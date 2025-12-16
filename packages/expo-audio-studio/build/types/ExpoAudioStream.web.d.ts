import { LegacyEventEmitter } from 'expo-modules-core';
import { AudioAnalysis } from './AudioAnalysis/AudioAnalysis.types';
import { AudioRecording, AudioStreamStatus, BitDepth, ConsoleLike, RecordingConfig, StartRecordingResult } from './ExpoAudioStream.types';
import { WebRecorder } from './WebRecorder.web';
export interface AudioStreamEvent {
    type: string;
    device?: string;
    timestamp: Date;
}
export interface ExpoAudioStreamOptions {
    logger?: ConsoleLike;
    eventCallback?: (event: AudioStreamEvent) => void;
}
export interface EmitAudioEventProps {
    data: Float32Array;
    position: number;
    compression?: {
        data: Blob;
        size: number;
        totalSize: number;
        mimeType: string;
        format: string;
        bitrate: number;
    };
}
export type EmitAudioEventFunction = (_: EmitAudioEventProps) => void;
export type EmitAudioAnalysisFunction = (_: AudioAnalysis) => void;
export interface ExpoAudioStreamWebProps {
    logger?: ConsoleLike;
    audioWorkletUrl: string;
    featuresExtratorUrl: string;
    maxBufferSize?: number;
}
export declare class ExpoAudioStreamWeb extends LegacyEventEmitter {
    customRecorder: WebRecorder | null;
    audioChunks: Float32Array[];
    isRecording: boolean;
    isPaused: boolean;
    recordingStartTime: number;
    pausedTime: number;
    currentDurationMs: number;
    currentSize: number;
    currentInterval: number;
    currentIntervalAnalysis: number;
    lastEmittedSize: number;
    lastEmittedTime: number;
    lastEmittedCompressionSize: number;
    lastEmittedAnalysisTime: number;
    streamUuid: string | null;
    extension: 'webm' | 'wav';
    recordingConfig?: RecordingConfig;
    bitDepth: BitDepth;
    audioWorkletUrl: string;
    featuresExtratorUrl: string;
    logger?: ConsoleLike;
    latestPosition: number;
    totalCompressedSize: number;
    private readonly maxBufferSize;
    private eventCallback?;
    constructor({ audioWorkletUrl, featuresExtratorUrl, logger, maxBufferSize, }: ExpoAudioStreamWebProps);
    getMediaStream(): Promise<MediaStream>;
    prepareRecording(recordingConfig?: RecordingConfig): Promise<boolean>;
    startRecording(recordingConfig?: RecordingConfig): Promise<StartRecordingResult>;
    /**
     * Centralized handler for recording interruptions
     */
    private handleRecordingInterruption;
    /**
     * Handler for audio events from the WebRecorder
     */
    private customRecorderEventCallback;
    /**
     * Handler for audio analysis events from the WebRecorder
     */
    private customRecorderAnalysisCallback;
    private getRecordingDuration;
    emitAudioEvent({ data, position, compression }: EmitAudioEventProps): void;
    stopRecording(): Promise<AudioRecording>;
    pauseRecording(): Promise<void>;
    resumeRecording(): Promise<void>;
    status(): AudioStreamStatus;
    /**
     * Handles device fallback when the current device is disconnected
     */
    private handleDeviceFallback;
    /**
     * Attempts to get a fallback audio device
     */
    private getFallbackDevice;
    /**
     * Gets user media with specific device ID
     */
    private requestPermissionsAndGetUserMedia;
    init(options?: ExpoAudioStreamOptions): Promise<void>;
}
//# sourceMappingURL=ExpoAudioStream.web.d.ts.map