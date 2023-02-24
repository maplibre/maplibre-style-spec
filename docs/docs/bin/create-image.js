// eslint-disable-line
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import pack from 'maplibre-gl/package.json' assert { type: 'json' };
import puppeteer from 'puppeteer';

const exampleName = process.argv[2];
const binPath = path.dirname(fileURLToPath(import.meta.url));
const examplePath = path.resolve(binPath, '..', 'pages', 'example');

const browser = await puppeteer.launch({ headless: exampleName === 'all' });

let page = await browser.newPage();
// set viewport and double deviceScaleFactor to get a closer shot of the map
await page.setViewport({
    width: 600,
    height: 600,
    deviceScaleFactor: 2
});

async function createImage(nameWithExtension) {
    const exampleName = nameWithExtension
        .replace('.html', '')
        .replace('.js', '');
    // get the example contents/snippet
    const snippet = fs.readFileSync(
        path.resolve(examplePath, `${exampleName}.html`),
        'utf-8'
    );
    // create an HTML page to display the example snippet
    const html = `<!DOCTYPE html>
    <html>
    <head>
    <meta charset='utf-8' />
    <script src='https://unpkg.com/maplibre-gl@${pack.version}/dist/maplibre-gl.js'></script>
    <link href='https://unpkg.com/maplibre-gl@${pack.version}/dist/maplibre-gl.css' rel='stylesheet' />
    <style>
    body { margin:0; padding:0; }
    #map { position: absolute; top:0; bottom:0; width: 600px; max-height: 300px; }
    </style>
    </head>
    <body>
    ${snippet}
    </body>
    </html>`;

    // eslint-disable-next-line xss/no-mixed-html
    await page.setContent(html);

    // Wait for map to load, then wait two more seconds for images, etc. to load.
    await page
        .waitForFunction('map.loaded()')
        .then(async () => {
            // Wait for 5 seconds on 3d model examples, since this takes longer to load.
            const waitTime = exampleName.includes('3d-model') ? 5000 : 1500;
            // eslint-disable-next-line es/no-promise
            await new Promise(function (resolve) {
                console.log(`waiting for ${waitTime} ms`);
                setTimeout(resolve, waitTime);
            });
        })
        // map.loaded() does not evaluate to true within 3 seconds, it's probably an animated example.
        // In this case we take the screenshot immediately.
        .catch(() => {
            console.log(`Timed out waiting for map load on ${exampleName}.`);
        });

    await page
        .screenshot({
            path: `./docs/img/src/${exampleName}.png`,
            type: 'png',
            clip: {
                x: 0,
                y: 0,
                width: 600,
                height: 250
            }
        })
        .then(() => console.log(`Created ./docs/img/src/${exampleName}.png`))
        .catch((err) => {
            console.log(err);
        });
}

if (exampleName === 'all') {
    const allFiles = fs.readdirSync(examplePath);
    const files = allFiles.filter((file) => /\.html$/.test(file));
    console.log(`Generating ${files.length} images.`);
    for (const file of files) {
        await createImage(file);
    }
} else if (exampleName) {
    await createImage(exampleName);
} else {
    throw new Error(
        '\n  Usage: npm run create-image <file-name>\nExample: npm run create-image 3d-buildings'
    );
}

await browser.close();
