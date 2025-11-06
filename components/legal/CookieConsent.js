/**
 * 🍪 ZERO-BUDGET COOKIE CONSENT BANNER
 *
 * DSGVO & TTDSG konform
 * - Opt-in BEVOR Cookies gesetzt werden
 * - Granulare Consent-Optionen
 * - Widerruf jederzeit möglich
 *
 * Nutzt: vanilla-cookieconsent (Open-Source, kostenlos)
 * https://github.com/orestbida/cookieconsent
 */

import { useEffect } from 'react';

/**
 * Cookie Consent Banner Component
 *
 * Installation:
 * npm install vanilla-cookieconsent --save
 *
 * Usage:
 * import CookieConsent from './components/legal/CookieConsent';
 * <CookieConsent />
 */
export default function CookieConsent() {
  useEffect(() => {
    // Dynamically import to avoid SSR issues
    import('vanilla-cookieconsent').then((CookieConsentModule) => {
      const CookieConsent = CookieConsentModule.default || CookieConsentModule;

      // Run cookie consent
      CookieConsent.run({
        // GUI Options
        guiOptions: {
          consentModal: {
            layout: 'box inline',
            position: 'bottom left',
            equalWeightButtons: true,
            flipButtons: false
          },
          preferencesModal: {
            layout: 'box',
            position: 'right',
            equalWeightButtons: true,
            flipButtons: false
          }
        },

        // Cookie Categories
        categories: {
          necessary: {
            enabled: true,  // Always enabled
            readOnly: true, // Cannot be disabled
            autoClear: {
              cookies: []
            }
          },
          analytics: {
            enabled: false, // Disabled by default (GDPR!)
            readOnly: false,
            autoClear: {
              cookies: [
                {
                  name: /^_ga/, // Google Analytics cookies
                },
                {
                  name: '_gid',
                }
              ]
            }
          },
          marketing: {
            enabled: false, // Disabled by default (GDPR!)
            readOnly: false,
            autoClear: {
              cookies: [
                {
                  name: /^_fb/, // Facebook cookies
                },
                {
                  name: 'fr',
                }
              ]
            }
          }
        },

        // Language & Translations
        language: {
          default: 'de',
          autoDetect: 'browser',

          translations: {
            de: {
              consentModal: {
                title: 'Wir verwenden Cookies 🍪',
                description: 'Diese Website verwendet Cookies, um Ihre Erfahrung zu verbessern. Einige Cookies sind für den Betrieb der Website notwendig, während andere uns helfen, die Website zu analysieren und zu verbessern. Sie können Ihre Einwilligung jederzeit widerrufen.',
                acceptAllBtn: 'Alle akzeptieren',
                acceptNecessaryBtn: 'Nur notwendige',
                showPreferencesBtn: 'Einstellungen verwalten',
                footer: `
                  <a href="/datenschutz">Datenschutzerklärung</a>
                  <a href="/impressum">Impressum</a>
                `
              },

              preferencesModal: {
                title: 'Cookie-Einstellungen',
                acceptAllBtn: 'Alle akzeptieren',
                acceptNecessaryBtn: 'Nur notwendige',
                savePreferencesBtn: 'Einstellungen speichern',
                closeIconLabel: 'Schließen',
                serviceCounterLabel: 'Dienst|Dienste',

                sections: [
                  {
                    title: 'Verwendung von Cookies',
                    description: 'Wir verwenden Cookies, um grundlegende Funktionen zu ermöglichen, Ihre Erfahrung zu personalisieren und die Nutzung der Website zu analysieren. Cookies sind kleine Textdateien, die auf Ihrem Gerät gespeichert werden.'
                  },
                  {
                    title: 'Notwendige Cookies <span class="pm__badge">Immer aktiviert</span>',
                    description: 'Diese Cookies sind für das Funktionieren der Website erforderlich und können nicht deaktiviert werden. Sie werden nur als Reaktion auf von Ihnen getätigte Aktionen gesetzt, die einer Dienstanforderung entsprechen, wie z.B. das Festlegen Ihrer Datenschutzeinstellungen oder das Ausfüllen von Formularen.',
                    linkedCategory: 'necessary',
                    cookieTable: {
                      headers: {
                        name: 'Cookie',
                        domain: 'Domain',
                        expiration: 'Ablauf',
                        description: 'Beschreibung'
                      },
                      body: [
                        {
                          name: 'cc_cookie',
                          domain: 'Diese Website',
                          expiration: '6 Monate',
                          description: 'Speichert Ihre Cookie-Einstellungen'
                        }
                      ]
                    }
                  },
                  {
                    title: 'Analyse-Cookies',
                    description: 'Diese Cookies helfen uns zu verstehen, wie Besucher mit der Website interagieren, indem Informationen anonym gesammelt und gemeldet werden. Diese Informationen helfen uns, die Website zu verbessern.',
                    linkedCategory: 'analytics',
                    cookieTable: {
                      headers: {
                        name: 'Cookie',
                        domain: 'Domain',
                        expiration: 'Ablauf',
                        description: 'Beschreibung'
                      },
                      body: [
                        {
                          name: '_ga',
                          domain: 'Google',
                          expiration: '2 Jahre',
                          description: 'Wird verwendet, um Benutzer zu unterscheiden'
                        },
                        {
                          name: '_gid',
                          domain: 'Google',
                          expiration: '24 Stunden',
                          description: 'Wird verwendet, um Benutzer zu unterscheiden'
                        }
                      ]
                    }
                  },
                  {
                    title: 'Marketing-Cookies',
                    description: 'Diese Cookies werden verwendet, um Ihnen relevante Werbung anzuzeigen. Sie begrenzen auch die Anzahl der Anzeigen, die Sie sehen, und helfen uns, die Effektivität unserer Werbekampagnen zu messen.',
                    linkedCategory: 'marketing',
                    cookieTable: {
                      headers: {
                        name: 'Cookie',
                        domain: 'Domain',
                        expiration: 'Ablauf',
                        description: 'Beschreibung'
                      },
                      body: [
                        {
                          name: '_fbp',
                          domain: 'Facebook',
                          expiration: '3 Monate',
                          description: 'Facebook Pixel für Werbezwecke'
                        }
                      ]
                    }
                  },
                  {
                    title: 'Weitere Informationen',
                    description: 'Für weitere Informationen über die von uns verwendeten Cookies und Ihre Wahlmöglichkeiten lesen Sie bitte unsere <a href="/datenschutz" class="cc-link">Datenschutzerklärung</a>. Sie können Ihre Einwilligung jederzeit ändern oder widerrufen.'
                  }
                ]
              }
            },

            en: {
              consentModal: {
                title: 'We use cookies 🍪',
                description: 'This website uses cookies to improve your experience. Some cookies are necessary for the website to function, while others help us analyze and improve the website. You can withdraw your consent at any time.',
                acceptAllBtn: 'Accept all',
                acceptNecessaryBtn: 'Necessary only',
                showPreferencesBtn: 'Manage preferences',
                footer: `
                  <a href="/privacy">Privacy Policy</a>
                  <a href="/imprint">Imprint</a>
                `
              },

              preferencesModal: {
                title: 'Cookie Preferences',
                acceptAllBtn: 'Accept all',
                acceptNecessaryBtn: 'Necessary only',
                savePreferencesBtn: 'Save preferences',
                closeIconLabel: 'Close',
                serviceCounterLabel: 'Service|Services',

                sections: [
                  {
                    title: 'Cookie Usage',
                    description: 'We use cookies to enable basic functions, personalize your experience, and analyze website usage.'
                  },
                  {
                    title: 'Necessary Cookies <span class="pm__badge">Always enabled</span>',
                    description: 'These cookies are required for the website to function and cannot be disabled.',
                    linkedCategory: 'necessary'
                  },
                  {
                    title: 'Analytics Cookies',
                    description: 'These cookies help us understand how visitors interact with the website.',
                    linkedCategory: 'analytics'
                  },
                  {
                    title: 'Marketing Cookies',
                    description: 'These cookies are used to show you relevant advertising.',
                    linkedCategory: 'marketing'
                  },
                  {
                    title: 'More Information',
                    description: 'For more information, please read our <a href="/privacy" class="cc-link">Privacy Policy</a>.'
                  }
                ]
              }
            }
          }
        },

        // Callbacks
        onFirstConsent: ({ cookie }) => {
          console.log('Cookie consent gegeben:', cookie);
        },

        onConsent: ({ cookie }) => {
          console.log('Cookie-Einstellungen aktualisiert:', cookie);

          // Hier könnten Sie Analytics/Marketing-Scripts laden
          if (cookie.categories.includes('analytics')) {
            // Load Google Analytics
            // window.gtag('consent', 'update', { 'analytics_storage': 'granted' });
          }

          if (cookie.categories.includes('marketing')) {
            // Load Marketing Scripts
            // loadMarketingScripts();
          }
        },

        onChange: ({ cookie, changedCategories }) => {
          console.log('Geänderte Kategorien:', changedCategories);

          // Wenn Analytics deaktiviert wurde
          if (changedCategories.includes('analytics') && !cookie.categories.includes('analytics')) {
            // Remove Analytics cookies
            // clearAnalyticsCookies();
          }
        }
      });
    }).catch(err => {
      console.error('Failed to load Cookie Consent:', err);
    });

    // Cleanup
    return () => {
      // Cleanup if needed
    };
  }, []);

  return null; // Component has no UI (managed by library)
}

/**
 * Utility: Programmatically show cookie settings
 */
export function showCookieSettings() {
  if (typeof window !== 'undefined' && window.CookieConsent) {
    window.CookieConsent.showPreferences();
  }
}

/**
 * Utility: Check if user has accepted a specific category
 */
export function hasConsentFor(category) {
  if (typeof window !== 'undefined' && window.CookieConsent) {
    const cookie = window.CookieConsent.getCookie();
    return cookie && cookie.categories.includes(category);
  }
  return false;
}

/**
 * Utility: Get all accepted categories
 */
export function getAcceptedCategories() {
  if (typeof window !== 'undefined' && window.CookieConsent) {
    const cookie = window.CookieConsent.getCookie();
    return cookie ? cookie.categories : [];
  }
  return [];
}
