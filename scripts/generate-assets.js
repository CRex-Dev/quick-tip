/**
 * Generates the placeholder app icon / splash artwork as PNGs.
 *
 * Run with `npm run generate:assets`. Everything is drawn from math with
 * zlib as the only dependency, so the art stays editable: tweak the colours
 * or the glyph below and re-run. Replace these with real artwork before a
 * public launch if you want something less geometric.
 */
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

const ASSETS = path.join(__dirname, '..', 'assets');

// Keep these in sync with the `primary` tokens in src/theme.ts.
const TEAL = [0x00, 0x69, 0x6b];
const TEAL_BRIGHT = [0x4f, 0xd8, 0xda];
const WHITE = [0xff, 0xff, 0xff];

// ---------------------------------------------------------------------------
// PNG encoding
// ---------------------------------------------------------------------------

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

/** Encodes an RGBA pixel buffer (size * size * 4) as a PNG. */
function encodePng(rgba, size) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // colour type: RGBA
  // 10..12 = compression / filter / interlace, all 0

  // Prefix each scanline with filter byte 0 (None).
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    const rowStart = y * (size * 4 + 1);
    raw[rowStart] = 0;
    rgba.copy(raw, rowStart + 1, y * size * 4, (y + 1) * size * 4);
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ---------------------------------------------------------------------------
// The glyph: a percent sign, drawn in a unit square
// ---------------------------------------------------------------------------

const RING_OUTER = 0.2;
const RING_INNER = 0.105;
const SLASH_RADIUS = 0.085;
const SLASH_A = [0.18, 0.86];
const SLASH_B = [0.82, 0.14];
const RINGS = [
  [0.25, 0.25],
  [0.75, 0.75],
];

function inRing(u, v, [cx, cy]) {
  const d = Math.hypot(u - cx, v - cy);
  return d >= RING_INNER && d <= RING_OUTER;
}

function inSlash(u, v) {
  const [ax, ay] = SLASH_A;
  const [bx, by] = SLASH_B;
  const dx = bx - ax;
  const dy = by - ay;
  const t = Math.max(0, Math.min(1, ((u - ax) * dx + (v - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(u - (ax + t * dx), v - (ay + t * dy)) <= SLASH_RADIUS;
}

function inGlyph(u, v) {
  if (u < 0 || u > 1 || v < 0 || v > 1) return false;
  return inSlash(u, v) || RINGS.some((c) => inRing(u, v, c));
}

// ---------------------------------------------------------------------------
// Rasteriser
// ---------------------------------------------------------------------------

const SAMPLES = 4; // supersampling factor, for anti-aliased edges

/**
 * @param {object} opts
 * @param {number} opts.size        output width/height in px
 * @param {number[]|null} opts.bg   background colour, or null for transparent
 * @param {number[]|null} opts.fg   glyph colour, or null to draw no glyph
 * @param {number} opts.scale       glyph size as a fraction of the canvas
 */
function render({ size, bg, fg, scale = 0.58 }) {
  const rgba = Buffer.alloc(size * size * 4);
  const offset = (1 - scale) / 2; // centres the glyph box
  const step = 1 / (size * SAMPLES);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let hits = 0;
      if (fg) {
        for (let sy = 0; sy < SAMPLES; sy++) {
          for (let sx = 0; sx < SAMPLES; sx++) {
            const px = (x * SAMPLES + sx + 0.5) * step;
            const py = (y * SAMPLES + sy + 0.5) * step;
            if (inGlyph((px - offset) / scale, (py - offset) / scale)) hits++;
          }
        }
      }
      const coverage = hits / (SAMPLES * SAMPLES);

      // Composite the glyph over the (possibly transparent) background.
      const bgA = bg ? 1 : 0;
      const outA = coverage + bgA * (1 - coverage);
      const i = (y * size + x) * 4;
      for (let c = 0; c < 3; c++) {
        const top = fg ? fg[c] * coverage : 0;
        const bottom = bg ? bg[c] * bgA * (1 - coverage) : 0;
        rgba[i + c] = outA === 0 ? 0 : Math.round((top + bottom) / outA);
      }
      rgba[i + 3] = Math.round(outA * 255);
    }
  }

  return encodePng(rgba, size);
}

function write(name, buffer) {
  fs.writeFileSync(path.join(ASSETS, name), buffer);
  console.log(`  ${name.padEnd(32)} ${(buffer.length / 1024).toFixed(1)} KB`);
}

fs.mkdirSync(ASSETS, { recursive: true });
console.log('Generating assets...');

// Full-bleed launcher icon (iOS + the fallback Android icon).
write('icon.png', render({ size: 1024, bg: TEAL, fg: WHITE, scale: 0.58 }));

// Android adaptive icon. The outer ~34% is cropped by the launcher mask, so
// the foreground glyph stays well inside the safe zone.
write('android-icon-background.png', render({ size: 1024, bg: TEAL, fg: null }));
write('android-icon-foreground.png', render({ size: 1024, bg: null, fg: WHITE, scale: 0.4 }));
write('android-icon-monochrome.png', render({ size: 1024, bg: null, fg: WHITE, scale: 0.4 }));

// Splash marks, sized for the light and dark splash backgrounds.
write('splash-icon.png', render({ size: 1024, bg: null, fg: TEAL, scale: 0.55 }));
write('splash-icon-dark.png', render({ size: 1024, bg: null, fg: TEAL_BRIGHT, scale: 0.55 }));

write('favicon.png', render({ size: 48, bg: TEAL, fg: WHITE, scale: 0.62 }));

console.log('Done.');
