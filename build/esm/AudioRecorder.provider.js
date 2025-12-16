// packages/expo-audio-stream/src/AudioRecorder.provider.tsx
import React, { createContext, useContext } from 'react';
import { useAudioRecorder } from './useAudioRecorder';
const initContext = {
    isRecording: false,
    isPaused: false,
    durationMs: 0,
    size: 0,
    compression: undefined,
    startRecording: async () => {
        throw new Error('AudioRecorderProvider not found');
    },
    stopRecording: async () => {
        throw new Error('AudioRecorderProvider not found');
    },
    pauseRecording: async () => {
        throw new Error('AudioRecorderProvider not found');
    },
    resumeRecording: async () => {
        throw new Error('AudioRecorderProvider not found');
    },
    prepareRecording: async () => {
        throw new Error('AudioRecorderProvider not found');
    },
};
const AudioRecorderContext = createContext(initContext);
export const AudioRecorderProvider = ({ children, config = {}, }) => {
    const audioRecorder = useAudioRecorder(config);
    return (<AudioRecorderContext.Provider value={audioRecorder}>
            {children}
        </AudioRecorderContext.Provider>);
};
export const useSharedAudioRecorder = () => {
    const context = useContext(AudioRecorderContext);
    if (!context) {
        throw new Error('useSharedAudioRecorder must be used within an AudioRecorderProvider');
    }
    return context;
};
//# sourceMappingURL=AudioRecorder.provider.js.map