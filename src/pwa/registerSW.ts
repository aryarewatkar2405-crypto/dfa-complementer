/**
 * Service Worker registration and lifecycle manager for DFA Complementer PWA.
 */

export interface SWRegistrationOptions {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
}

export function registerServiceWorker(options?: SWRegistrationOptions) {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  // Register when page loads to prevent impacting initial load performance
  window.addEventListener('load', () => {
    const swUrl = '/sw.js';

    navigator.serviceWorker
      .register(swUrl)
      .then((registration) => {
        // Check for updates
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;

          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New content available
                if (options?.onUpdate) {
                  options.onUpdate(registration);
                }
              } else {
                // Content cached for offline use
                if (options?.onSuccess) {
                  options.onSuccess(registration);
                }
              }
            }
          };
        };

        if (options?.onSuccess && !registration.installing) {
          options.onSuccess(registration);
        }
      })
      .catch((error) => {
        console.warn('[PWA] Service worker registration failed:', error);
      });
  });
}

export function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.warn('[PWA] Service worker unregister error:', error);
      });
  }
}
