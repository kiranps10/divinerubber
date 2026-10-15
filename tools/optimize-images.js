/**
 * Builds optimised website assets from the original sources.
 *   npm run images
 *
 * - Reads embedded images/videos straight out of Divinerubber.fig (a zip file)
 *   and the loose photos in the project root. Originals are never changed.
 * - Writes WebP images to assets/images/<folder>/<name>-<width>.webp
 * - Writes compressed MP4 videos + poster images to assets/videos/
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { execFileSync } = require('child_process');
const sharp = require('sharp');
const ffmpeg = require('ffmpeg-static');
const map = require('./asset-map');
const { whiteBackground } = require('./white-bg');

const ROOT = path.resolve(__dirname, '..');
const FIG = path.join(ROOT, 'Divinerubber.fig');
const IMG_OUT = path.join(ROOT, 'assets', 'images');
const VID_OUT = path.join(ROOT, 'assets', 'videos');

/* Minimal zip reader (central directory) so no extra dependency is needed. */
function readZip(file) {
  const buf = fs.readFileSync(file);
  let eocd = buf.length - 22;
  while (eocd >= 0 && buf.readUInt32LE(eocd) !== 0x06054b50) eocd--;
  const count = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);
  const entries = {};
  for (let i = 0; i < count; i++) {
    const method = buf.readUInt16LE(p + 10);
    const compSize = buf.readUInt32LE(p + 20);
    const nameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commentLen = buf.readUInt16LE(p + 32);
    const localOffset = buf.readUInt32LE(p + 42);
    const name = buf.toString('utf8', p + 46, p + 46 + nameLen);
    entries[name] = () => {
      const lNameLen = buf.readUInt16LE(localOffset + 26);
      const lExtraLen = buf.readUInt16LE(localOffset + 28);
      const start = localOffset + 30 + lNameLen + lExtraLen;
      const data = buf.subarray(start, start + compSize);
      return method === 0 ? Buffer.from(data) : zlib.inflateRawSync(data);
    };
    p += 46 + nameLen + extraLen + commentLen;
  }
  return entries;
}

const zip = readZip(FIG);
function load(source, folder) {
  if (source.startsWith('fig:')) {
    const prefix = `${folder}/${source.slice(4)}`;
    const key = Object.keys(zip).find((k) => k.startsWith(prefix));
    if (!key) throw new Error(`Not found in .fig: ${source}`);
    return zip[key]();
  }
  return fs.readFileSync(path.join(ROOT, source));
}

async function images() {
  // node tools/optimize-images.js images products/  → only outputs starting with that path
  const prefix = process.argv[3] || '';
  for (const item of map.images) {
    if (!item.out.startsWith(prefix)) continue;
    const input = load(item.source, 'images');
    const dir = path.join(IMG_OUT, path.dirname(item.out));
    fs.mkdirSync(dir, { recursive: true });
    const meta = await sharp(input).metadata();
    for (const w of item.widths) {
      const file = path.join(IMG_OUT, `${item.out}-${w}.webp`);
      // trim: product cut-out on a flat light background → crop the empty margin and
      // lift the background to pure white so it blends into white cards
      let img = sharp(input).rotate();
      // crop: { left, top, width, height } as fractions of the photo (a closer view of one part)
      if (item.crop) {
        const c = item.crop;
        img = sharp(await img.extract({ left: Math.round(c.left * meta.width), top: Math.round(c.top * meta.height), width: Math.round(c.width * meta.width), height: Math.round(c.height * meta.height) }).toBuffer());
      }
      // frame: old catalogue photos (divinerubber.com) have a 1px frame + white margin → remove both
      if (item.frame) img = sharp(await img.extract({ left: 1, top: 1, width: meta.width - 2, height: meta.height - 2 }).toBuffer()).trim({ background: '#ffffff', threshold: 20 });
      if (item.trim) img = sharp(await img.linear(255 / item.trim, 0).toBuffer()).trim({ background: '#ffffff', threshold: 12 });
      // whiteBg: replace a plain photo backdrop with white (tools/white-bg.js). { inset: n } first
      // crops n px (some photos have a thin line round the edge that blocks the fill)
      if (item.whiteBg) {
        const { inset = 0, ...options } = item.whiteBg;
        const cur = await img.png().toBuffer({ resolveWithObject: true });
        let src = sharp(cur.data);
        if (inset) src = src.extract({ left: inset, top: inset, width: cur.info.width - 2 * inset, height: cur.info.height - 2 * inset });
        const r = await whiteBackground(sharp(await src.png().toBuffer()), options);
        img = sharp(r.buffer, { raw: r.raw });
        // Catalogue photos: crop to the product again now the backdrop is white
        if (item.frame) img = sharp(await img.png().toBuffer()).trim({ background: '#ffffff', threshold: 10 });
      }
      // upscale: n → small originals are enlarged n× (never past `w`) with a sharp Lanczos
      // filter + light sharpening, which looks crisper than the browser stretching them.
      // quality: WebP quality (default 78; product photos use a higher value).
      const cur = await img.png().toBuffer({ resolveWithObject: true });
      const width = item.upscale ? Math.min(w, Math.round(cur.info.width * item.upscale)) : Math.min(w, cur.info.width);
      img = sharp(cur.data).resize({ width, kernel: 'lanczos3', withoutEnlargement: !item.upscale });
      if (item.upscale && width > cur.info.width) img = img.sharpen({ sigma: 0.7, m1: 0.6, m2: 1.2 });
      await img
        .webp({ quality: item.quality || 78, alphaQuality: 90, effort: 5, smartSubsample: true })
        .toFile(file);
      const out = await sharp(file).metadata();
      console.log(`img  ${path.relative(ROOT, file)}  ${out.width}x${out.height}  ${Math.round(fs.statSync(file).size / 1024)}KB`);
    }
  }
}

function videos() {
  fs.mkdirSync(VID_OUT, { recursive: true });
  const tmp = path.join(VID_OUT, '.tmp-source.mp4');
  for (const v of map.videos) {
    fs.writeFileSync(tmp, load(v.source, 'videos'));
    const out = path.join(VID_OUT, `${v.out}.mp4`);
    const args = ['-y', '-loglevel', 'error', '-i', tmp, '-vf', `scale='min(${v.width},iw)':-2`,
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '28', '-pix_fmt', 'yuv420p', '-movflags', '+faststart'];
    if (v.audio) args.push('-c:a', 'aac', '-b:a', '96k'); else args.push('-an');
    execFileSync(ffmpeg, [...args, out]);
    const poster = path.join(VID_OUT, `${v.out}-poster.jpg`);
    execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-ss', '1', '-i', out, '-frames:v', '1', '-q:v', '4', poster]);
    console.log(`vid  ${path.relative(ROOT, out)}  ${Math.round(fs.statSync(out).size / 1024)}KB`);
  }
  fs.unlinkSync(tmp);
}

async function favicon() {
  const logo = load(map.images.find((i) => i.out === 'brand/divine-logo').source, 'images');
  const out = path.join(ROOT, 'assets', 'icons', 'favicon-192.png');
  await sharp(logo)
    .resize(184, 184, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({ top: 4, bottom: 4, left: 4, right: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(out);
  console.log(`icon ${path.relative(ROOT, out)}`);
}

(async () => {
  const only = process.argv[2];
  if (only !== 'videos') {
    await images();
    await favicon();
  }
  if (only !== 'images') videos();
})().catch((e) => { console.error(e); process.exit(1); });
