type EventPayload = Record<string, unknown>;

const LAST_EVENT_KEY = 'femiora-last-event';

export const trackEvent = (event: string, payload: EventPayload = {}) => {
  const entry = { event, payload };
  try {
    localStorage.setItem(LAST_EVENT_KEY, JSON.stringify(entry));
  } catch {
    // No-op: storage can be unavailable in some environments.
  }
};
