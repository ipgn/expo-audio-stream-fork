"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.trimAudio = trimAudio;
exports.trimAudioSimple = trimAudioSimple;
const expo_modules_core_1 = require("expo-modules-core");
const ExpoAudioStreamModule_1 = __importDefault(require("./ExpoAudioStreamModule"));
// Create a single emitter instance
const emitter = new expo_modules_core_1.LegacyEventEmitter(ExpoAudioStreamModule_1.default);
/**
 * Trims an audio file based on the provided options.
 *
 * @experimental This API is experimental and not fully optimized for production use.
 * Performance may vary based on file size and device capabilities.
 * Future versions may include breaking changes.
 *
 * @param options Configuration options for the trimming operation
 * @param progressCallback Optional callback to receive progress updates
 * @returns Promise resolving to the trimmed audio file information, including processing time
 */
async function trimAudio(options, progressCallback) {
    // Validation
    if (!options.fileUri) {
        throw new Error('fileUri is required');
    }
    const mode = options.mode ?? 'single';
    if (mode === 'single') {
        if (options.startTimeMs === undefined &&
            options.endTimeMs === undefined) {
            throw new Error('At least one of startTimeMs or endTimeMs must be provided in single mode');
        }
    }
    else if (mode === 'keep' || mode === 'remove') {
        if (!options.ranges || options.ranges.length === 0) {
            throw new Error('ranges must be provided and non-empty for keep or remove modes');
        }
    }
    else {
        throw new Error(`Invalid mode: ${mode}. Must be 'single', 'keep', or 'remove'`);
    }
    // Set up progress event listener if callback is provided
    let subscription;
    if (progressCallback) {
        subscription = emitter.addListener('TrimProgress', (event) => {
            progressCallback(event);
        });
    }
    try {
        const result = await ExpoAudioStreamModule_1.default.trimAudio(options);
        return result;
    }
    finally {
        if (subscription) {
            subscription.remove();
        }
    }
}
/**
 * Simplified version of trimAudio that returns only the URI of the trimmed file.
 *
 * @experimental This API is experimental and not fully optimized for production use.
 * Performance may vary based on file size and device capabilities.
 * Future versions may include breaking changes.
 *
 * @param options Configuration options for the trimming operation
 * @returns Promise resolving to the URI of the trimmed audio file
 */
async function trimAudioSimple(options) {
    const result = await trimAudio(options);
    return result.uri;
}
//# sourceMappingURL=trimAudio.js.map