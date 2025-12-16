"use strict";
// src/index.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSharedAudioRecorder = exports.useAudioRecorder = exports.extractMelSpectrogram = exports.extractAudioData = exports.trimAudio = exports.extractPreview = exports.extractAudioAnalysis = exports.extractRawWavAnalysis = exports.ExpoAudioStreamModule = exports.AudioRecorderProvider = exports.useAudioDevices = exports.audioDeviceManager = exports.AudioDeviceManager = exports.validateRecordingConfig = exports.getFallbackBitDepth = exports.getFallbackEncoding = exports.isBitDepthSupported = exports.isEncodingSupported = exports.getPlatformCapabilities = void 0;
const extractAudioAnalysis_1 = require("./AudioAnalysis/extractAudioAnalysis");
Object.defineProperty(exports, "extractRawWavAnalysis", { enumerable: true, get: function () { return extractAudioAnalysis_1.extractRawWavAnalysis; } });
Object.defineProperty(exports, "extractAudioAnalysis", { enumerable: true, get: function () { return extractAudioAnalysis_1.extractAudioAnalysis; } });
const extractAudioData_1 = require("./AudioAnalysis/extractAudioData");
Object.defineProperty(exports, "extractAudioData", { enumerable: true, get: function () { return extractAudioData_1.extractAudioData; } });
const extractMelSpectrogram_1 = require("./AudioAnalysis/extractMelSpectrogram");
Object.defineProperty(exports, "extractMelSpectrogram", { enumerable: true, get: function () { return extractMelSpectrogram_1.extractMelSpectrogram; } });
const extractPreview_1 = require("./AudioAnalysis/extractPreview");
Object.defineProperty(exports, "extractPreview", { enumerable: true, get: function () { return extractPreview_1.extractPreview; } });
const AudioRecorder_provider_1 = require("./AudioRecorder.provider");
Object.defineProperty(exports, "AudioRecorderProvider", { enumerable: true, get: function () { return AudioRecorder_provider_1.AudioRecorderProvider; } });
Object.defineProperty(exports, "useSharedAudioRecorder", { enumerable: true, get: function () { return AudioRecorder_provider_1.useSharedAudioRecorder; } });
const ExpoAudioStreamModule_1 = __importDefault(require("./ExpoAudioStreamModule"));
exports.ExpoAudioStreamModule = ExpoAudioStreamModule_1.default;
const trimAudio_1 = require("./trimAudio");
Object.defineProperty(exports, "trimAudio", { enumerable: true, get: function () { return trimAudio_1.trimAudio; } });
const useAudioRecorder_1 = require("./useAudioRecorder");
Object.defineProperty(exports, "useAudioRecorder", { enumerable: true, get: function () { return useAudioRecorder_1.useAudioRecorder; } });
__exportStar(require("./utils/convertPCMToFloat32"), exports);
__exportStar(require("./utils/getWavFileInfo"), exports);
__exportStar(require("./utils/writeWavHeader"), exports);
// Export platform capabilities
var platformLimitations_1 = require("./constants/platformLimitations");
Object.defineProperty(exports, "getPlatformCapabilities", { enumerable: true, get: function () { return platformLimitations_1.getPlatformCapabilities; } });
Object.defineProperty(exports, "isEncodingSupported", { enumerable: true, get: function () { return platformLimitations_1.isEncodingSupported; } });
Object.defineProperty(exports, "isBitDepthSupported", { enumerable: true, get: function () { return platformLimitations_1.isBitDepthSupported; } });
Object.defineProperty(exports, "getFallbackEncoding", { enumerable: true, get: function () { return platformLimitations_1.getFallbackEncoding; } });
Object.defineProperty(exports, "getFallbackBitDepth", { enumerable: true, get: function () { return platformLimitations_1.getFallbackBitDepth; } });
Object.defineProperty(exports, "validateRecordingConfig", { enumerable: true, get: function () { return platformLimitations_1.validateRecordingConfig; } });
// Export AudioDeviceManager
var AudioDeviceManager_1 = require("./AudioDeviceManager");
Object.defineProperty(exports, "AudioDeviceManager", { enumerable: true, get: function () { return AudioDeviceManager_1.AudioDeviceManager; } });
Object.defineProperty(exports, "audioDeviceManager", { enumerable: true, get: function () { return AudioDeviceManager_1.audioDeviceManager; } });
// Export useAudioDevices hook
var useAudioDevices_1 = require("./hooks/useAudioDevices");
Object.defineProperty(exports, "useAudioDevices", { enumerable: true, get: function () { return useAudioDevices_1.useAudioDevices; } });
//# sourceMappingURL=index.js.map