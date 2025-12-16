import { AudioDevice, DeviceDisconnectionBehavior, ConsoleLike } from './ExpoAudioStream.types';
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
export declare class AudioDeviceManager {
    private eventEmitter;
    private currentDeviceId;
    private availableDevices;
    private deviceChangeListeners;
    private webDeviceChangeHandler?;
    private lastRefreshTime;
    private refreshInProgress;
    private refreshDebounceMs;
    private logger?;
    private temporarilyDisconnectedDevices;
    private disconnectionTimeouts;
    private readonly DISCONNECTION_TIMEOUT_MS;
    constructor(options?: {
        logger?: ConsoleLike;
    });
    /**
     * Set up device event listeners for the current platform
     */
    private setupDeviceEventListeners;
    /**
     * Set up native device event listener for iOS/Android
     */
    private setupNativeDeviceEventListener;
    /**
     * Initialize the device manager with a logger
     * @param logger A logger instance that implements the ConsoleLike interface
     * @returns The manager instance for chaining
     */
    initWithLogger(logger: ConsoleLike): AudioDeviceManager;
    /**
     * Set the logger instance
     * @param logger A logger instance that implements the ConsoleLike interface
     */
    setLogger(logger: ConsoleLike): void;
    /**
     * Initialize or reinitialize device detection
     * Useful for restarting device detection if initial setup failed
     */
    initializeDeviceDetection(): void;
    /**
     * Get the current logger instance
     * @returns The logger instance or undefined if not set
     */
    getLogger(): ConsoleLike | undefined;
    /**
     * Get all available audio input devices
     * @param options Optional settings to force refresh the device list. Can include a refresh flag.
     * @returns Promise resolving to an array of audio devices conforming to AudioDevice interface
     */
    getAvailableDevices(options?: {
        refresh?: boolean;
    }): Promise<AudioDevice[]>;
    /**
     * Get the currently selected audio input device
     * @returns Promise resolving to the current device (conforming to AudioDevice) or null
     */
    getCurrentDevice(): Promise<AudioDevice | null>;
    /**
     * Select a specific audio input device for recording
     * @param deviceId The ID of the device to select
     * @returns Promise resolving to a boolean indicating success
     */
    selectDevice(deviceId: string): Promise<boolean>;
    /**
     * Reset to the default audio input device
     * @returns Promise resolving to a boolean indicating success
     */
    resetToDefaultDevice(): Promise<boolean>;
    /**
     * Register a listener for device changes
     * @param listener Function to call when devices change (receives AudioDevice[])
     * @returns Function to remove the listener
     */
    addDeviceChangeListener(listener: (devices: AudioDevice[]) => void): () => void;
    /**
     * Mark a device as temporarily disconnected (for UI filtering)
     * @param deviceId The ID of the device that was disconnected
     * @param notify Whether to notify listeners immediately (default: true)
     */
    markDeviceAsDisconnected(deviceId: string, notify?: boolean): void;
    /**
     * Mark a device as reconnected (remove from disconnected set)
     * @param deviceId The ID of the device that was reconnected
     */
    markDeviceAsReconnected(deviceId: string): void;
    /**
     * Get filtered device list (excluding temporarily disconnected devices)
     * @returns Array of available devices excluding temporarily disconnected ones
     */
    private getFilteredDevices;
    /**
     * Get the raw device list (including temporarily disconnected devices)
     * @returns Array of all available devices from native layer
     */
    getRawDevices(): AudioDevice[];
    /**
     * Get the IDs of temporarily disconnected devices
     * @returns Set of device IDs that are temporarily hidden from UI
     */
    getTemporarilyDisconnectedDeviceIds(): ReadonlySet<string>;
    /**
     * Clean up timeouts and listeners (useful for testing or cleanup)
     */
    cleanup(): void;
    /**
     * Force refresh devices without debouncing (for device events)
     * @returns Promise resolving to the updated device list (AudioDevice[])
     */
    forceRefreshDevices(): Promise<AudioDevice[]>;
    /**
     * Refresh the list of available devices with debouncing and notify listeners.
     * @returns Promise resolving to the updated device list (AudioDevice[])
     */
    refreshDevices(): Promise<AudioDevice[]>;
    /**
     * Get audio input devices using the Web Audio API
     * @returns Promise resolving to an array of AudioDevice objects
     */
    private getWebAudioDevices;
    /**
     * Check the current microphone permission status
     * @returns Permission state ('prompt', 'granted', or 'denied')
     */
    private checkMicrophonePermission;
    /**
     * Setup listener for device changes in web environment
     */
    private setupWebDeviceChangeListener;
    /**
     * Check if the current browser is Safari or iOS WebKit
     */
    private isSafariOrIOS;
    /**
     * Create enhanced device information for Safari and privacy-restricted browsers
     * @param devices Array of AudioDevice objects, potentially unlabeled
     * @returns Array of enhanced AudioDevice objects
     */
    private enhanceDevicesForSafari;
    /**
     * Map a Web MediaDeviceInfo to our AudioDevice format
     * @param device The MediaDeviceInfo object from the browser
     * @returns An object conforming to the AudioDevice interface
     */
    private mapWebDeviceToAudioDevice;
    /**
     * Try to infer the device type from its name
     * @param deviceName The label of the device
     * @returns A string representing the inferred device type
     */
    private inferDeviceType;
    /**
     * Notify all registered listeners about device changes.
     */
    notifyListeners(): void;
}
export declare const audioDeviceManager: AudioDeviceManager;
export { DeviceDisconnectionBehavior };
//# sourceMappingURL=AudioDeviceManager.d.ts.map