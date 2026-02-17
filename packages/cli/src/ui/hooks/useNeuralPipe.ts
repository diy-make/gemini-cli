/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from 'react';
import { debugLogger } from '@google/gemini-cli-core';
import * as fs from 'node:fs';
import * as crypto from 'node:crypto';

/**
 * Hook to listen for external prompts via the Vanguard Bridge WebSocket.
 * This allows the HUD (laptop) to trigger prompts in the running CLI.
 */
export const useNeuralPipe = (handleFinalSubmit: (value: string) => void) => {
  const handleFinalSubmitRef = useRef(handleFinalSubmit);
  handleFinalSubmitRef.current = handleFinalSubmit;

  useEffect(() => {
    const KEY_PATH =
      '/home/bestape/gemini/repos/diy-make/next-servers/localhost-hud/logs/sovereign_key.txt';
    const wsUrl = 'ws://localhost:9223';
    let socket: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;

    const getSovereignKey = (): string => {
      try {
        if (fs.existsSync(KEY_PATH)) {
          return fs.readFileSync(KEY_PATH, 'utf8').trim();
        }
      } catch (e) {
        debugLogger.error('🧬 [NeuralPipe] Failed to read Sovereign Key:', e);
      }
      return 'a8202279-2355-4b9a-99e5-9eef455339a6'; // Fallback to current known key
    };

    const verifySignature = (
      content: string,
      from: string,
      timestamp: string,
      signature: string,
      key: string,
    ): boolean => {
      const payload = `${content}|${from}|${timestamp}`;
      const expectedSignature = crypto
        .createHmac('sha256', key)
        .update(payload)
        .digest('hex');
      return signature === expectedSignature;
    };

    const connect = () => {
      const sovereignKey = getSovereignKey();

      try {
        debugLogger.log(
          '🧬 [NeuralPipe] Attempting connection to Vanguard Bridge...',
        );
        socket = new WebSocket(wsUrl);

        socket.onopen = () => {
          debugLogger.log('🧬 [NeuralPipe] Connected to Vanguard Bridge');
          socket?.send(
            JSON.stringify({
              type: 'TAB_QUICKENING',
              agentType: 'GEMINI',
              sovereign_key: sovereignKey,
            }),
          );
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            const currentAgentName =
              process.env['GEMINI_AGENT_NAME'] || 'Unknown';

            if (data.type === 'USER_PROMPT' && data.content) {
              debugLogger.log(
                '🧬 [NeuralPipe] Received external prompt:',
                data.content,
              );
              handleFinalSubmitRef.current(data.content);
            } else if (data.type === 'AGENT_CONFER' && data.content) {
              const target = data.target || 'BROADCAST';
              const fromAgent = data.from || 'Unknown';
              const timestamp = data.timestamp || '';
              const signature = data.signature || '';

              // Only process if broadcast or targeted at us (and not FROM us)
              if (
                (target === 'BROADCAST' || target === currentAgentName) &&
                fromAgent !== currentAgentName
              ) {
                // Verify forensic signature if present
                if (signature) {
                  const isValid = verifySignature(
                    data.content,
                    fromAgent,
                    timestamp,
                    signature,
                    sovereignKey,
                  );
                  if (!isValid) {
                    debugLogger.warn(
                      `🧬 [NeuralPipe] REJECTED unauthenticated signal from ${fromAgent}`,
                    );
                    return;
                  }
                }

                // ✦✦ Alexandrian Standard: Distinct swarm prefix and mandated identity
                const prefixedContent = `✦✦ ${fromAgent}: ${data.content}`;
                debugLogger.log(
                  '🧬 [NeuralPipe] Swarm Conferral Ingested:',
                  prefixedContent,
                );
                handleFinalSubmitRef.current(prefixedContent);
              }
            }
          } catch (_e) {
            // Ignore non-json or malformed messages
          }
        };

        socket.onclose = () => {
          debugLogger.log(
            '🧬 [NeuralPipe] Disconnected from Vanguard Bridge. Reconnecting in 5s...',
          );
          reconnectTimeout = setTimeout(connect, 5000);
        };

        socket.onerror = (err) => {
          if (
            socket?.readyState === WebSocket.CLOSING ||
            socket?.readyState === WebSocket.CLOSED
          ) {
            return;
          }
          debugLogger.error('🧬 [NeuralPipe] WebSocket error:', err);
        };
      } catch (e) {
        debugLogger.error('🧬 [NeuralPipe] Connection failed:', e);
        reconnectTimeout = setTimeout(connect, 5000);
      }
    };

    connect();

    return () => {
      if (socket) {
        socket.onclose = null;
        socket.onerror = null;
        socket.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, []);
};
