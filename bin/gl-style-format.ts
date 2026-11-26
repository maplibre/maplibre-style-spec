import fs from 'fs';
import minimist from 'minimist';
import {format} from '../src/format';
import {readStdin} from './read_stdin';
const argv = minimist(process.argv.slice(2));

if (argv.help || argv.h || (!argv._.length && process.stdin.isTTY)) {
    help();
} else {
    const input = argv._.length ? Promise.resolve(fs.readFileSync(argv._[0], 'utf8')) : readStdin();
    input.then((style) => {
        console.log(format(JSON.parse(style), argv.space, argv['max-line-length']));
    });
}

function help() {
    console.log('usage:');
    console.log('  gl-style-format source.json > destination.json');
    console.log('  gl-style-format < source.json > destination.json');
    console.log('');
    console.log('options:');
    console.log('  --space <num>');
    console.log('     Number of spaces in output (default "2")');
    console.log('     Pass "0" for minified output.');
    console.log('  --max-line-length <num>');
    console.log('     Maximum line length in output (default "80")');
}
