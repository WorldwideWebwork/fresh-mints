import type { FeedFetchOutcome, RawSocialPost } from './types';

/**
 * Runtime boundary guard for the server relay's response (AGENTS.md 2.F).
 * The server returns exactly one of ok / blocked / failed; anything else is
 * treated as malformed so no unchecked payload reaches reactive state.
 */

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isString = (value: unknown): value is string => typeof value === 'string';

const isOptionalNumber = (value: unknown): boolean =>
  value === undefined || (typeof value === 'number' && Number.isFinite(value));

const isOptionalString = (value: unknown): boolean => value === undefined || isString(value);

const REQUIRED_POST_STRING_KEYS = [
  'id',
  'externalId',
  'author',
  'title',
  'content',
  'url',
  'timestamp',
] as const;

const isRedditPost = (value: unknown): value is RawSocialPost => {
  if (!isRecord(value)) return false;

  const hasRequiredStrings = REQUIRED_POST_STRING_KEYS.every((key) => isString(value[key]));
  const isRedditPlatform = value.platform === 'reddit';
  const hasValidOptionals =
    isOptionalNumber(value.score) &&
    isOptionalNumber(value.commentsCount) &&
    isOptionalString(value.subredditOrChannel);

  return hasRequiredStrings && isRedditPlatform && hasValidOptionals;
};

export const parseFeedFetchOutcome = (payload: unknown): FeedFetchOutcome | null => {
  if (!isRecord(payload)) return null;

  const { status } = payload;

  if (status === 'ok') {
    const { posts } = payload;
    const hasValidPosts = Array.isArray(posts) && posts.every(isRedditPost);
    return hasValidPosts ? { status: 'ok', posts } : null;
  }

  if (status === 'blocked' || status === 'failed') {
    const { reason } = payload;
    return isString(reason) ? { status, reason } : null;
  }

  return null;
};
