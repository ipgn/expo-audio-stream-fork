import ExpoAudioStreamModule from '../ExpoAudioStreamModule';
export const extractWaveform = async ({ fileUri, numberOfSamples, offset = 0, length, }) => {
    const res = await ExpoAudioStreamModule.extractAudioAnalysis({
        fileUri,
        numberOfSamples,
        offset,
        length,
    });
    return res;
};
//# sourceMappingURL=extractWaveform.js.map