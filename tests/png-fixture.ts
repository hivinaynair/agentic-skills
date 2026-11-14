import { deflateSync } from "node:zlib";

// Small real PNGs keep image acceptance tests independent of a browser or codecs.
function chunk(type: string, data: Buffer) {
  const body = Buffer.concat([Buffer.from(type), data]);
  let crc = 0xffffffff;
  for (const byte of body) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  const result = Buffer.alloc(body.length + 8);
  result.writeUInt32BE(data.length);
  body.copy(result, 4);
  result.writeUInt32BE((crc ^ 0xffffffff) >>> 0, result.length - 4);
  return result;
}

export function png(width: number, height: number, pixel = (x: number, y: number) => [x * 9, y * 11, 100, 255], filter = 0) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6;
  const stride = width * 4, plain = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) plain.set(pixel(x, y), y * stride + x * 4);
  const rows = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    rows[y * (stride + 1)] = filter;
    for (let x = 0; x < stride; x++) {
      const i = y * stride + x;
      const a = x >= 4 ? plain[i - 4] : 0, b = y ? plain[i - stride] : 0;
      const c = y && x >= 4 ? plain[i - stride - 4] : 0;
      const p = a + b - c, distances = [Math.abs(p - a), Math.abs(p - b), Math.abs(p - c)];
      const paeth = [a, b, c][distances.indexOf(Math.min(...distances))];
      rows[y * (stride + 1) + x + 1] = plain[i] - [0, a, b, (a + b) >> 1, paeth][filter];
    }
  }
  return Buffer.concat([
    Buffer.from("89504e470d0a1a0a", "hex"), chunk("IHDR", header),
    chunk("IDAT", deflateSync(rows)), chunk("IEND", Buffer.alloc(0)),
  ]);
}
