import { describe, it, expect } from 'vitest';
import { getDefaultWebsiteConfig, getSlugFallbackSeed } from './website-templates';

const seedWith = (city: string, state: string) => ({
  fullName: 'Test Practitioner',
  profession: 'dental' as const,
  city,
  state,
  collegeOrSchool: 'Test School',
});

describe('getDefaultWebsiteConfig location copy', () => {
  it('names city and state when both are present', () => {
    const config = getDefaultWebsiteConfig(seedWith('Tempe', 'AZ'));
    expect(config.heroSubheadline).toContain('services in Tempe, AZ.');
    expect(config.bioText).toContain('clients in Tempe and surrounding communities');
  });

  it('never prints a dangling comma when the city is blank or whitespace-only', () => {
    for (const city of ['', '   ']) {
      const config = getDefaultWebsiteConfig(seedWith(city, 'AZ'));
      expect(config.heroSubheadline).toContain('services in AZ.');
      expect(config.heroSubheadline).not.toMatch(/in\s*,/);
      expect(config.bioText).toContain('clients in AZ communities');
    }
  });

  it('never prints a dangling comma when the state is blank or whitespace-only', () => {
    for (const state of ['', '  ']) {
      const config = getDefaultWebsiteConfig(seedWith('Tempe', state));
      expect(config.heroSubheadline).toContain('services in Tempe.');
      expect(config.heroSubheadline).not.toContain(',');
    }
  });

  it('falls back to neutral wording, not an invented place, when both are missing', () => {
    const config = getDefaultWebsiteConfig(seedWith(' ', ''));
    expect(config.heroSubheadline).toContain('services in your region.');
    expect(config.bioText).toContain('clients in our community');
    expect(config.services[0].description).not.toMatch(/goals in/);
  });
});

describe('getSlugFallbackSeed', () => {
  it('derives a display name from the slug, dropping the -official suffix', () => {
    expect(getSlugFallbackSeed('jane-doe-official').fullName).toBe('Jane Doe');
    expect(getSlugFallbackSeed('jane_doe').fullName).toBe('Jane Doe');
  });

  it('uses a generic name when the slug is empty', () => {
    expect(getSlugFallbackSeed('').fullName).toBe('Professional Practice Specialist');
  });

  it('leaves location and school empty instead of inventing them', () => {
    const seed = getSlugFallbackSeed('jane-doe');
    expect(seed.city).toBe('');
    expect(seed.state).toBe('');
    expect(seed.collegeOrSchool).toBe('');
  });

  it('yields a default config that names no place and no school', () => {
    const config = getDefaultWebsiteConfig(getSlugFallbackSeed('jane-doe'));
    expect(config.heroSubheadline).toContain('services in your region.');
    expect(config.heroSubheadline).not.toMatch(/Phoenix|AZ|graduate from/);
    expect(config.bioText).not.toMatch(/Phoenix|AZ/);
  });
});
