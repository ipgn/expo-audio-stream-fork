// src/ExpoAudioStreamModule.web.ts
import { LegacyEventEmitter } from 'expo-modules-core';
import { WebRecorder } from './WebRecorder.web';
import { encodingToBitDepth } from './utils/encodingToBitDepth';
export class ExpoAudioStreamWeb extends LegacyEventEmitter {
    constructor({ audioWorkletUrl, featuresExtratorUrl, logger, maxBufferSize = 100, // Default to storing last 100 chunks (1 chunk = 0.5 seconds)
     }) {
        const mockNativeModule = {
            addListener: () => { },
            removeListeners: () => { },
        };
        super(mockNativeModule); // Pass the mock native module to the parent class
        this.extension = 'wav'; // Default extension is 'wav'
        this.latestPosition = 0;
        this.totalCompressedSize = 0;
        this.logger = logger;
        this.customRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;
        this.isPaused = false;
        this.recordingStartTime = 0;
        this.pausedTime = 0;
        this.currentDurationMs = 0;
        this.currentSize = 0;
        this.bitDepth = 32; // Default
        this.currentInterval = 1000; // Default interval in ms
        this.currentIntervalAnalysis = 500; // Default analysis interval in ms
        this.lastEmittedSize = 0;
        this.lastEmittedTime = 0;
        this.latestPosition = 0;
        this.lastEmittedCompressionSize = 0;
        this.lastEmittedAnalysisTime = 0;
        this.streamUuid = null; // Initialize UUID on first recording start
        this.audioWorkletUrl = audioWorkletUrl;
        this.featuresExtratorUrl = featuresExtratorUrl;
        this.maxBufferSize = maxBufferSize;
    }
    // Utility to handle user media stream
    async getMediaStream() {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        try {
            (_a = this.logger) === null || _a === void 0 ? void 0 : _a.debug('Requesting user media (microphone)...');
            // First check if the browser supports the necessary audio APIs
            if (!((_b = navigator === null || navigator === void 0 ? void 0 : navigator.mediaDevices) === null || _b === void 0 ? void 0 : _b.getUserMedia)) {
                (_c = this.logger) === null || _c === void 0 ? void 0 : _c.error('Browser does not support mediaDevices.getUserMedia');
                throw new Error('Browser does not support audio recording');
            }
            // Get media with detailed audio constraints for better diagnostics
            const constraints = {
                audio: Object.assign({ echoCancellation: true, noiseSuppression: true, autoGainControl: true }, (((_d = this.recordingConfig) === null || _d === void 0 ? void 0 : _d.deviceId)
                    ? {
                        deviceId: {
                            exact: this.recordingConfig.deviceId,
                        },
                    }
                    : {})),
            };
            (_e = this.logger) === null || _e === void 0 ? void 0 : _e.debug('Media constraints:', constraints);
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            // Get detailed info about the audio track for debugging
            const audioTracks = stream.getAudioTracks();
            if (audioTracks.length > 0) {
                const track = audioTracks[0];
                const settings = track.getSettings();
                (_f = this.logger) === null || _f === void 0 ? void 0 : _f.debug('Audio track obtained:', {
                    label: track.label,
                    id: track.id,
                    enabled: track.enabled,
                    muted: track.muted,
                    readyState: track.readyState,
                    settings,
                });
            }
            else {
                (_g = this.logger) === null || _g === void 0 ? void 0 : _g.warn('Stream has no audio tracks!');
            }
            return stream;
        }
        catch (error) {
            (_h = this.logger) === null || _h === void 0 ? void 0 : _h.error('Failed to get media stream:', error);
            throw error;
        }
    }
    // Prepare recording with options
    async prepareRecording(recordingConfig = {}) {
        var _a, _b, _c, _d;
        if (this.isRecording) {
            (_a = this.logger) === null || _a === void 0 ? void 0 : _a.warn('Cannot prepare: Recording is already in progress');
            return false;
        }
        try {
            // Check permissions and initialize basic settings
            await this.getMediaStream().then((stream) => {
                // Just verify we can access the microphone by getting a stream, then release it
                stream.getTracks().forEach((track) => track.stop());
            });
            this.bitDepth = encodingToBitDepth({
                encoding: (_b = recordingConfig.encoding) !== null && _b !== void 0 ? _b : 'pcm_32bit',
            });
            // Store recording configuration for later use
            this.recordingConfig = recordingConfig;
            // Use custom filename if provided, otherwise fallback to timestamp
            if (recordingConfig.filename) {
                // Remove any existing extension from the filename
                this.streamUuid = recordingConfig.filename.replace(/\.[^/.]+$/, '');
            }
            else {
                this.streamUuid = Date.now().toString();
            }
            (_c = this.logger) === null || _c === void 0 ? void 0 : _c.debug('Recording preparation completed successfully');
            return true;
        }
        catch (error) {
            (_d = this.logger) === null || _d === void 0 ? void 0 : _d.error('Error preparing recording:', error);
            return false;
        }
    }
    // Start recording with options
    async startRecording(recordingConfig = {}) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        if (this.isRecording) {
            throw new Error('Recording is already in progress');
        }
        // If we haven't prepared or have different settings, prepare now
        if (!this.recordingConfig ||
            this.recordingConfig.sampleRate !== recordingConfig.sampleRate ||
            this.recordingConfig.channels !== recordingConfig.channels ||
            this.recordingConfig.encoding !== recordingConfig.encoding) {
            await this.prepareRecording(recordingConfig);
        }
        else {
            (_a = this.logger) === null || _a === void 0 ? void 0 : _a.debug('Using previously prepared recording configuration');
        }
        // Save recording config for reference
        this.recordingConfig = recordingConfig;
        const audioContext = new (window.AudioContext ||
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore - Allow webkitAudioContext for Safari
            window.webkitAudioContext)();
        const stream = await this.getMediaStream();
        const source = audioContext.createMediaStreamSource(stream);
        this.customRecorder = new WebRecorder({
            logger: this.logger,
            audioContext,
            source,
            recordingConfig,
            emitAudioEventCallback: this.customRecorderEventCallback.bind(this),
            emitAudioAnalysisCallback: this.customRecorderAnalysisCallback.bind(this),
            onInterruption: this.handleRecordingInterruption.bind(this),
        });
        await this.customRecorder.init();
        this.customRecorder.start();
        this.isRecording = true;
        this.recordingStartTime = Date.now();
        this.pausedTime = 0;
        this.isPaused = false;
        this.lastEmittedSize = 0;
        this.lastEmittedTime = 0;
        this.lastEmittedCompressionSize = 0;
        this.currentInterval = (_b = recordingConfig.interval) !== null && _b !== void 0 ? _b : 1000;
        this.currentIntervalAnalysis = (_c = recordingConfig.intervalAnalysis) !== null && _c !== void 0 ? _c : 500;
        this.lastEmittedAnalysisTime = Date.now();
        // Use custom filename if provided, otherwise fallback to timestamp
        if (recordingConfig.filename) {
            // Remove any existing extension from the filename
            this.streamUuid = recordingConfig.filename.replace(/\.[^/.]+$/, '');
        }
        else {
            this.streamUuid = Date.now().toString();
        }
        const fileUri = `${this.streamUuid}.${this.extension}`;
        const streamConfig = {
            fileUri,
            mimeType: `audio/${this.extension}`,
            bitDepth: this.bitDepth,
            channels: (_d = recordingConfig.channels) !== null && _d !== void 0 ? _d : 1,
            sampleRate: (_e = recordingConfig.sampleRate) !== null && _e !== void 0 ? _e : 44100,
            compression: ((_g = (_f = recordingConfig.output) === null || _f === void 0 ? void 0 : _f.compressed) === null || _g === void 0 ? void 0 : _g.enabled)
                ? Object.assign(Object.assign({}, recordingConfig.output.compressed), { bitrate: (_h = recordingConfig.output.compressed.bitrate) !== null && _h !== void 0 ? _h : 128000, size: 0, mimeType: 'audio/webm', format: (_j = recordingConfig.output.compressed.format) !== null && _j !== void 0 ? _j : 'opus', compressedFileUri: '' }) : undefined,
        };
        return streamConfig;
    }
    /**
     * Centralized handler for recording interruptions
     */
    handleRecordingInterruption(event) {
        var _a, _b, _c, _d;
        (_a = this.logger) === null || _a === void 0 ? void 0 : _a.debug(`Received recording interruption: ${event.reason}`);
        // Update local state if the interruption should pause recording
        if (event.isPaused) {
            this.isPaused = true;
            // If this is a device disconnection, handle according to behavior setting
            if (event.reason === 'deviceDisconnected') {
                this.pausedTime = Date.now();
                // Check if we should try fallback to another device
                if (((_b = this.recordingConfig) === null || _b === void 0 ? void 0 : _b.deviceDisconnectionBehavior) ===
                    'fallback') {
                    (_c = this.logger) === null || _c === void 0 ? void 0 : _c.debug('Device disconnected with fallback behavior - attempting to switch to default device');
                    // Try to restart with default device
                    this.handleDeviceFallback().catch((error) => {
                        var _a;
                        // If fallback fails, emit warning
                        (_a = this.logger) === null || _a === void 0 ? void 0 : _a.error('Device fallback failed:', error);
                        this.emit('onRecordingInterrupted', {
                            reason: 'deviceSwitchFailed',
                            isPaused: true,
                            timestamp: Date.now(),
                            message: 'Failed to switch to fallback device. Recording paused.',
                        });
                    });
                }
                else {
                    // Just warn about disconnection if fallback not enabled
                    (_d = this.logger) === null || _d === void 0 ? void 0 : _d.warn('Device disconnected - recording paused automatically');
                    this.emit('onRecordingInterrupted', event);
                }
            }
            else {
                // For other interruption types, just emit the event
                this.emit('onRecordingInterrupted', event);
            }
        }
        else {
            // If not causing a pause, just forward the event
            this.emit('onRecordingInterrupted', event);
        }
    }
    /**
     * Handler for audio events from the WebRecorder
     */
    customRecorderEventCallback({ data, position, compression, }) {
        var _a;
        // Keep only the latest chunks based on maxBufferSize
        this.audioChunks.push(new Float32Array(data));
        if (this.audioChunks.length > this.maxBufferSize) {
            this.audioChunks.shift(); // Remove oldest chunk
        }
        this.currentSize += data.byteLength;
        this.emitAudioEvent({ data, position, compression });
        this.lastEmittedTime = Date.now();
        this.lastEmittedSize = this.currentSize;
        this.lastEmittedCompressionSize = (_a = compression === null || compression === void 0 ? void 0 : compression.size) !== null && _a !== void 0 ? _a : 0;
    }
    /**
     * Handler for audio analysis events from the WebRecorder
     */
    customRecorderAnalysisCallback(audioAnalysisData) {
        this.emit('AudioAnalysis', audioAnalysisData);
    }
    // Get recording duration
    getRecordingDuration() {
        if (!this.isRecording) {
            return 0;
        }
        return this.currentDurationMs;
    }
    emitAudioEvent({ data, position, compression }) {
        var _a, _b, _c, _d, _e;
        const fileUri = `${this.streamUuid}.${this.extension}`;
        if (compression === null || compression === void 0 ? void 0 : compression.size) {
            this.lastEmittedCompressionSize = compression.size;
            this.totalCompressedSize = compression.totalSize;
        }
        // Update latest position for tracking
        this.latestPosition = position;
        // Calculate duration of this chunk in ms
        const sampleRate = ((_a = this.recordingConfig) === null || _a === void 0 ? void 0 : _a.sampleRate) || 44100;
        const chunkDurationMs = (data.length / sampleRate) * 1000;
        // Handle duration calculation
        if ((_b = this.customRecorder) === null || _b === void 0 ? void 0 : _b.isFirstChunkAfterSwitch) {
            (_c = this.logger) === null || _c === void 0 ? void 0 : _c.debug(`Processing first chunk after device switch, duration preserved at ${this.currentDurationMs}ms`);
            this.customRecorder.isFirstChunkAfterSwitch = false;
        }
        else {
            this.currentDurationMs += chunkDurationMs;
        }
        const audioEventPayload = {
            fileUri,
            mimeType: `audio/${this.extension}`,
            lastEmittedSize: this.lastEmittedSize,
            deltaSize: data.byteLength,
            position,
            totalSize: this.currentSize,
            buffer: data,
            streamUuid: (_d = this.streamUuid) !== null && _d !== void 0 ? _d : '',
            compression: compression
                ? {
                    data: compression === null || compression === void 0 ? void 0 : compression.data,
                    totalSize: this.totalCompressedSize,
                    eventDataSize: (_e = compression === null || compression === void 0 ? void 0 : compression.size) !== null && _e !== void 0 ? _e : 0,
                    position,
                }
                : undefined,
        };
        this.emit('AudioData', audioEventPayload);
    }
    // Stop recording
    async stopRecording() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z;
        if (!this.customRecorder) {
            throw new Error('Recorder is not initialized');
        }
        (_a = this.logger) === null || _a === void 0 ? void 0 : _a.debug('Starting stop process');
        try {
            const { compressedBlob, uncompressedBlob } = await this.customRecorder.stop();
            this.isRecording = false;
            this.isPaused = false;
            let compression;
            let fileUri = `${this.streamUuid}.${this.extension}`;
            let mimeType = `audio/${this.extension}`;
            // Handle both compressed and uncompressed blobs according to new output configuration
            const primaryEnabled = (_e = (_d = (_c = (_b = this.recordingConfig) === null || _b === void 0 ? void 0 : _b.output) === null || _c === void 0 ? void 0 : _c.primary) === null || _d === void 0 ? void 0 : _d.enabled) !== null && _e !== void 0 ? _e : true;
            const compressedEnabled = (_j = (_h = (_g = (_f = this.recordingConfig) === null || _f === void 0 ? void 0 : _f.output) === null || _g === void 0 ? void 0 : _g.compressed) === null || _h === void 0 ? void 0 : _h.enabled) !== null && _j !== void 0 ? _j : false;
            // Process compressed blob if available and enabled
            if (compressedBlob && compressedEnabled) {
                const compressedUri = URL.createObjectURL(compressedBlob);
                const compressedInfo = {
                    compressedFileUri: compressedUri,
                    size: compressedBlob.size,
                    mimeType: 'audio/webm',
                    format: (_o = (_m = (_l = (_k = this.recordingConfig) === null || _k === void 0 ? void 0 : _k.output) === null || _l === void 0 ? void 0 : _l.compressed) === null || _m === void 0 ? void 0 : _m.format) !== null && _o !== void 0 ? _o : 'opus',
                    bitrate: (_s = (_r = (_q = (_p = this.recordingConfig) === null || _p === void 0 ? void 0 : _p.output) === null || _q === void 0 ? void 0 : _q.compressed) === null || _r === void 0 ? void 0 : _r.bitrate) !== null && _s !== void 0 ? _s : 128000,
                };
                // Store compression info
                compression = compressedInfo;
                // If primary is disabled, use compressed as main file
                if (!primaryEnabled) {
                    (_t = this.logger) === null || _t === void 0 ? void 0 : _t.debug('Using compressed audio as primary output (primary disabled)');
                    fileUri = compressedUri;
                    mimeType = 'audio/webm';
                }
            }
            // Process uncompressed WAV if available and primary is enabled
            if (uncompressedBlob && primaryEnabled) {
                const wavUri = URL.createObjectURL(uncompressedBlob);
                fileUri = wavUri;
                mimeType = 'audio/wav';
            }
            else if (!primaryEnabled && !compressedEnabled) {
                // No outputs enabled - streaming only mode
                (_u = this.logger) === null || _u === void 0 ? void 0 : _u.debug('No outputs enabled - streaming only mode');
                fileUri = '';
                mimeType = 'audio/wav';
            }
            // Use the stored streamUuid for the final filename
            const filename = fileUri
                ? `${this.streamUuid}.${this.extension}`
                : 'stream-only';
            const result = {
                fileUri,
                filename,
                bitDepth: this.bitDepth,
                createdAt: this.recordingStartTime,
                channels: (_w = (_v = this.recordingConfig) === null || _v === void 0 ? void 0 : _v.channels) !== null && _w !== void 0 ? _w : 1,
                sampleRate: (_y = (_x = this.recordingConfig) === null || _x === void 0 ? void 0 : _x.sampleRate) !== null && _y !== void 0 ? _y : 44100,
                durationMs: this.currentDurationMs,
                size: primaryEnabled ? this.currentSize : 0,
                mimeType,
                compression,
            };
            // Reset after creating the result
            this.streamUuid = null;
            // Reset recording state variables to prepare for next recording
            this.currentDurationMs = 0;
            this.currentSize = 0;
            this.lastEmittedSize = 0;
            this.totalCompressedSize = 0;
            this.lastEmittedCompressionSize = 0;
            this.audioChunks = [];
            return result;
        }
        catch (error) {
            (_z = this.logger) === null || _z === void 0 ? void 0 : _z.error('Error stopping recording:', error);
            throw error;
        }
    }
    // Pause recording
    async pauseRecording() {
        var _a, _b;
        if (!this.isRecording) {
            throw new Error('Recording is not active');
        }
        if (this.isPaused) {
            (_a = this.logger) === null || _a === void 0 ? void 0 : _a.debug('Recording already paused, skipping');
            return;
        }
        try {
            if (this.customRecorder) {
                this.customRecorder.pause();
            }
            this.isPaused = true;
            this.pausedTime = Date.now();
        }
        catch (error) {
            (_b = this.logger) === null || _b === void 0 ? void 0 : _b.error('Error in pauseRecording', error);
            // Even if the pause operation failed, make sure our state is consistent
            this.isPaused = true;
            this.pausedTime = Date.now();
        }
    }
    // Resume recording
    async resumeRecording() {
        var _a, _b, _c, _d, _e;
        if (!this.isPaused) {
            throw new Error('Recording is not paused');
        }
        (_a = this.logger) === null || _a === void 0 ? void 0 : _a.debug('Resuming recording', {
            deviceDisconnectionBehavior: (_b = this.recordingConfig) === null || _b === void 0 ? void 0 : _b.deviceDisconnectionBehavior,
            isDeviceDisconnected: (_c = this.customRecorder) === null || _c === void 0 ? void 0 : _c.isDeviceDisconnected,
        });
        try {
            // If we have no recorder, or if the device is disconnected, always attempt fallback
            if (!this.customRecorder ||
                this.customRecorder.isDeviceDisconnected) {
                (_d = this.logger) === null || _d === void 0 ? void 0 : _d.debug('No recorder exists or device disconnected - attempting fallback on resume');
                await this.handleDeviceFallback();
                // handleDeviceFallback will manage resuming if successful, or emit error if failed.
                return;
            }
            // Normal resume path - device is still connected
            this.customRecorder.resume();
            this.isPaused = false;
            // Adjust the recording start time to account for the pause duration
            const pauseDuration = Date.now() - this.pausedTime;
            this.recordingStartTime += pauseDuration;
            this.pausedTime = 0;
            this.emit('onRecordingInterrupted', {
                reason: 'userResumed',
                isPaused: false,
                timestamp: Date.now(),
            });
        }
        catch (error) {
            (_e = this.logger) === null || _e === void 0 ? void 0 : _e.error('Resume failed:', error);
            // Fallback to emitting a general failure if resume fails unexpectedly
            this.emit('onRecordingInterrupted', {
                reason: 'resumeFailed', // Use a more specific reason
                isPaused: true, // Remain paused if resume fails
                timestamp: Date.now(),
                message: 'Failed to resume recording. Please stop and start again.',
            });
        }
    }
    // Get current status
    status() {
        var _a, _b, _c, _d, _e;
        const durationMs = this.getRecordingDuration();
        const status = {
            isRecording: this.isRecording,
            isPaused: this.isPaused,
            durationMs,
            size: this.currentSize,
            interval: this.currentInterval,
            intervalAnalysis: this.currentIntervalAnalysis,
            mimeType: `audio/${this.extension}`,
            compression: ((_c = (_b = (_a = this.recordingConfig) === null || _a === void 0 ? void 0 : _a.output) === null || _b === void 0 ? void 0 : _b.compressed) === null || _c === void 0 ? void 0 : _c.enabled)
                ? {
                    size: this.totalCompressedSize,
                    mimeType: 'audio/webm',
                    format: (_d = this.recordingConfig.output.compressed.format) !== null && _d !== void 0 ? _d : 'opus',
                    bitrate: (_e = this.recordingConfig.output.compressed.bitrate) !== null && _e !== void 0 ? _e : 128000,
                    compressedFileUri: `${this.streamUuid}.webm`,
                }
                : undefined,
        };
        return status;
    }
    /**
     * Handles device fallback when the current device is disconnected
     */
    async handleDeviceFallback() {
        var _a, _b, _c, _d, _e;
        (_a = this.logger) === null || _a === void 0 ? void 0 : _a.debug('Starting device fallback procedure');
        if (!this.isRecording) {
            return false;
        }
        try {
            // Save important state before switching
            const currentPosition = this.latestPosition;
            const existingAudioChunks = [...this.audioChunks];
            // Save compressed chunks if available
            let compressedChunks = [];
            if (this.customRecorder) {
                try {
                    compressedChunks = this.customRecorder.getCompressedChunks();
                }
                catch (err) {
                    (_b = this.logger) === null || _b === void 0 ? void 0 : _b.warn('Failed to get compressed chunks:', err);
                }
            }
            // Save the current counter value for continuity
            let currentDataPointCounter = 0;
            if (this.customRecorder) {
                currentDataPointCounter =
                    this.customRecorder.getDataPointCounter();
            }
            // Clean up existing recorder
            if (this.customRecorder) {
                try {
                    this.customRecorder.cleanup();
                }
                catch (cleanupError) {
                    (_c = this.logger) === null || _c === void 0 ? void 0 : _c.warn('Error during cleanup:', cleanupError);
                }
            }
            // Keep recording state true but mark as paused
            this.isPaused = true;
            this.pausedTime = Date.now();
            // Store current size and other stats
            const previousTotalSize = this.currentSize;
            const previousLastEmittedSize = this.lastEmittedSize;
            const previousCompressedSize = this.totalCompressedSize;
            // Try to get a fallback device
            const fallbackDeviceInfo = await this.getFallbackDevice();
            if (!fallbackDeviceInfo) {
                this.emit('onRecordingInterrupted', {
                    reason: 'deviceSwitchFailed',
                    isPaused: true,
                    timestamp: Date.now(),
                    message: 'Failed to switch to fallback device. Recording paused.',
                });
                return false;
            }
            // Start recording with the new device
            try {
                const stream = await this.requestPermissionsAndGetUserMedia(fallbackDeviceInfo.deviceId);
                const audioContext = new (window.AudioContext ||
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore - Allow webkitAudioContext for Safari
                    window.webkitAudioContext)();
                const source = audioContext.createMediaStreamSource(stream);
                // Create a new recorder with the fallback device
                this.customRecorder = new WebRecorder({
                    logger: this.logger,
                    audioContext,
                    source,
                    recordingConfig: this.recordingConfig || {},
                    emitAudioEventCallback: this.customRecorderEventCallback.bind(this),
                    emitAudioAnalysisCallback: this.customRecorderAnalysisCallback.bind(this),
                    onInterruption: this.handleRecordingInterruption.bind(this),
                });
                await this.customRecorder.init();
                // Set the initial position to continue from the previous device
                this.customRecorder.setPosition(currentPosition);
                // Reset the data point counter to continue from where the previous device left off
                if (currentDataPointCounter > 0) {
                    this.customRecorder.resetDataPointCounter(currentDataPointCounter);
                }
                // Prepare the recorder to handle the device switch properly
                this.customRecorder.prepareForDeviceSwitch();
                // Restore the existing audio chunks
                if (existingAudioChunks.length > 0) {
                    this.audioChunks = existingAudioChunks;
                }
                // Restore compressed chunks if available
                if (compressedChunks.length > 0) {
                    this.customRecorder.setCompressedChunks(compressedChunks);
                }
                // Start the new recorder while preserving counters
                this.customRecorder.start(true);
                // Update recording state
                this.isPaused = false;
                this.recordingStartTime = Date.now();
                // Restore size counters to maintain continuity
                this.currentSize = previousTotalSize;
                this.lastEmittedSize = previousLastEmittedSize;
                this.totalCompressedSize = previousCompressedSize;
                // Notify that we switched to a fallback device
                if (this.eventCallback) {
                    this.eventCallback({
                        type: 'deviceFallback',
                        device: fallbackDeviceInfo.deviceId,
                        timestamp: new Date(),
                    });
                }
                return true;
            }
            catch (error) {
                (_d = this.logger) === null || _d === void 0 ? void 0 : _d.error('Failed to start recording with fallback device', error);
                this.isPaused = true;
                this.emit('onRecordingInterrupted', {
                    reason: 'deviceSwitchFailed',
                    isPaused: true,
                    timestamp: Date.now(),
                    message: 'Failed to switch to fallback device. Recording paused.',
                });
                return false;
            }
        }
        catch (error) {
            (_e = this.logger) === null || _e === void 0 ? void 0 : _e.error('Failed to use fallback device', error);
            this.isPaused = true;
            this.emit('onRecordingInterrupted', {
                reason: 'deviceSwitchFailed',
                isPaused: true,
                timestamp: Date.now(),
                message: 'Failed to switch to fallback device. Recording paused.',
            });
            return false;
        }
    }
    /**
     * Attempts to get a fallback audio device
     */
    async getFallbackDevice() {
        var _a, _b;
        try {
            // Get list of available audio input devices
            const devices = await navigator.mediaDevices.enumerateDevices();
            const audioInputDevices = devices.filter((device) => device.kind === 'audioinput');
            if (audioInputDevices.length === 0) {
                return null;
            }
            // Try to find a device that's not the current one
            if (this.customRecorder) {
                try {
                    // Use mediaDevices.enumerateDevices to find the current active device
                    const tracks = navigator.mediaDevices
                        .getUserMedia({ audio: true })
                        .then((stream) => {
                        const track = stream.getAudioTracks()[0];
                        return track ? track.label : '';
                    })
                        .catch(() => '');
                    const currentTrackLabel = await tracks;
                    if (currentTrackLabel) {
                        // Find a device with a different label
                        const differentDevice = audioInputDevices.find((device) => device.label &&
                            device.label !== currentTrackLabel);
                        if (differentDevice) {
                            return differentDevice;
                        }
                    }
                }
                catch (err) {
                    (_a = this.logger) === null || _a === void 0 ? void 0 : _a.warn('Error determining current device, using default', err);
                }
            }
            // Return the first available device (default device)
            return audioInputDevices[0];
        }
        catch (error) {
            (_b = this.logger) === null || _b === void 0 ? void 0 : _b.error('Error finding fallback device:', error);
            return null;
        }
    }
    /**
     * Gets user media with specific device ID
     */
    async requestPermissionsAndGetUserMedia(deviceId) {
        var _a;
        try {
            // Request the specific device
            return await navigator.mediaDevices.getUserMedia({
                audio: {
                    deviceId: { exact: deviceId },
                },
            });
        }
        catch (error) {
            (_a = this.logger) === null || _a === void 0 ? void 0 : _a.error(`Failed to get media for device ${deviceId}`, error);
            // Try with default constraints as fallback
            return await navigator.mediaDevices.getUserMedia({ audio: true });
        }
    }
    init(options) {
        var _a;
        try {
            this.logger = options === null || options === void 0 ? void 0 : options.logger;
            this.eventCallback = options === null || options === void 0 ? void 0 : options.eventCallback;
            return Promise.resolve();
        }
        catch (error) {
            (_a = this.logger) === null || _a === void 0 ? void 0 : _a.error('Error initializing ExpoAudioStream', error);
            return Promise.reject(error);
        }
    }
}
