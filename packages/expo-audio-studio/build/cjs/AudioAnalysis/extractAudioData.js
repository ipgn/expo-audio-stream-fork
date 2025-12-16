"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractAudioData = void 0;
const ExpoAudioStreamModule_1 = __importDefault(require("../ExpoAudioStreamModule"));
const extractAudioData = async (props) => {
    return await ExpoAudioStreamModule_1.default.extractAudioData(props);
};
exports.extractAudioData = extractAudioData;
//# sourceMappingURL=extractAudioData.js.map