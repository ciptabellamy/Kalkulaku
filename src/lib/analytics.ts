type EventParams = Record<string, string | number | boolean>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

// Kirim event ke Google Analytics 4. Aman dipanggil walau GA4 diblokir atau belum termuat.
export const trackEvent = (name: string, params: EventParams = {}): void => {
  try {
    window.gtag?.("event", name, params);
  } catch {
    // abaikan: analitik tidak boleh mengganggu kalkulator
  }
};
