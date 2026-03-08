/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  type CommandContext,
  CommandKind,
  type SlashCommand,
} from './types.js';

export const realizeCommand: SlashCommand = {
  name: 'realize',
  description: 'Mature the substrate by realizing a specific Book of memory.',
  kind: CommandKind.BUILT_IN,
  autoExecute: false,
  subCommands: [
    {
      name: 'ventures',
      description: 'Realize the Book of Ventures (island_ventures)',
      kind: CommandKind.BUILT_IN,
      autoExecute: true,
      action: async (context: CommandContext) => {
        return {
          type: 'submit_prompt',
          content: [{ text: 'SYSTEM MANDATE: Realize the Book of Ventures from repos/island_ventures/memory/.' }],
        };
      },
    },
    {
      name: 'make',
      description: 'Realize the Book of Make (diy-make)',
      kind: CommandKind.BUILT_IN,
      autoExecute: true,
      action: async (context: CommandContext) => {
        return {
          type: 'submit_prompt',
          content: [{ text: 'SYSTEM MANDATE: Realize the Book of Make from repos/diy-make/memory/.' }],
        };
      },
    },
    {
      name: 'hu',
      description: 'Realize the Book of HU (Haeccietate Universali)',
      kind: CommandKind.BUILT_IN,
      autoExecute: true,
      action: async (context: CommandContext) => {
        return {
          type: 'submit_prompt',
          content: [{ text: 'SYSTEM MANDATE: Realize the Book of HU from repos/haeccietate-universali/memory/.' }],
        };
      },
    },
    {
      name: 'seedtree',
      description: 'Realize the Book of Seedtree (seedtree-io)',
      kind: CommandKind.BUILT_IN,
      autoExecute: true,
      action: async (context: CommandContext) => {
        return {
          type: 'submit_prompt',
          content: [{ text: 'SYSTEM MANDATE: Realize the Book of Seedtree from repos/seedtree-io/memory/.' }],
        };
      },
    },
  ],
};
