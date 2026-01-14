/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { render } from '../../test-utils/render.js';
import { Tips } from './Tips.js';
import { describe, it, expect } from 'vitest';

describe('Tips', () => {
  it('renders correct tips', () => {
    const { lastFrame } = render(<Tips />);
    const output = lastFrame();
    expect(output).toContain('Get started by typing:');
    expect(output).toContain('"do readme.ai"');
  });
});
