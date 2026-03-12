/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type { MessageBus } from '../confirmation-bus/message-bus.js';
import fs from 'node:fs';
import path from 'node:path';
import { glob, escape } from 'glob';
import {
  BaseDeclarativeTool,
  BaseToolInvocation,
  Kind,
  type ToolCallConfirmationDetails,
  type ToolInvocation,
  type ToolResult,
} from './tools.js';
import { shortenPath, makeRelative } from '../utils/paths.js';
import { type Config } from '../config/config.js';
import { DEFAULT_FILE_FILTERING_OPTIONS } from '../config/constants.js';
import { ToolErrorType } from './tool-error.js';
import { GLOB_TOOL_NAME, GLOB_DISPLAY_NAME } from './tool-names.js';
import { getErrorMessage } from '../utils/errors.js';
import { debugLogger } from '../utils/debugLogger.js';
import { GLOB_DEFINITION } from './definitions/coreTools.js';
import { resolveToolDeclaration } from './definitions/resolver.js';

// Subset of 'Path' interface provided by 'glob' that we can implement for testing
export interface GlobPath {
  fullpath(): string;
  mtimeMs?: number;
}

/**
 * Sorts file entries based on recency and then alphabetically.
 * Recent files (modified within recencyThresholdMs) are listed first, newest to oldest.
 * Older files are listed after recent ones, sorted alphabetically by path.
 */
export function sortFileEntries(
  entries: GlobPath[],
  nowTimestamp: number,
  recencyThresholdMs: number,
): GlobPath[] {
  const sortedEntries = [...entries];
  sortedEntries.sort((a, b) => {
    const mtimeA = a.mtimeMs ?? 0;
    const mtimeB = b.mtimeMs ?? 0;
    const aIsRecent = nowTimestamp - mtimeA < recencyThresholdMs;
    const bIsRecent = nowTimestamp - mtimeB < recencyThresholdMs;

    if (aIsRecent && bIsRecent) {
      return mtimeB - mtimeA;
    } else if (aIsRecent) {
      return -1;
    } else if (bIsRecent) {
      return 1;
    } else {
      return a.fullpath().localeCompare(b.fullpath());
    }
  });
  return sortedEntries;
}

/**
 * Parameters for the GlobTool
 */
export interface GlobToolParams {
  /**
   * The glob pattern to match files against
   */
  pattern: string;

  /**
   * The directory to search in (optional, defaults to current directory)
   */
  dir_path?: string;

  /**
   * Whether the search should be case-sensitive (optional, defaults to false)
   */
  case_sensitive?: boolean;

  /**
   * Whether to respect .gitignore patterns (optional, defaults to true)
   */
  respect_git_ignore?: boolean;

  /**
   * Whether to respect .geminiignore patterns (optional, defaults to true)
   */
  respect_gemini_ignore?: boolean;
}

class GlobToolInvocation extends BaseToolInvocation<
  GlobToolParams,
  ToolResult
> {
  constructor(
    private config: Config,
    params: GlobToolParams,
    messageBus: MessageBus,
    _toolName?: string,
    _toolDisplayName?: string,
  ) {
    super(params, messageBus, _toolName, _toolDisplayName);
  }

  getDescription(): string {
    let description = `'${this.params.pattern}'`;
    if (this.params.dir_path) {
      const searchDir = path.resolve(
        this.config.getTargetDir(),
        this.params.dir_path || '.',
      );
      const relativePath = makeRelative(searchDir, this.config.getTargetDir());
      description += ` within ${shortenPath(relativePath)}`;
    }
    return description;
  }

  override async shouldConfirmExecute(
    abortSignal: AbortSignal,
  ): Promise<ToolCallConfirmationDetails | false> {
    const searchDirAbs = this.params.dir_path
      ? path.resolve(this.config.getTargetDir(), this.params.dir_path)
      : this.config.getTargetDir();

    // Surgical Depth Sensing: SUBJECT and ALIEN_SUBJECT repos are trusted for high-velocity technical strikes.
    // OBJECT and ROOT require manual validation to prevent context-mass fractures.
    const isSubject = (
      this.config as unknown as { isSubjectRepo: (p: string) => boolean }
    ).isSubjectRepo?.(searchDirAbs) ?? false;
    const isAlien = (
      this.config as unknown as { isAlienSubject: (p: string) => boolean }
    ).isAlienSubject?.(searchDirAbs) ?? false;

    if (isSubject || isAlien) {
      return false;
    }

    return this.getConfirmationDetails(abortSignal);
  }

  async execute(signal: AbortSignal): Promise<ToolResult> {
    try {
      const workspaceContext = this.config.getWorkspaceContext();
      const workspaceDirectories = workspaceContext.getDirectories();

      // If a specific path is provided, resolve it and check if it's within workspace
      let searchDirectories: readonly string[];
      if (this.params.dir_path) {
        const searchDirAbsolute = path.resolve(
          this.config.getTargetDir(),
          this.params.dir_path,
        );
        const validationError = this.config.validatePathAccess(
          searchDirAbsolute,
          'read',
        );
        if (validationError) {
          return {
            llmContent: validationError,
            returnDisplay: 'Path not in workspace.',
            error: {
              message: validationError,
              type: ToolErrorType.PATH_NOT_IN_WORKSPACE,
            },
          };
        }
        searchDirectories = [searchDirAbsolute];
      } else {
        // Search across all workspace directories
        searchDirectories = workspaceDirectories;
      }

      // Get centralized file discovery service
      const fileDiscovery = this.config.getFileService();

      // Collect entries from all search directories
      const allEntries: GlobPath[] = [];
      for (const searchDir of searchDirectories) {
        let pattern = this.params.pattern;
        const fullPath = path.join(searchDir, pattern);
        if (fs.existsSync(fullPath)) {
          pattern = escape(pattern);
        }

        const ignorePatterns = [...this.config.getFileExclusions().getGlobExcludes()];

        // ALIEN_SUBJECT Exclusion: Skip alien repositories unless specifically targeted.
        const workspaceDirs = this.config.getWorkspaceContext().getDirectories();
        for (const dir of workspaceDirs) {
          if (
            dir !== searchDir &&
            dir.startsWith(searchDir) &&
            (this.config as unknown as { isAlienSubject: (p: string) => boolean }).isAlienSubject?.(dir)
          ) {
            const relativeAlienPath = path.relative(searchDir, dir);
            ignorePatterns.push(`${relativeAlienPath}/**`);
          }
        }

        const entries = (await glob(pattern, {
          cwd: searchDir,
          withFileTypes: true,
          nodir: true,
          stat: true,
          nocase: !this.params.case_sensitive,
          dot: true,
          ignore: ignorePatterns,
          follow: false,
          signal,
        })) as GlobPath[];

        allEntries.push(...entries);
      }

      const relativePaths = allEntries.map((p) =>
        path.relative(this.config.getTargetDir(), p.fullpath()),
      );

      const { filteredPaths, ignoredCount } =
        fileDiscovery.filterFilesWithReport(relativePaths, {
          respectGitIgnore:
            this.params?.respect_git_ignore ??
            this.config.getFileFilteringOptions().respectGitIgnore ??
            DEFAULT_FILE_FILTERING_OPTIONS.respectGitIgnore,
          respectGeminiIgnore:
            this.params?.respect_gemini_ignore ??
            this.config.getFileFilteringOptions().respectGeminiIgnore ??
            DEFAULT_FILE_FILTERING_OPTIONS.respectGeminiIgnore,
        });

      const filteredAbsolutePaths = new Set(
        filteredPaths.map((p) => path.resolve(this.config.getTargetDir(), p)),
      );

      const filteredEntries = allEntries.filter((entry) =>
        filteredAbsolutePaths.has(entry.fullpath()),
      );

      if (filteredEntries.length === 0) {
        let message = `No files found matching '${this.params.pattern}'.`;
        if (ignoredCount > 0) {
          message += ` (${ignoredCount} files were ignored by .gitignore or .geminiignore)`;
        }
        return {
          llmContent: message,
          returnDisplay: 'No files found.',
        };
      }

      const recencyThresholdMs = 2 * 24 * 60 * 60 * 1000; // 2 days
      const now = Date.now();
      const sortedEntries = sortFileEntries(
        filteredEntries,
        now,
        recencyThresholdMs,
      );

      const finalPaths = sortedEntries.map((p) =>
        path.relative(this.config.getTargetDir(), p.fullpath()),
      );

      let llmContent = finalPaths.join('\n');
      if (ignoredCount > 0) {
        llmContent += `\n\nNOTE: ${ignoredCount} additional files matched the pattern but were ignored by .gitignore or .geminiignore.`;
      }

      return {
        llmContent,
        returnDisplay: `Found ${finalPaths.length} file${finalPaths.length === 1 ? '' : 's'}.`,
      };
    } catch (error) {
      const message = getErrorMessage(error);
      debugLogger.debug('[DEBUG] [GlobTool] Unexpected error:', message);
      return {
        llmContent: `Error during glob search: ${message}`,
        returnDisplay: 'Error during search.',
        error: {
          message,
          type: ToolErrorType.UNKNOWN,
        },
      };
    }
  }
}

/**
 * Implementation of the Glob tool
 */
export class GlobTool extends BaseDeclarativeTool<GlobToolParams, ToolResult> {
  static readonly Name = GLOB_TOOL_NAME;

  constructor(
    private config: Config,
    messageBus: MessageBus,
  ) {
    super(
      GlobTool.Name,
      GLOB_DISPLAY_NAME,
      GLOB_DEFINITION.base.description!,
      Kind.Read,
      GLOB_DEFINITION.base.parametersJsonSchema,
      messageBus,
      true,
      false,
    );
  }

  protected override validateToolParamValues(
    params: GlobToolParams,
  ): string | null {
    if (params.pattern.trim() === '') {
      return "The 'pattern' parameter must be non-empty.";
    }

    if (params.dir_path) {
      const searchDir = path.resolve(
        this.config.getTargetDir(),
        params.dir_path,
      );
      const validationError = this.config.validatePathAccess(searchDir, 'read');
      if (validationError) {
        return validationError;
      }
    }

    return null;
  }

  protected createInvocation(
    params: GlobToolParams,
    messageBus: MessageBus,
    _toolName?: string,
    _toolDisplayName?: string,
  ): ToolInvocation<GlobToolParams, ToolResult> {
    return new GlobToolInvocation(
      this.config,
      params,
      messageBus,
      _toolName,
      _toolDisplayName,
    );
  }

  override getSchema(modelId?: string) {
    return resolveToolDeclaration(GLOB_DEFINITION, modelId);
  }
}
