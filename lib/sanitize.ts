/**
 * Input Sanitization Utilities
 * Prevents XSS, injection attacks, and malicious input
 */

/**
 * Sanitize a string by removing potentially dangerous HTML/script content
 * but preserving normal text characters
 */
export function sanitizeString(input: string | null | undefined): string {
    if (!input) return '';

    return input
        // Remove null bytes
        .replace(/\0/g, '')
        // Remove script tags and their content
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        // Remove other dangerous tags
        .replace(/<(iframe|object|embed|link|style|meta|base|form|input|button)[^>]*>/gi, '')
        // Remove event handlers
        .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
        .replace(/\s*on\w+\s*=\s*[^\s>]+/gi, '')
        // Remove javascript: protocol
        .replace(/javascript:/gi, '')
        // Remove data: protocol for non-images
        .replace(/data:(?!image\/)/gi, '')
        // Remove vbscript: protocol
        .replace(/vbscript:/gi, '')
        // Trim whitespace
        .trim();
}

/**
 * Sanitize text specifically for display (converts HTML entities)
 */
export function sanitizeForDisplay(input: string | null | undefined): string {
    if (!input) return '';

    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .trim();
}

/**
 * Validate and sanitize a VIN number
 */
export function sanitizeVIN(vin: string | null | undefined): string | null {
    if (!vin) return null;

    // VIN should be exactly 17 alphanumeric characters (no I, O, Q)
    const cleaned = vin.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '');

    if (cleaned.length !== 17) {
        return cleaned.slice(0, 17); // Truncate if too long
    }

    return cleaned;
}

/**
 * Validate a base64 image URL
 */
export function isValidImageUrl(url: string): boolean {
    if (!url) return false;

    // Allow data URLs for images only
    if (url.startsWith('data:image/')) {
        // Check for valid image types
        const validTypes = ['jpeg', 'jpg', 'png', 'gif', 'webp', 'svg+xml'];
        const typeMatch = url.match(/^data:image\/([a-z+]+);/i);
        if (typeMatch && validTypes.includes(typeMatch[1].toLowerCase())) {
            return true;
        }
        return false;
    }

    // Allow https URLs
    if (url.startsWith('https://')) {
        return true;
    }

    // Allow relative URLs starting with /
    if (url.startsWith('/')) {
        return true;
    }

    return false;
}

/**
 * Sanitize an array of image URLs
 */
export function sanitizeImageUrls(urls: string[]): string[] {
    if (!Array.isArray(urls)) return [];

    return urls
        .filter(url => typeof url === 'string')
        .filter(isValidImageUrl)
        .slice(0, 20); // Limit to 20 images max
}

/**
 * Sanitize numeric input
 */
export function sanitizeNumber(input: string | number | null | undefined, min = 0, max = Number.MAX_SAFE_INTEGER): number {
    if (input === null || input === undefined) return min;

    const num = typeof input === 'string' ? parseFloat(input) : input;

    if (isNaN(num)) return min;

    return Math.max(min, Math.min(max, num));
}

/**
 * Sanitize year input
 */
export function sanitizeYear(input: string | number | null | undefined): number {
    const currentYear = new Date().getFullYear();
    return sanitizeNumber(input, 1900, currentYear + 2);
}
