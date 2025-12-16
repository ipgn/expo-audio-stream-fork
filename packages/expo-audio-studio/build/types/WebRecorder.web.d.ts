import { AudioAnalysis } from './AudioAnalysis/AudioAnalysis.types';
import { ConsoleLike, RecordingConfig } from './ExpoAudioStream.types';
import { EmitAudioAnalysisFunction, EmitAudioEventFunction } from './ExpoAudioStream.web';
interface AudioFeaturesEvent {
    data: {
        command: string;
        result: AudioAnalysis;
    };
}
export declare class WebRecorder {
    audioContext: AudioContext;
    private audioWorkletNode;
    private featureExtractorWorker?;
    private source;
    private emitAudioEventCallback;
    private emitAudioAnalysisCallback;
    private config;
    private position;
    private numberOfChannels;
    private bitDepth;
    private exportBitDepth;
    private audioAnalysisData;
    private readonly logger?;
    private compressedMediaRecorder;
    private compressedChunks;
    private compressedSize;
    private pendingCompressedChunk;
    private dataPointIdCounter;
    private deviceDisconnectionHandler;
    private readonly mediaStream;
    private readonly onInterruptionCallback?;
    private _isDeviceDisconnected;
    private pcmData;
    private totalSampleCount;
    /**
     * Flag to indicate whether this is the first audio chunk after a device switch
     * Used to maintain proper duration counting
     */
    isFirstChunkAfterSwitch: boolean;
    /**
     * Gets whether the recording device has been disconnected
     */
    get isDeviceDisconnected(): boolean;
    /**
     * Initializes a new WebRecorder instance for audio recording and processing
     * @param audioContext - The AudioContext to use for recording
     * @param source - The MediaStreamAudioSourceNode providing the audio input
     * @param recordingConfig - Configuration options for the recording
     * @param emitAudioEventCallback - Callback function for audio data events
     * @param emitAudioAnalysisCallback - Callback function for audio analysis events
     * @param onInterruption - Callback for recording interruptions
     * @param logger - Optional logger for debugging information
     */
    constructor({ audioContext, source, recordingConfig, emitAudioEventCallback, emitAudioAnalysisCallback, onInterruption, logger, }: {
        audioContext: AudioContext;
        source: MediaStreamAudioSourceNode;
        recordingConfig: RecordingConfig;
        emitAudioEventCallback: EmitAudioEventFunction;
        emitAudioAnalysisCallback: EmitAudioAnalysisFunction;
        onInterruption?: (event: {
            reason: string;
            isPaused: boolean;
            timestamp: number;
        }) => void;
        logger?: ConsoleLike;
    });
    /**
     * Initializes the audio worklet using an inline script
     * Creates and connects the audio processing pipeline
     */
    init(): Promise<void>;
    /**
     * Append new PCM data to the existing buffer
     * @param newData New Float32Array data to append
     */
    private appendPcmData;
    /**
     * Initializes the feature extractor worker for audio analysis
     * Creates an inline worker from a blob for audio feature extraction
     */
    initFeatureExtractorWorker(): void;
    /**
     * Processes audio analysis results from the feature extractor worker
     * Updates the audio analysis data and emits events
     * @param event - The event containing audio analysis results
     */
    handleFeatureExtractorMessage(event: AudioFeaturesEvent): void;
    /**
     * Filters out data points with duplicate IDs
     */
    private filterUniqueDataPoints;
    /**
     * Updates the counter based on the highest ID in datapoints
     */
    private updateDataPointCounter;
    /**
     * Updates audio analysis data with segment results
     */
    private updateAudioAnalysisData;
    /**
     * Merges value ranges
     */
    private mergeRange;
    /**
     * Reset the data point counter to a specific value or zero
     * @param startCounterFrom Optional value to start the counter from (for continuing from previous recordings)
     */
    resetDataPointCounter(startCounterFrom?: number): void;
    /**
     * Get the current data point counter value
     * @returns The current value of the data point counter
     */
    getDataPointCounter(): number;
    /**
     * Prepares the recorder for continuity after device switch
     * Sets up all necessary state to maintain proper recording continuity
     */
    prepareForDeviceSwitch(): void;
    /**
     * Starts the audio recording process
     * Connects the audio nodes and begins capturing audio data
     * @param preserveCounters If true, do not reset the counter (used for device switching)
     */
    start(preserveCounters?: boolean): void;
    /**
     * Creates a WAV file from the stored PCM data
     */
    private createWavFromPcmData;
    /**
     * Stops the audio recording process and returns the recorded data
     * @returns Promise resolving to an object containing compressed and/or uncompressed blobs
     */
    stop(): Promise<{
        compressedBlob?: Blob;
        uncompressedBlob?: Blob;
    }>;
    /**
     * Cleans up resources when recording is stopped
     * Closes audio context and disconnects nodes
     */
    cleanup(): void;
    /**
     * Pauses the audio recording process
     * Disconnects audio nodes and pauses the media recorder
     */
    pause(): void;
    /**
     * Stops all media stream tracks to release hardware resources
     * Ensures recording indicators (like microphone icon) are turned off
     */
    stopMediaStreamTracks(): void;
    /**
     * Determines the audio format capabilities of the current audio context
     * @param sampleRate - The sample rate to check
     * @returns Object containing format information (sample rate, bit depth, channels)
     */
    private checkAudioContextFormat;
    /**
     * Resumes a paused recording
     * Reconnects audio nodes and resumes the media recorder
     */
    resume(): void;
    /**
     * Initializes the compressed media recorder if compression is enabled
     * Sets up event handlers for compressed audio data
     */
    private initializeCompressedRecorder;
    /**
     * Processes features if enabled
     */
    processFeatures(chunk: Float32Array, sampleRate: number, chunkPosition: number, startPosition: number, endPosition: number, samples: number): void;
    /**
     * Sets up detection for device disconnection events
     */
    private setupDeviceDisconnectionDetection;
    /**
     * Explicitly set the position for continuous recording across device switches
     * @param position The position in seconds to continue from
     */
    setPosition(position: number): void;
    /**
     * Get the current position in seconds
     * @returns The current position
     */
    getPosition(): number;
    /**
     * Gets the current compressed chunks
     * @returns Array of current compressed audio chunks
     */
    getCompressedChunks(): Blob[];
    /**
     * Sets the compressed chunks from a previous recorder
     * @param chunks Array of compressed chunks from a previous recorder
     */
    setCompressedChunks(chunks: Blob[]): void;
}
export {};
//# sourceMappingURL=WebRecorder.web.d.ts.map