/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type React from 'react';
import { Box, Text } from 'ink';
import { theme } from '../semantic-colors.js';

export const Tips: React.FC = () => (
  <Box flexDirection="column">
    <Text color={theme.text.primary}>Get started by typing:</Text>
    <Text color={theme.text.accent}>&quot;do readme.ai&quot;</Text>
  </Box>
);
