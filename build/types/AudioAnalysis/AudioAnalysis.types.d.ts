import { BitDepth, ConsoleLike } from '../ExpoAudioStream.types';
/**
 * Represents the configuration for decoding audio data.
 */
export interface DecodingConfig {
    /** Target sample rate for decoded audio (Android and Web) */
    targetSampleRate?: number;
    /** Target number of channels (Android and Web) */
    targetChannels?: number;
    /** Target bit depth (Android and Web) */
    targetBitDepth?: BitDepth;
    /** Whether to normalize audio levels (Android and Web) */
    normalizeAudio?: boolean;
}
/**
 * Represents speech-related features extracted from audio.
 */
export interface SpeechFeatures {
    isActive: boolean;
    speakerId?: number;
}
/**
 * Represents various audio features extracted from an audio signal.
 */
export interface AudioFeatures {
    energy?: number;
    mfcc?: number[];
    rms?: number;
    minAmplitude?: number;
    maxAmplitude?: number;
    zcr?: number;
    spectralCentroid?: number;
    spectralFlatness?: number;
    spectralRolloff?: number;
    spectralBandwidth?: number;
    chromagram?: number[];
    tempo?: number;
    hnr?: number;
    melSpectrogram?: number[];
    spectralContrast?: number[];
    tonnetz?: number[];
    pitch?: number;
    crc32?: number;
}
/**
 * Options to specify which audio features to extract.
 * Note: Advanced features (spectral features, chromagram, pitch, etc.) are experimental,
 * especially during live recording, due to high processing requirements.
 */
export interface AudioFeaturesOptions {
    energy?: boolean;
    rms?: boolean;
    zcr?: boolean;
    mfcc?: boolean;
    spectralCentroid?: boolean;
    spectralFlatness?: boolean;
    spectralRolloff?: boolean;
    spectralBandwidth?: boolean;
    chromagram?: boolean;
    tempo?: boolean;
    hnr?: boolean;
    melSpectrogram?: boolean;
    spectralContrast?: boolean;
    tonnetz?: boolean;
    pitch?: boolean;
    crc32?: boolean;
}
/**
 * Represents a single data point in the audio analysis.
 */
export interface DataPoint {
    id: number;
    amplitude: number;
    rms: number;
    dB: number;
    silent: boolean;
    features?: AudioFeatures;
    speech?: SpeechFeatures;
    startTime?: number;
    endTime?: number;
    startPosition?: number;
    endPosition?: number;
    samples?: number;
}
/**
 * Represents the complete data from the audio analysis.
 */
export interface AudioAnalysis {
    segmentDurationMs: number;
    durationMs: number;
    /**
     * Bit depth used for audio analysis processing.
     *
     * **Important**: This represents the internal processing bit depth, which may differ
     * from the recording bit depth. Audio is typically converted to 32-bit float for
     * analysis to ensure precision in calculations, regardless of the original recording format.
     *
     * Platform behavior:
     * - iOS: Always 32 (float processing)
     * - Android: Always 32 (float processing)
     * - Web: Always 32 (Web Audio API standard)
     *
     * The actual recorded file will maintain the requested bit depth (8, 16, or 32).
     */
    bitDepth: number;
    samples: number;
    numberOfChannels: number;
    sampleRate: number;
    dataPoints: DataPoint[];
    amplitudeRange: {
        min: number;
        max: number;
    };
    rmsRange: {
        min: number;
        max: number;
    };
    extractionTimeMs: number;
    speechAnalysis?: {
        speakerChanges: {
            timestamp: number;
            speakerId: number;
        }[];
    };
}
/**
 * Options for specifying a time range within an audio file.
 */
export interface AudioRangeOptions {
    /** Start time in milliseconds */
    startTimeMs?: number;
    /** End time in milliseconds */
    endTimeMs?: number;
}
/**
 * Options for generating a quick preview of audio waveform.
 * This is optimized for UI rendering with a specified number of points.
 */
export interface PreviewOptions extends AudioRangeOptions {
    /** URI of the audio file to analyze */
    fileUri: string;
    /**
     * Total number of points to generate for the preview.
     * @default 100
     */
    numberOfPoints?: number;
    /**
     * Optional logger for debugging.
     */
    logger?: ConsoleLike;
    /**
     * Optional configuration for decoding the audio file.
     * Defaults to:
     * - targetSampleRate: undefined (keep original)
     * - targetChannels: undefined (keep original)
     * - targetBitDepth: 16
     * - normalizeAudio: false
     */
    decodingOptions?: DecodingConfig;
}
/**
 * Options for mel-spectrogram extraction
 *
 * @experimental This feature is experimental and currently only available on Android.
 * The API may change in future versions.
 */
export interface ExtractMelSpectrogramOptions {
    fileUri?: string;
    arrayBuffer?: ArrayBuffer;
    windowSizeMs: number;
    hopLengthMs: number;
    nMels: number;
    fMin?: number;
    fMax?: number;
    windowType?: 'hann' | 'hamming';
    normalize?: boolean;
    logScale?: boolean;
    decodingOptions?: DecodingConfig;
    startTimeMs?: number;
    endTimeMs?: number;
    logger?: ConsoleLike;
}
/**
 * Return type for mel spectrogram extraction
 *
 * @experimental This feature is experimental and currently only available on Android.
 * The API may change in future versions.
 */
export interface MelSpectrogram {
    spectrogram: number[][];
    sampleRate: number;
    nMels: number;
    timeSteps: number;
    durationMs: number;
}
//# sourceMappingURL=AudioAnalysis.types.d.ts.map