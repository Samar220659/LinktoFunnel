/**
 * IMPRESSUM (§5 TMG - PFLICHTANGABEN)
 *
 * ⚠️ KRITISCH: Ohne Impressum drohen bis zu €50.000 Strafe!
 *
 * ANLEITUNG:
 * 1. Gehe zu: https://www.impressum-generator.de/
 * 2. Fülle das Formular aus
 * 3. Kopiere den generierten Text
 * 4. Ersetze "IMPRESSUM_CONTENT" unten mit deinem Text
 */

import { useState } from 'react';
import Head from 'next/head';

export default function Impressum() {
  return (
    <>
      <Head>
        <title>Impressum - LinktoFunnel</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-8">
          {/* Header */}
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Impressum
          </h1>

          {/* Legal Notice Section */}
          <div className="prose prose-lg max-w-none">
            <h2>Angaben gemäß § 5 TMG</h2>

            <p className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-4">
              <strong>⚠️ WICHTIG:</strong> Ersetzen Sie diesen Platzhalter-Text mit Ihrem echten Impressum!
              <br />
              <br />
              Nutzen Sie den kostenlosen Generator:
              <a href="https://www.impressum-generator.de/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                impressum-generator.de
              </a>
            </p>

            {/*
              ============================================================
              ERSETZEN SIE DIESEN BEREICH MIT IHREM ECHTEN IMPRESSUM
              ============================================================
            */}

            <div className="bg-gray-100 p-6 rounded-lg my-6">
              <h3>Betreiber der Website</h3>
              <p>
                [Ihr vollständiger Name / Firmenname]<br />
                [Straße und Hausnummer]<br />
                [PLZ und Ort]<br />
                [Land]
              </p>

              <h3 className="mt-6">Kontakt</h3>
              <p>
                Telefon: [Ihre Telefonnummer]<br />
                E-Mail: [Ihre E-Mail-Adresse]
              </p>

              <h3 className="mt-6">Umsatzsteuer-ID</h3>
              <p>
                Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG:<br />
                [Ihre USt-ID oder "Nicht umsatzsteuerpflichtig" für Kleinunternehmer]
              </p>

              <h3 className="mt-6">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h3>
              <p>
                [Ihr vollständiger Name]<br />
                [Ihre Adresse]
              </p>
            </div>

            {/*
              ============================================================
              ENDE DES ZU ERSETZENDEN BEREICHS
              ============================================================
            */}

            <h2>EU-Streitschlichtung</h2>
            <p>
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:
              {' '}
              <a
                href="https://ec.europa.eu/consumers/odr/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                https://ec.europa.eu/consumers/odr/
              </a>
              .<br />
              Unsere E-Mail-Adresse finden Sie oben im Impressum.
            </p>

            <h2>Verbraucherstreitbeilegung / Universalschlichtungsstelle</h2>
            <p>
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
              Verbraucherschlichtungsstelle teilzunehmen.
            </p>

            <h2>Haftung für Inhalte</h2>
            <p>
              Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach
              den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter
              jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen
              oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
            </p>
            <p>
              Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen
              Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt
              der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden
              Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
            </p>

            <h2>Haftung für Links</h2>
            <p>
              Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss
              haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte
              der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
            </p>

            <h2>Urheberrecht</h2>
            <p>
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem
              deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung
              außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors
              bzw. Erstellers.
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
