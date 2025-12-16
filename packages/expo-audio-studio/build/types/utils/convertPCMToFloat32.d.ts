import { ConsoleLike } from '../ExpoAudioStream.types';
export declare const WAV_HEADER_SIZE = 44;
export declare const convertPCMToFloat32: ({ bitDepth, buffer, skipWavHeader, logger, }: {
    buffer: ArrayBuffer;
    bitDepth: number;
    skipWavHeader?: boolean;
    logger?: ConsoleLike;
}) => Promise<{
    pcmValues: Float32Array;
    min: number;
    max: number;
}>;
//# sourceMappingURL=convertPCMToFloat32.d.ts.map