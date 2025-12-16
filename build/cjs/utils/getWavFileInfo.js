"use strict";
// packages/expo-audio-stream/src/utils/getWavFileInfo.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWavFileInfo = void 0;
const constants_1 = require("../constants");
// Audio format descriptions
const AUDIO_FORMATS = {
    1: 'PCM',
    3: 'IEEE float',
    6: '8-bit ITU-T G.711 A-law',
    7: '8-bit ITU-T G.711 µ-law',
    65534: 'WAVE_FORMAT_EXTENSIBLE',
};
/**
 * Extracts metadata from a WAV buffer.
 *
 * @param arrayBuffer - The array buffer containing the WAV data.
 * @returns A promise that resolves to the extracted metadata.
 */
const getWavFileInfo = async (arrayBuffer) => {
    const view = new DataView(arrayBuffer);
    // Check if the file is a valid RIFF/WAVE file
    const riffHeader = view.getUint32(0, false);
    const waveHeader = view.getUint32(8, false);
    if (riffHeader !== constants_1.RIFF_HEADER || waveHeader !== constants_1.WAVE_HEADER) {
        throw new Error('Invalid WAV file');
    }
    // Initialize variables for the metadata
    let fmtChunkOffset = 12;
    let sampleRate = constants_1.DEFAULT_SAMPLE_RATE;
    let numChannels = 0;
    let bitDepth = constants_1.DEFAULT_BIT_DEPTH;
    let dataChunkSize = 0;
    let audioFormat = 0;
    let byteRate = 0;
    let blockAlign = 0;
    let creationDateTime = '';
    let comments = '';
    let dataChunkOffset = 0;
    // Parse chunks to find the "fmt " and "data" chunks
    while (fmtChunkOffset < view.byteLength) {
        const chunkId = view.getUint32(fmtChunkOffset, false);
        const chunkSize = view.getUint32(fmtChunkOffset + 4, true);
        if (chunkId === constants_1.FMT_CHUNK_ID) {
            // "fmt "
            audioFormat = view.getUint16(fmtChunkOffset + 8, true);
            if (!AUDIO_FORMATS[audioFormat]) {
                throw new Error('Unsupported WAV file format');
            }
            numChannels = view.getUint16(fmtChunkOffset + 10, true);
            sampleRate = view.getUint32(fmtChunkOffset + 12, true);
            byteRate = view.getUint32(fmtChunkOffset + 16, true);
            blockAlign = view.getUint16(fmtChunkOffset + 20, true);
            bitDepth = view.getUint16(fmtChunkOffset + 22, true);
        }
        else if (chunkId === constants_1.DATA_CHUNK_ID) {
            // "data"
            dataChunkSize = chunkSize;
            dataChunkOffset = fmtChunkOffset + 8; // Position after chunk header
            break;
        }
        else if (chunkId === constants_1.INFO_CHUNK_ID) {
            // "INFO"
            // Read INFO chunk (assuming it contains a text-based creation date/time and comments)
            const infoStart = fmtChunkOffset + 8;
            const infoText = new TextDecoder().decode(new Uint8Array(arrayBuffer.slice(infoStart, infoStart + chunkSize)));
            const infoParts = infoText.split('\0');
            creationDateTime = infoParts[0];
            comments = infoParts[1];
        }
        fmtChunkOffset += 8 + chunkSize;
    }
    if (!sampleRate || !numChannels || !bitDepth || !dataChunkSize) {
        throw new Error('Incomplete WAV file information');
    }
    // Calculate duration
    const bytesPerSample = bitDepth / 8;
    const numSamples = dataChunkSize / (numChannels * bytesPerSample);
    const durationMs = (numSamples / sampleRate) * 1000;
    return {
        sampleRate,
        numChannels,
        bitDepth,
        size: arrayBuffer.byteLength,
        durationMs,
        audioFormatDescription: AUDIO_FORMATS[audioFormat],
        byteRate,
        blockAlign,
        creationDateTime: creationDateTime || undefined,
        comments: comments || undefined,
        compressionType: audioFormat === 1 ? 'None' : AUDIO_FORMATS[audioFormat],
        dataChunkOffset,
    };
};
exports.getWavFileInfo = getWavFileInfo;
//# sourceMappingURL=getWavFileInfo.js.map