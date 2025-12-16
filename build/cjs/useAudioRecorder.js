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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAudioRecorder = useAudioRecorder;
// src/useAudioRecorder.ts
const expo_modules_core_1 = require("expo-modules-core");
const react_1 = require("react");
const AudioDeviceManager_1 = require("./AudioDeviceManager");
const ExpoAudioStreamModule_1 = __importDefault(require("./ExpoAudioStreamModule"));
const events_1 = require("./events");
const defaultAnalysis = {
    segmentDurationMs: 100,
    bitDepth: 32,
    numberOfChannels: 1,
    durationMs: 0,
    sampleRate: 44100,
    samples: 0,
    dataPoints: [],
    rmsRange: {
        min: Number.POSITIVE_INFINITY,
        max: Number.NEGATIVE_INFINITY,
    },
    amplitudeRange: {
        min: Number.POSITIVE_INFINITY,
        max: Number.NEGATIVE_INFINITY,
    },
    extractionTimeMs: 0,
};
function audioRecorderReducer(state, action) {
    switch (action.type) {
        case 'START':
            return {
                ...state,
                isRecording: true,
                isPaused: false,
                durationMs: 0,
                size: 0,
                compression: undefined,
                analysisData: defaultAnalysis,
            };
        case 'STOP':
            return {
                ...state,
                isRecording: false,
                isPaused: false,
                durationMs: 0,
                size: 0,
                compression: undefined,
                analysisData: undefined,
            };
        case 'PAUSE':
            return { ...state, isPaused: true, isRecording: false };
        case 'RESUME':
            return { ...state, isPaused: false, isRecording: true };
        case 'UPDATE_RECORDING_STATE':
            return {
                ...state,
                isPaused: action.payload.isPaused,
                isRecording: action.payload.isRecording,
            };
        case 'UPDATE_STATUS': {
            const newState = {
                ...state,
                durationMs: action.payload.durationMs,
                size: action.payload.size,
                compression: action.payload.compression
                    ? {
                        size: action.payload.compression.size,
                        mimeType: action.payload.compression.mimeType,
                        bitrate: action.payload.compression.bitrate,
                        format: action.payload.compression.format,
                    }
                    : undefined,
            };
            return newState;
        }
        case 'UPDATE_ANALYSIS':
            return {
                ...state,
                analysisData: action.payload,
            };
        default:
            return state;
    }
}
function useAudioRecorder({ logger, audioWorkletUrl, featuresExtratorUrl, } = {}) {
    // Initialize AudioDeviceManager with logger (once)
    if (logger) {
        AudioDeviceManager_1.audioDeviceManager.setLogger(logger);
    }
    const [state, dispatch] = (0, react_1.useReducer)(audioRecorderReducer, {
        isRecording: false,
        isPaused: false,
        durationMs: 0,
        size: 0,
        compression: undefined,
        analysisData: undefined,
    });
    const startResultRef = (0, react_1.useRef)(null);
    const analysisListenerRef = (0, react_1.useRef)(null);
    // analysisRef is the current analysis data (last 10 seconds by default)
    const analysisRef = (0, react_1.useRef)({ ...defaultAnalysis });
    // fullAnalysisRef is the full analysis data (all data points)
    const fullAnalysisRef = (0, react_1.useRef)({
        ...defaultAnalysis,
    });
    // Instantiate the module for web with URLs
    const ExpoAudioStream = expo_modules_core_1.Platform.OS === 'web'
        ? (0, ExpoAudioStreamModule_1.default)({
            audioWorkletUrl,
            featuresExtratorUrl,
            logger,
        })
        : ExpoAudioStreamModule_1.default;
    const onAudioStreamRef = (0, react_1.useRef)(null);
    const stateRef = (0, react_1.useRef)({
        isRecording: false,
        isPaused: false,
        durationMs: 0,
        size: 0,
        compression: undefined,
    });
    const recordingConfigRef = (0, react_1.useRef)(null);
    // Generate unique instance ID for debugging
    const instanceId = (0, react_1.useId)().replace(/:/g, '').slice(0, 5);
    const handleAudioAnalysis = (0, react_1.useCallback)(async ({ analysis, visualizationDuration, }) => {
        const savedAnalysisData = analysisRef.current || {
            ...defaultAnalysis,
        };
        const maxDuration = visualizationDuration;
        logger?.debug(`[handleAudioAnalysis] Received audio analysis: maxDuration=${maxDuration} analysis.dataPoints=${analysis.dataPoints.length} analysisData.dataPoints=${savedAnalysisData.dataPoints.length}`);
        // Combine data points
        const combinedDataPoints = [
            ...savedAnalysisData.dataPoints,
            ...analysis.dataPoints,
        ];
        const fullCombinedDataPoints = [
            ...(fullAnalysisRef.current?.dataPoints ?? []),
            ...analysis.dataPoints,
        ];
        // Calculate the new duration
        // The number of segments is based on how many segments of segmentDurationMs can fit in visualizationDuration
        const numberOfSegments = Math.ceil(visualizationDuration / analysis.segmentDurationMs);
        // maxDataPoints should be the number of data points, not milliseconds
        const maxDataPoints = numberOfSegments;
        logger?.debug(`[handleAudioAnalysis] Combined data points before trimming: numberOfSegments=${numberOfSegments} visualizationDuration=${visualizationDuration} combinedDataPointsLength=${combinedDataPoints.length} vs maxDataPoints=${maxDataPoints}`);
        // Trim data points to keep within the maximum number of data points
        if (combinedDataPoints.length > maxDataPoints) {
            combinedDataPoints.splice(0, combinedDataPoints.length - maxDataPoints);
        }
        // Keep the full data points
        fullAnalysisRef.current = {
            ...fullAnalysisRef.current,
            dataPoints: fullCombinedDataPoints,
        };
        fullAnalysisRef.current.durationMs =
            fullCombinedDataPoints.length * analysis.segmentDurationMs;
        savedAnalysisData.dataPoints = combinedDataPoints;
        savedAnalysisData.bitDepth =
            analysis.bitDepth || savedAnalysisData.bitDepth;
        savedAnalysisData.durationMs =
            combinedDataPoints.length * analysis.segmentDurationMs;
        // Update amplitude range
        const newMin = Math.min(savedAnalysisData.amplitudeRange.min, analysis.amplitudeRange.min);
        const newMax = Math.max(savedAnalysisData.amplitudeRange.max, analysis.amplitudeRange.max);
        savedAnalysisData.amplitudeRange = {
            min: newMin,
            max: newMax,
        };
        fullAnalysisRef.current.amplitudeRange = {
            min: newMin,
            max: newMax,
        };
        logger?.debug(`[handleAudioAnalysis] Updated analysis data: durationMs=${savedAnalysisData.durationMs}`, { dataPoints: savedAnalysisData.dataPoints.length });
        // Call the onAudioAnalysis callback if it exists in the recording config
        if (recordingConfigRef.current?.onAudioAnalysis) {
            recordingConfigRef.current
                .onAudioAnalysis(analysis)
                .catch((error) => {
                logger?.warn(`Error processing audio analysis:`, error);
            });
        }
        // Update the ref
        analysisRef.current = savedAnalysisData;
        // Dispatch the updated analysis data to state to trigger re-render
        dispatch({
            type: 'UPDATE_ANALYSIS',
            payload: { ...savedAnalysisData },
        });
    }, [dispatch]);
    const handleAudioEvent = (0, react_1.useCallback)(async (eventData) => {
        const { fileUri, deltaSize, totalSize, lastEmittedSize, position, streamUuid, encoded, mimeType, buffer, compression, } = eventData;
        logger?.debug(`[handleAudioEvent] Received audio event:`, {
            fileUri,
            deltaSize,
            totalSize,
            position,
            mimeType,
            lastEmittedSize,
            streamUuid,
            encodedLength: encoded?.length,
            compression,
        });
        if (deltaSize === 0) {
            // Ignore packet with no data
            return;
        }
        try {
            // Coming from native ( ios / android ) otherwise buffer is set
            if (expo_modules_core_1.Platform.OS !== 'web') {
                // Read the audio file as a base64 string for comparison
                if (!encoded) {
                    logger?.error(`Encoded audio data is missing`);
                    throw new Error('Encoded audio data is missing');
                }
                onAudioStreamRef.current?.({
                    data: encoded,
                    position,
                    fileUri,
                    eventDataSize: deltaSize,
                    totalSize,
                    compression: compression && startResultRef.current?.compression
                        ? {
                            data: compression.data,
                            size: compression.totalSize,
                            mimeType: startResultRef.current.compression
                                ?.mimeType,
                            bitrate: startResultRef.current.compression
                                ?.bitrate,
                            format: startResultRef.current.compression
                                ?.format,
                        }
                        : undefined,
                });
            }
            else if (buffer) {
                // Coming from web
                const webEvent = {
                    data: buffer,
                    position,
                    fileUri,
                    eventDataSize: deltaSize,
                    totalSize,
                    compression: compression && startResultRef.current?.compression
                        ? {
                            data: compression.data,
                            size: compression.totalSize,
                            mimeType: startResultRef.current.compression
                                ?.mimeType,
                            bitrate: startResultRef.current.compression
                                ?.bitrate,
                            format: startResultRef.current.compression
                                ?.format,
                        }
                        : undefined,
                };
                onAudioStreamRef.current?.(webEvent);
                logger?.debug(`[handleAudioEvent] Audio data sent to onAudioStream`, webEvent);
            }
        }
        catch (error) {
            logger?.error(`Error processing audio event:`, error);
        }
    }, []);
    const checkStatus = (0, react_1.useCallback)(async () => {
        try {
            const status = ExpoAudioStream.status();
            logger?.debug(`Status: paused: ${status.isPaused} isRecording: ${status.isRecording} durationMs: ${status.durationMs} size: ${status.size}`, status.compression);
            // Only dispatch if values actually changed
            if (status.isRecording !== stateRef.current.isRecording ||
                status.isPaused !== stateRef.current.isPaused) {
                stateRef.current.isRecording = status.isRecording;
                stateRef.current.isPaused = status.isPaused;
                dispatch({
                    type: 'UPDATE_RECORDING_STATE',
                    payload: {
                        isRecording: status.isRecording,
                        isPaused: status.isPaused,
                    },
                });
            }
            if (status.durationMs !== stateRef.current.durationMs ||
                status.size !== stateRef.current.size) {
                stateRef.current.durationMs = status.durationMs;
                stateRef.current.size = status.size;
                stateRef.current.compression = status.compression;
                dispatch({
                    type: 'UPDATE_STATUS',
                    payload: {
                        durationMs: status.durationMs,
                        size: status.size,
                        compression: status.compression,
                    },
                });
            }
        }
        catch (error) {
            logger?.error(`Error getting status:`, error);
        }
    }, [ExpoAudioStream, logger]); // Only depend on ExpoAudioStream and logger
    // Update ref when state changes
    (0, react_1.useEffect)(() => {
        stateRef.current = {
            isRecording: state.isRecording,
            isPaused: state.isPaused,
            durationMs: state.durationMs,
            size: state.size,
            compression: state.compression,
        };
    }, [
        state.isRecording,
        state.isPaused,
        state.durationMs,
        state.size,
        state.compression,
    ]);
    const startRecording = (0, react_1.useCallback)(async (recordingOptions) => {
        // Import validation function
        const { validateRecordingConfig } = await Promise.resolve().then(() => __importStar(require('./constants/platformLimitations')));
        // Validate the encoding configuration
        const validationResult = validateRecordingConfig({
            encoding: recordingOptions.encoding,
        });
        // Log warnings if any
        if (validationResult.warnings.length > 0) {
            validationResult.warnings.forEach((warning) => {
                logger?.warn(warning);
            });
        }
        // Update recording options with validated values
        const validatedOptions = {
            ...recordingOptions,
            encoding: validationResult.encoding,
        };
        recordingConfigRef.current = validatedOptions;
        logger?.debug(`start recording with validated config`, validatedOptions);
        analysisRef.current = { ...defaultAnalysis }; // Reset analysis data
        fullAnalysisRef.current = { ...defaultAnalysis };
        const { onAudioStream, onRecordingInterrupted, onAudioAnalysis, ...options } = validatedOptions;
        const { enableProcessing } = options;
        const maxRecentDataDuration = 10000; // TODO compute maxRecentDataDuration based on screen dimensions
        if (typeof onAudioStream === 'function') {
            onAudioStreamRef.current = onAudioStream;
        }
        else {
            logger?.warn(`onAudioStream is not a function`, onAudioStream);
            onAudioStreamRef.current = null;
        }
        const startResult = await ExpoAudioStream.startRecording(options);
        dispatch({ type: 'START' });
        startResultRef.current = startResult;
        if (enableProcessing) {
            logger?.debug(`Enabling audio analysis listener`);
            const listener = (0, events_1.addAudioAnalysisListener)(async (analysisData) => {
                try {
                    await handleAudioAnalysis({
                        analysis: analysisData,
                        visualizationDuration: maxRecentDataDuration,
                    });
                }
                catch (error) {
                    logger?.warn(`Error processing audio analysis:`, error);
                }
            });
            analysisListenerRef.current = listener;
        }
        return startResult;
    }, [handleAudioAnalysis, dispatch]);
    const prepareRecording = (0, react_1.useCallback)(async (recordingOptions) => {
        recordingConfigRef.current = recordingOptions;
        logger?.debug(`preparing recording`, recordingOptions);
        analysisRef.current = { ...defaultAnalysis }; // Reset analysis data
        fullAnalysisRef.current = { ...defaultAnalysis };
        const { onAudioStream, onRecordingInterrupted, onAudioAnalysis, ...options } = recordingOptions;
        // Store onAudioStream for later use when recording starts
        if (typeof onAudioStream === 'function') {
            onAudioStreamRef.current = onAudioStream;
        }
        else {
            logger?.warn(`onAudioStream is not a function`, onAudioStream);
            onAudioStreamRef.current = null;
        }
        // Call the native prepareRecording method
        await ExpoAudioStream.prepareRecording(options);
        logger?.debug(`recording prepared successfully`);
    }, []);
    const stopRecording = (0, react_1.useCallback)(async () => {
        logger?.debug(`stoping recording`);
        const stopResult = await ExpoAudioStream.stopRecording();
        stopResult.analysisData = fullAnalysisRef.current;
        if (analysisListenerRef.current) {
            analysisListenerRef.current.remove();
            analysisListenerRef.current = null;
        }
        onAudioStreamRef.current = null;
        // Note: We deliberately DON'T clear recordingConfigRef here to preserve interruption callback
        logger?.debug(`recording stopped`, stopResult);
        dispatch({ type: 'STOP' });
        return stopResult;
    }, [dispatch]);
    const pauseRecording = (0, react_1.useCallback)(async () => {
        logger?.debug(`pause recording`);
        const pauseResult = await ExpoAudioStream.pauseRecording();
        dispatch({ type: 'PAUSE' });
        return pauseResult;
    }, [dispatch]);
    const resumeRecording = (0, react_1.useCallback)(async () => {
        logger?.debug(`resume recording`);
        const resumeResult = await ExpoAudioStream.resumeRecording();
        dispatch({ type: 'RESUME' });
        return resumeResult;
    }, [dispatch]);
    (0, react_1.useEffect)(() => {
        let intervalId;
        if (state.isRecording || state.isPaused) {
            // Immediately check status when starting
            checkStatus();
            // Start interval
            intervalId = setInterval(checkStatus, 1000);
        }
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = undefined;
            }
        };
    }, [checkStatus, state.isRecording, state.isPaused]);
    (0, react_1.useEffect)(() => {
        logger?.debug(`Registering audio event listener`);
        const subscribeAudio = (0, events_1.addAudioEventListener)(handleAudioEvent);
        logger?.debug(`Subscribed to audio event listener and analysis listener`, {
            subscribeAudio,
        });
        return () => {
            logger?.debug(`Removing audio event listener`);
            subscribeAudio.remove();
        };
    }, [handleAudioEvent, handleAudioAnalysis]);
    (0, react_1.useEffect)(() => {
        // Add event subscription for recording interruptions
        logger?.debug(`Setting up recording interruption listener [${instanceId}]`);
        const subscription = (0, events_1.addRecordingInterruptionListener)((event) => {
            logger?.debug(`[${instanceId}] Received recording interruption event:`, event);
            // Handle device disconnection for UI updates
            if (event.reason === 'deviceDisconnected') {
                logger?.debug(`[${instanceId}] Device disconnected - temporarily hiding last device from UI`);
                // Get current device list before the native layer updates
                const currentDevices = AudioDeviceManager_1.audioDeviceManager.getRawDevices();
                // Wait a moment for native layer to update, then compare
                setTimeout(async () => {
                    try {
                        // Get updated devices without notifying yet
                        const updatedDevices = await AudioDeviceManager_1.audioDeviceManager.getAvailableDevices({
                            refresh: true,
                        });
                        // Find missing devices by comparing lists
                        const missingDevices = currentDevices.filter((oldDevice) => !updatedDevices.some((newDevice) => newDevice.id === oldDevice.id));
                        if (missingDevices.length > 0) {
                            // Mark all missing devices as disconnected (silently)
                            missingDevices.forEach((missingDevice) => {
                                logger?.debug(`[${instanceId}] Confirmed disconnected device: ${missingDevice.name} (${missingDevice.id})`);
                                AudioDeviceManager_1.audioDeviceManager.markDeviceAsDisconnected(missingDevice.id, false);
                            });
                        }
                        // Notify listeners once with the final filtered state
                        AudioDeviceManager_1.audioDeviceManager.notifyListeners();
                    }
                    catch (error) {
                        logger?.warn(`[${instanceId}] Error in delayed device disconnection handling:`, error);
                    }
                }, 500); // 500ms delay to let native layer update
            }
            else if (event.reason === 'deviceConnected') {
                // Device reconnected - force refresh to show it immediately
                logger?.debug(`[${instanceId}] Device connected, forcing refresh`);
                AudioDeviceManager_1.audioDeviceManager.forceRefreshDevices();
            }
            // Check if we have a callback configured
            logger?.debug(`[${instanceId}] recordingConfigRef.current exists:`, !!recordingConfigRef.current);
            if (recordingConfigRef.current?.onRecordingInterrupted) {
                try {
                    logger?.debug(`[${instanceId}] Calling recording interruption callback`);
                    recordingConfigRef.current.onRecordingInterrupted(event);
                }
                catch (error) {
                    logger?.error(`[${instanceId}] Error in recording interruption callback:`, error);
                }
            }
            else {
                logger?.debug(`[${instanceId}] No recording interruption callback configured`);
            }
        });
        return () => {
            logger?.debug(`[${instanceId}] Removing recording interruption listener`);
            subscription.remove();
        };
    }, [instanceId, logger]); // Include instanceId and logger in dependencies
    return {
        prepareRecording,
        startRecording,
        stopRecording,
        pauseRecording,
        resumeRecording,
        isPaused: state.isPaused,
        isRecording: state.isRecording,
        durationMs: state.durationMs,
        size: state.size,
        compression: state.compression,
        analysisData: state.analysisData,
    };
}
//# sourceMappingURL=useAudioRecorder.js.map