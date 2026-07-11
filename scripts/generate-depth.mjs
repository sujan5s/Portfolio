// One-time depth-map generator for the hero depth portrait.
//
// Usage: node scripts/generate-depth.mjs
//
// Runs Depth-Anything-V2-small (ONNX, CPU) on public/images/sujans05.webp and
// writes a grayscale depth map to public/images/sujans05-depth.webp.
// The model (~25 MB quantized) is downloaded on first run and cached.
//
// Fallbacks if this script fails:
//  1. Swap the model id for 'Xenova/depth-anything-small-hf' (v1, well tested
//     with transformers.js).
//  2. Generate the depth map online at
//     https://huggingface.co/spaces/depth-anything/Depth-Anything-V2 and save
//     the grayscale result as public/images/sujans05-depth.webp (near = white).
import { pipeline, RawImage } from '@huggingface/transformers';
import sharp from 'sharp';

const SRC = 'public/images/sujans05.webp';
const OUT = 'public/images/sujans05-depth.webp';

console.log('Loading depth-estimation model (first run downloads ~25 MB)...');
const estimator = await pipeline(
  'depth-estimation',
  'onnx-community/depth-anything-v2-small',
  { dtype: 'q8' }
);

console.log('Estimating depth for', SRC);
const { depth } = await estimator(await RawImage.read(SRC));

// Blur softens depth cliffs at the silhouette so displaced vertices ramp
// instead of stretching into spikes.
// toColourspace('b-w') keeps the output single-channel — sharp otherwise
// promotes raw grayscale to 3 channels after blur.
const depthBuf = await sharp(Buffer.from(depth.data), {
  raw: { width: depth.width, height: depth.height, channels: 1 },
})
  .blur(1.8)
  .toColourspace('b-w')
  .raw()
  .toBuffer();

// Force depth to 0 (far) wherever the photo is transparent, so the model's
// background guesses can't displace invisible geometry.
const alpha = await sharp(SRC)
  .ensureAlpha()
  .extractChannel('alpha')
  .resize(depth.width, depth.height, { fit: 'fill' })
  .raw()
  .toBuffer();

for (let i = 0; i < depthBuf.length; i++) {
  if (alpha[i] < 128) depthBuf[i] = 0;
}

await sharp(depthBuf, {
  raw: { width: depth.width, height: depth.height, channels: 1 },
})
  .resize({ width: 512, fit: 'inside' })
  .webp({ quality: 80 })
  .toFile(OUT);

console.log('Wrote', OUT);
