"use strict";
// packages/expo-audio-stream/src/events.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addAudioEventListener = addAudioEventListener;
exports.addAudioAnalysisListener = addAudioAnalysisListener;
exports.addRecordingInterruptionListener = addRecordingInterruptionListener;
const expo_modules_core_1 = require("expo-modules-core");
const ExpoAudioStreamModule_1 = __importDefault(require("./ExpoAudioStreamModule"));
const emitter = new expo_modules_core_1.LegacyEventEmitter(ExpoAudioStreamModule_1.default);
function addAudioEventListener(listener) {
    return emitter.addListener('AudioData', listener);
}
function addAudioAnalysisListener(listener) {
    return emitter.addListener('AudioAnalysis', listener);
}
function addRecordingInterruptionListener(listener) {
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