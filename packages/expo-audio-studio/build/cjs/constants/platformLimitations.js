"use strict";
/**
 * Platform-specific audio recording limitations and capabilities
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLATFORM_CAPABILITIES = void 0;
exports.getPlatformCapabilities = getPlatformCapabilities;
exports.isEncodingSupported = isEncodingSupported;
exports.isBitDepthSupported = isBitDepthSupported;
exports.getFallbackEncoding = getFallbackEncoding;
exports.getFallbackBitDepth = getFallbackBitDepth;
exports.validateRecordingConfig = validateRecordingConfig;
const react_native_1 = require("react-native");
exports.PLATFORM_CAPABILITIES = {
    ios: {
        supportedEncodings: ['pcm_16bit', 'pcm_32bit'],
        supportedBitDepths: [16, 32],
        notes: [
            '8-bit PCM is not natively supported by iOS AVAudioFormat',
            'Recording with 8-bit will fallback to 16-bit',
        ],
    },
    android: {
        supportedEncodings: ['pcm_8bit', 'pcm_16bit', 'pcm_32bit'],
        supportedBitDepths: [8, 16, 32],
        notes: ['All PCM formats are fully supported'],
    },
    web: {
        supportedEncodings: ['pcm_16bit', 'pcm_32bit'],
        supportedBitDepths: [16, 32],
        notes: [
            'Web Audio API typically works with 32-bit float',
            '8-bit is not commonly supported in browsers',
        ],
    },
};
/**
 * Get the current platform's audio capabilities
 */
function getPlatformCapabilities() {
    return exports.PLATFORM_CAPABILITIES[react_native_1.Platform.OS] || exports.PLATFORM_CAPABILITIES.web;
}
/**
 * Check if a specific encoding is supported on the current platform
 */
function isEncodingSupported(encoding) {
    const capabilities = getPlatformCapabilities();
    return capabilities.supportedEncodings.includes(encoding);
}
/**
 * Check if a specific bit depth is supported on the current platform
 */
function isBitDepthSupported(bitDepth) {
    const capabilities = getPlatformCapabilities();
    return capabilities.supportedBitDepths.includes(bitDepth);
}
/**
 * Get a fallback encoding if the requested one is not supported
 */
function getFallbackEncoding(requestedEncoding) {
    if (isEncodingSupported(requestedEncoding)) {
        return requestedEncoding;
    }
    // Default fallback is 16-bit PCM (supported on all platforms)
    return 'pcm_16bit';
}
/**
 * Get a fallback bit depth if the requested one is not supported
 */
function getFallbackBitDepth(requestedBitDepth) {
    if (isBitDepthSupported(requestedBitDepth)) {
        return requestedBitDepth;
    }
    // Default fallback is 16-bit (supported on all platforms)
    return 16;
}
/**
 * Validate and adjust recording configuration based on platform limitations
 */
function validateRecordingConfig(config) {
    const warnings = [];
    const capabilities = getPlatformCapabilities();
    let encoding = config.encoding || 'pcm_16bit';
    // Check if encoding is supported
    if (!isEncodingSupported(encoding)) {
        const fallback = getFallbackEncoding(encoding);
        warnings.push(`${encoding} is not supported on ${react_native_1.Platform.OS}. Using ${fallback} instead.`);
        encoding = fallback;
    }
    // Add platform-specific notes if there were changes
    if (warnings.length > 0) {
        warnings.push(...capabilities.notes);
    }
    return {
        encoding,
        warnings,
    };
}
//# sourceMappingURL=platformLimitations.js.map