// STORAGE-NAMESPACE § 1
export const STORAGE_PREFIX = 'seatwise_';

export const scopedKey = (key: string): string => `${STORAGE_PREFIX}${key}`;

