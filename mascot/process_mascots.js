const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');

ffmpeg.setFfmpegPath(ffmpegStatic);

const inputDir = __dirname;
const outputDir = path.join(__dirname, 'output_videos');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

const FRAME_WIDTH = 209;
const FRAME_HEIGHT = 941;
const TOTAL_FRAMES = 8;
const FPS = 10 / 3; // 0.3s per frame

async function processFile(filename) {
    const filePath = path.join(inputDir, filename);
    const basename = path.basename(filename, '.png');
    const tempDir = path.join(inputDir, `temp_${basename.replace(/\s+/g, '_')}`);

    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
    }

    console.log(`Processing ${filename}...`);

    // Split frames
    for (let i = 0; i < TOTAL_FRAMES; i++) {
        await sharp(filePath)
            .extract({ left: i * FRAME_WIDTH, top: 0, width: FRAME_WIDTH, height: FRAME_HEIGHT })
            .toFile(path.join(tempDir, `frame_${i}.png`));
    }

    // Generate video
    const outputFile = path.join(outputDir, `${basename}.webm`);
    
    return new Promise((resolve, reject) => {
        ffmpeg()
            .input(path.join(tempDir, 'frame_%d.png'))
            .inputOptions([
                `-framerate ${FPS}`
            ])
            .outputOptions([
                '-vcodec libvpx-vp9',
                '-pix_fmt yuva420p',
                '-lossless 1'
            ])
            .save(outputFile)
            .on('end', () => {
                console.log(`Finished generating ${outputFile}`);
                // Cleanup temp dir
                for (let i = 0; i < TOTAL_FRAMES; i++) {
                    fs.unlinkSync(path.join(tempDir, `frame_${i}.png`));
                }
                fs.rmdirSync(tempDir);
                resolve();
            })
            .on('error', (err) => {
                console.error(`Error generating ${outputFile}:`, err);
                reject(err);
            });
    });
}

async function main() {
    const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.png') && !f.startsWith('._'));
    console.log(`Found ${files.length} png files.`);

    for (const file of files) {
        try {
            await processFile(file);
        } catch (error) {
            console.error(`Failed to process ${file}`, error);
        }
    }
    console.log('All files processed.');
}

main();
