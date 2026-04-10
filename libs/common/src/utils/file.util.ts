import { BadRequestException } from '@nestjs/common';

/**
 * Common file size limits based on MIME category.
 */
export const MAX_FILE_SIZE_LIMITS: Record<string, number> = {
  image: 10 * 1024 * 1024, // 10 MB
  video: 100 * 1024 * 1024, // 100 MB
  audio: 50 * 1024 * 1024, // 50 MB
  application: 20 * 1024 * 1024, // 20 MB (docs, pdf, ...)
  default: 10 * 1024 * 1024, // 10 MB fallback
};

/**
 * Gets the maximum allowed size (in bytes) for a given MIME type.
 */
export function getMaxSizeForMimeType(mimeType: string): number {
  const category = mimeType.split('/')[0];
  return MAX_FILE_SIZE_LIMITS[category] ?? MAX_FILE_SIZE_LIMITS.default;
}

/**
 * Validates a file's size against category-based limits.
 * Throws BadRequestException if the file is too large.
 */
export function validateFileSize(file: {
  mimetype: string;
  size: number;
  originalname?: string;
}): void {
  const maxSize = getMaxSizeForMimeType(file.mimetype);
  if (file.size > maxSize) {
    const fileName = file.originalname ? `"${file.originalname}" ` : 'File';
    const limitMb = Math.round(maxSize / 1024 / 1024);
    throw new BadRequestException(
      `${fileName} exceeds size limit of ${limitMb} MB for ${file.mimetype}`,
    );
  }
}
