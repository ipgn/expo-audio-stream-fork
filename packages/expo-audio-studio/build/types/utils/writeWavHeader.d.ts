/**
 * Options for creating a WAV header.
 */
export interface WavHeaderOptions {
    /** Optional buffer containing audio data. If provided, it will be combined with the header. */
    buffer?: ArrayBuffer;
    /** The sample rate of the audio in Hz (e.g., 44100). */
    sampleRate: number;
    /** The number of audio channels (e.g., 1 for mono, 2 for stereo). */
    numChannels: number;
    /** The bit depth of the audio (e.g., 16, 24, or 32). */
    bitDepth: number;
    /** Whether the audio data is in float format (only applies to 32-bit) */
    isFloat?: boolean;
}
/**
 * Writes or updates a WAV (RIFF) header based on the provided options.
 *
 * This function can be used in three ways:
 * 1. To create a standalone WAV header (when no buffer is provided).
 * 2. To create a WAV header and combine it with existing audio data (when a buffer without a header is provided).
 * 3. To update an existing WAV header in the provided buffer.
 *
 * For streaming audio where the final size is unknown, this function sets the size fields
 * to the maximum 32-bit value (0xFFFFFFFF). These can be updated later using the
 * `updateWavHeaderSize` function once the final size is known.
 *
 * @param options - The options for creating or updating the WAV header.
 * @returns An ArrayBuffer containing the WAV header, or the header combined with the provided audio data.
 *
 * @throws {Error} Throws an error if the provided options are invalid or if the buffer is too small.
 */
export declare const writeWavHeader: ({ buffer, sampleRate, numChannels, bitDepth, isFloat, }: WavHeaderOptions) => ArrayBuffer;
//# sourceMappingURL=writeWavHeader.d.ts.map