var fs = require('fs');

/* eslint-disable no-undef */
fileName = 'maplibre-gl-js/rollup/build/tsc/src/style-spec/reference/latest.js';

fs.readFile(fileName, 'utf8', function (err, data) {
    if (err) {
        return console.log(err);
    }
    var result = data.replace(/ assert { type: 'json' }/g, '');

    fs.writeFile(fileName, result, 'utf8', function (err) {
        if (err) return console.log(err);
    });
});
