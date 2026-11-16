/**
 * Generates a standard RFC4122 version 4 UUID.
 * Suitable for local offline-first entity IDs and outbox operation idempotency keys.
 */
export const generateUUID = (): string => {
  // Use crypto.randomUUID if available in Hermes/Node, otherwise fallback to RFC4122 v4 math
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
};
