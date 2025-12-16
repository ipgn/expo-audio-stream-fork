import { AudioAnalysis } from './AudioAnalysis/AudioAnalysis.types';
import { AudioRecording, CompressionInfo, ConsoleLike, RecordingConfig, StartRecordingResult } from './ExpoAudioStream.types';
export interface UseAudioRecorderProps {
    logger?: ConsoleLike;
    audioWorkletUrl?: string;
    featuresExtratorUrl?: string;
}
export interface UseAudioRecorderState {
    prepareRecording: (_: RecordingConfig) => Promise<void>;
    startRecording: (_: RecordingConfig) => Promise<StartRecordingResult>;
    stopRecording: () => Promise<AudioRecording>;
    pauseRecording: () => Promise<void>;
    resumeRecording: () => Promise<void>;
    isRecording: boolean;
    isPaused: boolean;
    durationMs: number;
    size: number;
    compression?: CompressionInfo;
    analysisData?: AudioAnalysis;
}
export declare function useAudioRecorder({ logger, audioWorkletUrl, featuresExtratorUrl, }?: UseAudioRecorderProps): UseAudioRecorderState;
//# sourceMappingURL=useAudioRecorder.d.ts.map