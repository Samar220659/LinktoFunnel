/**
 * WIDERRUFSBELEHRUNG (BGB §312g)
 *
 * ⚠️ KRITISCH: Bei Verbraucherverträgen MUSS eine Widerrufsbelehrung vorhanden sein!
 *              Ohne korrekte Widerrufsbelehrung verlängert sich die Widerrufsfrist auf 12 Monate + 14 Tage!
 *
 * ANLEITUNG:
 * 1. Gehe zu: https://www.haendlerbund.de/de/downloads/muster-widerrufsbelehrung
 * 2. Oder: https://www.ihk.de/ (kostenlose Muster für Mitglieder)
 * 3. Passe das Muster an dein Geschäftsmodell an
 * 4. Ersetze den Platzhalter unten mit deinem Text
 */

import Head from 'next/head';

export default function Widerruf() {
  return (
    <>
      <Head>
        <title>Widerrufsbelehrung - LinktoFunnel</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8">
          {/* Header */}
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Widerrufsbelehrung
          </h1>

          {/* Important Notice */}
          <div className="prose prose-lg max-w-none">
            <div className="bg-gray-100 p-6 rounded-lg my-6">
              <h2>Widerrufsrecht</h2>

              <p>
                Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen.
              </p>

              <p>
                Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag, [je nach Vertragsart unterschiedlich]:
              </p>
              <ul>
                <li>an dem Sie oder ein von Ihnen benannter Dritter, der nicht der Beförderer ist, die Waren in
                    Besitz genommen haben bzw. hat (bei Warenlieferung)</li>
                <li>des Vertragsabschlusses (bei Dienstleistungen)</li>
                <li>an dem Sie oder ein von Ihnen benannter Dritter, der nicht der Beförderer ist, die erste Ware
                    in Besitz genommen haben bzw. hat (bei Lieferung mehrerer Waren)</li>
              </ul>

              <p>
                Um Ihr Widerrufsrecht auszuüben, müssen Sie uns:
              </p>
              <div className="bg-white p-4 rounded border border-gray-300 my-4">
                <p className="font-semibold">Daniel Oettel</p>
                <p>Pekinger Str. 5</p>
                <p>06712 Zeitz</p>
                <p>Deutschland</p>
                <p>E-Mail: a22061981@gmx.de</p>
              </div>

              <p>
                mittels einer eindeutigen Erklärung (z.B. ein mit der Post versandter Brief oder E-Mail) über Ihren
                Entschluss, diesen Vertrag zu widerrufen, informieren.
              </p>

              <p>
                Sie können dafür das beigefügte Muster-Widerrufsformular verwenden, das jedoch nicht vorgeschrieben ist.
              </p>

              <p>
                Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung des
                Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.
              </p>

              <h2>Folgen des Widerrufs</h2>

              <p>
                Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben,
                einschließlich der Lieferkosten (mit Ausnahme der zusätzlichen Kosten, die sich daraus ergeben, dass
                Sie eine andere Art der Lieferung als die von uns angebotene, günstigste Standardlieferung gewählt
                haben), unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die
                Mitteilung über Ihren Widerruf dieses Vertrags bei uns eingegangen ist.
              </p>

              <p>
                Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der ursprünglichen Transaktion
                eingesetzt haben, es sei denn, mit Ihnen wurde ausdrücklich etwas anderes vereinbart; in keinem Fall
                werden Ihnen wegen dieser Rückzahlung Entgelte berechnet.
              </p>

              <h3>Bei Warenlieferung:</h3>
              <p>
                Wir können die Rückzahlung verweigern, bis wir die Waren wieder zurückerhalten haben oder bis Sie den
                Nachweis erbracht haben, dass Sie die Waren zurückgesandt haben, je nachdem, welches der frühere
                Zeitpunkt ist.
              </p>

              <p>
                Sie haben die Waren unverzüglich und in jedem Fall spätestens binnen vierzehn Tagen ab dem Tag, an dem
                Sie uns über den Widerruf dieses Vertrags unterrichten, an uns zurückzusenden oder zu übergeben. Die
                Frist ist gewahrt, wenn Sie die Waren vor Ablauf der Frist von vierzehn Tagen absenden.
              </p>

              <p>
                Sie tragen die unmittelbaren Kosten der Rücksendung der Waren.
              </p>

              <p>
                Sie müssen für einen etwaigen Wertverlust der Waren nur aufkommen, wenn dieser Wertverlust auf einen
                zur Prüfung der Beschaffenheit, Eigenschaften und Funktionsweise der Waren nicht notwendigen Umgang
                mit ihnen zurückzuführen ist.
              </p>

              <h3>Bei Dienstleistungen:</h3>
              <p>
                Haben Sie verlangt, dass die Dienstleistungen während der Widerrufsfrist beginnen soll, so haben Sie
                uns einen angemessenen Betrag zu zahlen, der dem Anteil der bis zu dem Zeitpunkt, zu dem Sie uns von
                der Ausübung des Widerrufsrechts hinsichtlich dieses Vertrags unterrichten, bereits erbrachten
                Dienstleistungen im Vergleich zum Gesamtumfang der im Vertrag vorgesehenen Dienstleistungen entspricht.
              </p>

              <h2>Ausschluss des Widerrufsrechts</h2>

              <p className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <strong>⚠️ WICHTIG:</strong> Das Widerrufsrecht besteht nicht bei:
              </p>

              <ul className="list-disc pl-6 my-4">
                <li>Verträgen zur Lieferung von Waren, die nicht vorgefertigt sind und für deren Herstellung eine
                    individuelle Auswahl oder Bestimmung durch den Verbraucher maßgeblich ist oder die eindeutig
                    auf die persönlichen Bedürfnisse des Verbrauchers zugeschnitten sind</li>

                <li>Verträgen zur Lieferung von Waren, die schnell verderben können oder deren Verfallsdatum schnell
                    überschritten würde</li>

                <li>Verträgen zur Lieferung versiegelter Waren, die aus Gründen des Gesundheitsschutzes oder der
                    Hygiene nicht zur Rückgabe geeignet sind, wenn ihre Versiegelung nach der Lieferung entfernt wurde</li>

                <li>Verträgen zur Lieferung von Ton- oder Videoaufnahmen oder Computersoftware in einer versiegelten
                    Packung, wenn die Versiegelung nach der Lieferung entfernt wurde</li>

                <li><strong className="text-red-600">Verträgen zur Erbringung von Dienstleistungen, wenn der Unternehmer diese
                    vollständig erbracht hat und mit der Ausführung der Dienstleistung erst begonnen hat, nachdem
                    der Verbraucher dazu seine ausdrückliche Zustimmung gegeben hat und gleichzeitig seine Kenntnis
                    davon bestätigt hat, dass er sein Widerrufsrecht bei vollständiger Vertragserfüllung durch den
                    Unternehmer verliert</strong></li>

                <li>Verträgen zur Lieferung digitaler Inhalte, die nicht auf einem körperlichen Datenträger geliefert
                    werden, wenn der Unternehmer mit der Ausführung des Vertrags begonnen hat, nachdem der Verbraucher
                    dazu seine ausdrückliche Zustimmung gegeben hat und gleichzeitig seine Kenntnis davon bestätigt
                    hat, dass er sein Widerrufsrecht bei Beginn der Vertragsausführung verliert</li>
              </ul>

              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-6">
                <h3 className="font-bold">💡 Für digitale Produkte (z.B. Software, Online-Kurse):</h3>
                <p className="mt-2">
                  Wenn Sie digitale Inhalte anbieten, benötigen Sie eine <strong>ausdrückliche Zustimmung</strong>
                  des Kunden VOR dem Download:
                </p>
                <div className="bg-white p-4 rounded border border-gray-300 mt-2">
                  <p className="text-sm">
                    <strong>Beispiel-Checkbox vor Download:</strong>
                    <br />
                    <input type="checkbox" id="widerruf-verzicht" className="mr-2" />
                    <label htmlFor="widerruf-verzicht">
                      "Ich stimme zu, dass mit der Ausführung des Vertrages vor Ablauf der Widerrufsfrist begonnen wird.
                      Mir ist bekannt, dass ich mit Beginn der Ausführung des Vertrages mein Widerrufsrecht verliere."
                    </label>
                  </p>
                </div>
              </div>
            </div>

            {/*
              ============================================================
              ENDE DES ZU ERSETZENDEN BEREICHS
              ============================================================
            */}

            <h2>Muster-Widerrufsformular</h2>

            <div className="bg-gray-50 border border-gray-300 p-6 rounded my-4">
              <p className="text-sm italic">
                (Wenn Sie den Vertrag widerrufen wollen, dann füllen Sie bitte dieses Formular aus und senden Sie es zurück.)
              </p>

              <div className="mt-4 space-y-2">
                <p>An:</p>
                <p className="font-semibold pl-4">
                  [Ihr Firmenname]<br />
                  [Ihre Adresse]<br />
                  E-Mail: [Ihre E-Mail]
                </p>

                <p className="pt-4">
                  Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über den Kauf der
                  folgenden Waren (*)/die Erbringung der folgenden Dienstleistung (*)
                </p>

                <p>Bestellt am (*)/erhalten am (*): _______________</p>
                <p>Name des/der Verbraucher(s): _______________</p>
                <p>Anschrift des/der Verbraucher(s): _______________</p>
                <p>Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier): _______________</p>
                <p>Datum: _______________</p>

                <p className="text-sm italic pt-4">
                  (*) Unzutreffendes streichen.
                </p>
              </div>
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
