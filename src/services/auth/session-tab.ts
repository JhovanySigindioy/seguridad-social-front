const SESSION_TAB_KEY = 'dashboard_session_tab_id';
const TAB_CHANNEL_NAME = 'dashboard-session-tab';

let uniquenessChecked = false;
let uniquenessCheck: Promise<void> | null = null;

const tabChannel = typeof BroadcastChannel !== 'undefined'
  ? new BroadcastChannel(TAB_CHANNEL_NAME)
  : null;

tabChannel?.addEventListener('message', (event: MessageEvent<{ type?: string; tabId?: string }>) => {
  if (event.data?.type !== 'probe' || event.data.tabId !== sessionStorage.getItem(SESSION_TAB_KEY)) {
    return;
  }

  tabChannel.postMessage({ type: 'probe-response', tabId: event.data.tabId });
});

export const getSessionTabId = (): string => {
  const current = sessionStorage.getItem(SESSION_TAB_KEY);
  if (current) return current;

  const tabId = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  sessionStorage.setItem(SESSION_TAB_KEY, tabId);
  return tabId;
};

export const ensureUniqueSessionTabId = async (): Promise<void> => {
  if (uniquenessChecked || typeof BroadcastChannel === 'undefined') return;
  if (uniquenessCheck) return uniquenessCheck;

  uniquenessCheck = new Promise((resolve) => {
    const tabId = getSessionTabId();
    let duplicateDetected = false;
    const handleMessage = (event: MessageEvent<{ type?: string; tabId?: string }>) => {
      if (event.data?.type === 'probe-response' && event.data.tabId === tabId) {
        duplicateDetected = true;
      }
    };

    tabChannel?.addEventListener('message', handleMessage);
    tabChannel?.postMessage({ type: 'probe', tabId });

    window.setTimeout(() => {
      tabChannel?.removeEventListener('message', handleMessage);
      if (duplicateDetected) {
        sessionStorage.setItem(SESSION_TAB_KEY, globalThis.crypto.randomUUID());
      }
      uniquenessChecked = true;
      uniquenessCheck = null;
      resolve();
    }, 50);
  });

  return uniquenessCheck;
};
