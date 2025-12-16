export interface CRC32 {
    (data: string | Uint8Array): number;
    buf(data: Uint8Array): number;
}
declare let crc32Implementation: CRC32;
export default crc32Implementation;
//# sourceMappingURL=crc32.d.ts.map