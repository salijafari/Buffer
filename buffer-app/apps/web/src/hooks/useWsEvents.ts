'use client';

import { useEffect, useRef } from 'react';
import type { WsEventType, WsListener } from '../lib/wsClient';

/**
 * Subscribe to a WebSocket event type, cleaned up automatically on unmount.
 *
 * @example
 * useWsEvent('score.updated', event => {
 *   creditScoreStore.setScore(event.payload);
 * });
 */
export function useWsEvent<T = unknown>(
  type: WsEventType,
  handler: WsListener<T>,
) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    // Lazy import to avoid SSR issues
    let unsubscribe: (() => void) | undefined;

    import('../lib/wsClient').then(({ getWsClient }) => {
      try {
        const client = getWsClient();
        unsubscribe = client.on<T>(type, event => {
          handlerRef.current(event);
        });
      } catch {
        // Client not yet initialized (e.g., not yet authenticated)
      }
    });

    return () => unsubscribe?.();
  }, [type]);
}
