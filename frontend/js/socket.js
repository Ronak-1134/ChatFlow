const SOCKET_URL = `ws://${location.host}`;

let ws = null;
const listeners = {};

// Reconnection state
let reconnectTimer = null;
const MAX_RETRIES = 5;
let retries = 0;

const on = (type, fn) => {
  if (!listeners[type]) listeners[type] = [];
  listeners[type].push(fn);
};

const emit = (type, fn) => on(type, fn); // alias for readability

const dispatch = (type, data) => {
  listeners[type]?.forEach(fn => fn(data));
};

const send = (payload) => {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(payload));
  }
};

const connect = () => new Promise((resolve, reject) => {
  ws = new WebSocket(SOCKET_URL);

  ws.onopen = () => {
    // Reset retry logic on successful connection
    retries = 0;
    clearTimeout(reconnectTimer);
    dispatch('connected');
    resolve();
  };

  ws.onclose = () => {
    dispatch('disconnected');
    
    // Exponential backoff reconnection logic
    if (retries < MAX_RETRIES) {
      const delay = Math.min(1000 * 2 ** retries, 15000);
      retries++;
      console.log(`[WS] Reconnecting in ${delay}ms... (${retries}/${MAX_RETRIES})`);
      reconnectTimer = setTimeout(() => connect().catch(() => {}), delay);
    } else {
      console.log('[WS] Max reconnection attempts reached.');
    }
  };

  ws.onerror = (e) => {
    dispatch('error', e);
    reject(e);
  };

  ws.onmessage = ({ data }) => {
    try {
      const msg = JSON.parse(data);
      dispatch(msg.type, msg);
      dispatch('*', msg); // wildcard listener
    } catch {}
  };
});

export default { connect, send, on, emit };