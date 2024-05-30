import {globSync} from 'glob';
import fs from 'fs';
import path from 'path';
import validate from '../../../src/validate_style';
import reference from '../../../src/reference/latest';

const UPDATE = !!process.env.UPDATE;

describe('validate_spec', () => {
    globSync('test/integration/style-spec/tests/*.input.json').forEach((file) => {
        test(path.basename(file), () => {
            const outputfile = file.replace('.input', '.output');
            const style = fs.readFileSync(file);
            const result = validate(style);
            if (UPDATE) fs.writeFileSync(outputfile, JSON.stringify(result, null, 2));
            const expectedOutput = JSON.parse(fs.readFileSync(outputfile).toString());
            expect(result).toEqual(expectedOutput);
        });
    });

    test('errors from validate do not contain line numbers', () => {
        const style = JSON.parse(fs.readFileSync('test/integration/style-spec/tests/bad-color.input.json', 'utf8'));

        const result = validate(style, reference);
        expect(result[0].line).toBeUndefined();
    });

});
