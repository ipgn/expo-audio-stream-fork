import { BitDepth, SampleRate } from '../ExpoAudioStream.types';
/**
 * Interface representing the metadata of a WAV file.
 */
export interface WavFileInfo {
    sampleRate: SampleRate;
    numChannels: number;
    bitDepth: BitDepth;
    size: number;
    durationMs: number;
    audioFormatDescription: string;
    byteRate: number;
    blockAlign: number;
    creationDateTime?: string;
    comments?: string;
    compressionType?: string;
    dataChunkOffset: number;
}
/**
 * Extracts metadata from a WAV buffer.
 *
 * @param arrayBuffer - The array buffer containing the WAV data.
 * @returns A promise that resolves to the extracted metadata.
 */
export declare const getWavFileInfo: (arrayBuffer: ArrayBuffer) => Promise<WavFileInfo>;
//# sourceMappingURL=getWavFileInfo.d.ts.map