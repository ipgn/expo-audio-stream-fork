import { ConsoleLike } from '../ExpoAudioStream.types';
export interface ProcessAudioBufferOptions {
    arrayBuffer?: ArrayBuffer;
    fileUri?: string;
    targetSampleRate: number;
    targetChannels: number;
    normalizeAudio: boolean;
    startTimeMs?: number;
    endTimeMs?: number;
    position?: number;
    length?: number;
    audioContext?: AudioContext;
    logger?: ConsoleLike;
}
export interface ProcessedAudioData {
    channelData: Float32Array;
    samples: number;
    durationMs: number;
    sampleRate: number;
    channels: number;
    buffer: AudioBuffer;
}
export declare function processAudioBuffer({ arrayBuffer, fileUri, targetSampleRate, targetChannels, normalizeAudio, startTimeMs, endTimeMs, position, length, audioContext, logger, }: ProcessAudioBufferOptions): Promise<ProcessedAudioData>;
//# sourceMappingURL=audioProcessing.d.ts.map