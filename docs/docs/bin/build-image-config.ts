#!/usr/bin/env node
// builds image.config.json
// this configuration file is required to generate the appropriate images sizes with docs/bin/appropriate-images.js
// it is also required in react component that loads the image in components/appropriate-image.js
import fs from 'fs';
import path from 'path';

const imagePath = './docs/img/src/';
const imageConfig = fs.readdirSync(imagePath).reduce((obj, image) => {
    const ext = path.extname(`${imagePath}${image}`);
    // only process png
    if (ext === '.png') {
        const key = image.replace(ext, '');
        // set sizes for all images
        const sizes = [{width: 800}, {width: 500}];

        obj[key] = {
            basename: image,
            sizes
        };
    }
    return obj;
}, {});

fs.writeFileSync(
    './docs/img/dist/image.config.json',
    JSON.stringify(imageConfig)
);
