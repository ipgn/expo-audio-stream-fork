/**
 * Platform-specific audio recording limitations and capabilities
 */
import { EncodingType, BitDepth } from '../ExpoAudioStream.types';
export interface PlatformCapabilities {
    supportedEncodings: EncodingType[];
    supportedBitDepths: BitDepth[];
    notes: string[];
}
export declare const PLATFORM_CAPABILITIES: Record<string, PlatformCapabilities>;
/**
 * Get the current platform's audio capabilities
 */
export declare function getPlatformCapabilities(): PlatformCapabilities;
/**
 * Check if a specific encoding is supported on the current platform
 */
export declare function isEncodingSupported(encoding: EncodingType): boolean;
/**
 * Check if a specific bit depth is supported on the current platform
 */
export declare function isBitDepthSupported(bitDepth: BitDepth): boolean;
/**
 * Get a fallback encoding if the requested one is not supported
 */
export declare function getFallbackEncoding(requestedEncoding: EncodingType): EncodingType;
/**
 * Get a fallback bit depth if the requested one is not supported
 */
export declare function getFallbackBitDepth(requestedBitDepth: BitDepth): BitDepth;
/**
 * Validate and adjust recording configuration based on platform limitations
 */
export declare function validateRecordingConfig(config: {
    encoding?: EncodingType;
}): {
    encoding: EncodingType;
    warnings: string[];
};
//# sourceMappingURL=platformLimitations.d.ts.map