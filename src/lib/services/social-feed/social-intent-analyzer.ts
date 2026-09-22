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

    const matchedKeyword = rule.keywords.find((kw) => text.includes(kw.toLowerCase())) || rule.keywords[0] || 'general';

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

    const detectedPainPoint = matchedHighPatterns[0] || matchedModPatterns[0] || 'Exploring web development and hosting upgrade';
    const suggestedPitch = `Hey ${post.author}, saw your post regarding "${post.title.slice(0, 60)}...". Fresh Mints builds turnkey high-speed hosted websites with zero setup fees and 24 months included cloud hosting. Here is a live sandbox preview tailored to your field.`;

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
    };
  }
}
