"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractWaveform = void 0;
const ExpoAudioStreamModule_1 = __importDefault(require("../ExpoAudioStreamModule"));
const extractWaveform = async ({ fileUri, numberOfSamples, offset = 0, length, }) => {
    const res = await ExpoAudioStreamModule_1.default.extractAudioAnalysis({
        fileUri,
        numberOfSamples,
        offset,
        length,
    });
    return res;
};
exports.extractWaveform = extractWaveform;
//# sourceMappingURL=extractWaveform.js.map