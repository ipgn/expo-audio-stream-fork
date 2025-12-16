import { AudioDevice } from '../ExpoAudioStream.types';
/**
 * React hook for managing audio input devices
 */
export declare function useAudioDevices(): {
    devices: AudioDevice[];
    currentDevice: AudioDevice | null;
    loading: boolean;
    error: Error | null;
    selectDevice: (deviceId: string) => Promise<boolean>;
    resetToDefaultDevice: () => Promise<boolean>;
    refreshDevices: () => Promise<AudioDevice[]>;
    initializeDeviceDetection: () => void;
};
//# sourceMappingURL=useAudioDevices.d.ts.map