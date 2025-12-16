import { ConfigPlugin } from '@expo/config-plugins';
interface AudioStreamPluginOptions {
    enablePhoneStateHandling?: boolean;
    enableNotifications?: boolean;
    enableBackgroundAudio?: boolean;
    enableDeviceDetection?: boolean;
    iosBackgroundModes?: {
        useVoIP?: boolean;
        useAudio?: boolean;
        useProcessing?: boolean;
        useLocation?: boolean;
        useExternalAccessory?: boolean;
    };
    iosConfig?: {
        allowBackgroundAudioControls?: boolean;
        backgroundProcessingTitle?: string;
        microphoneUsageDescription?: string;
        notificationUsageDescription?: string;
    };
}
declare const withRecordingPermission: ConfigPlugin<AudioStreamPluginOptions>;
export default withRecordingPermission;
