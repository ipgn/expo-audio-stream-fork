"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.concatenateBuffers = void 0;
/**
 * Concatenates an array of ArrayBuffers into a single ArrayBuffer.
 *
 * @param buffers - An array of ArrayBuffers to be concatenated.
 * @returns A single ArrayBuffer containing the concatenated data.
 */
const concatenateBuffers = (buffers) => {
    // Filter out any undefined or null buffers
    const validBuffers = buffers.filter((buffer) => buffer);
    const totalLength = validBuffers.reduce((sum, buffer) => sum + buffer.byteLength, 0);
    // Create a new Uint8Array to hold the concatenated result
    const result = new Uint8Array(totalLength);
    // Offset to keep track of the current position in the result array
    let offset = 0;
    for (const buffer of validBuffers) {
        result.set(new Uint8Array(buffer), offset);
        offset += buffer.byteLength;
    }
    return result.buffer;
};
exports.concatenateBuffers = concatenateBuffers;
//# sourceMappingURL=concatenateBuffers.js.map