/**
 * ALLGEMEINE GESCHÄFTSBEDINGUNGEN (AGB)
 *
 * ⚠️ WICHTIG: AGB sind essentiell für rechtssichere Geschäfte!
 *
 * ANLEITUNG:
 * 1. Gehe zu: https://www.agb.de/agb-erstellen (kostenlos!)
 * 2. Oder: https://www.ihk.de/ (viele IHKs bieten kostenlose Muster)
 * 3. Fülle das Formular aus
 * 4. Kopiere den generierten Text
 * 5. Ersetze den Platzhalter unten mit deinem Text
 */

import Head from 'next/head';

export default function AGB() {
  return (
    <>
      <Head>
        <title>AGB - Allgemeine Geschäftsbedingungen - LinktoFunnel</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8">
          {/* Header */}
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Allgemeine Geschäftsbedingungen (AGB)
          </h1>

          {/* Important Notice */}
          <div className="prose prose-lg max-w-none">
            <div className="bg-gray-100 p-6 rounded-lg my-6">
              <h2>§ 1 Geltungsbereich</h2>
              <p>
                (1) Diese Allgemeinen Geschäftsbedingungen (nachfolgend "AGB") gelten für alle Verträge über die
                Lieferung von Waren und/oder Dienstleistungen, die zwischen Daniel Oettel (nachfolgend "Anbieter")
                und dem Kunden (nachfolgend "Kunde") geschlossen werden.
              </p>
              <p>
                (2) Abweichende Bedingungen des Kunden werden nicht anerkannt, es sei denn, der Anbieter stimmt
                ihrer Geltung ausdrücklich schriftlich zu.
              </p>

              <h2>§ 2 Vertragsschluss</h2>
              <p>
                (1) Die Darstellung der Produkte im Online-Shop stellt kein rechtlich bindendes Angebot, sondern
                nur eine Aufforderung zur Bestellung dar.
              </p>
              <p>
                (2) Durch Anklicken des Buttons "Kaufen" oder vergleichbarer Buttons gibt der Kunde eine verbindliche
                Bestellung ab.
              </p>
              <p>
                (3) Der Anbieter bestätigt den Eingang der Bestellung per E-Mail. Diese Bestätigung stellt noch keine
                Annahme des Vertrages dar, es sei denn, darin wird neben der Bestätigung des Zugangs zugleich die
                Annahme erklärt.
              </p>

              <h2>§ 3 Preise und Zahlung</h2>
              <p>
                (1) Alle Preise sind Endpreise und enthalten die gesetzliche Mehrwertsteuer.
              </p>
              <p>
                (2) Folgende Zahlungsarten stehen zur Verfügung:
              </p>
              <ul>
                <li>PayPal</li>
                <li>DigiStore24 (für Affiliate-Produkte)</li>
              </ul>

              <h2>§ 4 Lieferung und Versand</h2>
              <p>
                (1) Die Lieferung erfolgt digital über Online-Zugang oder per E-Mail.
              </p>
              <p>
                (2) Die Lieferzeit beträgt in der Regel unmittelbar nach Zahlungseingang bzw. erfolgt automatisiert.
              </p>

              <h2>§ 5 Widerrufsrecht</h2>
              <p className="bg-red-50 border-l-4 border-red-400 p-4">
                <strong>⚠️ WICHTIG:</strong> Das Widerrufsrecht muss bei Verbraucherverträgen angegeben werden!
                <br />
                Details finden Sie in unserer separaten Widerrufsbelehrung.
                <br />
                <a href="/widerruf" className="text-blue-600 hover:underline">
                  → Zur Widerrufsbelehrung
                </a>
              </p>

              <h2>§ 6 Gewährleistung</h2>
              <p>
                Es gelten die gesetzlichen Gewährleistungsrechte.
              </p>

              <h2>§ 7 Haftung</h2>
              <p>
                (1) Der Anbieter haftet unbeschränkt für Vorsatz und grobe Fahrlässigkeit sowie nach dem Produkthaftungsgesetz.
              </p>
              <p>
                (2) Bei leicht fahrlässiger Verletzung von Pflichten, deren Erfüllung die ordnungsgemäße Durchführung
                des Vertrages überhaupt erst ermöglicht und auf deren Einhaltung der Kunde regelmäßig vertrauen darf
                (Kardinalspflichten), ist die Haftung der Höhe nach auf den bei Vertragsschluss vorhersehbaren Schaden begrenzt.
              </p>
              <p>
                (3) Im Übrigen ist die Haftung ausgeschlossen.
              </p>

              <h2>§ 8 Affiliate-Programme</h2>
              <p>
                Diese Website nimmt an Affiliate-Partnerprogrammen teil. Wenn Sie über unsere Links Produkte kaufen,
                erhalten wir eine Provision, ohne dass Ihnen dadurch zusätzliche Kosten entstehen.
              </p>
              <p>
                Zu unseren Partnerprogrammen gehören:
              </p>
              <ul>
                <li>DigiStore24</li>
                <li>[Weitere Partnerprogramme]</li>
              </ul>

              <h2>§ 9 Urheberrecht</h2>
              <p>
                Alle Inhalte dieser Website (Texte, Bilder, Grafiken, etc.) unterliegen dem Urheberrecht. Eine
                Vervielfältigung oder Verwendung ohne ausdrückliche Genehmigung ist nicht gestattet.
              </p>

              <h2>§ 10 Datenschutz</h2>
              <p>
                Der Anbieter erhebt, verarbeitet und nutzt personenbezogene Daten nur im Rahmen der gesetzlichen
                Bestimmungen. Details finden Sie in unserer Datenschutzerklärung.
                <br />
                <a href="/datenschutz" className="text-blue-600 hover:underline">
                  → Zur Datenschutzerklärung
                </a>
              </p>

              <h2>§ 11 Schlussbestimmungen</h2>
              <p>
                (1) Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts.
              </p>
              <p>
                (2) Gerichtsstand ist, soweit gesetzlich zulässig, der Sitz des Anbieters.
              </p>
              <p>
                (3) Sollten einzelne Bestimmungen dieser AGB unwirksam sein, bleibt die Wirksamkeit der übrigen
                Bestimmungen unberührt.
              </p>
            </div>

            {/*
              ============================================================
              ENDE DES ZU ERSETZENDEN BEREICHS
              ============================================================
            */}

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-6">
              <h3 className="font-bold">📋 Checkliste für Ihre AGB:</h3>
              <ul className="list-disc pl-6 mt-2">
                <li>✅ Geltungsbereich klar definiert</li>
                <li>✅ Vertragsschluss-Prozess beschrieben</li>
                <li>✅ Preise und Zahlungsbedingungen</li>
                <li>✅ Lieferung und Versand</li>
                <li>✅ Widerrufsrecht (Pflicht bei Verbraucherverträgen!)</li>
                <li>✅ Gewährleistung</li>
                <li>✅ Haftungsbeschränkungen</li>
                <li>✅ Affiliate-Hinweise (falls zutreffend)</li>
                <li>✅ Urheberrecht</li>
                <li>✅ Datenschutz-Verweis</li>
                <li>✅ Gerichtsstand und anwendbares Recht</li>
              </ul>
            </div>

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
