// Minimal ZIP writer (stored, no compression — GIFs are already compressed)
// and reader (stored + deflate via DecompressionStream). Used for library backup/restore
// and for importing a .zip full of GIFs.

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(bytes) {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/** files: [{ name, blob }] → Blob (application/zip) */
export async function writeZip(files, onProgress) {
  const enc = new TextEncoder();
  const parts = [];
  const central = [];
  let offset = 0;
  for (let i = 0; i < files.length; i++) {
    const { name, blob } = files[i];
    const data = new Uint8Array(await blob.arrayBuffer());
    const nameBytes = enc.encode(name);
    const crc = crc32(data);
    const h = new DataView(new ArrayBuffer(30));
    h.setUint32(0, 0x04034b50, true);
    h.setUint16(4, 20, true);
    h.setUint16(6, 0x0800, true); // UTF-8 names
    h.setUint16(8, 0, true); // stored
    h.setUint32(14, crc, true);
    h.setUint32(18, data.length, true);
    h.setUint32(22, data.length, true);
    h.setUint16(26, nameBytes.length, true);
    parts.push(h.buffer, nameBytes, data);
    const c = new DataView(new ArrayBuffer(46));
    c.setUint32(0, 0x02014b50, true);
    c.setUint16(4, 20, true);
    c.setUint16(6, 20, true);
    c.setUint16(8, 0x0800, true);
    c.setUint32(16, crc, true);
    c.setUint32(20, data.length, true);
    c.setUint32(24, data.length, true);
    c.setUint16(28, nameBytes.length, true);
    c.setUint32(42, offset, true);
    central.push(c.buffer, nameBytes);
    offset += 30 + nameBytes.length + data.length;
    onProgress && onProgress((i + 1) / files.length);
  }
  const cdSize = central.reduce((s, p) => s + p.byteLength, 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true);
  end.setUint16(8, files.length, true);
  end.setUint16(10, files.length, true);
  end.setUint32(12, cdSize, true);
  end.setUint32(16, offset, true);
  return new Blob([...parts, ...central, end.buffer], { type: 'application/zip' });
}

/** Returns [{ name, blob() }] for every file entry in the zip. */
export async function readZip(file) {
  const tailSize = Math.min(file.size, 65557);
  const tail = new DataView(await file.slice(file.size - tailSize).arrayBuffer());
  let eocd = -1;
  for (let i = tail.byteLength - 22; i >= 0; i--) {
    if (tail.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error('Not a zip file');
  const count = tail.getUint16(eocd + 10, true);
  const cdSize = tail.getUint32(eocd + 12, true);
  const cdOffset = tail.getUint32(eocd + 16, true);
  const cd = new DataView(await file.slice(cdOffset, cdOffset + cdSize).arrayBuffer());
  const dec = new TextDecoder();
  const entries = [];
  let p = 0;
  for (let i = 0; i < count; i++) {
    if (cd.getUint32(p, true) !== 0x02014b50) break;
    const method = cd.getUint16(p + 10, true);
    const csize = cd.getUint32(p + 20, true);
    const nlen = cd.getUint16(p + 28, true);
    const xlen = cd.getUint16(p + 30, true);
    const clen = cd.getUint16(p + 32, true);
    const local = cd.getUint32(p + 42, true);
    const name = dec.decode(new Uint8Array(cd.buffer, cd.byteOffset + p + 46, nlen));
    p += 46 + nlen + xlen + clen;
    if (name.endsWith('/')) continue;
    entries.push({
      name,
      async blob() {
        const lh = new DataView(await file.slice(local, local + 30).arrayBuffer());
        const start = local + 30 + lh.getUint16(26, true) + lh.getUint16(28, true);
        const raw = file.slice(start, start + csize);
        if (method === 0) return raw;
        if (method === 8 && typeof DecompressionStream !== 'undefined') {
          return new Response(raw.stream().pipeThrough(new DecompressionStream('deflate-raw'))).blob();
        }
        throw new Error(`Unsupported compression in ${name}`);
      },
    });
  }
  return entries;
}
