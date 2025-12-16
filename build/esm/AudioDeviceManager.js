import { EventEmitter } from 'expo-modules-core';
import { Platform } from 'react-native';
import { DeviceDisconnectionBehavior, } from './ExpoAudioStream.types';
import ExpoAudioStreamModule from './ExpoAudioStreamModule';
// Default device fallback for web and unsupported platforms
const DEFAULT_DEVICE = {
    id: 'default',
    name: 'Default Microphone',
    type: 'builtin_mic',
    isDefault: true,
    isAvailable: true,
    capabilities: {
        sampleRates: [16000, 44100, 48000],
        channelCounts: [1, 2],
        bitDepths: [16, 24, 32],
        hasEchoCancellation: true,
        hasNoiseSuppression: true,
        hasAutomaticGainControl: true,
    },
};
// Helper function to map raw object to AudioDevice interface
// This handles potential inconsistencies from the native module
function mapRawDeviceToAudioDevice(rawDevice) {
    const capabilities = rawDevice.capabilities || {};
    return {
        id: rawDevice.id || 'unknown',
        name: rawDevice.name || 'Unknown Device',
        type: rawDevice.type || 'unknown',
        isDefault: rawDevice.isDefault || false,
        isAvailable: rawDevice.isAvailable !== undefined ? rawDevice.isAvailable : true, // Default to true if undefined
        capabilities: {
            sampleRates: capabilities.sampleRates || [16000, 44100, 48000], // Provide defaults
            channelCounts: capabilities.channelCounts || [1, 2],
            bitDepths: capabilities.bitDepths || [16, 24, 32],
            hasEchoCancellation: capabilities.hasEchoCancellation,
            hasNoiseSuppression: capabilities.hasNoiseSuppression,
            hasAutomaticGainControl: capabilities.hasAutomaticGainControl,
        },
    };
}
/**
 * Class that provides a cross-platform API for managing audio input devices
 *
 * EVENT API SPECIFICATION:
 * ========================
 *
 * Device Events (deviceChangedEvent):
 * ```
 * {
 *   type: "deviceConnected" | "deviceDisconnected",
 *   deviceId: string
 * }
 * ```
 *
 * Recording Interruption Events (recordingInterruptedEvent):
 * ```
 * {
 *   reason: "userPaused" | "userResumed" | "audioFocusLoss" | "audioFocusGain" |
 *           "deviceFallback" | "deviceSwitchFailed" | "phoneCall" | "phoneCallEnded",
 *   isPaused: boolean,
 *   timestamp: number
 * }
 * ```
 *
 * NOTE: Device events use "type" field, interruption events use "reason" field.
 * This is intentional to distinguish between different event categories.
 */
export class AudioDeviceManager {
    constructor(options) {
        this.currentDeviceId = null;
        this.availableDevices = [];
        this.deviceChangeListeners = new Set();
        this.lastRefreshTime = 0;
        this.refreshInProgress = false;
        this.refreshDebounceMs = 500; // Minimum 500ms between refreshes
        // Track temporarily disconnected devices
        this.temporarilyDisconnectedDevices = new Set();
        this.disconnectionTimeouts = new Map();
        this.DISCONNECTION_TIMEOUT_MS = 5000; // 5 seconds
        this.eventEmitter = new EventEmitter(ExpoAudioStreamModule);
        this.logger = options === null || options === void 0 ? void 0 : options.logger;
        // Set up device event listeners for all platforms immediately
        this.setupDeviceEventListeners();
    }
    /**
     * Set up device event listeners for the current platform
     */
    setupDeviceEventListeners() {
        if (Platform.OS === 'web') {
            this.setupWebDeviceChangeListener();
        }
        else {
            this.setupNativeDeviceEventListener();
        }
    }
    /**
     * Set up native device event listener for iOS/Android
     */
    setupNativeDeviceEventListener() {
        var _a;
        // Store the last event type to avoid duplicates
        let lastEventType = null;
        let lastEventTime = 0;
        this.eventEmitter.addListener('deviceChangedEvent', (event) => {
            var _a, _b;
            // Skip processing duplicate events that occur too close together
            const now = Date.now();
            const isSimilarEvent = lastEventType === event.type &&
                now - lastEventTime < this.refreshDebounceMs;
            if (isSimilarEvent) {
                (_a = this.logger) === null || _a === void 0 ? void 0 : _a.debug(`Skipping similar device event (${event.type}) received too soon`);
                return;
            }
            // Update the last event tracking
            lastEventType = event.type;
            lastEventTime = now;
            // Only refresh on meaningful events
            if (event.type === 'deviceConnected' ||
                event.type === 'deviceDisconnected' ||
                event.type === 'routeChanged') {
                (_b = this.logger) === null || _b === void 0 ? void 0 : _b.debug(`Processing device event: ${event.type}`);
                // Force refresh for device events to ensure fresh data
                this.forceRefreshDevices();
            }
        });
        (_a = this.logger) === null || _a === void 0 ? void 0 : _a.debug('Native device event listener set up');
    }
    /**
     * Initialize the device manager with a logger
     * @param logger A logger instance that implements the ConsoleLike interface
     * @returns The manager instance for chaining
     */
    initWithLogger(logger) {
        this.setLogger(logger);
        return this;
    }
    /**
     * Set the logger instance
     * @param logger A logger instance that implements the ConsoleLike interface
     */
    setLogger(logger) {
        this.logger = logger;
    }
    /**
     * Initialize or reinitialize device detection
     * Useful for restarting device detection if initial setup failed
     */
    initializeDeviceDetection() {
        var _a;
        (_a = this.logger) === null || _a === void 0 ? void 0 : _a.debug('Initializing device detection...');
        // Clean up existing listeners first
        if (Platform.OS === 'web' && this.webDeviceChangeHandler) {
            if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
                navigator.mediaDevices.removeEventListener('devicechange', this.webDeviceChangeHandler);
            }
            this.webDeviceChangeHandler = undefined;
        }
        // Re-setup device event listeners
        this.setupDeviceEventListeners();
    }
    /**
     * Get the current logger instance
     * @returns The logger instance or undefined if not set
     */
    getLogger() {
        return this.logger;
    }
    /**
     * Get all available audio input devices
     * @param options Optional settings to force refresh the device list. Can include a refresh flag.
     * @returns Promise resolving to an array of audio devices conforming to AudioDevice interface
     */
    async getAvailableDevices(options) {
        var _a;
        try {
            if (Platform.OS === 'web') {
                this.availableDevices = await this.getWebAudioDevices();
            }
            else if (ExpoAudioStreamModule.getAvailableInputDevices) {
                // Expecting an array of raw device objects from native
                const rawDevices = await ExpoAudioStreamModule.getAvailableInputDevices(options);
                // Map raw objects to the AudioDevice interface
                this.availableDevices = rawDevices.map(mapRawDeviceToAudioDevice);
            }
            else {
                // Fallback for unsupported platforms
                this.availableDevices = [DEFAULT_DEVICE];
            }
            return this.availableDevices;
        }
        catch (error) {
            (_a = this.logger) === null || _a === void 0 ? void 0 : _a.error('Failed to get available devices:', error);
            this.availableDevices = [DEFAULT_DEVICE]; // Ensure state is updated on error
            return this.availableDevices;
        }
    }
    /**
     * Get the currently selected audio input device
     * @returns Promise resolving to the current device (conforming to AudioDevice) or null
     */
    async getCurrentDevice() {
        var _a;
        try {
            if (Platform.OS === 'web') {
                if (!this.currentDeviceId) {
                    // On web, return the typed default device if nothing is selected
                    return DEFAULT_DEVICE;
                }
                // Refresh web devices to ensure the current one is up-to-date
                const webDevices = await this.getWebAudioDevices();
                return (webDevices.find((d) => d.id === this.currentDeviceId) ||
                    DEFAULT_DEVICE // Fallback to default if current ID not found
                );
            }
            else if (ExpoAudioStreamModule.getCurrentInputDevice) {
                // Expecting a single raw device object or null from native
                const rawDevice = await ExpoAudioStreamModule.getCurrentInputDevice();
                // Map to AudioDevice interface if not null
                return rawDevice ? mapRawDeviceToAudioDevice(rawDevice) : null;
            }
            else {
                // Fallback for unsupported platforms
                return DEFAULT_DEVICE;
            }
        }
        catch (error) {
            (_a = this.logger) === null || _a === void 0 ? void 0 : _a.error('Failed to get current device:', error);
            return DEFAULT_DEVICE; // Return default on error
        }
    }
    /**
     * Select a specific audio input device for recording
     * @param deviceId The ID of the device to select
     * @returns Promise resolving to a boolean indicating success
     */
    async selectDevice(deviceId) {
        var _a, _b;
        try {
            let success = false;
            if (Platform.OS === 'web') {
                // Check if the device exists before setting it
                const devices = await this.getWebAudioDevices();
                if (devices.some((d) => d.id === deviceId)) {
                    this.currentDeviceId = deviceId;
                    success = true;
                }
                else {
                    (_a = this.logger) === null || _a === void 0 ? void 0 : _a.warn(`Web: Device with ID ${deviceId} not found.`);
                    success = false;
                }
            }
            else if (ExpoAudioStreamModule.selectInputDevice) {
                success =
                    await ExpoAudioStreamModule.selectInputDevice(deviceId);
                if (success) {
                    this.currentDeviceId = deviceId;
                }
            }
            // Refresh devices after selection attempt to update state
            await this.refreshDevices();
            return success;
        }
        catch (error) {
            (_b = this.logger) === null || _b === void 0 ? void 0 : _b.error('Failed to select device:', error);
            await this.refreshDevices(); // Refresh even on error
            return false;
        }
    }
    /**
     * Reset to the default audio input device
     * @returns Promise resolving to a boolean indicating success
     */
    async resetToDefaultDevice() {
        var _a;
        try {
            let success = false;
            if (Platform.OS === 'web') {
                this.currentDeviceId = 'default';
                success = true;
            }
            else if (ExpoAudioStreamModule.resetToDefaultDevice) {
                success = await ExpoAudioStreamModule.resetToDefaultDevice();
                if (success) {
                    this.currentDeviceId = null;
                }
            }
            // Refresh devices after reset attempt
            await this.refreshDevices();
            return success;
        }
        catch (error) {
            (_a = this.logger) === null || _a === void 0 ? void 0 : _a.error('Failed to reset to default device:', error);
            await this.refreshDevices(); // Refresh even on error
            return false;
        }
    }
    /**
     * Register a listener for device changes
     * @param listener Function to call when devices change (receives AudioDevice[])
     * @returns Function to remove the listener
     */
    addDeviceChangeListener(listener) {
        this.deviceChangeListeners.add(listener);
        // Immediately call listener with current devices if available
        if (this.availableDevices.length > 0) {
            listener([...this.availableDevices]);
        }
        // Return a function to remove the listener
        return () => {
            this.deviceChangeListeners.delete(listener);
        };
    }
    /**
     * Mark a device as temporarily disconnected (for UI filtering)
     * @param deviceId The ID of the device that was disconnected
     * @param notify Whether to notify listeners immediately (default: true)
     */
    markDeviceAsDisconnected(deviceId, notify = true) {
        var _a;
        (_a = this.logger) === null || _a === void 0 ? void 0 : _a.debug(`Marking device ${deviceId} as temporarily disconnected`);
        // Clear any existing timeout for this device
        const existingTimeout = this.disconnectionTimeouts.get(deviceId);
        if (existingTimeout) {
            clearTimeout(existingTimeout);
        }
        // Add to disconnected set
        this.temporarilyDisconnectedDevices.add(deviceId);
        // Set timeout to remove from disconnected set
        const timeout = setTimeout(() => {
            var _a;
            (_a = this.logger) === null || _a === void 0 ? void 0 : _a.debug(`Reconnection timeout expired for device ${deviceId}`);
            this.temporarilyDisconnectedDevices.delete(deviceId);
            this.disconnectionTimeouts.delete(deviceId);
            // Refresh devices to show the device again if it's still available
            this.forceRefreshDevices();
        }, this.DISCONNECTION_TIMEOUT_MS);
        this.disconnectionTimeouts.set(deviceId, timeout);
        // Only notify listeners if requested
        if (notify) {
            this.notifyListeners();
        }
    }
    /**
     * Mark a device as reconnected (remove from disconnected set)
     * @param deviceId The ID of the device that was reconnected
     */
    markDeviceAsReconnected(deviceId) {
        var _a;
        (_a = this.logger) === null || _a === void 0 ? void 0 : _a.debug(`Marking device ${deviceId} as reconnected`);
        // Clear timeout and remove from disconnected set
        const timeout = this.disconnectionTimeouts.get(deviceId);
        if (timeout) {
            clearTimeout(timeout);
            this.disconnectionTimeouts.delete(deviceId);
        }
        this.temporarilyDisconnectedDevices.delete(deviceId);
        // Notify listeners with updated device list
        this.notifyListeners();
    }
    /**
     * Get filtered device list (excluding temporarily disconnected devices)
     * @returns Array of available devices excluding temporarily disconnected ones
     */
    getFilteredDevices() {
        var _a;
        if (this.temporarilyDisconnectedDevices.size === 0) {
            return [...this.availableDevices];
        }
        const filtered = this.availableDevices.filter((device) => !this.temporarilyDisconnectedDevices.has(device.id));
        (_a = this.logger) === null || _a === void 0 ? void 0 : _a.debug(`Filtered ${this.availableDevices.length - filtered.length} temporarily disconnected devices. ` +
            `Showing ${filtered.length} devices.`);
        return filtered;
    }
    /**
     * Get the raw device list (including temporarily disconnected devices)
     * @returns Array of all available devices from native layer
     */
    getRawDevices() {
        return [...this.availableDevices];
    }
    /**
     * Get the IDs of temporarily disconnected devices
     * @returns Set of device IDs that are temporarily hidden from UI
     */
    getTemporarilyDisconnectedDeviceIds() {
        return new Set(this.temporarilyDisconnectedDevices);
    }
    /**
     * Clean up timeouts and listeners (useful for testing or cleanup)
     */
    cleanup() {
        var _a;
        // Clear all disconnection timeouts
        this.disconnectionTimeouts.forEach((timeout) => clearTimeout(timeout));
        this.disconnectionTimeouts.clear();
        this.temporarilyDisconnectedDevices.clear();
        // Clear device change listeners
        this.deviceChangeListeners.clear();
        // Clean up web device listener
        if (Platform.OS === 'web' && this.webDeviceChangeHandler) {
            if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
                navigator.mediaDevices.removeEventListener('devicechange', this.webDeviceChangeHandler);
            }
            this.webDeviceChangeHandler = undefined;
        }
        (_a = this.logger) === null || _a === void 0 ? void 0 : _a.debug('AudioDeviceManager cleanup completed');
    }
    /**
     * Force refresh devices without debouncing (for device events)
     * @returns Promise resolving to the updated device list (AudioDevice[])
     */
    async forceRefreshDevices() {
        var _a, _b, _c;
        (_a = this.logger) === null || _a === void 0 ? void 0 : _a.debug('Force refreshing devices (bypassing debounce)...');
        this.refreshInProgress = true;
        try {
            // Force fetch the latest devices from native layer
            const devices = await this.getAvailableDevices({ refresh: true });
            // Update internal state
            this.availableDevices = devices;
            // Notify listeners with fresh data
            this.notifyListeners();
            this.lastRefreshTime = Date.now();
            return devices;
        }
        catch (error) {
            (_b = this.logger) === null || _b === void 0 ? void 0 : _b.error('Error during forceRefreshDevices:', error);
            return this.availableDevices;
        }
        finally {
            this.refreshInProgress = false;
            (_c = this.logger) === null || _c === void 0 ? void 0 : _c.debug('Force refresh finished.');
        }
    }
    /**
     * Refresh the list of available devices with debouncing and notify listeners.
     * @returns Promise resolving to the updated device list (AudioDevice[])
     */
    async refreshDevices() {
        var _a, _b, _c, _d, _e;
        const now = Date.now();
        if (this.refreshInProgress) {
            (_a = this.logger) === null || _a === void 0 ? void 0 : _a.debug('Refresh already in progress, skipping');
            return this.availableDevices;
        }
        // Always allow refresh if forced by native event or longer than 2s debounce
        const timeSinceLastRefresh = now - this.lastRefreshTime;
        const shouldDebounce = timeSinceLastRefresh < this.refreshDebounceMs &&
            timeSinceLastRefresh < 2000;
        if (shouldDebounce) {
            (_b = this.logger) === null || _b === void 0 ? void 0 : _b.debug(`Refresh debounced, skipping (last refresh was ${timeSinceLastRefresh}ms ago)`);
            return this.availableDevices;
        }
        (_c = this.logger) === null || _c === void 0 ? void 0 : _c.debug('Refreshing devices...');
        this.refreshInProgress = true;
        try {
            // Fetch the latest devices; getAvailableDevices handles mapping now
            const devices = await this.getAvailableDevices({ refresh: true });
            // availableDevices state is updated within getAvailableDevices
            this.notifyListeners(); // Notify listeners with the updated list
            this.lastRefreshTime = Date.now();
            return devices; // Return the fetched & mapped list
        }
        catch (error) {
            (_d = this.logger) === null || _d === void 0 ? void 0 : _d.error('Error during refreshDevices:', error);
            return this.availableDevices; // Return potentially stale list on error
        }
        finally {
            this.refreshInProgress = false;
            (_e = this.logger) === null || _e === void 0 ? void 0 : _e.debug('Refresh finished.');
        }
    }
    /**
     * Get audio input devices using the Web Audio API
     * @returns Promise resolving to an array of AudioDevice objects
     */
    async getWebAudioDevices() {
        var _a, _b;
        if (typeof navigator === 'undefined' ||
            !navigator.mediaDevices ||
            !navigator.mediaDevices.enumerateDevices) {
            return [DEFAULT_DEVICE];
        }
        try {
            const permissionStatus = await this.checkMicrophonePermission();
            if (permissionStatus === 'denied') {
                return [
                    Object.assign(Object.assign({}, DEFAULT_DEVICE), { name: 'Microphone Access Denied', isAvailable: false }),
                ];
            }
            if (permissionStatus !== 'granted') {
                try {
                    // Requesting stream often reveals device labels
                    await navigator.mediaDevices.getUserMedia({ audio: true });
                }
                catch (error) {
                    (_a = this.logger) === null || _a === void 0 ? void 0 : _a.warn('Microphone permission request failed:', error);
                    return [
                        Object.assign(Object.assign({}, DEFAULT_DEVICE), { name: 'Microphone Access Required', isAvailable: false }),
                    ];
                }
            }
            const devices = await navigator.mediaDevices.enumerateDevices();
            const audioInputDevices = devices
                .filter((device) => device.kind === 'audioinput')
                .map((device) => this.mapWebDeviceToAudioDevice(device));
            const hasUnlabeledDevices = audioInputDevices.some((device) => !device.name || device.name.startsWith('Microphone '));
            let finalDevices = audioInputDevices;
            if (hasUnlabeledDevices && this.isSafariOrIOS()) {
                finalDevices = this.enhanceDevicesForSafari(audioInputDevices);
            }
            if (finalDevices.length === 0) {
                finalDevices = [DEFAULT_DEVICE];
            }
            this.availableDevices = finalDevices; // Update internal state
            return finalDevices;
        }
        catch (error) {
            (_b = this.logger) === null || _b === void 0 ? void 0 : _b.error('Failed to enumerate web audio devices:', error);
            this.availableDevices = [DEFAULT_DEVICE]; // Update state on error
            return this.availableDevices;
        }
    }
    /**
     * Check the current microphone permission status
     * @returns Permission state ('prompt', 'granted', or 'denied')
     */
    async checkMicrophonePermission() {
        var _a;
        if (!navigator.permissions || !navigator.permissions.query) {
            return 'prompt';
        }
        try {
            const permissionStatus = await navigator.permissions.query({
                name: 'microphone',
            });
            permissionStatus.onchange = () => {
                // Refresh devices when permission changes
                this.refreshDevices();
            };
            return permissionStatus.state;
        }
        catch (error) {
            (_a = this.logger) === null || _a === void 0 ? void 0 : _a.warn('Permission query not supported:', error);
            return 'prompt';
        }
    }
    /**
     * Setup listener for device changes in web environment
     */
    setupWebDeviceChangeListener() {
        var _a, _b, _c;
        if (typeof navigator === 'undefined' ||
            !navigator.mediaDevices ||
            this.webDeviceChangeHandler // Avoid adding multiple listeners
        ) {
            (_a = this.logger) === null || _a === void 0 ? void 0 : _a.debug('Web device change listener not available or already set up');
            return;
        }
        try {
            this.webDeviceChangeHandler = () => {
                var _a;
                (_a = this.logger) === null || _a === void 0 ? void 0 : _a.debug('Web device change detected, refreshing device list');
                // Force refresh to get immediate updates
                this.forceRefreshDevices();
            };
            navigator.mediaDevices.addEventListener('devicechange', this.webDeviceChangeHandler);
            (_b = this.logger) === null || _b === void 0 ? void 0 : _b.debug('Web device change listener successfully set up');
        }
        catch (error) {
            (_c = this.logger) === null || _c === void 0 ? void 0 : _c.warn('Failed to set up web device change listener:', error);
            this.webDeviceChangeHandler = undefined;
        }
    }
    /**
     * Check if the current browser is Safari or iOS WebKit
     */
    isSafariOrIOS() {
        if (typeof navigator === 'undefined')
            return false;
        const ua = navigator.userAgent;
        return (/^((?!chrome|android).)*safari/i.test(ua) ||
            /iPad|iPhone|iPod/.test(ua) ||
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
    }
    /**
     * Create enhanced device information for Safari and privacy-restricted browsers
     * @param devices Array of AudioDevice objects, potentially unlabeled
     * @returns Array of enhanced AudioDevice objects
     */
    enhanceDevicesForSafari(devices) {
        const defaultDevice = devices.find((d) => d.isDefault);
        if (devices.length <= 1) {
            // Return a typed default device
            return [
                {
                    id: (defaultDevice === null || defaultDevice === void 0 ? void 0 : defaultDevice.id) || 'default',
                    name: 'Microphone (Browser Managed)',
                    type: 'builtin_mic',
                    isDefault: true,
                    isAvailable: true,
                    capabilities: (defaultDevice === null || defaultDevice === void 0 ? void 0 : defaultDevice.capabilities) ||
                        DEFAULT_DEVICE.capabilities,
                },
            ];
        }
        // Provide more descriptive names for unlabeled devices
        return devices.map((device, index) => {
            if (!device.name || device.name.startsWith('Microphone ')) {
                const deviceTypes = [
                    'Built-in Microphone',
                    'External Microphone',
                    'Headset Microphone',
                ];
                const typeName = deviceTypes[index % deviceTypes.length];
                return Object.assign(Object.assign({}, device), { name: device.isDefault ? `${typeName} (Default)` : typeName });
            }
            return device;
        });
    }
    /**
     * Map a Web MediaDeviceInfo to our AudioDevice format
     * @param device The MediaDeviceInfo object from the browser
     * @returns An object conforming to the AudioDevice interface
     */
    mapWebDeviceToAudioDevice(device) {
        const isDefault = device.deviceId === 'default';
        const deviceType = this.inferDeviceType(device.label || '');
        // Provide reasonable default capabilities for web devices
        const defaultWebCapabilities = {
            sampleRates: [16000, 44100, 48000],
            channelCounts: [1, 2],
            bitDepths: [16, 32], // Web Audio uses float32, common PCM might be 16/32
            hasEchoCancellation: true, // Often handled by browser
            hasNoiseSuppression: true, // Often handled by browser
            hasAutomaticGainControl: true, // Often handled by browser
        };
        return {
            id: device.deviceId,
            name: device.label || `Microphone ${device.deviceId.substring(0, 8)}`,
            type: deviceType,
            isDefault,
            isAvailable: true, // Assume available if enumerated
            capabilities: defaultWebCapabilities,
        };
    }
    /**
     * Try to infer the device type from its name
     * @param deviceName The label of the device
     * @returns A string representing the inferred device type
     */
    inferDeviceType(deviceName) {
        const name = deviceName.toLowerCase();
        if (name.includes('bluetooth') || name.includes('airpods'))
            return 'bluetooth';
        if (name.includes('usb'))
            return 'usb';
        if (name.includes('headphone') || name.includes('headset')) {
            return name.includes('wired') ? 'wired_headset' : 'wired_headphones';
        }
        if (name.includes('speaker'))
            return 'speaker';
        return 'builtin_mic'; // Default assumption
    }
    /**
     * Notify all registered listeners about device changes.
     */
    notifyListeners() {
        var _a;
        // Pass a copy of the filtered devices array to listeners
        const devicesCopy = this.getFilteredDevices();
        (_a = this.logger) === null || _a === void 0 ? void 0 : _a.debug(`Notifying ${this.deviceChangeListeners.size} listeners with ${devicesCopy.length} devices ` +
            `(${this.temporarilyDisconnectedDevices.size} temporarily hidden)`);
        this.deviceChangeListeners.forEach((listener) => {
            var _a;
            try {
                listener(devicesCopy);
            }
            catch (error) {
                (_a = this.logger) === null || _a === void 0 ? void 0 : _a.error('Error in device change listener:', error);
            }
        });
    }
}
// Create and export the singleton instance
export const audioDeviceManager = new AudioDeviceManager();
export { DeviceDisconnectionBehavior };
