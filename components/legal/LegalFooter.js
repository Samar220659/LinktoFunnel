/**
 * 📄 LEGAL FOOTER COMPONENT
 *
 * Pflicht-Links für deutsche Websites:
 * - Impressum (§5 TMG)
 * - Datenschutz (Art. 13 DSGVO)
 * - AGB
 * - Widerruf
 */

export default function LegalFooter() {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        {/* Legal Links */}
        <div style={styles.legalLinks}>
          <a href="/impressum" style={styles.link}>
            Impressum
          </a>
          <span style={styles.separator}>|</span>
          <a href="/datenschutz" style={styles.link}>
            Datenschutz
          </a>
          <span style={styles.separator}>|</span>
          <a href="/agb" style={styles.link}>
            AGB
          </a>
          <span style={styles.separator}>|</span>
          <a href="/widerruf" style={styles.link}>
            Widerrufsbelehrung
          </a>
        </div>

        {/* Cookie Settings Button */}
        <div style={styles.cookieButton}>
          <button
            onClick={() => {
              if (typeof window !== 'undefined' && window.CookieConsent) {
                window.CookieConsent.showPreferences();
              }
            }}
            style={styles.button}
          >
            🍪 Cookie-Einstellungen
          </button>
        </div>

        {/* Copyright */}
        <div style={styles.copyright}>
          © {new Date().getFullYear()} LinktoFunnel. Alle Rechte vorbehalten.
        </div>

        {/* EU Online Dispute Resolution */}
        <div style={styles.odr}>
          <a
            href="https://ec.europa.eu/consumers/odr"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.odrLink}
          >
            EU Online-Streitbeilegung
          </a>
        </div>

        {/* Affiliate Disclosure */}
        <div style={styles.disclosure}>
          <small>
            ⚠️ Diese Website enthält Affiliate-Links (Werbelinks). Bei Käufen über diese Links
            erhalten wir eine Provision, ohne dass Ihnen zusätzliche Kosten entstehen.
          </small>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    backgroundColor: '#f8f9fa',
    borderTop: '1px solid #dee2e6',
    padding: '30px 20px',
    marginTop: '60px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    textAlign: 'center'
  },
  legalLinks: {
    marginBottom: '15px',
    fontSize: '14px'
  },
  link: {
    color: '#333',
    textDecoration: 'none',
    padding: '0 10px',
    transition: 'color 0.2s'
  },
  separator: {
    color: '#999',
    padding: '0 5px'
  },
  cookieButton: {
    marginBottom: '15px'
  },
  button: {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    transition: 'background-color 0.2s'
  },
  copyright: {
    fontSize: '13px',
    color: '#666',
    marginBottom: '10px'
  },
  odr: {
    fontSize: '11px',
    marginBottom: '10px'
  },
  odrLink: {
    color: '#666',
    textDecoration: 'underline'
  },
  disclosure: {
    fontSize: '11px',
    color: '#666',
    marginTop: '15px',
    padding: '10px',
    backgroundColor: '#fff3cd',
    borderRadius: '4px',
    maxWidth: '800px',
    margin: '15px auto 0'
  }
};
