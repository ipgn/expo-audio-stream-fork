import { type EventSubscription } from 'expo-modules-core';
import { AudioAnalysis } from './AudioAnalysis/AudioAnalysis.types';
import { RecordingInterruptionEvent } from './ExpoAudioStream.types';
export interface AudioEventPayload {
    encoded?: string;
    buffer?: Float32Array;
    fileUri: string;
    lastEmittedSize: number;
    position: number;
    deltaSize: number;
    totalSize: number;
    mimeType: string;
    streamUuid: string;
    compression?: {
        data?: string | Blob;
        position: number;
        eventDataSize: number;
        totalSize: number;
    };
}
export declare function addAudioEventListener(listener: (event: AudioEventPayload) => Promise<void>): EventSubscription;
export interface AudioAnalysisEvent extends AudioAnalysis {
}
export declare function addAudioAnalysisListener(listener: (event: AudioAnalysisEvent) => Promise<void>): EventSubscription;
export declare function addRecordingInterruptionListener(listener: (event: RecordingInterruptionEvent) => void): EventSubscription;
//# sourceMappingURL=events.d.ts.map