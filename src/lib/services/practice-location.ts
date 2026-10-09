/**
 * Location copy for the practice website preview.
 *
 * A prospect reads this text, so a lead with no city and/or no state must never
 * produce a dangling comma or an invented place. Missing parts are omitted.
 */

type MaybeText = string | null | undefined;

/** Trims a location part; undefined, null and whitespace-only input become "". */
export function cleanLocationPart(value: MaybeText): string {
  return typeof value === 'string' ? value.trim() : '';
}

/** Returns "City, ST", "City", "ST" or "" depending on which parts are present. */
export function formatPracticeLocation(city: MaybeText, state: MaybeText): string {
  const parts = [cleanLocationPart(city), cleanLocationPart(state)];
  return parts.filter((part) => part.length > 0).join(', ');
}
