#!/usr/bin/env node

import path from 'path';
import appropriateImages from '@mapbox/appropriate-images';
import imageConfig from '../img/dist/image.config.json' assert { type: 'json' };
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
appropriateImages.createCli(imageConfig, {
    inputDirectory: path.join(__dirname, '../img/src'),
    outputDirectory: path.join(__dirname, '../img/dist')
});
