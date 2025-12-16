/**
 * Fixes duration on MediaRecorder output.
 * @param blob Input Blob with incorrect duration.
 * @param duration Correct duration (in milliseconds).
 * @param type Output blob mimetype (default: video/webm).
 * @returns
 */
export declare const webmFixDuration: (blob: Blob, duration: number, type?: string) => Promise<Blob>;
//# sourceMappingURL=BlobFix.d.ts.map