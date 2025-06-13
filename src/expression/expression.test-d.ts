import {describe, expectTypeOf, test} from 'vitest';
import type {ExpressionInputType, ExpressionSpecification} from '../types.g';

describe('Distance expression', () => {
    describe('Invalid expression', () => {
        test('missing geometry typecheck', () => {
            expectTypeOf<['distance']>().not.toExtend<ExpressionSpecification>();
        });
        test('invalid geometry typecheck', () => {
            expectTypeOf<['distance', {type: 'Nope!'}]>().not.toExtend<ExpressionSpecification>();
        });
        test('expression as geometry typecheck', () => {
            expectTypeOf<['distance', ['literal', {type: 'MultiPoint'; coordinates: [[3, 3], [3, 4]]}]]>().not.toExtend<ExpressionSpecification>();
        });
    });

    describe('valid expression', () => {
        test('multi point geometry typecheck', () => {
            expectTypeOf<['distance', {type: 'MultiPoint'; coordinates: [[3, 3], [3, 4]]}]>().toExtend<ExpressionSpecification>();
        });
        test('multi line geometry typecheck', () => {
            expectTypeOf<['distance', {type: 'MultiLineString'; coordinates: [[[3, 3], [3, 4]]]}]>().toExtend<ExpressionSpecification>();
        });
        test('multi polygon geometry typecheck', () => {
            expectTypeOf<['distance', {type: 'MultiPolygon'; coordinates: [[[[3, 3], [3, 4], [4, 4], [4, 3], [3, 3]]]]}]>().toExtend<ExpressionSpecification>();
        });
    });
});

describe('"array" expression', () => {
    test('type requires an expression as the input value', () => {
        expectTypeOf<['array', 1, 2, 3]>().not.toExtend<ExpressionSpecification>();
        expectTypeOf<['array', [1, 2, 3]]>().not.toExtend<ExpressionSpecification>();
        expectTypeOf<['array', 'number', [1, 2, 3]]>().not.toExtend<ExpressionSpecification>();
        expectTypeOf<['array', 'number', 3, [1, 2, 3]]>().not.toExtend<ExpressionSpecification>();

        expectTypeOf<['array', ['literal', []]]>().toExtend<ExpressionSpecification>();
        expectTypeOf<['array', 'number', ['literal', [1, 2, 3]]]>().toExtend<ExpressionSpecification>();
        expectTypeOf<['array', 'number', typeof Number.MAX_SAFE_INTEGER, ['get', 'arr']]>().toExtend<ExpressionSpecification>();
    });
    test('type requires either "string", "number", or "boolean" as the asserted type', () => {
        expectTypeOf<['array', 0, ['literal', []]]>().not.toExtend<ExpressionSpecification>();
        expectTypeOf<['array', '0', ['literal', []]]>().not.toExtend<ExpressionSpecification>();
        expectTypeOf<['array', ['literal', 'number'], ['literal', []]]>().not.toExtend<ExpressionSpecification>();

        expectTypeOf<['array', 'string', ['literal', []]]>().toExtend<ExpressionSpecification>();
        expectTypeOf<['array', 'number', ['literal', []]]>().toExtend<ExpressionSpecification>();
        expectTypeOf<['array', 'boolean', ['literal', []]]>().toExtend<ExpressionSpecification>();
    });
    test('type requires a number literal as the asserted length', () => {
        expectTypeOf<['array', 'string', '0', ['literal', []]]>().not.toExtend<ExpressionSpecification>();
        expectTypeOf<['array', 'string', ['literal', 0], ['literal', []]]>().not.toExtend<ExpressionSpecification>();

        expectTypeOf<['array', 'string', 0, ['literal', []]]>().toExtend<ExpressionSpecification>();
        expectTypeOf<['array', 'string', 2, ['literal', ['one', 'two']]]>().toExtend<ExpressionSpecification>();
    });
});

describe('"format" expression', () => {
    test('type rejects bare string arrays in the "text-font" style override', () => {
        expectTypeOf<['format', 'foo', {'text-font': ['Helvetica', 'Arial']}]>().not.toExtend<ExpressionSpecification>();
    });
    test('type accepts expression which scales text', () => {
        expectTypeOf<['format', ['get', 'title'], {'font-scale': 0.8}]>().toExtend<ExpressionSpecification>();
    });
    test('type requires either "bottom", "center", or "top" as the vertical alignment', () => {
        expectTypeOf<['format', 'foo', {'vertical-align': 'middle'}]>().not.toExtend<ExpressionSpecification>();
    });
    test('type accepts expression which aligns a text section vertically', () => {
        expectTypeOf<['format', 'foo', {'vertical-align': 'top'}]>().toExtend<ExpressionSpecification>();
    });
    test('type accepts expression which aligns an image vertically', () => {
        expectTypeOf<['format', ['image', 'bar'], {'vertical-align': 'bottom'}]>().toExtend<ExpressionSpecification>();
    });
    test('type accepts expression which applies multiple style overrides', () => {
        expectTypeOf<['format', 'foo', {'font-scale': 0.8; 'text-color': '#fff'}]>().toExtend<ExpressionSpecification>();
    });
    test('type accepts expression which applies default styles with an empty overrides object', () => {
        expectTypeOf<['format', ['downcase', 'BaR'], {}]>().toExtend<ExpressionSpecification>();
    });
});

describe('"image" expression', () => {
    test('type requires a string as the image name argument', () => {
        expectTypeOf<['image', true]>().not.toExtend<ExpressionSpecification>();
        expectTypeOf<['image', 123]>().not.toExtend<ExpressionSpecification>();
    });
    test('type accepts expression which returns an image with a string literal as the image name', () => {
        expectTypeOf<['image', 'foo']>().toExtend<ExpressionSpecification>();
    });
    test('type accepts an expression which returns an image with an expression as the image name', () => {
        expectTypeOf<['image', ['concat', 'foo', 'bar']]>().toExtend<ExpressionSpecification>();
    });
});

describe('"typeof" expression', () => {
    test('type requires a value argument', () => {
        expectTypeOf<['typeof']>().not.toExtend<ExpressionSpecification>();
    });
    test('type rejects a second argument', () => {
        expectTypeOf<['typeof', true, 42]>().not.toExtend<ExpressionSpecification>();
    });
    test('type accepts expression which returns a string describing the type of the given literal value', () => {
        expectTypeOf<['typeof', true]>().toExtend<ExpressionSpecification>();
    });
    test('type accepts expression which returns a string describing the type of the given expression value', () => {
        expectTypeOf<['typeof', ['concat', 'foo', ['to-string', 0]]]>().toExtend<ExpressionSpecification>();
    });
});

describe('"feature-state" expression', () => {
    test('type accepts expression which retrieves the feature state with a string literal argument', () => {
        expectTypeOf<['feature-state', 'foo']>().toExtend<ExpressionSpecification>();
    });
    test('type accepts expression which retrieves the feature state with an expression argument', () => {
        expectTypeOf<['feature-state', ['get', 'feat-prop']]>().toExtend<ExpressionSpecification>();
    });
});

describe('"get" expression', () => {
    test('type requires an expression as the object argument if provided', () => {
        expectTypeOf<['get', 'prop', {prop: 4}]>().not.toExtend<ExpressionSpecification>();
    });
    test('type accepts expression which retrieves a property value from the given object argument', () => {
        expectTypeOf<['get', 'prop', ['literal', {prop: 4}]]>().toExtend<ExpressionSpecification>();
    });
});

describe('"global-state" expression', () => {
    test('type requires a property argument', () => {
        expectTypeOf<['global-state']>().not.toExtend<ExpressionSpecification>();
    });
    test('type requires a string literal as the property argument', () => {
        expectTypeOf<['global-state', ['concat', 'pr', 'op']]>().not.toExtend<ExpressionSpecification>();
    });
    test('type rejects a second argument', () => {
        expectTypeOf<['global-state', 'foo', 'bar']>().not.toExtend<ExpressionSpecification>();
    });
    test('type accepts expression which evaluates a global state property', () => {
        expectTypeOf<['global-state', 'foo']>().toExtend<ExpressionSpecification>();
    });
});

describe('"has" expression', () => {
    test('type requires an expression as the object argument if provided', () => {
        expectTypeOf<['has', 'prop', {prop: 4}]>().not.toExtend<ExpressionSpecification>();
    });
    test('type accepts expression which checks whether a property exists in the given object argument', () => {
        expectTypeOf<['has', 'prop', ['literal', {prop: 4}]]>().toExtend<ExpressionSpecification>();
    });
});

describe('"at" expression', () => {
    test('type accepts expression which retrieves the item at the specified index in the given array', () => {
        expectTypeOf<['at', 2, ['literal', [1, 2, 3]]]>().toExtend<ExpressionSpecification>();
    });
});

describe('"in" expression', () => {
    test('type requires a needle', () => {
        expectTypeOf<['in']>().not.toExtend<ExpressionSpecification>();
    });
    test('type requires a haystack', () => {
        expectTypeOf<['in', 'a']>().not.toExtend<ExpressionSpecification>();
    });
    test('type rejects a third argument', () => {
        expectTypeOf<['in', 'a', 'abc', 1]>().not.toExtend<ExpressionSpecification>();
    });
    test('type requires a string or array as the haystack', () => {
        expectTypeOf<['in', 't', true]>().not.toExtend<ExpressionSpecification>();
    });
    test('type accepts expression which finds a substring in a string', () => {
        expectTypeOf<['in', 'b', 'abc']>().toExtend<ExpressionSpecification>();
    });
    test('type accepts expression which finds a non-literal substring in a string', () => {
        expectTypeOf<['in', ['downcase', 'C'], ['concat', 'ab', 'cd']]>().toExtend<ExpressionSpecification>();
    });
    test('type accepts expression which finds an element in an array', () => {
        expectTypeOf<['in', 2, ['literal', [1, 2, 3]]]>().toExtend<ExpressionSpecification>();
    });
    test('type accepts expression which finds a non-literal element in an array', () => {
        expectTypeOf<['in', ['*', 2, 5], ['literal', [1, 10, 100]]]>().toExtend<ExpressionSpecification>();
    });
});

describe('"index-of" expression', () => {
    test('type requires a needle', () => {
        expectTypeOf<['index-of']>().not.toExtend<ExpressionSpecification>();
    });
    test('type requires a haystack', () => {
        expectTypeOf<['index-of', 'a']>().not.toExtend<ExpressionSpecification>();
    });
    test('type rejects a fourth argument', () => {
        expectTypeOf<['index-of', 'a', 'abc', 1, 8]>().not.toExtend<ExpressionSpecification>();
    });
    test('type requires a string or array as the haystack', () => {
        expectTypeOf<['index-of', 't', true]>().not.toExtend<ExpressionSpecification>();
    });
    test('type accepts expression which finds a substring in a string', () => {
        expectTypeOf<['index-of', 'b', 'abc']>().toExtend<ExpressionSpecification>();
    });
    test('type accepts expression which finds a non-literal substring in a string', () => {
        expectTypeOf<['index-of', ['downcase', 'C'], ['concat', 'ab', 'cd']]>().toExtend<ExpressionSpecification>();
    });
    test('type accepts expression which starts looking for the substring at a start index', () => {
        expectTypeOf<['index-of', 'a', 'abc', 1]>().toExtend<ExpressionSpecification>();
    });
    test('type accepts expression which starts looking for the substring at a non-literal start index', () => {
        expectTypeOf<['index-of', 'c', 'abc', ['-', 0, 1]]>().toExtend<ExpressionSpecification>();
    });
    test('type accepts expression which finds an element in an array', () => {
        expectTypeOf<['index-of', 2, ['literal', [1, 2, 3]]]>().toExtend<ExpressionSpecification>();
    });
    test('type accepts expression which finds a non-literal element in an array', () => {
        expectTypeOf<['index-of', ['*', 2, 5], ['literal', [1, 10, 100]]]>().toExtend<ExpressionSpecification>();
    });
    test('type accepts expression which starts looking for the element at a start index', () => {
        expectTypeOf<['index-of', 1, ['literal', [1, 2, 3]], 1]>().toExtend<ExpressionSpecification>();
    });
    test('type accepts expression which starts looking for the element at a non-literal start index', () => {
        expectTypeOf<['index-of', 2, ['literal', [1, 2, 3]], ['+', 0, -1, 2]]>().toExtend<ExpressionSpecification>();
    });
});

describe('"length" expression', () => {
    test('type requires an argument', () => {
        expectTypeOf<['length']>().not.toExtend<ExpressionSpecification>();
    });
    test('type requires a string or array as the argument', () => {
        expectTypeOf<['length', true]>().not.toExtend<ExpressionSpecification>();
    });
    test('type rejects a second argument', () => {
        expectTypeOf<['length', 'abc', 'def']>().not.toExtend<ExpressionSpecification>();
    });
    test('type accepts expression which measures a string', () => {
        expectTypeOf<['length', 'abc']>().toExtend<ExpressionSpecification>();
    });
    test('type accepts expression which measures an array', () => {
        expectTypeOf<['length', ['literal', [1, 2, 3]]]>().toExtend<ExpressionSpecification>();
    });
});

describe('"slice" expression', () => {
    test('type requires an input argument', () => {
        expectTypeOf<['slice']>().not.toExtend<ExpressionSpecification>();
    });
    test('type requires a start index argument', () => {
        expectTypeOf<['slice', 'abc']>().not.toExtend<ExpressionSpecification>();
    });
    test('type rejects a fourth argument', () => {
        expectTypeOf<['slice', 'abc', 0, 1, 8]>().not.toExtend<ExpressionSpecification>();
    });
    test('type requires a string or array as the input argument', () => {
        expectTypeOf<['slice', true, 0]>().not.toExtend<ExpressionSpecification>();
    });
    test('type requires a number as the start index argument', () => {
        expectTypeOf<['slice', 'abc', true]>().not.toExtend<ExpressionSpecification>();
    });
    test('type accepts expression which slices a string', () => {
        expectTypeOf<['slice', 'abc', 1]>().toExtend<ExpressionSpecification>();
    });
    test('type accepts expression which slices a string by a given range', () => {
        expectTypeOf<['slice', 'abc', 1, 1]>().toExtend<ExpressionSpecification>();
    });
    test('type accepts expression which slices an array', () => {
        expectTypeOf<['slice', ['literal', [1, 2, 3]], 1]>().toExtend<ExpressionSpecification>();
    });
    test('type accepts expression which slices an array by a given range', () => {
        expectTypeOf<['slice', ['literal', [1, 2, 3]], 1, 1]>().toExtend<ExpressionSpecification>();
    });
});

describe('comparison expressions', () => {
    describe('"!=" expression', () => {
        test('type accepts expression which compares against literal null value', () => {
            expectTypeOf<['!=', null, ['get', 'nonexistent-prop']]>().toExtend<ExpressionSpecification>();
        });
    });
    describe('"==" expression', () => {
        test('type accepts expression which compares expression input against literal input', () => {
            expectTypeOf<['==', ['get', 'MILITARYAIRPORT'], 1]>().toExtend<ExpressionSpecification>();
        });
        test('type accepts expression which compares against literal null value', () => {
            expectTypeOf<['==', null, ['get', 'nonexistent-prop']]>().toExtend<ExpressionSpecification>();
        });
    });
    describe('"<" expression', () => {
        test('type rejects boolean input', () => {
            expectTypeOf<['<', -1, true]>().not.toExtend<ExpressionSpecification>();
        });
    });
    describe('"<=" expression', () => {
        test('type rejects boolean input', () => {
            expectTypeOf<['<=', 0, true]>().not.toExtend<ExpressionSpecification>();
        });
    });
    describe('">" expression', () => {
        test('type rejects boolean input', () => {
            expectTypeOf<['>', 1, true]>().not.toExtend<ExpressionSpecification>();
        });
    });
    describe('">=" expression', () => {
        test('type rejects boolean input', () => {
            expectTypeOf<['>=', 1, true]>().not.toExtend<ExpressionSpecification>();
        });
    });
});

describe('"any" expression', () => {
    test('type accepts expression which has no arguments', () => {
        expectTypeOf<['any']>().toExtend<ExpressionSpecification>();
    });
});

describe('"case" expression', () => {
    test('type accepts expression which returns the string output of the first matching condition', () => {
        expectTypeOf<[
            'case',
            ['==', ['get', 'CAPITAL'], 1], 'city-capital',
            ['>=', ['get', 'POPULATION'], 1000000], 'city-1M',
            ['>=', ['get', 'POPULATION'], 500000], 'city-500k',
            ['>=', ['get', 'POPULATION'], 100000], 'city-100k',
            'city',
        ]>().toExtend<ExpressionSpecification>();
    });
    test('type accepts expression which returns the evaluated output of the first matching condition', () => {
        expectTypeOf<[
            'case',
            ['has', 'point_count'], ['interpolate', ['linear'], ['get', 'point_count'], 2, '#ccc', 10, '#444'],
            ['has', 'priorityValue'], ['interpolate', ['linear'], ['get', 'priorityValue'], 0, '#ff9', 1, '#f66'],
            '#fcaf3e',
        ]>().toExtend<ExpressionSpecification>();
    });
    test('type accepts expression which has literal null output', () => {
        expectTypeOf<['case', false, ['get', 'prop'], true, null, 'fallback']>().toExtend<ExpressionSpecification>();
    });
    test('type accepts expression which has literal null fallback', () => {
        expectTypeOf<['case', false, ['get', 'prop'], null]>().toExtend<ExpressionSpecification>();
    });
});

describe('"match" expression', () => {
    test('type requires label to be string literal, number literal, string literal array, or number literal array', () => {
        expectTypeOf<['match', 4, true, 'matched', 'fallback']>().not.toExtend<ExpressionSpecification>();
        expectTypeOf<['match', 4, [true], 'matched', 'fallback']>().not.toExtend<ExpressionSpecification>();
        expectTypeOf<['match', 4, [4, '4'], 'matched', 'fallback']>().not.toExtend<ExpressionSpecification>();
        expectTypeOf<['match', 4, ['literal', [4]], 'matched', 'fallback']>().not.toExtend<ExpressionSpecification>();
    });
    test('type accepts expression which matches number input against number label', () => {
        expectTypeOf<['match', 2, [0], 'o1', 1, 'o2', 2, 'o3', 'fallback']>().toExtend<ExpressionSpecification>();
    });
    test('type accepts expression which matches string input against string label', () => {
        expectTypeOf<['match', 'c', 'a', 'o1', ['b'], 'o2', 'c', 'o3', 'fallback']>().toExtend<ExpressionSpecification>();
    });
    test('type accepts expression which matches number input against number array label', () => {
        expectTypeOf<['match', 2, 0, 'o1', [1, 2, 3], 'o2', 'fallback']>().toExtend<ExpressionSpecification>();
    });
    test('type accepts expression which matches string input against string array label', () => {
        expectTypeOf<['match', 'c', 'a', 'o1', ['b', 'c', 'd'], 'o2', 'fallback']>().toExtend<ExpressionSpecification>();
    });
    test('type accepts expression which has a non-literal input', () => {
        expectTypeOf<['match', ['get', 'TYPE'], ['ADIZ', 'AMA', 'AWY'], true, false]>().toExtend<ExpressionSpecification>();
    });
    test('type accepts expression which has an expression output', () => {
        expectTypeOf<['match', ['get', 'id'], 'exampleID', ['get', 'iconNameFocused'], ['get', 'iconName']]>().toExtend<ExpressionSpecification>();
    });
    test('type accepts expression which has literal null output', () => {
        expectTypeOf<['match', 1, 0, ['get', 'prop'], 1, null, 'fallback']>().toExtend<ExpressionSpecification>();
    });
});

describe('"within" expression', () => {
    test('type requires a GeoJSON input', () => {
        expectTypeOf<['within']>().not.toExtend<ExpressionSpecification>();
    });
    test('type rejects an expression as input', () => {
        expectTypeOf<['within', ['literal', {type: 'Polygon'; coordinates: []}]]>().not.toExtend<ExpressionSpecification>();
    });
    test('type rejects a second argument', () => {
        expectTypeOf<['within', {type: 'Polygon'; coordinates: []}, 'second arg']>().not.toExtend<ExpressionSpecification>();
    });
    test('type accepts expression which checks if feature fully contained within input GeoJSON geometry', () => {
        expectTypeOf<['within', {
            type: 'Polygon';
            coordinates: [[[0, 0], [0, 5], [5, 5], [5, 0], [0, 0]]];
        }]>().toExtend<ExpressionSpecification>();
    });
});

describe('interpolation expressions', () => {
    describe('linear interpolation type', () => {
        test('type works with "interpolate" expression', () => {
            expectTypeOf<['interpolate', ['linear'], ['zoom'], 0, 10, 1, 20]>().toExtend<ExpressionSpecification>();
        });
    });

    describe('exponential interpolation type', () => {
        test('type requires a number literal as the base argument', () => {
            expectTypeOf<['interpolate', ['exponential', ['+', 0.1, 0.4]], ['zoom'], 0, 10, 1, 100]>().not.toExtend<ExpressionSpecification>();
        });
        test('type works with "interpolate" expression', () => {
            expectTypeOf<['interpolate', ['exponential', 1.1], ['zoom'], 0, 10, 1, 20]>().toExtend<ExpressionSpecification>();
        });
    });

    describe('cubic-bezier interpolation type', () => {
        test('type requires four numeric literal control point arguments', () => {
            expectTypeOf<['interpolate', ['cubic-bezier', 0.4, 0, ['literal', 0.6], 1], ['zoom'], 2, 0, 8, 100]>().not.toExtend<ExpressionSpecification>();
        });
        test('type rejects a fifth control point argument', () => {
            expectTypeOf<['interpolate', ['cubic-bezier', 0.4, 0, 0.6, 1, 0.8], ['zoom'], 2, 0, 8, 100]>().not.toExtend<ExpressionSpecification>();
        });
        test('type works with "interpolate" expression', () => {
            expectTypeOf<['interpolate', ['cubic-bezier', 0.4, 0, 0.6, 1], ['zoom'], 0, 0, 10, 100]>().toExtend<ExpressionSpecification>();
        });
    });

    describe('"interpolate" expression', () => {
        test('type requires stop outputs to be a number, color, number array, color array, or projection', () => {
            expectTypeOf<['interpolate', ['linear'], ['zoom'], 0, false, 2, 1024]>().not.toExtend<ExpressionSpecification>();
            expectTypeOf<['interpolate', ['linear'], ['zoom'], 0, [10, 20, 30], 0.5, [20, 30, 40], 1, [30, 40, 50]]>().not.toExtend<ExpressionSpecification>();
            expectTypeOf<['interpolate', ['linear'], ['zoom'], 0, {prop: 'foo'}, 2, {prop: 'bar'}]>().not.toExtend<ExpressionSpecification>();
        });
        test('type accepts expression which interpolates with feature property input', () => {
            expectTypeOf<['interpolate', ['linear'], ['get', 'point_count'], 2, ['/', 2, ['get', 'point_count']], 10, ['*', 4, ['get', 'point_count']]]>().toExtend<ExpressionSpecification>();
        });
        test('type accepts expression which interpolates between number outputs', () => {
            expectTypeOf<['interpolate', ['linear'], ['zoom'], 0, 0, 0.5, ['*', 2, 5], 1, 100]>().toExtend<ExpressionSpecification>();
        });
        test('type accepts expression which interpolates between color outputs', () => {
            expectTypeOf<['interpolate', ['linear'], ['zoom'], 2, 'white', 4, 'black']>().toExtend<ExpressionSpecification>();
        });
        test('type accepts expression which interpolates between number array outputs', () => {
            expectTypeOf<['interpolate', ['linear'], ['zoom'], 8, ['literal', [2, 3]], 10, ['literal', [4, 5]]]>().toExtend<ExpressionSpecification>();
        });
        test('type accepts expression which interpolates between color array outputs', () => {
            expectTypeOf<['interpolate', ['linear'], ['zoom'], 8, ['literal', ['white', 'black']], 10, ['literal', ['black', 'white']]]>().toExtend<ExpressionSpecification>();
        });
        test('type accepts expression which interpolates between projection outputs', () => {
            expectTypeOf<['interpolate', ['linear'], ['zoom'], 8, 'vertical-perspective', 10, 'mercator']>().toExtend<ExpressionSpecification>();
        });
    });

    describe('"interpolate-hcl" expression', () => {
        test('type requires stop outputs to be a color', () => {
            expectTypeOf<['interpolate-hcl', ['linear'], ['zoom'], 0, false, 2, 1024]>().not.toExtend<ExpressionSpecification>();
            expectTypeOf<['interpolate-hcl', ['linear'], ['zoom'], 0, [10, 20, 30], 0.5, [20, 30, 40], 1, [30, 40, 50]]>().not.toExtend<ExpressionSpecification>();
            expectTypeOf<['interpolate-hcl', ['linear'], ['zoom'], 0, {prop: 'foo'}, 2, {prop: 'bar'}]>().not.toExtend<ExpressionSpecification>();
        });
        test('type accepts expression which interpolates between color outputs', () => {
            expectTypeOf<['interpolate-hcl', ['linear'], ['zoom'], 2, 'white', 4, 'black']>().toExtend<ExpressionSpecification>();
        });
        test('type accepts expression which interpolates between color array outputs', () => {
            expectTypeOf<['interpolate-hcl', ['linear'], ['zoom'], 8, ['literal', ['white', 'black']], 10, ['literal', ['black', 'white']]]>().toExtend<ExpressionSpecification>();
        });
        test('type accepts expression which interpolates between non-literal color array outputs', () => {
            // eslint-disable-next-line
            const obj = {'colors-8': ['white', 'black'], 'colors-10': ['black', 'white']};
            expectTypeOf<['interpolate-hcl', ['linear'], ['zoom'], 8, ['get', 'colors-8', ['literal', typeof obj]], 10, ['get', 'colors-10', ['literal', typeof obj]]]>().toExtend<ExpressionSpecification>();
        });
    });

    describe('"interpolate-lab" expression', () => {
        test('type requires stop outputs to be a color', () => {
            expectTypeOf<['interpolate-lab', ['linear'], ['zoom'], 0, false, 2, 1024]>().not.toExtend<ExpressionSpecification>();
            expectTypeOf<['interpolate-lab', ['linear'], ['zoom'], 0, [10, 20, 30], 0.5, [20, 30, 40], 1, [30, 40, 50]]>().not.toExtend<ExpressionSpecification>();
            expectTypeOf<['interpolate-lab', ['linear'], ['zoom'], 0, {prop: 'foo'}, 2, {prop: 'bar'}]>().not.toExtend<ExpressionSpecification>();
        });
        test('type accepts expression which interpolates between color outputs', () => {
            expectTypeOf<['interpolate-lab', ['linear'], ['zoom'], 2, 'white', 4, 'black']>().toExtend<ExpressionSpecification>();
        });
        test('type accepts expression which interpolates between color array outputs', () => {
            expectTypeOf<['interpolate-lab', ['linear'], ['zoom'], 8, ['literal', ['white', 'black']], 10, ['literal', ['black', 'white']]]>().toExtend<ExpressionSpecification>();
        });
        test('type accepts expression which interpolates between non-literal color array outputs', () => {
            // eslint-disable-next-line
            const obj = {'colors-8': ['white', 'black'], 'colors-10': ['black', 'white']};
            expectTypeOf<['interpolate-lab', ['linear'], ['zoom'], 8, ['get', 'colors-8', ['literal', typeof obj]], 10, ['get', 'colors-10', ['literal', typeof obj]]]>().toExtend<ExpressionSpecification>();
        });
    });
});

describe('"step" expression', () => {
    test('type accepts expression which outputs stepped numbers', () => {
        expectTypeOf<['step', ['get', 'point_count'], 0.6, 50, 0.7, 200, 0.8]>().toExtend<ExpressionSpecification>();
    });
    test('type accepts expression which outputs stepped colors', () => {
        expectTypeOf<['step', ['get', 'point_count'], '#ddd', 50, '#eee', 200, '#fff']>().toExtend<ExpressionSpecification>();
    });
    test('type accepts expression which outputs stepped projections', () => {
        expectTypeOf<['step', ['zoom'], 'vertical-perspective', 10, 'mercator']>().toExtend<ExpressionSpecification>();
    });
    test('type accepts expression which outputs stepped multi-input projections', () => {
        expectTypeOf<['step', ['zoom'], ['literal', ['vertical-perspective', 'mercator', 0.5]], 10, 'mercator']>().toExtend<ExpressionSpecification>();
    });
});

describe('"e" expression', () => {
    test('type rejects any arguments', () => {
        expectTypeOf<['e', 2]>().not.toExtend<ExpressionSpecification>();
    });
    test('type accepts expression which returns the mathematical constant e', () => {
        expectTypeOf<['e']>().toExtend<ExpressionSpecification>();
    });
});

describe('nonexistent operators', () => {
    test('ExpressionSpecification type does not contain "ExpressionSpecification" expression', () => {
        type ExpressionSpecificationExpression = Extract<ExpressionSpecification, ['ExpressionSpecification', ...any[]]>;
        expectTypeOf<ExpressionSpecificationExpression>().not.toExtend<ExpressionSpecification>();
    });
});

test('ExpressionSpecification type supports common variable insertion patterns', () => {
    // Checks the ability for the ExpressionSpecification type to allow arguments to be provided via constants (as opposed to in-line).
    // As in most cases the styling is read from JSON, these are rather optional tests.
    // eslint-disable-next-line
    const colorStops = [0, 'red', 0.5, 'green', 1, 'blue'];
    expectTypeOf<[
        'interpolate',
        ['linear'],
        ['line-progress'],
        ...typeof colorStops
    ]>().toExtend<ExpressionSpecification>();
    expectTypeOf<[
        'interpolate-hcl',
        ['linear'],
        ['line-progress'],
        ...typeof colorStops
    ]>().toExtend<ExpressionSpecification>();
    expectTypeOf<[
        'interpolate-lab',
        ['linear'],
        ['line-progress'],
        ...typeof colorStops
    ]>().toExtend<ExpressionSpecification>();
    // eslint-disable-next-line
    const [firstOutput, ...steps] = ['#df2d43', 50, '#df2d43', 200, '#df2d43'];
    expectTypeOf<['step', ['get', 'point_count'], typeof firstOutput, ...typeof steps]>().toExtend<ExpressionSpecification>();
    // eslint-disable-next-line
    const strings = ['first', 'second', 'third'];
    expectTypeOf<['concat', ...typeof strings]>().toExtend<ExpressionSpecification>();
    // eslint-disable-next-line
    const values: (ExpressionInputType | ExpressionSpecification)[] = [['get', 'name'], ['get', 'code'], 'NONE']; // type is necessary!
    expectTypeOf<['coalesce', ...typeof values]>().toExtend<ExpressionSpecification>();
});
