// packages/expo-audio-stream/src/events.ts
import { LegacyEventEmitter } from 'expo-modules-core';
import ExpoAudioStreamModule from './ExpoAudioStreamModule';
const emitter = new LegacyEventEmitter(ExpoAudioStreamModule);
export function addAudioEventListener(listener) {
    return emitter.addListener('AudioData', listener);
}
export function addAudioAnalysisListener(listener) {
    return emitter.addListener('AudioAnalysis', listener);
}
export function addRecordingInterruptionListener(listener) {
    // Add debug logging
    console.debug('Adding recording interruption listener');
    const subscription = emitter.addListener('onRecordingInterrupted', // Make sure this matches the native event name
    (event) => {
        console.debug('Recording interruption event received:', event);
        listener(event);
    });
    return subscription;
}
//# sourceMappingURL=events.js.map