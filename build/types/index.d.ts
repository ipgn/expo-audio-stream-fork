import { extractRawWavAnalysis, extractAudioAnalysis } from './AudioAnalysis/extractAudioAnalysis';
import { extractAudioData } from './AudioAnalysis/extractAudioData';
import { extractMelSpectrogram } from './AudioAnalysis/extractMelSpectrogram';
import { extractPreview } from './AudioAnalysis/extractPreview';
import { AudioRecorderProvider, useSharedAudioRecorder } from './AudioRecorder.provider';
import ExpoAudioStreamModule from './ExpoAudioStreamModule';
import { trimAudio } from './trimAudio';
import { useAudioRecorder } from './useAudioRecorder';
export * from './utils/convertPCMToFloat32';
export * from './utils/getWavFileInfo';
export * from './utils/writeWavHeader';
export { getPlatformCapabilities, isEncodingSupported, isBitDepthSupported, getFallbackEncoding, getFallbackBitDepth, validateRecordingConfig, type PlatformCapabilities, } from './constants/platformLimitations';
export { AudioDeviceManager, audioDeviceManager } from './AudioDeviceManager';
export { useAudioDevices } from './hooks/useAudioDevices';
export { AudioRecorderProvider, ExpoAudioStreamModule, extractRawWavAnalysis, extractAudioAnalysis, extractPreview, trimAudio, extractAudioData, extractMelSpectrogram, useAudioRecorder, useSharedAudioRecorder, };
export type * from './AudioAnalysis/AudioAnalysis.types';
export type * from './ExpoAudioStream.types';
//# sourceMappingURL=index.d.ts.map