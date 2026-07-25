type AnalyticsPayload = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export function trackEvent(eventName: string, payload: AnalyticsPayload = {}) {
  if (typeof window === "undefined") return;

  window.dataLayer?.push({
    event: eventName,
    ...payload,
  });

  window.dispatchEvent(
    new CustomEvent("profgui:analytics", {
      detail: { event: eventName, ...payload },
    })
  );
}
