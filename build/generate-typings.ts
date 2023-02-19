
import fs from 'fs';
import childProcess from 'child_process';

if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
}

console.log('Starting bundling types');

const outputPath = './dist';
if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath);
}
const outputFile = `${outputPath}/index.d.ts`;
childProcess.execSync(`dts-bundle-generator -o ${outputFile} ./src/style-spec.ts`);

console.log('Finished bundling types');
