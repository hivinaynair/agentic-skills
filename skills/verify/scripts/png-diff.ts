import { inflateSync } from "node:zlib";

export type Region = { x: number; y: number; width: number; height: number };
export type Png = { width: number; height: number; pixels: Uint8Array };

export function pngSize(bytes: Uint8Array) {
  const data = Buffer.from(bytes);
  if (data.length < 33 || data.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a" ||
      data.toString("ascii", 12, 16) !== "IHDR") throw Error("Expected a PNG capture");
  return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) };
}

// Screenshot PNGs use 8-bit, non-interlaced channels. Fail on other encodings
// rather than silently resizing or comparing compressed file bytes.
export function decodePng(bytes: Uint8Array): Png {
  const data = Buffer.from(bytes);
  pngSize(data);
  let width = 0, height = 0, channels = 0, ended = false;
  const compressed: Buffer[] = [];
  for (let at = 8; at + 12 <= data.length;) {
    const size = data.readUInt32BE(at), type = data.toString("ascii", at + 4, at + 8);
    if (at + size + 12 > data.length) throw Error("Truncated PNG chunk");
    const chunk = data.subarray(at + 8, at + 8 + size);
    if (type === "IHDR") {
      if (at !== 8 || size !== 13 || width) throw Error("Invalid PNG header");
      width = chunk.readUInt32BE(0); height = chunk.readUInt32BE(4);
      channels = ({ 0: 1, 2: 3, 4: 2, 6: 4 } as Record<number, number>)[chunk[9]] ?? 0;
      if (!width || !height || width * height > 40_000_000 || chunk[8] !== 8 ||
          !channels || chunk[10] || chunk[11] || chunk[12])
        throw Error("Use an 8-bit non-interlaced RGB/RGBA or grayscale PNG capture");
    } else if (type === "IDAT") compressed.push(chunk);
    else if (type === "tRNS") throw Error("Use an opaque PNG or an explicit alpha channel");
    else if (type === "IEND") { ended = true; break; }
    at += size + 12;
  }
  if (!width || !channels || !ended || !compressed.length) throw Error("Incomplete PNG capture");
  const stride = width * channels, expected = (stride + 1) * height;
  const raw = inflateSync(Buffer.concat(compressed), { maxOutputLength: expected });
  if (raw.length !== expected) throw Error("Invalid PNG pixel data length");
  const decoded = new Uint8Array(stride * height);
  const paeth = (a: number, b: number, c: number) => {
    const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
    return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
  };
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    if (filter > 4) throw Error("Invalid PNG row filter");
    for (let x = 0; x < stride; x++) {
      const i = y * stride + x;
      const left = x >= channels ? decoded[i - channels] : 0;
      const up = y ? decoded[i - stride] : 0;
      const corner = y && x >= channels ? decoded[i - stride - channels] : 0;
      const predictor = [0, left, up, Math.floor((left + up) / 2), paeth(left, up, corner)][filter];
      decoded[i] = raw[y * (stride + 1) + x + 1] + predictor;
    }
  }
  const pixels = new Uint8Array(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const p = i * channels;
    if (channels <= 2) pixels.set([decoded[p], decoded[p], decoded[p], channels === 2 ? decoded[p + 1] : 255], i * 4);
    else pixels.set([decoded[p], decoded[p + 1], decoded[p + 2], channels === 4 ? decoded[p + 3] : 255], i * 4);
  }
  return { width, height, pixels };
}

export function comparePng(reference: Png, actual: Png, regions: Region[] = []) {
  if (reference.width !== actual.width || reference.height !== actual.height)
    throw Error("PNG capture size differs from the pinned design");
  const { width, height } = reference;
  for (const r of regions) if (![r.x, r.y, r.width, r.height].every(Number.isInteger) ||
      r.x < 0 || r.y < 0 || r.width <= 0 || r.height <= 0 ||
      r.x + r.width > width || r.y + r.height > height)
    throw Error("Exception region must fit inside the capture");
  let compared = 0, changed = 0;
  const tiles = new Map<number, { compared: number; changed: number }>();
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    if (regions.some(r => x >= r.x && y >= r.y && x < r.x + r.width && y < r.y + r.height)) continue;
    compared++;
    const tileId = Math.floor(y / 32) * Math.ceil(width / 32) + Math.floor(x / 32);
    const tile = tiles.get(tileId) ?? { compared: 0, changed: 0 };
    tiles.set(tileId, tile); tile.compared++;
    const at = (y * width + x) * 4;
    if ([0, 1, 2, 3].some(c => Math.abs(reference.pixels[at + c] - actual.pixels[at + c]) > 32)) { changed++; tile.changed++; }
  }
  if (!compared) throw Error("Exception regions cannot hide the entire capture");
  let worstTile = 0;
  for (const tile of tiles.values()) worstTile = Math.max(worstTile, tile.changed / tile.compared);
  return { changed, compared, ratio: changed / compared, worstTile,
    passed: changed / compared <= 0.01 && worstTile <= 0.2 };
}
