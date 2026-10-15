/**
 * Replaces a plain photo backdrop (grey, beige, brown studio paper…) with pure white,
 * so product photos match the white product cards.
 *
 * How: the backdrop colour is sampled from the photo's edges, then a flood fill grows
 * inwards from the edges through every connected pixel close to that colour (it stops
 * at the product's outline). Soft shadows of the same hue are included. The mask edge
 * is feathered by 1px so the cut-out doesn't look jagged.
 *
 *   const buffer = await whiteBackground(sharpInstance, { tolerance: 38 });   // flat backdrop
 *   const buffer = await whiteBackground(sharpInstance, { step: 8, cap: 110 }); // gradient backdrop
 * Used by tools/optimize-images.js for asset-map entries with `whiteBg`.
 */
const sharp = require('sharp');

async function whiteBackground(img, { tolerance = 38, shadow = 0.55, step = 0, cap = 120 } = {}) {
  const { data, info } = await img.clone().flatten({ background: '#ffffff' }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;
  const px = (i) => [data[i * 3], data[i * 3 + 1], data[i * 3 + 2]];

  // Backdrop colour = median of the edge pixels
  const edge = [];
  for (let x = 0; x < W; x++) edge.push(x, (H - 1) * W + x);
  for (let y = 0; y < H; y++) edge.push(y * W, y * W + W - 1);
  const med = [0, 1, 2].map((c) => {
    const v = edge.map((i) => data[i * 3 + c]).sort((a, b) => a - b);
    return v[v.length >> 1];
  });
  const medL = med[0] + med[1] + med[2];
  const chroma = (p, L) => p.map((v) => v / (L || 1));
  const medC = chroma(med, medL);

  // Backdrop-like: close in colour, or a shadow (same hue, darker but not too dark)
  const isBg = (i) => {
    const p = px(i);
    const d = Math.hypot(p[0] - med[0], p[1] - med[1], p[2] - med[2]);
    if (d <= tolerance) return true;
    const L = p[0] + p[1] + p[2];
    if (L > medL || L < medL * shadow) return false;
    const c = chroma(p, L);
    return Math.hypot(c[0] - medC[0], c[1] - medC[1], c[2] - medC[2]) < 0.035;
  };

  // Gradient backdrops (step > 0): grow while each neighbour is close to the pixel it
  // was reached from, and never too far from the backdrop colour (stops at the product rim)
  const follows = (i, n) => {
    const a = px(i);
    const b = px(n);
    return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) <= step && Math.hypot(b[0] - med[0], b[1] - med[1], b[2] - med[2]) <= cap;
  };

  const mask = new Uint8Array(W * H);
  const stack = edge.filter((i) => isBg(i) || (step && Math.hypot(...px(i).map((v, c) => v - med[c])) <= cap));
  stack.forEach((i) => (mask[i] = 255));
  while (stack.length) {
    const i = stack.pop();
    const x = i % W;
    for (const n of [x > 0 ? i - 1 : -1, x < W - 1 ? i + 1 : -1, i - W, i + W]) {
      if (n >= 0 && n < W * H && !mask[n] && (step ? follows(i, n) : isBg(n))) {
        mask[n] = 255;
        stack.push(n);
      }
    }
  }

  // Feather the edge, then blend white in through the mask
  const soft = await sharp(Buffer.from(mask), { raw: { width: W, height: H, channels: 1 } }).blur(0.8).extractChannel(0).raw().toBuffer();
  const out = Buffer.alloc(W * H * 3);
  for (let i = 0; i < W * H; i++) {
    const a = soft[i] / 255;
    for (let c = 0; c < 3; c++) out[i * 3 + c] = Math.round(data[i * 3 + c] * (1 - a) + 255 * a);
  }
  return { buffer: out, raw: { width: W, height: H, channels: 3 }, covered: mask.reduce((s, v) => s + (v ? 1 : 0), 0) / (W * H) };
}

module.exports = { whiteBackground };
