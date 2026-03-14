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
  description:
    'Mature the substrate by absorbing organizational memory and mapping its forest nodes.',
  kind: CommandKind.BUILT_IN,
  autoExecute: false,
  subCommands: [
    {
      name: 'cli',
      description: 'Realize the Book of CLI (gemini-cli)',
      kind: CommandKind.BUILT_IN,
      autoExecute: true,
      action: async (_context: CommandContext) => {
        return {
          type: 'submit_prompt',
          content: [{ text: 'SYSTEM MANDATE: Realize the Book of CLI by absorbing third_party/google_diy_make/memory/public/ and mapping the CLI organization.' }],
        };
      },
    },

        }),
    },
    {
      name: 'make',
      description: 'Realize the Book of Make (diy-make)',
      kind: CommandKind.BUILT_IN,
      autoExecute: true,
      action: async (_context: CommandContext) => ({
          type: 'submit_prompt',
          content: [
            {
              text: 'SYSTEM MANDATE: Realize the Book of Make by absorbing repos/diy-make/memory/ and mapping the diy-make organization.',
            },
          ],
        }),
    },
    {
      name: 'seedtree',
      description: 'Realize the Book of Seedtree (seedtree-io)',
      kind: CommandKind.BUILT_IN,
      autoExecute: true,
      action: async (_context: CommandContext) => ({
          type: 'submit_prompt',
          content: [
            {
              text: 'SYSTEM MANDATE: Realize the Book of Seedtree by absorbing repos/seedtree-io/memory/ and mapping the seedtree-io organization.',
            },
          ],
        }),
    },
    {
      name: 'ventures',
      description: 'Realize the Book of Ventures (island_ventures)',
      kind: CommandKind.BUILT_IN,
      autoExecute: true,
      action: async (_context: CommandContext) => ({
          type: 'submit_prompt',
          content: [
            {
              text: 'SYSTEM MANDATE: Realize the Book of Ventures by absorbing repos/island_ventures/memory/ and mapping the island_ventures organization.',
            },
          ],
        }),
    },
    {
      name: 'hu',
      description: 'Realize the Book of HU (Haeccietate Universali)',
      kind: CommandKind.BUILT_IN,
      autoExecute: true,
      action: async (_context: CommandContext) => ({
          type: 'submit_prompt',
          content: [
            {
              text: 'SYSTEM MANDATE: Realize the Book of HU by absorbing repos/haeccietate-universali/memory/ and mapping the haeccietate-universali organization.',
            },
          ],
        }),
    },
    {
      name: 'lesa',
      description: 'Realize the Book of LESA',
      kind: CommandKind.BUILT_IN,
      autoExecute: true,
      action: async (_context: CommandContext) => ({
          type: 'submit_prompt',
          content: [
            {
              text: 'SYSTEM MANDATE: Realize the Book of LESA by absorbing repos/lesa/memory/ and mapping the lesa organization.',
            },
          ],
        }),
    },
    {
      name: 'ixventure',
      description: 'Realize the Book of IXVenture',
      kind: CommandKind.BUILT_IN,
      autoExecute: true,
      action: async (_context: CommandContext) => ({
          type: 'submit_prompt',
          content: [
            {
              text: 'SYSTEM MANDATE: Realize the Book of IXVenture by absorbing repos/ixventure/memory/ and mapping the ixventure organization.',
            },
          ],
        }),
    },
    {
      name: 'cheerbot',
      description: 'Realize the Book of Cheerbot',
      kind: CommandKind.BUILT_IN,
      autoExecute: true,
      action: async (_context: CommandContext) => ({
          type: 'submit_prompt',
          content: [
            {
              text: 'SYSTEM MANDATE: Realize the Book of Cheerbot by absorbing repos/cheerbotme/memory/ and mapping the cheerbotme organization.',
            },
          ],
        }),
    },
    {
      name: 'bestape',
      description: 'Realize the Book of Bestape',
      kind: CommandKind.BUILT_IN,
      autoExecute: true,
      action: async (_context: CommandContext) => ({
          type: 'submit_prompt',
          content: [
            {
              text: 'SYSTEM MANDATE: Realize the Book of Bestape by absorbing repos/bestape/memory/ and mapping the bestape organization.',
            },
          ],
        }),
    },
    {
      name: 'forkfolk',
      description: 'Realize the Book of Forkfolk',
      kind: CommandKind.BUILT_IN,
      autoExecute: true,
      action: async (_context: CommandContext) => ({
          type: 'submit_prompt',
          content: [
            {
              text: 'SYSTEM MANDATE: Realize the Book of Forkfolk by absorbing repos/forkfolk/memory/ and mapping the forkfolk organization.',
            },
          ],
        }),
    },
    {
      name: 'local',
      description: 'Realize the Book of Local Only',
      kind: CommandKind.BUILT_IN,
      autoExecute: true,
      action: async (_context: CommandContext) => ({
          type: 'submit_prompt',
          content: [
            {
              text: 'SYSTEM MANDATE: Realize the Book of Local Only by absorbing repos/local_only/memory/ and mapping the local_only organization.',
            },
          ],
        }),
    },
  ],
};
