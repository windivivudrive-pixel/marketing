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
const FRAMES_INPUT_DIR = path.join(ROOT, 'public/mascot/frames');
const SPRITESHEETS_DIR = path.join(ROOT, 'public/mascot/spritesheets');
const PUBLIC_FRAMES_DIR = path.join(ROOT, 'public/mascot/frames');
const PUBLIC_OUTPUT_VIDEOS = path.join(ROOT, 'public/mascot/output_videos');

const MASCOT_ROOT = '/Users/win/Documents/marketing channel/mascot';
const MASCOT_OUTPUT_VIDEOS = path.join(MASCOT_ROOT, 'output_videos');
const MASCOT_SPRITESHEETS_DIR = path.join(MASCOT_ROOT, 'spritesheets');

// Create directories
fs.mkdirSync(SPRITESHEETS_DIR, { recursive: true });
fs.mkdirSync(PUBLIC_OUTPUT_VIDEOS, { recursive: true });
fs.mkdirSync(MASCOT_OUTPUT_VIDEOS, { recursive: true });
fs.mkdirSync(MASCOT_SPRITESHEETS_DIR, { recursive: true });

const MASCOT_FILES = [
  'confuse.png',
  'happy.png',
  'pointing.png',
  'research.png',
  'scare.png',
  'thinking.png',
  'thumbup.png',
  'working.png'
];

const ALIASES = {
  'research': ['search', 'find'],
  'working': ['working cool'],
  'confuse': ['confused'],
  'happy': ['chill drink milk tea', 'happy drink milktea']
};

const FRAME_DURATION = 0.35; // seconds
const FPS_RATIONAL = '20/7'; // 1 / 0.35 = 2.857142857 fps
const FRAME_WIDTH = 512;
const FRAME_HEIGHT = 512;
const COLS = 3;
const ROWS = 2;
const TOTAL_FRAMES = 6;

async function processMascot(filename) {
  const name = path.basename(filename, '.png');
  const srcPath = path.join(FRAMES_INPUT_DIR, filename);

  console.log(`\n========================================`);
  console.log(`Processing mascot: "${name}" (${filename})`);
  console.log(`========================================`);

  // 1. Copy sprite sheet to spritesheets directory for archival
  const backupPath1 = path.join(SPRITESHEETS_DIR, filename);
  const backupPath2 = path.join(MASCOT_SPRITESHEETS_DIR, filename);
  fs.copyFileSync(srcPath, backupPath1);
  fs.copyFileSync(srcPath, backupPath2);
  console.log(`✓ Backed up sprite sheet to ${backupPath1}`);

  // 2. Crop 6 frames evenly (3x2 grid of 512x512)
  const targetDir = path.join(PUBLIC_FRAMES_DIR, name);
  fs.mkdirSync(targetDir, { recursive: true });

  const tempFrameDir = path.join(ROOT, 'public/mascot', `.temp_${name}`);
  fs.mkdirSync(tempFrameDir, { recursive: true });

  console.log(`Cropping ${TOTAL_FRAMES} frames (512x512 each)...`);
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const idx = r * COLS + c;
      const left = c * FRAME_WIDTH;
      const top = r * FRAME_HEIGHT;

      const framePath = path.join(targetDir, `frame_${idx}.png`);
      const tempPath = path.join(tempFrameDir, `frame_${idx}.png`);

      await sharp(srcPath)
        .extract({ left, top, width: FRAME_WIDTH, height: FRAME_HEIGHT })
        .png()
        .toFile(framePath);

      fs.copyFileSync(framePath, tempPath);
    }
  }

  // Also create frame_6.png, frame_7.png, frame_8.png for Remotion 1-based indexing safety
  for (let i = 6; i <= 8; i++) {
    const loopIdx = i % TOTAL_FRAMES;
    fs.copyFileSync(
      path.join(targetDir, `frame_${loopIdx}.png`),
      path.join(targetDir, `frame_${i}.png`)
    );
  }
  console.log(`✓ Cropped frames saved to ${targetDir} (frame_0.png to frame_5.png + 1-indexed aliases)`);

  // Handle alias folders for frames
  const aliases = ALIASES[name] || [];
  for (const alias of aliases) {
    const aliasDir = path.join(PUBLIC_FRAMES_DIR, alias);
    fs.mkdirSync(aliasDir, { recursive: true });
    for (let i = 0; i <= 8; i++) {
      fs.copyFileSync(
        path.join(targetDir, `frame_${i}.png`),
        path.join(aliasDir, `frame_${i}.png`)
      );
    }
    console.log(`✓ Synced frames to alias: ${aliasDir}`);
  }

  // 3. Generate WebM Video (Standard 6 frames @ 0.35s/frame = 2.1s duration)
  const publicWebmPath = path.join(PUBLIC_OUTPUT_VIDEOS, `${name}.webm`);
  const mascotWebmPath = path.join(MASCOT_OUTPUT_VIDEOS, `${name}.webm`);

  console.log(`Generating WebM with VP9 alpha transparency at ${FRAME_DURATION}s/frame (${FPS_RATIONAL} fps)...`);
  const cmd = [
    `"${ffmpegStatic}"`,
    '-y',
    `-framerate ${FPS_RATIONAL}`,
    `-i "${path.join(tempFrameDir, 'frame_%d.png')}"`,
    '-c:v libvpx-vp9',
    '-pix_fmt yuva420p',
    '-auto-alt-ref 0',
    '-b:v 2M',
    '-crf 15',
    `"${publicWebmPath}"`
  ].join(' ');

  execSync(cmd, { stdio: 'inherit' });
  fs.copyFileSync(publicWebmPath, mascotWebmPath);
  console.log(`✓ Generated standard WebM: ${publicWebmPath} (Duration: ${(TOTAL_FRAMES * FRAME_DURATION).toFixed(2)}s)`);

  // 4. Also generate a 5-loop (10.5s) extended version for easy timeline insertion in editors: `${name}_loop.webm`
  const loopTempDir = path.join(ROOT, 'public/mascot', `.temp_loop_${name}`);
  fs.mkdirSync(loopTempDir, { recursive: true });
  for (let loop = 0; loop < 5; loop++) {
    for (let f = 0; f < TOTAL_FRAMES; f++) {
      const loopFrameIdx = loop * TOTAL_FRAMES + f;
      fs.copyFileSync(
        path.join(targetDir, `frame_${f}.png`),
        path.join(loopTempDir, `frame_${loopFrameIdx}.png`)
      );
    }
  }

  const publicLoopWebmPath = path.join(PUBLIC_OUTPUT_VIDEOS, `${name}_loop.webm`);
  const mascotLoopWebmPath = path.join(MASCOT_OUTPUT_VIDEOS, `${name}_loop.webm`);

  const loopCmd = [
    `"${ffmpegStatic}"`,
    '-y',
    `-framerate ${FPS_RATIONAL}`,
    `-i "${path.join(loopTempDir, 'frame_%d.png')}"`,
    '-c:v libvpx-vp9',
    '-pix_fmt yuva420p',
    '-auto-alt-ref 0',
    '-b:v 2M',
    '-crf 15',
    `"${publicLoopWebmPath}"`
  ].join(' ');

  execSync(loopCmd, { stdio: 'inherit' });
  fs.copyFileSync(publicLoopWebmPath, mascotLoopWebmPath);
  console.log(`✓ Generated 5-cycle looped WebM: ${publicLoopWebmPath} (Duration: ${(5 * TOTAL_FRAMES * FRAME_DURATION).toFixed(2)}s)`);

  // Copy to aliases
  for (const alias of aliases) {
    fs.copyFileSync(publicWebmPath, path.join(PUBLIC_OUTPUT_VIDEOS, `${alias}.webm`));
    fs.copyFileSync(publicWebmPath, path.join(MASCOT_OUTPUT_VIDEOS, `${alias}.webm`));
    fs.copyFileSync(publicLoopWebmPath, path.join(PUBLIC_OUTPUT_VIDEOS, `${alias}_loop.webm`));
    fs.copyFileSync(publicLoopWebmPath, path.join(MASCOT_OUTPUT_VIDEOS, `${alias}_loop.webm`));
    console.log(`✓ Synced WebM to alias: ${alias}.webm & ${alias}_loop.webm`);
  }

  // Cleanup temp directories
  fs.rmSync(tempFrameDir, { recursive: true, force: true });
  fs.rmSync(loopTempDir, { recursive: true, force: true });
}

async function main() {
  console.log(`Starting Mascot Processing for ${MASCOT_FILES.length} mascot sets...`);
  for (const file of MASCOT_FILES) {
    const fullPath = path.join(FRAMES_INPUT_DIR, file);
    if (!fs.existsSync(fullPath)) {
      console.warn(`Warning: File not found: ${fullPath}`);
      continue;
    }
    await processMascot(file);
  }
  console.log(`\n========================================`);
  console.log(`ALL MASCOTS PROCESSED SUCCESSFULLY! 🎉`);
  console.log(`========================================`);
}

main().catch(err => {
  console.error('Fatal error processing mascots:', err);
  process.exit(1);
});
