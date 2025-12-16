import { TrimAudioOptions, TrimAudioResult, TrimProgressEvent } from './ExpoAudioStream.types';
/**
 * Trims an audio file based on the provided options.
 *
 * @experimental This API is experimental and not fully optimized for production use.
 * Performance may vary based on file size and device capabilities.
 * Future versions may include breaking changes.
 *
 * @param options Configuration options for the trimming operation
 * @param progressCallback Optional callback to receive progress updates
 * @returns Promise resolving to the trimmed audio file information, including processing time
 */
export declare function trimAudio(options: TrimAudioOptions, progressCallback?: (event: TrimProgressEvent) => void): Promise<TrimAudioResult>;
/**
 * Simplified version of trimAudio that returns only the URI of the trimmed file.
 *
 * @experimental This API is experimental and not fully optimized for production use.
 * Performance may vary based on file size and device capabilities.
 * Future versions may include breaking changes.
 *
 * @param options Configuration options for the trimming operation
 * @returns Promise resolving to the URI of the trimmed audio file
 */
export declare function trimAudioSimple(options: TrimAudioOptions): Promise<string>;
//# sourceMappingURL=trimAudio.d.ts.map