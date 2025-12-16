"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_BIT_DEPTH = exports.DEFAULT_SAMPLE_RATE = exports.INFO_CHUNK_ID = exports.DATA_CHUNK_ID = exports.FMT_CHUNK_ID = exports.WAVE_HEADER = exports.RIFF_HEADER = exports.DEBUG_NAMESPACE = exports.isWeb = void 0;
// packages/expo-audio-stream/src/constants.ts
const react_native_1 = require("react-native");
exports.isWeb = react_native_1.Platform.OS === 'web';
exports.DEBUG_NAMESPACE = 'expo-audio-stream';
// Constants for identifying chunks in a WAV file
exports.RIFF_HEADER = 0x52494646; // "RIFF"
exports.WAVE_HEADER = 0x57415645; // "WAVE"
exports.FMT_CHUNK_ID = 0x666d7420; // "fmt "
exports.DATA_CHUNK_ID = 0x64617461; // "data"
exports.INFO_CHUNK_ID = 0x494e464f; // "INFO"
// Default values
exports.DEFAULT_SAMPLE_RATE = 16000;
exports.DEFAULT_BIT_DEPTH = 32;
//# sourceMappingURL=constants.js.map