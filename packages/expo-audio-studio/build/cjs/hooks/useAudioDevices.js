"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAudioDevices = useAudioDevices;
const react_1 = require("react");
const AudioDeviceManager_1 = require("../AudioDeviceManager");
/**
 * React hook for managing audio input devices
 */
function useAudioDevices() {
    const [devices, setDevices] = (0, react_1.useState)([]);
    const [currentDevice, setCurrentDevice] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    // Generate unique instance ID for debugging
    const instanceId = (0, react_1.useId)().replace(/:/g, '').slice(0, 5);
    // Load devices on mount
    (0, react_1.useEffect)(() => {
        let isMounted = true;
        const loadDevices = async () => {
            try {
                setLoading(true);
                setError(null);
                // Load available devices
                const availableDevices = await AudioDeviceManager_1.audioDeviceManager.getAvailableDevices();
                if (isMounted)
                    setDevices(availableDevices);
                // Get current device
                const device = await AudioDeviceManager_1.audioDeviceManager.getCurrentDevice();
                if (isMounted)
                    setCurrentDevice(device);
            }
            catch (err) {
                AudioDeviceManager_1.audioDeviceManager
                    .getLogger()
                    ?.error('Failed to load audio devices:', err);
                if (isMounted)
                    setError(err instanceof Error
                        ? err
                        : new Error('Failed to load audio devices'));
            }
            finally {
                if (isMounted)
                    setLoading(false);
            }
        };
        loadDevices();
        // Set up device change listener
        const removeListener = AudioDeviceManager_1.audioDeviceManager.addDeviceChangeListener((updatedDevices) => {
            AudioDeviceManager_1.audioDeviceManager
                .getLogger()
                ?.debug(`🎛️ useAudioDevices [${instanceId}] received device change. Count: ${updatedDevices.length}`);
            if (isMounted) {
                setDevices(updatedDevices);
                // If our current device is no longer available, update it
                if (currentDevice &&
                    !updatedDevices.some((d) => d.id === currentDevice.id)) {
                    AudioDeviceManager_1.audioDeviceManager
                        .getLogger()
                        ?.debug(`🎛️ useAudioDevices [${instanceId}] Current device ${currentDevice.id} no longer available, updating`);
                    AudioDeviceManager_1.audioDeviceManager
                        .getCurrentDevice()
                        .then((newDevice) => {
                        if (isMounted) {
                            setCurrentDevice(newDevice);
                        }
                    });
                }
            }
        });
        return () => {
            isMounted = false;
            removeListener();
        };
    }, []);
    /**
     * Select a specific audio input device
     * @param deviceId The ID of the device to select
     * @returns Promise resolving to a boolean indicating success
     */
    const selectDevice = (0, react_1.useCallback)(async (deviceId) => {
        try {
            setLoading(true);
            setError(null);
            const success = await AudioDeviceManager_1.audioDeviceManager.selectDevice(deviceId);
            if (success) {
                // Get the updated current device after selection
                const device = await AudioDeviceManager_1.audioDeviceManager.getCurrentDevice();
                setCurrentDevice(device);
            }
            return success;
        }
        catch (err) {
            AudioDeviceManager_1.audioDeviceManager
                .getLogger()
                ?.error('Failed to select audio device:', err);
            setError(err instanceof Error
                ? err
                : new Error('Failed to select audio device'));
            return false;
        }
        finally {
            setLoading(false);
        }
    }, []);
    /**
     * Reset to the default audio input device
     * @returns Promise resolving to a boolean indicating success
     */
    const resetToDefaultDevice = (0, react_1.useCallback)(async () => {
        try {
            setLoading(true);
            setError(null);
            const success = await AudioDeviceManager_1.audioDeviceManager.resetToDefaultDevice();
            if (success) {
                // Get the updated current device after reset
                const device = await AudioDeviceManager_1.audioDeviceManager.getCurrentDevice();
                setCurrentDevice(device);
            }
            return success;
        }
        catch (err) {
            AudioDeviceManager_1.audioDeviceManager
                .getLogger()
                ?.error('Failed to reset to default audio device:', err);
            setError(err instanceof Error
                ? err
                : new Error('Failed to reset to default audio device'));
            return false;
        }
        finally {
            setLoading(false);
        }
    }, []);
    /**
     * Refresh the list of available devices
     */
    const refreshDevices = (0, react_1.useCallback)(async () => {
        try {
            setLoading(true);
            setError(null);
            const updatedDevices = await AudioDeviceManager_1.audioDeviceManager.refreshDevices();
            setDevices(updatedDevices);
            // Also refresh the current device
            const device = await AudioDeviceManager_1.audioDeviceManager.getCurrentDevice();
            setCurrentDevice(device);
            return updatedDevices;
        }
        catch (err) {
            AudioDeviceManager_1.audioDeviceManager
                .getLogger()
                ?.error('Failed to refresh audio devices:', err);
            setError(err instanceof Error
                ? err
                : new Error('Failed to refresh audio devices'));
            return [];
        }
        finally {
            setLoading(false);
        }
    }, []);
    /**
     * Initialize device detection
     * Useful for restarting device detection if it failed initially
     */
    const initializeDeviceDetection = (0, react_1.useCallback)(() => {
        AudioDeviceManager_1.audioDeviceManager.initializeDeviceDetection();
    }, []);
    return {
        devices,
        currentDevice,
        loading,
        error,
        selectDevice,
        resetToDefaultDevice,
        refreshDevices,
        initializeDeviceDetection,
    };
}
//# sourceMappingURL=useAudioDevices.js.map