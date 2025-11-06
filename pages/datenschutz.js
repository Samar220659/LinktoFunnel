/**
 * DATENSCHUTZERKLÄRUNG (DSGVO)
 *
 * ⚠️ KRITISCH: Ohne Datenschutzerklärung drohen bis zu €20.000.000 Strafe (oder 4% Jahresumsatz)!
 *
 * ANLEITUNG:
 * 1. Gehe zu: https://datenschutz-generator.de/
 * 2. Fülle das Formular aus (alle Tools die du nutzt angeben!)
 * 3. Kopiere den generierten Text
 * 4. Ersetze "DATENSCHUTZ_CONTENT" unten mit deinem Text
 */

import Head from 'next/head';
import { useEffect } from 'react';

export default function Datenschutz() {
  // Cookie Consent einbinden (falls noch nicht)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.CookieConsent) {
      // Cookie Consent ist geladen
    }
  }, []);

  return (
    <>
      <Head>
        <title>Datenschutzerklärung - LinktoFunnel</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8">
          {/* Header */}
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Datenschutzerklärung
          </h1>

          {/* Important Notice */}
          <div className="prose prose-lg max-w-none">
            <p className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-4">
              <strong>⚠️ WICHTIG:</strong> Ersetzen Sie diesen Platzhalter-Text mit Ihrer echten Datenschutzerklärung!
              <br />
              <br />
              Nutzen Sie den kostenlosen Generator:
              <a href="https://datenschutz-generator.de/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                datenschutz-generator.de
              </a>
              <br />
              <br />
              <strong>Geben Sie ALLE genutzten Tools an:</strong> Google Analytics, Supabase, Buffer, Ayrshare,
              PayPal, Telegram, alle Social Media APIs, etc.
            </p>

            {/*
              ============================================================
              ERSETZEN SIE DIESEN BEREICH MIT IHRER ECHTEN DATENSCHUTZERKLÄRUNG
              ============================================================
            */}

            <div className="bg-gray-100 p-6 rounded-lg my-6">
              <h2>1. Datenschutz auf einen Blick</h2>

              <h3>Allgemeine Hinweise</h3>
              <p>
                Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen
                Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit
                denen Sie persönlich identifiziert werden können.
              </p>

              <h3>Datenerfassung auf dieser Website</h3>
              <h4>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</h4>
              <p>
                Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten
                können Sie dem Impressum dieser Website entnehmen.
              </p>

              <h4>Wie erfassen wir Ihre Daten?</h4>
              <p>
                Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei kann es sich
                z.B. um Daten handeln, die Sie in ein Kontaktformular eingeben.
              </p>
              <p>
                Andere Daten werden automatisch beim Besuch der Website durch unsere IT-Systeme erfasst. Das sind
                vor allem technische Daten (z.B. Internetbrowser, Betriebssystem oder Uhrzeit des Seitenaufrufs).
              </p>

              <h3>Wofür nutzen wir Ihre Daten?</h3>
              <p>
                Ein Teil der Daten wird erhoben, um eine fehlerfreie Bereitstellung der Website zu gewährleisten.
                Andere Daten können zur Analyse Ihres Nutzerverhaltens verwendet werden.
              </p>

              <h3>Welche Rechte haben Sie bezüglich Ihrer Daten?</h3>
              <p>
                Sie haben jederzeit das Recht unentgeltlich Auskunft über Herkunft, Empfänger und Zweck Ihrer
                gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem ein Recht, die Berichtigung
                oder Löschung dieser Daten zu verlangen.
              </p>

              <h2>2. Hosting</h2>

              <h3>Externes Hosting</h3>
              <p>
                Diese Website wird bei einem externen Dienstleister gehostet (Hoster). Die personenbezogenen Daten,
                die auf dieser Website erfasst werden, werden auf den Servern des Hosters gespeichert.
              </p>
              <p>
                <strong>[HIER HOSTING-ANBIETER EINTRAGEN: Railway, Render, Vercel, etc.]</strong>
              </p>

              <h2>3. Allgemeine Hinweise und Pflichtinformationen</h2>

              <h3>Datenschutz</h3>
              <p>
                Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln
                Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften
                sowie dieser Datenschutzerklärung.
              </p>

              <h2>4. Datenerfassung auf dieser Website</h2>

              <h3>Cookies</h3>
              <p>
                Diese Website verwendet Cookies. Cookies sind kleine Textdateien, die auf Ihrem Computer gespeichert
                werden und die Ihr Browser speichert. Durch die Nutzung dieser Website erklären Sie sich mit der
                Verwendung von Cookies einverstanden.
              </p>
              <p>
                Sie können Ihre Cookie-Einstellungen jederzeit anpassen über den Button "Cookie-Einstellungen" im Footer.
              </p>

              <h3>Server-Log-Dateien</h3>
              <p>
                Der Provider der Seiten erhebt und speichert automatisch Informationen in so genannten Server-Log-Dateien:
              </p>
              <ul>
                <li>Browsertyp und Browserversion</li>
                <li>verwendetes Betriebssystem</li>
                <li>Referrer URL</li>
                <li>Hostname des zugreifenden Rechners</li>
                <li>Uhrzeit der Serveranfrage</li>
                <li>IP-Adresse</li>
              </ul>

              <h2>5. Plugins und Tools</h2>

              <p className="bg-blue-50 border-l-4 border-blue-400 p-4">
                <strong>📋 WICHTIG:</strong> Hier müssen Sie ALLE genutzten Dienste aufführen:
              </p>

              <ul className="list-disc pl-6">
                <li><strong>Supabase</strong> - Datenbankhosting und Authentifizierung</li>
                <li><strong>Buffer & Ayrshare</strong> - Social Media Management</li>
                <li><strong>PayPal</strong> - Zahlungsabwicklung</li>
                <li><strong>Telegram</strong> - Bot-Kommunikation</li>
                <li><strong>Google Gemini AI</strong> - Content-Generierung</li>
                <li><strong>Social Media APIs</strong> - TikTok, Instagram, YouTube, etc.</li>
                <li>Weitere von Ihnen genutzte Tools...</li>
              </ul>

              <h2>6. Affiliate-Programme</h2>

              <h3>DigiStore24 Partnerprogramm</h3>
              <p>
                Diese Website nimmt am Partnerprogramm von DigiStore24 teil. Wenn Sie über unsere Affiliate-Links
                einkaufen, erhalten wir eine Provision. Dabei können personenbezogene Daten wie IP-Adresse und
                Klickverhalten erfasst werden.
              </p>

              <h2>7. Ihre Rechte</h2>

              <h3>Auskunftsrecht</h3>
              <p>
                Sie haben das Recht, jederzeit Auskunft über Ihre bei uns gespeicherten personenbezogenen Daten zu erhalten.
              </p>

              <h3>Recht auf Löschung</h3>
              <p>
                Sie haben das Recht, die Löschung Ihrer personenbezogenen Daten zu verlangen.
              </p>

              <h3>Widerspruchsrecht</h3>
              <p>
                Sie haben das Recht, der Verarbeitung Ihrer personenbezogenen Daten zu widersprechen.
              </p>

              <h3>Beschwerderecht</h3>
              <p>
                Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren.
              </p>
            </div>

            {/*
              ============================================================
              ENDE DES ZU ERSETZENDEN BEREICHS
              ============================================================
            */}

            <p className="text-sm text-gray-600 mt-8">
              Stand: {new Date().toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Back Button */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <a
              href="/"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Zurück zur Startseite
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
