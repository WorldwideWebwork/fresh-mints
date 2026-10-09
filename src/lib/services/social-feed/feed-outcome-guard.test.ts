import { describe, it, expect } from 'vitest';
import { parseFeedFetchOutcome } from './feed-outcome-guard';
import type { RawSocialPost } from './types';

const validPost: RawSocialPost = {
  id: 'reddit-abc',
  platform: 'reddit',
  externalId: 'abc',
  author: 'u/someone',
  title: 'Anyone know a good annuity explainer?',
  content: 'Trying to understand surrender periods.',
  url: 'https://www.reddit.com/r/retirement/comments/abc/x/',
  timestamp: '2026-10-09T12:00:00.000Z',
  score: 4,
  commentsCount: 2,
  subredditOrChannel: 'r/retirement',
};

describe('parseFeedFetchOutcome', () => {
  it('accepts an ok outcome with valid posts', () => {
    const outcome = parseFeedFetchOutcome({ status: 'ok', posts: [validPost] });
    expect(outcome).toEqual({ status: 'ok', posts: [validPost] });
  });

  it('accepts an ok outcome with no posts', () => {
    expect(parseFeedFetchOutcome({ status: 'ok', posts: [] })).toEqual({ status: 'ok', posts: [] });
  });

  it('accepts a post that omits the optional score, comment count and channel', () => {
    const { score, commentsCount, subredditOrChannel, ...required } = validPost;
    const outcome = parseFeedFetchOutcome({ status: 'ok', posts: [required] });
    expect(outcome?.status).toBe('ok');
  });

  it('accepts blocked and failed outcomes that carry a reason', () => {
    expect(parseFeedFetchOutcome({ status: 'blocked', reason: 'offline' })).toEqual({
      status: 'blocked',
      reason: 'offline',
    });
    expect(parseFeedFetchOutcome({ status: 'failed', reason: 'HTTP 429' })).toEqual({
      status: 'failed',
      reason: 'HTTP 429',
    });
  });

  it('rejects payloads that are not objects', () => {
    expect(parseFeedFetchOutcome(null)).toBeNull();
    expect(parseFeedFetchOutcome(undefined)).toBeNull();
    expect(parseFeedFetchOutcome('ok')).toBeNull();
    expect(parseFeedFetchOutcome([])).toBeNull();
  });

  it('rejects an unknown status', () => {
    expect(parseFeedFetchOutcome({ status: 'partial', posts: [] })).toBeNull();
  });

  it('rejects an ok outcome whose posts is not an array', () => {
    expect(parseFeedFetchOutcome({ status: 'ok' })).toBeNull();
    expect(parseFeedFetchOutcome({ status: 'ok', posts: 'none' })).toBeNull();
  });

  it('rejects an ok outcome when any post is missing a required string field', () => {
    const { url, ...withoutUrl } = validPost;
    expect(parseFeedFetchOutcome({ status: 'ok', posts: [validPost, withoutUrl] })).toBeNull();
  });

  it('rejects a post whose required field has the wrong type', () => {
    const badTimestamp = { ...validPost, timestamp: 1760011200 };
    expect(parseFeedFetchOutcome({ status: 'ok', posts: [badTimestamp] })).toBeNull();
  });

  it('rejects a post whose optional numeric field has the wrong type', () => {
    const badScore = { ...validPost, score: 'high' };
    expect(parseFeedFetchOutcome({ status: 'ok', posts: [badScore] })).toBeNull();
  });

  it('rejects a post claiming a platform other than reddit', () => {
    const wrongPlatform = { ...validPost, platform: 'x' };
    expect(parseFeedFetchOutcome({ status: 'ok', posts: [wrongPlatform] })).toBeNull();
  });

  it('accepts youtube and stack_exchange posts when that platform is expected', () => {
    const youtubePost = { ...validPost, id: 'yt-1', platform: 'youtube' };
    const stackPost = { ...validPost, id: 'se-1', platform: 'stack_exchange' };

    expect(parseFeedFetchOutcome({ status: 'ok', posts: [youtubePost] }, 'youtube')).toEqual({
      status: 'ok',
      posts: [youtubePost],
    });
    expect(parseFeedFetchOutcome({ status: 'ok', posts: [stackPost] }, 'stack_exchange')).toEqual({
      status: 'ok',
      posts: [stackPost],
    });
  });

  it('rejects a post whose platform is not the one that was requested', () => {
    const redditPost = { ...validPost };
    const stackPost = { ...validPost, platform: 'stack_exchange' };

    expect(parseFeedFetchOutcome({ status: 'ok', posts: [redditPost] }, 'youtube')).toBeNull();
    expect(parseFeedFetchOutcome({ status: 'ok', posts: [stackPost] }, 'reddit')).toBeNull();
    expect(parseFeedFetchOutcome({ status: 'ok', posts: [stackPost, redditPost] }, 'stack_exchange')).toBeNull();
  });

  it('rejects blocked and failed outcomes without a string reason', () => {
    expect(parseFeedFetchOutcome({ status: 'blocked' })).toBeNull();
    expect(parseFeedFetchOutcome({ status: 'failed', reason: 500 })).toBeNull();
  });
});
