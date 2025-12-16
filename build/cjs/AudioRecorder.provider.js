"use strict";
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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSharedAudioRecorder = exports.AudioRecorderProvider = void 0;
// packages/expo-audio-stream/src/AudioRecorder.provider.tsx
const react_1 = __importStar(require("react"));
const useAudioRecorder_1 = require("./useAudioRecorder");
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
const AudioRecorderContext = (0, react_1.createContext)(initContext);
const AudioRecorderProvider = ({ children, config = {}, }) => {
    const audioRecorder = (0, useAudioRecorder_1.useAudioRecorder)(config);
    return (<AudioRecorderContext.Provider value={audioRecorder}>
            {children}
        </AudioRecorderContext.Provider>);
};
exports.AudioRecorderProvider = AudioRecorderProvider;
const useSharedAudioRecorder = () => {
    const context = (0, react_1.useContext)(AudioRecorderContext);
    if (!context) {
        throw new Error('useSharedAudioRecorder must be used within an AudioRecorderProvider');
    }
    return context;
};
exports.useSharedAudioRecorder = useSharedAudioRecorder;
//# sourceMappingURL=AudioRecorder.provider.js.map