import { PreviewOptions, AudioAnalysis } from './AudioAnalysis.types';
/**
 * Generates a simplified preview of the audio waveform for quick visualization.
 * Ideal for UI rendering with a specified number of points.
 *
 * @param options - The options for the preview, including file URI and time range.
 * @returns A promise that resolves to the audio preview data.
 */
export declare function extractPreview({ fileUri, numberOfPoints, startTimeMs, endTimeMs, // First 30 seconds
decodingOptions, logger, }: PreviewOptions): Promise<AudioAnalysis>;
//# sourceMappingURL=extractPreview.d.ts.map