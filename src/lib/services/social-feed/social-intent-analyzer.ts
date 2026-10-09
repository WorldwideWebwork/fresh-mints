import type { RawSocialPost, SocialMonitorRule, SocialLead } from './types';

const HIGH_INTENT_PATTERNS = [
  'looking for',
  'need agency',
  'need website',
  'recommend a',
  'recommend me',
  'switch hosting',
  'overhaul our',
  'cost to build',
  'hire someone',
  'anyone know a good',
  'tired of paying',
  'landing page for my',
];

const MODERATE_INTENT_PATTERNS = [
  'best tool for',
  'alternative to',
  'how do you handle',
  'feedback on',
  'anyone using',
  'building a new',
];

const DEFAULT_PAIN_POINT = 'Exploring web development and hosting upgrade';
const TEMPLATE_PLACEHOLDER = /\{(author|title)\}/g;

const hasCustomTemplate = (rule: SocialMonitorRule): boolean =>
  (rule.pitchTemplate ?? '').trim().length > 0;

const findMatchedKeyword = (text: string, keywords: string[]): string | undefined =>
  keywords.find((keyword) => {
    const term = keyword.trim().toLowerCase();
    return term.length > 0 && text.includes(term);
  });

/** The website pitch every rule used before per-rule templates existed. Do not reword: legacy rules depend on it. */
const buildDefaultPitch = (post: RawSocialPost): string =>
  `Hey ${post.author}, saw your post regarding "${post.title.slice(0, 60)}...". Fresh Mints builds turnkey high-speed hosted websites with zero setup fees and 24 months included cloud hosting. Here is a live sandbox preview tailored to your field.`;

/** Single pass with a function replacer: post text is inserted literally and never re-scanned for placeholders. */
const fillTemplate = (template: string, post: RawSocialPost): string => {
  const values = { author: post.author, title: post.title };
  return template.replace(TEMPLATE_PLACEHOLDER, (_match, key: keyof typeof values) => values[key]);
};

const buildSuggestedPitch = (post: RawSocialPost, rule: SocialMonitorRule): string => {
  const template = rule.pitchTemplate ?? '';
  return hasCustomTemplate(rule) ? fillTemplate(template, post) : buildDefaultPitch(post);
};

/** The default pain point describes web work, so a template rule describes its own match instead. */
const buildFallbackPainPoint = (rule: SocialMonitorRule, matchedKeyword: string): string =>
  hasCustomTemplate(rule) ? `Mentions "${matchedKeyword}"` : DEFAULT_PAIN_POINT;

/** Only carries fields the rule actually sets, so a legacy rule yields a lead shaped exactly as before. */
const funnelFieldsFrom = (rule: SocialMonitorRule): Pick<SocialLead, 'appendFunnelLink' | 'funnelBaseUrl'> => ({
  ...(rule.appendFunnelLink !== undefined && { appendFunnelLink: rule.appendFunnelLink }),
  ...(rule.funnelBaseUrl !== undefined && { funnelBaseUrl: rule.funnelBaseUrl }),
});

export class SocialIntentAnalyzer {
  static evaluatePost(post: RawSocialPost, rule: SocialMonitorRule): SocialLead | null {
    const text = `${post.title} ${post.content}`.toLowerCase();

    const hasNegativeMatch = rule.negativeKeywords.some((neg) => {
      const term = neg.trim().toLowerCase();
      return term.length > 0 && text.includes(term);
    });

    if (hasNegativeMatch) {
      return null;
    }

    const matchedKeyword = findMatchedKeyword(text, rule.keywords);
    if (!matchedKeyword) {
      return null;
    }

    let baseScore = 50;

    const matchedHighPatterns = HIGH_INTENT_PATTERNS.filter((pattern) => text.includes(pattern));
    baseScore += matchedHighPatterns.length * 18;

    const matchedModPatterns = MODERATE_INTENT_PATTERNS.filter((pattern) => text.includes(pattern));
    baseScore += matchedModPatterns.length * 8;

    const finalScore = Math.min(Math.max(baseScore, 10), 98);
    const meetsThreshold = finalScore >= rule.minIntentScore;

    if (!meetsThreshold) {
      return null;
    }

    const detectedPainPoint =
      matchedHighPatterns[0] || matchedModPatterns[0] || buildFallbackPainPoint(rule, matchedKeyword);
    const suggestedPitch = buildSuggestedPitch(post, rule);

    return {
      id: `lead-social-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      rawPost: post,
      matchedRuleId: rule.id,
      matchedKeyword,
      intentScore: finalScore,
      detectedPainPoint,
      suggestedPitch,
      status: 'radar',
      evaluatedAt: new Date().toISOString(),
      ...funnelFieldsFrom(rule),
    };
  }
}
