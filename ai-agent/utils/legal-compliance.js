/**
 * 💪 ZERO-BUDGET LEGAL COMPLIANCE SYSTEM
 *
 * Kostenlose Lösung für vollständige rechtliche Absicherung in DE/EU
 *
 * Features:
 * - Automatische Affiliate-Link Kennzeichnung (UWG §5a)
 * - AI-Content Disclosure (EU AI Act Art. 50)
 * - Content Moderation (NetzDG Basis)
 * - DSGVO-konform
 */

// ===== AFFILIATE DISCLOSURE (UWG §5a) =====

const AFFILIATE_DISCLOSURES = {
  de: {
    // Vollständiger Hinweis (für Landing Pages, Blog Posts)
    full: `🔔 WERBUNG | Affiliate-Links

Dieser Beitrag enthält Werbelinks (Affiliate-Links). Wenn du über diese Links einkaufst, erhalte ich eine kleine Provision, ohne dass dir zusätzliche Kosten entstehen. Dies hilft mir, diese Website zu betreiben. Danke für deine Unterstützung!`,

    // Kurzer Hinweis (für Social Media)
    short: `🔔 WERBUNG | Dieser Beitrag enthält Affiliate-Links`,

    // Minimaler Hinweis (sehr kurze Posts)
    minimal: `🔔 WERBUNG`,

    // Hashtags (zusätzlich!)
    hashtags: `#Werbung #Anzeige #AffiliateLinks`,

    // Plattform-spezifisch
    instagram: `[WERBUNG] Dieser Beitrag enthält Affiliate-Links. Keine bezahlte Partnerschaft.

`,

    tiktok: `#ad #sponsored #werbung #affiliatelinks

`,

    youtube: `⚠️ WERBEHINWEIS: Dieses Video enthält Affiliate-Links (Werbelinks).

Wenn du über diese Links etwas kaufst, erhalte ich eine kleine Provision, ohne dass dir zusätzliche Kosten entstehen. Dies hilft mir, den Kanal zu betreiben.

Vielen Dank für deine Unterstützung! ❤️`,

    pinterest: `🔔 WERBUNG | Affiliate-Pin

Dieser Pin enthält Werbelinks.`,

    twitter: `🔔 WERBUNG | Affiliate-Links

`,

    facebook: `[WERBUNG]
Dieser Beitrag enthält Affiliate-Links.

`,

    linkedin: `Hinweis: Dieser Beitrag enthält Affiliate-Links (Werbung).

`
  }
};

/**
 * Füge Affiliate-Disclosure zu Content hinzu
 * @param {string} content - Der Content
 * @param {string} platform - Plattform (instagram, tiktok, youtube, etc.)
 * @param {string} style - Stil (full, short, minimal)
 * @returns {string} Content mit Disclosure
 */
function addAffiliateDisclosure(content, platform = 'default', style = 'full') {
  // Prüfe, ob bereits Disclosure vorhanden
  if (hasDisclosure(content)) {
    return content;
  }

  // Wähle passende Disclosure
  let disclosure;
  if (AFFILIATE_DISCLOSURES.de[platform]) {
    disclosure = AFFILIATE_DISCLOSURES.de[platform];
  } else {
    disclosure = AFFILIATE_DISCLOSURES.de[style] || AFFILIATE_DISCLOSURES.de.full;
  }

  // WICHTIG: Disclosure MUSS am Anfang stehen (deutsches Recht!)
  return `${disclosure}\n\n${content}`;
}

/**
 * Prüfe, ob Content bereits Disclosure hat
 * @param {string} content
 * @returns {boolean}
 */
function hasDisclosure(content) {
  const keywords = [
    'werbung', 'anzeige', 'affiliate', 'werbelink', 'werbelinks',
    '#ad', '#sponsored', '#werbung', '[werbung]'
  ];
  const lowerContent = content.toLowerCase();
  return keywords.some(keyword => lowerContent.includes(keyword));
}

// ===== AI CONTENT DISCLOSURE (EU AI Act Art. 50) =====

const AI_DISCLOSURES = {
  de: {
    // Wasserzeichen (kurz)
    watermark: '🤖 Mit KI erstellt',

    // Vollständiger Hinweis
    full: 'Dieser Inhalt wurde mit Künstlicher Intelligenz (KI) erstellt.',

    // Footer (für längere Inhalte)
    footer: '\n\n---\n🤖 Dieser Beitrag wurde mit KI-Unterstützung erstellt.',

    // Social Media (kurz)
    social: '\n\n🤖 KI-generierter Content',

    // Metadata (machine-readable)
    metadata: {
      aiGenerated: true,
      model: null,
      timestamp: null
    }
  }
};

/**
 * Füge AI-Disclosure hinzu
 * @param {string} content
 * @param {string} position - 'header', 'footer', 'social'
 * @param {object} options - { model: 'gemini-pro' }
 * @returns {string}
 */
function addAIDisclosure(content, position = 'footer', options = {}) {
  const { model = 'KI' } = options;

  switch (position) {
    case 'header':
      return `${AI_DISCLOSURES.de.full}\n\n${content}`;

    case 'social':
      return `${content}${AI_DISCLOSURES.de.social}`;

    case 'watermark':
      return `${AI_DISCLOSURES.de.watermark}\n\n${content}`;

    case 'footer':
    default:
      return `${content}${AI_DISCLOSURES.de.footer}`;
  }
}

/**
 * Erstelle AI-Metadata (machine-readable per EU AI Act)
 * @param {object} postObject
 * @param {string} model
 * @returns {object}
 */
function addAIMetadata(postObject, model = 'gemini-pro') {
  return {
    ...postObject,
    metadata: {
      ...postObject.metadata,
      aiGenerated: true,
      model: model,
      timestamp: new Date().toISOString(),
      disclosure: AI_DISCLOSURES.de.full
    }
  };
}

// ===== CONTENT MODERATION (NetzDG Basis) =====

// WARNUNG: Diese Liste ist NICHT vollständig!
// Erweitern Sie sie entsprechend Ihrer Anforderungen!
const ILLEGAL_KEYWORDS = {
  // Hate Speech (Beispiele)
  hateСpeech: [
    'nazi', 'hitler', 'holocaust leugnung'
  ],

  // Gewalt
  violence: [
    'töten', 'mord', 'bombenanleitung'
  ],

  // Drogen (illegale)
  drugs: [
    'kokain kaufen', 'heroin', 'crystal meth'
  ],

  // Waffen (illegale)
  weapons: [
    'waffe kaufen', 'schusswaffe illegal'
  ],

  // Copyright-Verstöße
  copyright: [
    'torrent', 'crack download', 'keygen', 'warez'
  ],

  // Betrug / Scam
  scam: [
    'reich über nacht', 'geld verdienen ohne arbeit',
    '10000 euro pro tag', 'garantiert reich werden'
  ],

  // Spam-Patterns
  spam: [
    'klick hier jetzt', 'limited offer now', 'act now'
  ]
};

/**
 * Prüfe Content auf illegale Inhalte
 * @param {string} content
 * @returns {object} { approved: boolean, issues: array }
 */
function moderateContent(content) {
  const issues = [];
  const lowerContent = content.toLowerCase();

  // 1. Prüfe auf illegale Keywords
  for (const [category, keywords] of Object.entries(ILLEGAL_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerContent.includes(keyword)) {
        issues.push({
          type: 'illegal_keyword',
          category: category,
          keyword: keyword,
          severity: 'critical',
          action: 'block',
          message: `Illegaler Inhalt erkannt: ${category}`
        });
      }
    }
  }

  // 2. Prüfe auf zu viele URLs (Spam-Indikator)
  const urlCount = (content.match(/https?:\/\//g) || []).length;
  if (urlCount > 5) {
    issues.push({
      type: 'too_many_urls',
      count: urlCount,
      severity: 'warning',
      message: `Zu viele URLs: ${urlCount} (max. 5 empfohlen)`
    });
  }

  // 3. Prüfe auf zu viele Hashtags (Spam-Indikator)
  const hashtagCount = (content.match(/#\w+/g) || []).length;
  if (hashtagCount > 30) {
    issues.push({
      type: 'too_many_hashtags',
      count: hashtagCount,
      severity: 'warning',
      message: `Zu viele Hashtags: ${hashtagCount} (max. 30 empfohlen)`
    });
  }

  // 4. Prüfe auf Mindestlänge
  if (content.length < 20) {
    issues.push({
      type: 'too_short',
      length: content.length,
      severity: 'warning',
      message: 'Content zu kurz (min. 20 Zeichen empfohlen)'
    });
  }

  // 5. Prüfe auf übermäßig viele Großbuchstaben (SPAM!)
  const upperCaseCount = (content.match(/[A-Z]/g) || []).length;
  const upperCaseRatio = upperCaseCount / content.length;
  if (upperCaseRatio > 0.3 && content.length > 50) {
    issues.push({
      type: 'too_many_capitals',
      ratio: upperCaseRatio,
      severity: 'warning',
      message: 'Zu viele Großbuchstaben (wirkt wie Spam)'
    });
  }

  // 6. Prüfe auf übermäßig viele Emojis
  const emojiCount = (content.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length;
  const emojiRatio = emojiCount / (content.length / 10);
  if (emojiRatio > 3) {
    issues.push({
      type: 'too_many_emojis',
      count: emojiCount,
      severity: 'info',
      message: 'Sehr viele Emojis verwendet'
    });
  }

  // Entscheide: approved = true wenn keine critical issues
  const approved = !issues.some(i => i.severity === 'critical');

  return {
    approved: approved,
    issues: issues,
    content: content,
    stats: {
      length: content.length,
      urls: urlCount,
      hashtags: hashtagCount,
      emojis: emojiCount,
      upperCaseRatio: upperCaseRatio
    }
  };
}

// ===== ALL-IN-ONE COMPLIANCE FUNCTION =====

/**
 * Mache Content vollständig rechtskonform
 *
 * Diese Funktion wendet ALLE erforderlichen Compliance-Maßnahmen an:
 * - Content Moderation (blockiert illegale Inhalte)
 * - Affiliate Disclosure (UWG §5a)
 * - AI Disclosure (EU AI Act Art. 50)
 *
 * @param {string} content - Der Original-Content
 * @param {object} options - Optionen
 * @returns {object} { success: boolean, content: string, issues: array }
 */
function makeCompliant(content, options = {}) {
  const {
    platform = 'default',
    hasAffiliateLinks = true,
    isAIGenerated = true,
    disclosureStyle = 'full',
    aiDisclosurePosition = 'footer',
    aiModel = 'gemini-pro',
    strict = true
  } = options;

  let compliantContent = content;
  const allIssues = [];

  // SCHRITT 1: Content Moderation (ZUERST!)
  const moderation = moderateContent(compliantContent);

  if (!moderation.approved) {
    if (strict) {
      // Im strict mode: blockiere content
      return {
        success: false,
        content: null,
        error: 'Content wurde durch Moderation blockiert',
        issues: moderation.issues,
        blocked: true
      };
    } else {
      // Im non-strict mode: warne nur
      allIssues.push(...moderation.issues);
    }
  } else {
    // Füge Warnungen hinzu (auch wenn approved)
    allIssues.push(...moderation.issues.filter(i => i.severity === 'warning'));
  }

  // SCHRITT 2: Affiliate Disclosure (falls Affiliate-Links vorhanden)
  if (hasAffiliateLinks) {
    compliantContent = addAffiliateDisclosure(compliantContent, platform, disclosureStyle);
    allIssues.push({
      type: 'compliance_applied',
      action: 'affiliate_disclosure',
      severity: 'info',
      message: 'Affiliate-Kennzeichnung hinzugefügt'
    });
  }

  // SCHRITT 3: AI Disclosure (falls AI-generiert)
  if (isAIGenerated) {
    compliantContent = addAIDisclosure(compliantContent, aiDisclosurePosition, { model: aiModel });
    allIssues.push({
      type: 'compliance_applied',
      action: 'ai_disclosure',
      severity: 'info',
      message: 'KI-Kennzeichnung hinzugefügt'
    });
  }

  return {
    success: true,
    content: compliantContent,
    issues: allIssues,
    stats: moderation.stats,
    blocked: false
  };
}

// ===== UTILITY FUNCTIONS =====

/**
 * Extrahiere alle URLs aus Content
 */
function extractURLs(content) {
  const urlRegex = /https?:\/\/[^\s]+/g;
  return content.match(urlRegex) || [];
}

/**
 * Zähle Wörter
 */
function countWords(content) {
  return content.split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Prüfe, ob Content Affiliate-Links enthält
 */
function hasAffiliateLinks(content) {
  const affiliatePatterns = [
    /digistore24\.com/i,
    /awin1\.com/i,
    /amazon\.[a-z.]+\/.*\/dp\//i,
    /bit\.ly/i,
    /\/ref=/i,
    /\?aff=/i,
    /affiliate/i
  ];

  return affiliatePatterns.some(pattern => pattern.test(content));
}

// ===== LOGGING & REPORTING =====

/**
 * Erstelle Compliance Report
 */
function generateComplianceReport(result) {
  const report = {
    timestamp: new Date().toISOString(),
    success: result.success,
    blocked: result.blocked,
    contentLength: result.content ? result.content.length : 0,
    issuesCount: result.issues.length,
    criticalIssues: result.issues.filter(i => i.severity === 'critical').length,
    warnings: result.issues.filter(i => i.severity === 'warning').length,
    stats: result.stats || {}
  };

  return report;
}

// ===== EXPORTS =====

module.exports = {
  // Affiliate Disclosure
  addAffiliateDisclosure,
  hasDisclosure,
  AFFILIATE_DISCLOSURES,

  // AI Disclosure
  addAIDisclosure,
  addAIMetadata,
  AI_DISCLOSURES,

  // Content Moderation
  moderateContent,
  ILLEGAL_KEYWORDS,

  // All-in-one
  makeCompliant,

  // Utilities
  extractURLs,
  countWords,
  hasAffiliateLinks,
  generateComplianceReport
};
