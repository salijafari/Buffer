/**
 * Buffer WebSocket Client
 *
 * Handles real-time events from the Buffer backend:
 *   payment.processed    — a PAD transfer completed
 *   payment.failed       — a PAD transfer failed
 *   score.updated        — new credit score from bureau
 *   plaid.refresh.needed — Plaid token expired, reconnect required
 *   plaid.refresh.complete — Plaid data refreshed
 *   ai.proactive_card    — new AI insight ready
 *   credit_line.updated  — credit line balance or limit changed
 *
 * Connection lifecycle:
 *   - Auto-reconnects with exponential backoff (2s → 4s → 8s → 16s → 30s cap)
 *   - Pauses reconnection when the tab is hidden (Page Visibility API)
 *   - Sends a heartbeat ping every 30s; disconnects if no pong within 10s
 *   - Never retries on auth errors (4001, 4003)
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type WsEventType =
  | 'payment.processed'
  | 'payment.failed'
  | 'score.updated'
  | 'plaid.refresh.needed'
  | 'plaid.refresh.complete'
  | 'ai.proactive_card'
  | 'credit_line.updated'
  | 'connected'
  | 'disconnected';

export interface WsEvent<T = unknown> {
  type: WsEventType;
  payload: T;
  timestamp: string;
}

export type WsListener<T = unknown> = (event: WsEvent<T>) => void;

interface WsClientOptions {
  url: string;
  /** Function to get the current auth token (called on each connection) */
  getToken: () => Promise<string | null>;
  /** Called when connection state changes */
  onStateChange?: (state: WsState) => void;
}

export type WsState = 'connecting' | 'connected' | 'disconnected' | 'error';

// ─── Constants ────────────────────────────────────────────────────────────────

const PING_INTERVAL_MS  = 30_000;
const PONG_TIMEOUT_MS   = 10_000;
const MAX_BACKOFF_MS     = 30_000;
const FATAL_CLOSE_CODES  = new Set([4001, 4003]); // Unauthorized, Forbidden

// ─── WebSocket Client ─────────────────────────────────────────────────────────

export class BufferWsClient {
  private ws:           WebSocket | null = null;
  private listeners:    Map<WsEventType, Set<WsListener>> = new Map();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pingTimer:      ReturnType<typeof setTimeout> | null = null;
  private pongTimer:      ReturnType<typeof setTimeout> | null = null;
  private retryCount    = 0;
  private destroyed     = false;
  private state:        WsState = 'disconnected';

  constructor(private readonly options: WsClientOptions) {}

  // ── Public API ──────────────────────────────────────────────────────────────

  connect() {
    if (this.destroyed)     return;
    if (this.ws?.readyState === WebSocket.OPEN) return;
    this.doConnect();
  }

  disconnect() {
    this.destroyed = true;
    this.clearTimers();
    this.ws?.close(1000, 'Client closed');
    this.ws = null;
    this.setState('disconnected');
  }

  on<T>(type: WsEventType, listener: WsListener<T>) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type)!.add(listener as WsListener);
    return () => this.off(type, listener);
  }

  off<T>(type: WsEventType, listener: WsListener<T>) {
    this.listeners.get(type)?.delete(listener as WsListener);
  }

  getState(): WsState { return this.state; }

  // ── Private ─────────────────────────────────────────────────────────────────

  private async doConnect() {
    const token = await this.options.getToken();
    if (!token) {
      this.setState('error');
      return;
    }

    this.setState('connecting');
    const wsUrl = `${this.options.url}?token=${encodeURIComponent(token)}`;

    try {
      this.ws = new WebSocket(wsUrl);
    } catch {
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      this.retryCount = 0;
      this.setState('connected');
      this.emit({ type: 'connected', payload: null, timestamp: new Date().toISOString() });
      this.startPing();
    };

    this.ws.onmessage = (e: MessageEvent) => {
      if (e.data === 'pong') {
        this.clearPongTimer();
        return;
      }
      try {
        const event = JSON.parse(e.data as string) as WsEvent;
        this.emit(event);
      } catch {
        // Ignore malformed messages
      }
    };

    this.ws.onclose = (e: CloseEvent) => {
      this.clearTimers();
      this.setState('disconnected');
      this.emit({ type: 'disconnected', payload: { code: e.code, reason: e.reason }, timestamp: new Date().toISOString() });

      if (!this.destroyed && !FATAL_CLOSE_CODES.has(e.code)) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = () => {
      this.setState('error');
      // onclose fires after onerror — reconnect handled there
    };

    // Pause reconnection when tab is hidden (browser-only API)
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibility);
    }
  }

  private handleVisibility = () => {
    if (typeof document === 'undefined') return;
    if (document.visibilityState === 'visible' && this.state === 'disconnected') {
      this.retryCount = 0;
      this.doConnect();
    }
  };

  private startPing() {
    this.pingTimer = setInterval(() => {
      if (this.ws?.readyState !== WebSocket.OPEN) return;
      this.ws.send('ping');
      this.pongTimer = setTimeout(() => {
        // No pong received — connection stale, force reconnect
        this.ws?.close(4000, 'Ping timeout');
      }, PONG_TIMEOUT_MS);
    }, PING_INTERVAL_MS);
  }

  private scheduleReconnect() {
    if (this.destroyed) return;
    const backoff = Math.min(MAX_BACKOFF_MS, 2000 * Math.pow(2, this.retryCount));
    this.retryCount++;
    this.reconnectTimer = setTimeout(() => this.doConnect(), backoff);
  }

  private clearTimers() {
    if (this.reconnectTimer) { clearTimeout(this.reconnectTimer);  this.reconnectTimer = null; }
    if (this.pingTimer)      { clearInterval(this.pingTimer);       this.pingTimer = null; }
    this.clearPongTimer();
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.handleVisibility);
    }
  }

  private clearPongTimer() {
    if (this.pongTimer) { clearTimeout(this.pongTimer); this.pongTimer = null; }
  }

  private setState(state: WsState) {
    this.state = state;
    this.options.onStateChange?.(state);
  }

  private emit(event: WsEvent) {
    const listeners = this.listeners.get(event.type);
    if (listeners) {
      listeners.forEach(fn => {
        try { fn(event); } catch { /* listener errors are isolated */ }
      });
    }
  }
}

// ─── Singleton factory ────────────────────────────────────────────────────────

let _client: BufferWsClient | null = null;

export function getWsClient(options?: WsClientOptions): BufferWsClient {
  if (!_client && options) {
    _client = new BufferWsClient(options);
  }
  if (!_client) throw new Error('WsClient not initialised — pass options on first call');
  return _client;
}
