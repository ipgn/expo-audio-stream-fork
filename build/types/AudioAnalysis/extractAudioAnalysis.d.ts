/**
 * This module provides functions for extracting and analyzing audio data.
 * - `extractAudioAnalysis`: For detailed analysis with customizable ranges and decoding options.
 * - `extractWavAudioAnalysis`: For analyzing WAV files without decoding, preserving original PCM values.
 * - `extractPreview`: For generating quick previews of audio waveforms, optimized for UI rendering.
 */
import { ConsoleLike } from '../ExpoAudioStream.types';
import { AudioAnalysis, AudioFeaturesOptions, DecodingConfig } from './AudioAnalysis.types';
import { WavFileInfo } from '../utils/getWavFileInfo';
export interface ExtractWavAudioAnalysisProps {
    fileUri?: string;
    wavMetadata?: WavFileInfo;
    arrayBuffer?: ArrayBuffer;
    bitDepth?: number;
    durationMs?: number;
    sampleRate?: number;
    numberOfChannels?: number;
    position?: number;
    length?: number;
    segmentDurationMs?: number;
    features?: AudioFeaturesOptions;
    featuresExtratorUrl?: string;
    logger?: ConsoleLike;
    decodingOptions?: DecodingConfig;
}
interface BaseExtractOptions {
    fileUri?: string;
    arrayBuffer?: ArrayBuffer;
    /**
     * Duration of each analysis segment in milliseconds. Defaults to 100ms if not specified.
     */
    segmentDurationMs?: number;
    features?: AudioFeaturesOptions;
    decodingOptions?: DecodingConfig;
    logger?: ConsoleLike;
}
interface TimeRangeOptions extends BaseExtractOptions {
    startTimeMs?: number;
    endTimeMs?: number;
    position?: never;
    length?: never;
}
interface ByteRangeOptions extends BaseExtractOptions {
    position?: number;
    length?: number;
    startTimeMs?: never;
    endTimeMs?: never;
}
/**
 * Options for extracting audio analysis.
 * - For time-based analysis, provide `startTimeMs` and `endTimeMs`.
 * - For byte-based analysis, provide `position` and `length`.
 * - Do not mix time and byte ranges.
 */
export type ExtractAudioAnalysisProps = TimeRangeOptions | ByteRangeOptions;
/**
 * Extracts detailed audio analysis from the specified audio file or buffer.
 * Supports either time-based or byte-based ranges for flexibility in analysis.
 *
 * @param props - The options for extraction, including file URI, ranges, and decoding settings.
 * @returns A promise that resolves to the audio analysis data.
 * @throws {Error} If both time and byte ranges are provided or if required parameters are missing.
 */
export declare function extractAudioAnalysis(props: ExtractAudioAnalysisProps): Promise<AudioAnalysis>;
/**
 * Analyzes WAV files without decoding, preserving original PCM values.
 * Use this function when you need to ensure the analysis matches other software by avoiding any transformations.
 *
 * @param props - The options for WAV analysis, including file URI and range.
 * @returns A promise that resolves to the audio analysis data.
 */
export declare const extractRawWavAnalysis: ({ fileUri, segmentDurationMs, arrayBuffer, bitDepth, durationMs, sampleRate, numberOfChannels, features, logger, position, length, }: ExtractWavAudioAnalysisProps) => Promise<AudioAnalysis>;
export {};
//# sourceMappingURL=extractAudioAnalysis.d.ts.map