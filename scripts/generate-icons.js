import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, '../public');

// Pure Node.js PNG encoder
function createPNG(width, height, pixelFn) {
  const bytesPerPixel = 4;
  const rowSize = 1 + width * bytesPerPixel;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter 0
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = pixelFn(x, y, width, height);
      const pixelOffset = rowOffset + 1 + x * bytesPerPixel;
      rawData[pixelOffset] = Math.max(0, Math.min(255, Math.round(r)));
      rawData[pixelOffset + 1] = Math.max(0, Math.min(255, Math.round(g)));
      rawData[pixelOffset + 2] = Math.max(0, Math.min(255, Math.round(b)));
      rawData[pixelOffset + 3] = Math.max(0, Math.min(255, Math.round(a)));
    }
  }

  const deflated = zlib.deflateSync(rawData, { level: 9 });

  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c;
  }

  function crc32(buf) {
    let crc = 0 ^ -1;
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
    }
    return (crc ^ -1) >>> 0;
  }

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const toCrc = Buffer.concat([typeBuf, data]);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc32(toCrc), 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflated),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

// Math helpers for SDF 2D rendering
function sdRoundedBox(px, py, bx, by, r) {
  const qx = Math.abs(px) - bx + r;
  const qy = Math.abs(py) - by + r;
  return Math.min(Math.max(qx, qy), 0.0) + Math.hypot(Math.max(qx, 0.0), Math.max(qy, 0.0)) - r;
}

function sdSegment(px, py, ax, ay, bx, by) {
  const pax = px - ax;
  const pay = py - ay;
  const bax = bx - ax;
  const bay = by - ay;
  const h = Math.max(0, Math.min(1, (pax * bax + pay * bay) / (bax * bax + bay * bay)));
  return Math.hypot(pax - bax * h, pay - bay * h);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function mixColor(c1, c2, t) {
  return [
    lerp(c1[0], c2[0], t),
    lerp(c1[1], c2[1], t),
    lerp(c1[2], c2[2], t),
    lerp(c1[3] ?? 255, c2[3] ?? 255, t)
  ];
}

// Brand Colors
const BG_DARK = [7, 8, 11, 255];        // #07080b
const CARD_DARK = [14, 16, 24, 255];     // #0e1018
const PURPLE = [139, 92, 246, 255];     // #8b5cf6
const INDIGO = [79, 70, 229, 255];      // #4f46e5
const CYAN = [34, 211, 238, 255];       // #22d3ee
const WHITE = [255, 255, 255, 255];

function renderIconPixel(x, y, w, h, isMaskable) {
  const nx = (x / w) * 2 - 1;
  const ny = (y / h) * 2 - 1;
  const pixelSize = 2 / w;

  const scale = isMaskable ? 0.76 : 0.88;
  const sx = nx / scale;
  const sy = ny / scale;

  let r = BG_DARK[0];
  let g = BG_DARK[1];
  let b = BG_DARK[2];
  let a = isMaskable ? 255 : (Math.hypot(nx, ny) > 1.3 ? 0 : 255);

  const boxDist = sdRoundedBox(sx, sy, 0.86, 0.86, 0.28);
  const aa = pixelSize / scale * 1.5;

  if (boxDist < aa) {
    const tGrad = Math.max(0, Math.min(1, (sx - sy + 1.2) / 2.4));
    let gradCol;
    if (tGrad < 0.5) {
      gradCol = mixColor(PURPLE, INDIGO, tGrad * 2);
    } else {
      gradCol = mixColor(INDIGO, CYAN, (tGrad - 0.5) * 2);
    }

    const borderDist = Math.abs(boxDist + 0.025) - 0.025;
    const innerDist = boxDist + 0.05;

    const glow = Math.exp(-Math.max(0, boxDist) * 8) * 0.4;
    r = lerp(r, gradCol[0], glow);
    g = lerp(g, gradCol[1], glow);
    b = lerp(b, gradCol[2], glow);

    if (innerDist < 0) {
      const innerT = Math.max(0, Math.min(1, (1 - Math.hypot(sx, sy))));
      const innerCard = mixColor(CARD_DARK, [18, 20, 32, 255], innerT);
      const innerAlpha = Math.max(0, Math.min(1, -innerDist / aa));
      r = lerp(r, innerCard[0], innerAlpha);
      g = lerp(g, innerCard[1], innerAlpha);
      b = lerp(b, innerCard[2], innerAlpha);
    }

    if (borderDist < 0) {
      const borderAlpha = Math.max(0, Math.min(1, -borderDist / aa));
      r = lerp(r, gradCol[0], borderAlpha);
      g = lerp(g, gradCol[1], borderAlpha);
      b = lerp(b, gradCol[2], borderAlpha);
    }
  }

  const drawLine = (ax, ay, bx, by, thick = 0.065) => {
    const d = sdSegment(sx, sy, ax, ay, bx, by) - thick / 2;
    return Math.max(0, Math.min(1, -d / (pixelSize / scale * 1.5)));
  };

  let symbolAlpha = 0;
  const l1 = drawLine(0, -0.32, 0.46, -0.10);
  const l2 = drawLine(0.46, -0.10, 0, 0.12);
  const l3 = drawLine(0, 0.12, -0.46, -0.10);
  const l4 = drawLine(-0.46, -0.10, 0, -0.32);
  const topDiamond = Math.max(l1, l2, l3, l4);

  const topCenterDist = Math.hypot(sx, sy + 0.10);
  if (topCenterDist < 0.3) {
    const fillGlow = Math.max(0, 1 - topCenterDist / 0.3) * 0.35;
    r = lerp(r, CYAN[0], fillGlow);
    g = lerp(g, CYAN[1], fillGlow);
    b = lerp(b, CYAN[2], fillGlow);
  }

  const m1 = drawLine(-0.46, 0.12, 0, 0.34);
  const m2 = drawLine(0, 0.34, 0.46, 0.12);
  const midChevron = Math.max(m1, m2);

  const b1 = drawLine(-0.46, 0.34, 0, 0.56);
  const b2 = drawLine(0, 0.56, 0.46, 0.34);
  const botChevron = Math.max(b1, b2);

  symbolAlpha = Math.max(topDiamond, midChevron * 0.9, botChevron * 0.8);

  const symGradT = Math.max(0, Math.min(1, (sy + 0.35) / 0.9));
  const symCol = mixColor(CYAN, PURPLE, symGradT);

  r = lerp(r, symCol[0], symbolAlpha);
  g = lerp(g, symCol[1], symbolAlpha);
  b = lerp(b, symCol[2], symbolAlpha);

  const dotDist = Math.hypot(sx - 0.28, sy + 0.26) - 0.055;
  const dotRingDist = Math.abs(Math.hypot(sx - 0.28, sy + 0.26) - 0.09) - 0.02;
  const dotAlpha = Math.max(0, Math.min(1, -dotDist / aa));
  const dotRingAlpha = Math.max(0, Math.min(1, -dotRingDist / aa));

  r = lerp(r, CYAN[0], dotAlpha);
  g = lerp(g, CYAN[1], dotAlpha);
  b = lerp(b, CYAN[2], dotAlpha);

  r = lerp(r, WHITE[0], dotRingAlpha * 0.85);
  g = lerp(g, WHITE[1], dotRingAlpha * 0.85);
  b = lerp(b, WHITE[2], dotRingAlpha * 0.85);

  return [r, g, b, a];
}

console.log('Generating PNG & SVG icons...');

const png192 = createPNG(192, 192, (x, y, w, h) => renderIconPixel(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), png192);
console.log('✓ Created pwa-192x192.png');

const png512 = createPNG(512, 512, (x, y, w, h) => renderIconPixel(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), png512);
console.log('✓ Created pwa-512x512.png');

const pngMaskable192 = createPNG(192, 192, (x, y, w, h) => renderIconPixel(x, y, w, h, true));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-192x192.png'), pngMaskable192);
console.log('✓ Created pwa-maskable-192x192.png');

const pngMaskable512 = createPNG(512, 512, (x, y, w, h) => renderIconPixel(x, y, w, h, true));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), pngMaskable512);
console.log('✓ Created pwa-maskable-512x512.png');

const pngApple = createPNG(180, 180, (x, y, w, h) => renderIconPixel(x, y, w, h, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), pngApple);
console.log('✓ Created apple-touch-icon.png');

const pngFavicon = createPNG(64, 64, (x, y, w, h) => renderIconPixel(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'favicon.png'), pngFavicon);
console.log('✓ Created favicon.png');

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <defs>
    <linearGradient id="brand-grad" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#8b5cf6" />
      <stop offset="50%" stop-color="#4f46e5" />
      <stop offset="100%" stop-color="#22d3ee" />
    </linearGradient>
    <linearGradient id="sym-grad" x1="50%" y1="0%" x2="50%" y2="100%">
      <stop offset="0%" stop-color="#22d3ee" />
      <stop offset="100%" stop-color="#8b5cf6" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="16" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
  <rect width="512" height="512" rx="128" fill="#07080b" />
  <rect x="24" y="24" width="464" height="464" rx="104" fill="#0e1018" stroke="url(#brand-grad)" stroke-width="12" filter="url(#glow)" />
  
  <g stroke="url(#sym-grad)" stroke-width="26" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <path d="M256 140 L396 210 L256 280 L116 210 Z" fill="#22d3ee" fill-opacity="0.12" />
    <path d="M116 285 L256 355 L396 285" />
    <path d="M116 360 L256 430 L396 360" />
  </g>
  
  <circle cx="396" cy="140" r="28" stroke="#22d3ee" stroke-width="8" fill="#07080b" />
  <circle cx="396" cy="140" r="16" fill="#8b5cf6" />
</svg>`;

fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent);
console.log('✓ Created/Updated favicon.svg');
console.log('All icons generated successfully!');
