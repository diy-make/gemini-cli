/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  BaseDeclarativeTool,
  BaseToolInvocation,
  type ToolResult,
  Kind,
} from './tools.js';

import type { MessageBus } from '../confirmation-bus/message-bus.js';
import * as fs from 'node:fs';
import WebSocket from 'ws';

export interface SwarmConferParams {
  message: string;
  target?: string;
}

export class SwarmConferTool extends BaseDeclarativeTool<
  SwarmConferParams,
  ToolResult
> {
  constructor(messageBus: MessageBus) {
    super(
      'confer_with_swarm',
      'ConferWithSwarm',
      'Broadcast a message to all other active agents in the swarm or target a specific agent for realtime coordination.',
      Kind.Communicate,
      {
        type: 'object',
        required: ['message'],
        properties: {
          message: {
            type: 'string',
            description: 'The message content to broadcast to the swarm.',
          },
          target: {
            type: 'string',
            description:
              'Optional: The name of a specific agent to target (e.g., "Hermippus.agent"). Defaults to "BROADCAST".',
          },
        },
      },
      messageBus,
    );
  }

  protected createInvocation(
    params: SwarmConferParams,
    messageBus: MessageBus,
    toolName: string,
    toolDisplayName: string,
  ): SwarmConferInvocation {
    return new SwarmConferInvocation(
      params,
      messageBus,
      toolName,
      toolDisplayName,
    );
  }
}

export class SwarmConferInvocation extends BaseToolInvocation<
  SwarmConferParams,
  ToolResult
> {
  getDescription(): string {
    const target = this.params.target || 'BROADCAST';
    return `Conferring with swarm (${target}): ${this.params.message.substring(0, 50)}...`;
  }

  async execute(_signal: AbortSignal): Promise<ToolResult> {
    const KEY_PATH =
      '/home/bestape/gemini/repos/diy-make/next-servers/localhost-hud/logs/sovereign_key.txt';
    const wsUrl = 'ws://localhost:9223';
    const currentAgent = process.env['GEMINI_AGENT_NAME'] || 'Unknown';

    let sovereignKey = 'a8202279-2355-4b9a-99e5-9eef455339a6';
    try {
      if (fs.existsSync(KEY_PATH)) {
        sovereignKey = fs.readFileSync(KEY_PATH, 'utf8').trim();
      }
    } catch (_e) {
      // Intentionally ignore errors during key read
    }

    return new Promise((resolve) => {
      const ws = new WebSocket(wsUrl);

      ws.on('open', () => {
        const payload = {
          type: 'AGENT_CONFER',
          from: currentAgent,
          target: this.params.target || 'BROADCAST',
          content: this.params.message,
          sovereign_key: sovereignKey,
        };
        ws.send(JSON.stringify(payload), () => {
          ws.close();
          resolve({
            llmContent: `Message broadcast to swarm: ${this.params.message}`,
            returnDisplay: `✔ Swarm conferral sent: ${this.params.message}`,
          });
        });
      });

      ws.on('error', (err) => {
        resolve({
          llmContent: `Failed to connect to swarm bridge: ${err.message}`,
          returnDisplay: `❌ Swarm conferral failed: Bridge unreachable.`,
        });
      });
    });
  }
}
