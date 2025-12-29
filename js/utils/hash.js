/**
 * Simple 32-bit hash function for deterministic edition generation
 */
export function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Generate a seed integer from a string
 */
export function seedFromString(str) {
  return simpleHash(str);
}
