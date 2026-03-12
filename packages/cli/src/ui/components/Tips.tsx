/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type React from 'react';
import { Box, Text } from 'ink';
import { theme } from '../semantic-colors.js';

import type { Config } from '@google/gemini-cli-core';

interface TipsProps {
  config?: Config;
}

export const Tips: React.FC<TipsProps> = ({ config }) => {
  return (
    <Box flexDirection="column" marginTop={1}>
      <Text color={theme.text.primary}>🔱 Sovereign Metagit Tips:</Text>
      <Text color={theme.text.primary}>
        1. Always begin by typing: <Text color={theme.text.accent}>&quot;do readme.ai&quot;</Text>
      </Text>
      <Text color={theme.text.primary}>
        2. Realize a mission context via <Text color={theme.text.secondary}>/realize:[book]</Text>
      </Text>
      <Text color={theme.text.primary}>
        3. Ingest the <Text bold>Memory Framework</Text> (json/heartwood) for domain law
      </Text>
      <Text color={theme.text.primary}>
        4. Use <Text color={theme.text.secondary}>/help</Text> for tool and command documentation
      </Text>
    </Box>
  );
};
