"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractPreview = extractPreview;
const extractAudioAnalysis_1 = require("./extractAudioAnalysis");
/**
 * Generates a simplified preview of the audio waveform for quick visualization.
 * Ideal for UI rendering with a specified number of points.
 *
 * @param options - The options for the preview, including file URI and time range.
 * @returns A promise that resolves to the audio preview data.
 */
async function extractPreview({ fileUri, numberOfPoints = 100, startTimeMs = 0, endTimeMs = 30000, // First 30 seconds
decodingOptions, logger, }) {
    const durationMs = endTimeMs - startTimeMs;
    const segmentDurationMs = Math.floor(durationMs / numberOfPoints);
    // Call extractAudioAnalysis with calculated parameters
    const analysis = await (0, extractAudioAnalysis_1.extractAudioAnalysis)({
        fileUri,
        startTimeMs,
        endTimeMs,
        logger,
        segmentDurationMs,
        decodingOptions,
    });
    // Transform the result into AudioPreview format
    return analysis;
}
//# sourceMappingURL=extractPreview.js.map