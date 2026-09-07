import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { execSync } from 'child_process';

const require = createRequire(import.meta.url);
const sharp = require('/Users/win/Documents/marketing channel/mascot/node_modules/sharp');
const ffmpegStatic = require('ffmpeg-static');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '..');
const FRAMES_DIR = path.join(ROOT, 'public/mascot/frames');
const OUTPUT_VIDEOS_DIR = path.join(ROOT, 'public/mascot/output_videos');
const MASCOT_OUTPUT_VIDEOS = '/Users/win/Documents/marketing channel/mascot/output_videos';

const EXACT_MASCOTS = [
  'confuse',
  'happy',
  'pointing',
  'research',
  'scare',
  'thinking',
  'thumbup',
  'working'
];

const FRAME_WIDTH = 512;
const FRAME_HEIGHT = 512;
const COLS = 3;
const ROWS = 2;
const TOTAL_FRAMES = 6;
const FPS_RATIONAL = '20/7'; // 0.35s per frame

// 1. Clean frames directory: remove any non-exact folder
const existingFrameItems = fs.readdirSync(FRAMES_DIR);
for (const item of existingFrameItems) {
  const itemPath = path.join(FRAMES_DIR, item);
  const stat = fs.statSync(itemPath);
  if (stat.isDirectory() && !EXACT_MASCOTS.includes(item)) {
    fs.rmSync(itemPath, { recursive: true, force: true });
    console.log(`Removed extra directory: ${item}`);
  }
}

// 2. Clean output_videos directories: clear and keep only exact 8 webm files
fs.rmSync(OUTPUT_VIDEOS_DIR, { recursive: true, force: true });
fs.mkdirSync(OUTPUT_VIDEOS_DIR, { recursive: true });

// Also remove _loop.webm and alias files from MASCOT_OUTPUT_VIDEOS
if (fs.existsSync(MASCOT_OUTPUT_VIDEOS)) {
  for (const f of fs.readdirSync(MASCOT_OUTPUT_VIDEOS)) {
    if (f.endsWith('_loop.webm') || f === 'confused.webm') {
      fs.rmSync(path.join(MASCOT_OUTPUT_VIDEOS, f), { force: true });
    }
  }
}

// 3. Process each exact mascot
for (const name of EXACT_MASCOTS) {
  const imgFile = `${name}.png`;
  const srcPath = path.join(FRAMES_DIR, imgFile);

  if (!fs.existsSync(srcPath)) {
    console.warn(`File not found: ${srcPath}`);
    continue;
  }

  console.log(`Processing exact mascot: ${name}`);

  // Subfolder for frames: public/mascot/frames/<name>/
  const targetFolder = path.join(FRAMES_DIR, name);
  fs.rmSync(targetFolder, { recursive: true, force: true });
  fs.mkdirSync(targetFolder, { recursive: true });

  const tempDir = path.join(ROOT, 'public/mascot', `.temp_${name}`);
  fs.mkdirSync(tempDir, { recursive: true });

  // Crop exactly 6 frames (frame_0.png to frame_5.png)
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const idx = r * COLS + c;
      const left = c * FRAME_WIDTH;
      const top = r * FRAME_HEIGHT;

      const frameFile = path.join(targetFolder, `frame_${idx}.png`);
      const tempFrameFile = path.join(tempDir, `frame_${idx}.png`);

      await sharp(srcPath)
        .extract({ left, top, width: FRAME_WIDTH, height: FRAME_HEIGHT })
        .png()
        .toFile(frameFile);

      fs.copyFileSync(frameFile, tempFrameFile);
    }
  }

  // Generate 1 single WebM file: <name>.webm
  const outWebm = path.join(OUTPUT_VIDEOS_DIR, `${name}.webm`);
  const cmd = [
    `"${ffmpegStatic}"`,
    '-y',
    `-framerate ${FPS_RATIONAL}`,
    `-i "${path.join(tempDir, 'frame_%d.png')}"`,
    '-c:v libvpx-vp9',
    '-pix_fmt yuva420p',
    '-auto-alt-ref 0',
    '-b:v 2M',
    '-crf 15',
    `"${outWebm}"`
  ].join(' ');

  execSync(cmd);
  console.log(`✓ Generated: ${name}.webm (0.35s/frame, 2.10s duration)`);

  // Copy to MASCOT_OUTPUT_VIDEOS as well
  if (fs.existsSync(MASCOT_OUTPUT_VIDEOS)) {
    fs.copyFileSync(outWebm, path.join(MASCOT_OUTPUT_VIDEOS, `${name}.webm`));
  }

  fs.rmSync(tempDir, { recursive: true, force: true });
}

console.log('\nAll done! Cleaned and generated exactly 8 WebM files matching original image names.');
