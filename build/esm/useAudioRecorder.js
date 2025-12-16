var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
// src/useAudioRecorder.ts
import { Platform } from 'expo-modules-core';
import { useCallback, useEffect, useReducer, useRef, useId } from 'react';
import { audioDeviceManager } from './AudioDeviceManager';
import ExpoAudioStreamModule from './ExpoAudioStreamModule';
import { addAudioAnalysisListener, addAudioEventListener, addRecordingInterruptionListener, } from './events';
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
            return Object.assign(Object.assign({}, state), { isRecording: true, isPaused: false, durationMs: 0, size: 0, compression: undefined, analysisData: defaultAnalysis });
        case 'STOP':
            return Object.assign(Object.assign({}, state), { isRecording: false, isPaused: false, durationMs: 0, size: 0, compression: undefined, analysisData: undefined });
        case 'PAUSE':
            return Object.assign(Object.assign({}, state), { isPaused: true, isRecording: false });
        case 'RESUME':
            return Object.assign(Object.assign({}, state), { isPaused: false, isRecording: true });
        case 'UPDATE_RECORDING_STATE':
            return Object.assign(Object.assign({}, state), { isPaused: action.payload.isPaused, isRecording: action.payload.isRecording });
        case 'UPDATE_STATUS': {
            const newState = Object.assign(Object.assign({}, state), { durationMs: action.payload.durationMs, size: action.payload.size, compression: action.payload.compression
                    ? {
                        size: action.payload.compression.size,
                        mimeType: action.payload.compression.mimeType,
                        bitrate: action.payload.compression.bitrate,
                        format: action.payload.compression.format,
                    }
                    : undefined });
            return newState;
        }
        case 'UPDATE_ANALYSIS':
            return Object.assign(Object.assign({}, state), { analysisData: action.payload });
        default:
            return state;
    }
}
export function useAudioRecorder({ logger, audioWorkletUrl, featuresExtratorUrl, } = {}) {
    // Initialize AudioDeviceManager with logger (once)
    if (logger) {
        audioDeviceManager.setLogger(logger);
    }
    const [state, dispatch] = useReducer(audioRecorderReducer, {
        isRecording: false,
        isPaused: false,
        durationMs: 0,
        size: 0,
        compression: undefined,
        analysisData: undefined,
    });
    const startResultRef = useRef(null);
    const analysisListenerRef = useRef(null);
    // analysisRef is the current analysis data (last 10 seconds by default)
    const analysisRef = useRef(Object.assign({}, defaultAnalysis));
    // fullAnalysisRef is the full analysis data (all data points)
    const fullAnalysisRef = useRef(Object.assign({}, defaultAnalysis));
    // Instantiate the module for web with URLs
    const ExpoAudioStream = Platform.OS === 'web'
        ? ExpoAudioStreamModule({
            audioWorkletUrl,
            featuresExtratorUrl,
            logger,
        })
        : ExpoAudioStreamModule;
    const onAudioStreamRef = useRef(null);
    const stateRef = useRef({
        isRecording: false,
        isPaused: false,
        durationMs: 0,
        size: 0,
        compression: undefined,
    });
    const recordingConfigRef = useRef(null);
    // Generate unique instance ID for debugging
    const instanceId = useId().replace(/:/g, '').slice(0, 5);
    const handleAudioAnalysis = useCallback(async ({ analysis, visualizationDuration, }) => {
        var _a, _b, _c;
        const savedAnalysisData = analysisRef.current || Object.assign({}, defaultAnalysis);
        const maxDuration = visualizationDuration;
        logger === null || logger === void 0 ? void 0 : logger.debug(`[handleAudioAnalysis] Received audio analysis: maxDuration=${maxDuration} analysis.dataPoints=${analysis.dataPoints.length} analysisData.dataPoints=${savedAnalysisData.dataPoints.length}`);
        // Combine data points
        const combinedDataPoints = [
            ...savedAnalysisData.dataPoints,
            ...analysis.dataPoints,
        ];
        const fullCombinedDataPoints = [
            ...((_b = (_a = fullAnalysisRef.current) === null || _a === void 0 ? void 0 : _a.dataPoints) !== null && _b !== void 0 ? _b : []),
            ...analysis.dataPoints,
        ];
        // Calculate the new duration
        // The number of segments is based on how many segments of segmentDurationMs can fit in visualizationDuration
        const numberOfSegments = Math.ceil(visualizationDuration / analysis.segmentDurationMs);
        // maxDataPoints should be the number of data points, not milliseconds
        const maxDataPoints = numberOfSegments;
        logger === null || logger === void 0 ? void 0 : logger.debug(`[handleAudioAnalysis] Combined data points before trimming: numberOfSegments=${numberOfSegments} visualizationDuration=${visualizationDuration} combinedDataPointsLength=${combinedDataPoints.length} vs maxDataPoints=${maxDataPoints}`);
        // Trim data points to keep within the maximum number of data points
        if (combinedDataPoints.length > maxDataPoints) {
            combinedDataPoints.splice(0, combinedDataPoints.length - maxDataPoints);
        }
        // Keep the full data points
        fullAnalysisRef.current = Object.assign(Object.assign({}, fullAnalysisRef.current), { dataPoints: fullCombinedDataPoints });
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
        logger === null || logger === void 0 ? void 0 : logger.debug(`[handleAudioAnalysis] Updated analysis data: durationMs=${savedAnalysisData.durationMs}`, { dataPoints: savedAnalysisData.dataPoints.length });
        // Call the onAudioAnalysis callback if it exists in the recording config
        if ((_c = recordingConfigRef.current) === null || _c === void 0 ? void 0 : _c.onAudioAnalysis) {
            recordingConfigRef.current
                .onAudioAnalysis(analysis)
                .catch((error) => {
                logger === null || logger === void 0 ? void 0 : logger.warn(`Error processing audio analysis:`, error);
            });
        }
        // Update the ref
        analysisRef.current = savedAnalysisData;
        // Dispatch the updated analysis data to state to trigger re-render
        dispatch({
            type: 'UPDATE_ANALYSIS',
            payload: Object.assign({}, savedAnalysisData),
        });
    }, [dispatch]);
    const handleAudioEvent = useCallback(async (eventData) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        const { fileUri, deltaSize, totalSize, lastEmittedSize, position, streamUuid, encoded, mimeType, buffer, compression, } = eventData;
        logger === null || logger === void 0 ? void 0 : logger.debug(`[handleAudioEvent] Received audio event:`, {
            fileUri,
            deltaSize,
            totalSize,
            position,
            mimeType,
            lastEmittedSize,
            streamUuid,
            encodedLength: encoded === null || encoded === void 0 ? void 0 : encoded.length,
            compression,
        });
        if (deltaSize === 0) {
            // Ignore packet with no data
            return;
        }
        try {
            // Coming from native ( ios / android ) otherwise buffer is set
            if (Platform.OS !== 'web') {
                // Read the audio file as a base64 string for comparison
                if (!encoded) {
                    logger === null || logger === void 0 ? void 0 : logger.error(`Encoded audio data is missing`);
                    throw new Error('Encoded audio data is missing');
                }
                (_a = onAudioStreamRef.current) === null || _a === void 0 ? void 0 : _a.call(onAudioStreamRef, {
                    data: encoded,
                    position,
                    fileUri,
                    eventDataSize: deltaSize,
                    totalSize,
                    compression: compression && ((_b = startResultRef.current) === null || _b === void 0 ? void 0 : _b.compression)
                        ? {
                            data: compression.data,
                            size: compression.totalSize,
                            mimeType: (_c = startResultRef.current.compression) === null || _c === void 0 ? void 0 : _c.mimeType,
                            bitrate: (_d = startResultRef.current.compression) === null || _d === void 0 ? void 0 : _d.bitrate,
                            format: (_e = startResultRef.current.compression) === null || _e === void 0 ? void 0 : _e.format,
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
                    compression: compression && ((_f = startResultRef.current) === null || _f === void 0 ? void 0 : _f.compression)
                        ? {
                            data: compression.data,
                            size: compression.totalSize,
                            mimeType: (_g = startResultRef.current.compression) === null || _g === void 0 ? void 0 : _g.mimeType,
                            bitrate: (_h = startResultRef.current.compression) === null || _h === void 0 ? void 0 : _h.bitrate,
                            format: (_j = startResultRef.current.compression) === null || _j === void 0 ? void 0 : _j.format,
                        }
                        : undefined,
                };
                (_k = onAudioStreamRef.current) === null || _k === void 0 ? void 0 : _k.call(onAudioStreamRef, webEvent);
                logger === null || logger === void 0 ? void 0 : logger.debug(`[handleAudioEvent] Audio data sent to onAudioStream`, webEvent);
            }
        }
        catch (error) {
            logger === null || logger === void 0 ? void 0 : logger.error(`Error processing audio event:`, error);
        }
    }, []);
    const checkStatus = useCallback(async () => {
        try {
            const status = ExpoAudioStream.status();
            logger === null || logger === void 0 ? void 0 : logger.debug(`Status: paused: ${status.isPaused} isRecording: ${status.isRecording} durationMs: ${status.durationMs} size: ${status.size}`, status.compression);
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
            logger === null || logger === void 0 ? void 0 : logger.error(`Error getting status:`, error);
        }
    }, [ExpoAudioStream, logger]); // Only depend on ExpoAudioStream and logger
    // Update ref when state changes
    useEffect(() => {
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
    const startRecording = useCallback(async (recordingOptions) => {
        // Import validation function
        const { validateRecordingConfig } = await import('./constants/platformLimitations');
        // Validate the encoding configuration
        const validationResult = validateRecordingConfig({
            encoding: recordingOptions.encoding,
        });
        // Log warnings if any
        if (validationResult.warnings.length > 0) {
            validationResult.warnings.forEach((warning) => {
                logger === null || logger === void 0 ? void 0 : logger.warn(warning);
            });
        }
        // Update recording options with validated values
        const validatedOptions = Object.assign(Object.assign({}, recordingOptions), { encoding: validationResult.encoding });
        recordingConfigRef.current = validatedOptions;
        logger === null || logger === void 0 ? void 0 : logger.debug(`start recording with validated config`, validatedOptions);
        analysisRef.current = Object.assign({}, defaultAnalysis); // Reset analysis data
        fullAnalysisRef.current = Object.assign({}, defaultAnalysis);
        const { onAudioStream, onRecordingInterrupted, onAudioAnalysis } = validatedOptions, options = __rest(validatedOptions, ["onAudioStream", "onRecordingInterrupted", "onAudioAnalysis"]);
        const { enableProcessing } = options;
        const maxRecentDataDuration = 10000; // TODO compute maxRecentDataDuration based on screen dimensions
        if (typeof onAudioStream === 'function') {
            onAudioStreamRef.current = onAudioStream;
        }
        else {
            logger === null || logger === void 0 ? void 0 : logger.warn(`onAudioStream is not a function`, onAudioStream);
            onAudioStreamRef.current = null;
        }
        const startResult = await ExpoAudioStream.startRecording(options);
        dispatch({ type: 'START' });
        startResultRef.current = startResult;
        if (enableProcessing) {
            logger === null || logger === void 0 ? void 0 : logger.debug(`Enabling audio analysis listener`);
            const listener = addAudioAnalysisListener(async (analysisData) => {
                try {
                    await handleAudioAnalysis({
                        analysis: analysisData,
                        visualizationDuration: maxRecentDataDuration,
                    });
                }
                catch (error) {
                    logger === null || logger === void 0 ? void 0 : logger.warn(`Error processing audio analysis:`, error);
                }
            });
            analysisListenerRef.current = listener;
        }
        return startResult;
    }, [handleAudioAnalysis, dispatch]);
    const prepareRecording = useCallback(async (recordingOptions) => {
        recordingConfigRef.current = recordingOptions;
        logger === null || logger === void 0 ? void 0 : logger.debug(`preparing recording`, recordingOptions);
        analysisRef.current = Object.assign({}, defaultAnalysis); // Reset analysis data
        fullAnalysisRef.current = Object.assign({}, defaultAnalysis);
        const { onAudioStream, onRecordingInterrupted, onAudioAnalysis } = recordingOptions, options = __rest(recordingOptions
        // Store onAudioStream for later use when recording starts
        , ["onAudioStream", "onRecordingInterrupted", "onAudioAnalysis"]);
        // Store onAudioStream for later use when recording starts
        if (typeof onAudioStream === 'function') {
            onAudioStreamRef.current = onAudioStream;
        }
        else {
            logger === null || logger === void 0 ? void 0 : logger.warn(`onAudioStream is not a function`, onAudioStream);
            onAudioStreamRef.current = null;
        }
        // Call the native prepareRecording method
        await ExpoAudioStream.prepareRecording(options);
        logger === null || logger === void 0 ? void 0 : logger.debug(`recording prepared successfully`);
    }, []);
    const stopRecording = useCallback(async () => {
        logger === null || logger === void 0 ? void 0 : logger.debug(`stoping recording`);
        const stopResult = await ExpoAudioStream.stopRecording();
        stopResult.analysisData = fullAnalysisRef.current;
        if (analysisListenerRef.current) {
            analysisListenerRef.current.remove();
            analysisListenerRef.current = null;
        }
        onAudioStreamRef.current = null;
        // Note: We deliberately DON'T clear recordingConfigRef here to preserve interruption callback
        logger === null || logger === void 0 ? void 0 : logger.debug(`recording stopped`, stopResult);
        dispatch({ type: 'STOP' });
        return stopResult;
    }, [dispatch]);
    const pauseRecording = useCallback(async () => {
        logger === null || logger === void 0 ? void 0 : logger.debug(`pause recording`);
        const pauseResult = await ExpoAudioStream.pauseRecording();
        dispatch({ type: 'PAUSE' });
        return pauseResult;
    }, [dispatch]);
    const resumeRecording = useCallback(async () => {
        logger === null || logger === void 0 ? void 0 : logger.debug(`resume recording`);
        const resumeResult = await ExpoAudioStream.resumeRecording();
        dispatch({ type: 'RESUME' });
        return resumeResult;
    }, [dispatch]);
    useEffect(() => {
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
    useEffect(() => {
        logger === null || logger === void 0 ? void 0 : logger.debug(`Registering audio event listener`);
        const subscribeAudio = addAudioEventListener(handleAudioEvent);
        logger === null || logger === void 0 ? void 0 : logger.debug(`Subscribed to audio event listener and analysis listener`, {
            subscribeAudio,
        });
        return () => {
            logger === null || logger === void 0 ? void 0 : logger.debug(`Removing audio event listener`);
            subscribeAudio.remove();
        };
    }, [handleAudioEvent, handleAudioAnalysis]);
    useEffect(() => {
        // Add event subscription for recording interruptions
        logger === null || logger === void 0 ? void 0 : logger.debug(`Setting up recording interruption listener [${instanceId}]`);
        const subscription = addRecordingInterruptionListener((event) => {
            var _a;
            logger === null || logger === void 0 ? void 0 : logger.debug(`[${instanceId}] Received recording interruption event:`, event);
            // Handle device disconnection for UI updates
            if (event.reason === 'deviceDisconnected') {
                logger === null || logger === void 0 ? void 0 : logger.debug(`[${instanceId}] Device disconnected - temporarily hiding last device from UI`);
                // Get current device list before the native layer updates
                const currentDevices = audioDeviceManager.getRawDevices();
                // Wait a moment for native layer to update, then compare
                setTimeout(async () => {
                    try {
                        // Get updated devices without notifying yet
                        const updatedDevices = await audioDeviceManager.getAvailableDevices({
                            refresh: true,
                        });
                        // Find missing devices by comparing lists
                        const missingDevices = currentDevices.filter((oldDevice) => !updatedDevices.some((newDevice) => newDevice.id === oldDevice.id));
                        if (missingDevices.length > 0) {
                            // Mark all missing devices as disconnected (silently)
                            missingDevices.forEach((missingDevice) => {
                                logger === null || logger === void 0 ? void 0 : logger.debug(`[${instanceId}] Confirmed disconnected device: ${missingDevice.name} (${missingDevice.id})`);
                                audioDeviceManager.markDeviceAsDisconnected(missingDevice.id, false);
                            });
                        }
                        // Notify listeners once with the final filtered state
                        audioDeviceManager.notifyListeners();
                    }
                    catch (error) {
                        logger === null || logger === void 0 ? void 0 : logger.warn(`[${instanceId}] Error in delayed device disconnection handling:`, error);
                    }
                }, 500); // 500ms delay to let native layer update
            }
            else if (event.reason === 'deviceConnected') {
                // Device reconnected - force refresh to show it immediately
                logger === null || logger === void 0 ? void 0 : logger.debug(`[${instanceId}] Device connected, forcing refresh`);
                audioDeviceManager.forceRefreshDevices();
            }
            // Check if we have a callback configured
            logger === null || logger === void 0 ? void 0 : logger.debug(`[${instanceId}] recordingConfigRef.current exists:`, !!recordingConfigRef.current);
            if ((_a = recordingConfigRef.current) === null || _a === void 0 ? void 0 : _a.onRecordingInterrupted) {
                try {
                    logger === null || logger === void 0 ? void 0 : logger.debug(`[${instanceId}] Calling recording interruption callback`);
                    recordingConfigRef.current.onRecordingInterrupted(event);
                }
                catch (error) {
                    logger === null || logger === void 0 ? void 0 : logger.error(`[${instanceId}] Error in recording interruption callback:`, error);
                }
            }
            else {
                logger === null || logger === void 0 ? void 0 : logger.debug(`[${instanceId}] No recording interruption callback configured`);
            }
        });
        return () => {
            logger === null || logger === void 0 ? void 0 : logger.debug(`[${instanceId}] Removing recording interruption listener`);
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
