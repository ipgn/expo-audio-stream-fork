import React from 'react';
import { UseAudioRecorderState } from './ExpoAudioStream.types';
import { UseAudioRecorderProps } from './useAudioRecorder';
interface AudioRecorderProviderProps {
    children: React.ReactNode;
    config?: UseAudioRecorderProps;
}
export declare const AudioRecorderProvider: React.FC<AudioRecorderProviderProps>;
export declare const useSharedAudioRecorder: () => UseAudioRecorderState;
export {};
//# sourceMappingURL=AudioRecorder.provider.d.ts.map