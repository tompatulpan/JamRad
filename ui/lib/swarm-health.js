export {checkWsHealth, watchOnlineEvents};

// connection states
export const INITIAL = 0;
export const CONNECTING = 1;
export const CONNECTED = 2;
export const DISCONNECTED = 3;

function checkWsHealth(swarm) {
  setInterval(() => {
    if (swarm.connectState === INITIAL || swarm.connectState === CONNECTING)
      return;
    if (!navigator.onLine) return;
    switch (swarm.hub?.ws?.readyState) {
      case undefined:
      case WebSocket.CLOSING:
      case WebSocket.CLOSED:
        swarm.connectState = DISCONNECTED;
        swarm.connect();
    }
  }, 1000);
}

// react immediately to network / tab changes instead of waiting on ws timeouts,
// which is what makes reconnecting after switching networks slow
function watchOnlineEvents(swarm) {
  let forceRecheck = () => {
    if (swarm.connectState !== CONNECTED && swarm.connectState !== CONNECTING)
      return;
    // the existing socket may be stale (e.g. after switching networks) even
    // though its readyState still reports OPEN; closing it makes checkWsHealth
    // reconnect right away instead of waiting for the ping/pong timeout
    swarm.hub?.close(4001);
  };
  window.addEventListener('online', forceRecheck);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') forceRecheck();
  });
  window.addEventListener('pageshow', forceRecheck);
}

