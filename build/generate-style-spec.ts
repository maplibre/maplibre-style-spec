import {writeFileSync} from 'fs';
import spec from '../src/reference/v8.json' with {type: 'json'};
import {supportsPropertyExpression, supportsZoomExpression} from '../src/util/properties';
import {formatJSON} from './util';

function jsDocComment(property) {
    const lines = [];
    if (property.doc) {
        lines.push(...property.doc.split('\n'));
    }
    if (property.default) {
        if (lines.length) {
            lines.push('');
        }
        lines.push(...jsDocBlock('default', property.default).split('\n'));
    }
    if (property.example) {
        if (lines.length) {
            lines.push('');
        }
        lines.push(...jsDocBlock('example', property.example).split('\n'));
    }

    if (!lines.length) {
        return undefined;
    }
    return [
        '/**',
        ...lines.map(line => ` * ${line}`),
        ' */',
    ].join('\n');
}

function jsDocBlock(tag, value) {
    return `@${tag}
\`\`\`json
${formatJSON(value)}
\`\`\``;
}

function unionType(values) {
    if (Array.isArray(values)) {
        return values.map(v => JSON.stringify(v)).join(' | ');
    } else {
        return Object.keys(values).map(v => JSON.stringify(v)).join(' | ');
    }
}

function propertyType(property) {
    if (typeof property.type === 'function') {
        return property.type();
    }

    const baseType = (() => {
        switch (property.type) {
            case 'string':
            case 'number':
            case 'boolean':
                return property.type;
            case 'enum':
                return unionType(property.values);
            case 'array': {
                const elementType = propertyType(typeof property.value === 'string' ? {type: property.value, values: property.values} : property.value);
                if (property.length) {
                    return `[${Array(property.length).fill(elementType).join(', ')}]`;
                } else {
                    return `Array<${elementType}>`;
                }
            }
            case 'light':
                return 'LightSpecification';
            case 'sky':
                return 'SkySpecification';
            case 'sources':
                return '{[_: string]: SourceSpecification}';
            case 'projection:':
                return 'ProjectionSpecification';
            case 'state':
                return 'StateSpecification';
            case 'numberArray':
                return 'NumberArraySpecification';
            case 'colorArray':
                return 'ColorArraySpecification';
            case '*':
                return 'unknown';
            default:
                return `${property.type.slice(0, 1).toUpperCase()}${property.type.slice(1)}Specification`;
        }
    })();

    if (supportsPropertyExpression(property)) {
        return `DataDrivenPropertyValueSpecification<${baseType}>`;
    } else if (supportsZoomExpression(property)) {
        return `PropertyValueSpecification<${baseType}>`;
    } else if (property.expression) {
        return 'ExpressionSpecification';
    } else {
        return baseType;
    }
}

function propertyDeclaration(key, property) {
    const jsDoc = jsDocComment(property);
    const declaration = `"${key}"${property.required ? '' : '?'}: ${propertyType(property)}`;
    return jsDoc ? [jsDoc, declaration].join('\n') : declaration;
}

function transitionPropertyDeclaration(key) {
    return `"${key}-transition"?: TransitionSpecification`;
}

function objectDeclaration(key, properties) {
    return `export type ${key} = ${objectType(properties, '')};`;
}

function objectType(properties, indent) {
    return `{
${Object.keys(properties)
    .filter(k => k !== '*')
    .flatMap(k => {
        const declarations = [propertyDeclaration(k, properties[k])];
        if (properties[k].transition) {
            declarations.push(transitionPropertyDeclaration(k));
        }
        return declarations;
    })
    .map(declaration => {
        return declaration
            .split('\n')
            .map(line => `    ${indent}${line}`)
            .join('\n');
    })
    .join(',\n')}
${indent}}`;
}

function sourceTypeName(key) {
    return key.replace(/source_(.)(.*)/, (_, _1, _2) => `${_1.toUpperCase()}${_2}SourceSpecification`)
        .replace(/_dem/, 'DEM')
        .replace(/Geojson/, 'GeoJSON');
}

function layerTypeName(key) {
    return key.split('-').map(k => k.replace(/(.)(.*)/, (_, _1, _2) => `${_1.toUpperCase()}${_2}`)).concat('LayerSpecification').join('');
}

function layerType(key) {
    const layer = spec.layer as any;

    layer.type = {
        type: 'enum',
        values: [key],
        required: true
    };

    delete layer.ref;
    delete layer['paint.*'];

    layer.paint.type = () => {
        return objectType(spec[`paint_${key}`], '    ');
    };

    layer.layout.type = () => {
        return objectType(spec[`layout_${key}`], '    ');
    };

    if (key === 'background') {
        delete layer.source;
        delete layer['source-layer'];
        delete layer.filter;
    } else {
        layer.source.required = true;
    }

    return objectDeclaration(layerTypeName(key), layer);
}

const layerTypes = Object.keys(spec.layer.type.values);

writeFileSync('src/types.g.ts',
    `// Generated code; do not edit. Edit build/generate-style-spec.ts instead.
/* eslint-disable */

export type ColorSpecification = string;

export type ProjectionDefinitionT = [string, string, number];
export type ProjectionDefinitionSpecification = string | ProjectionDefinitionT | PropertyValueSpecification<ProjectionDefinitionT>

export type PaddingSpecification = number | number[];
export type NumberArraySpecification = number | number[];
export type ColorArraySpecification = string | string[];

export type VariableAnchorOffsetCollectionSpecification = Array<string | [number, number]>;

export type SpriteSpecification = string | {id: string; url: string}[];

export type FormattedSpecification = string;

export type ResolvedImageSpecification = string;

export type PromoteIdSpecification = {[_: string]: string} | string;

export type ExpressionInputType = string | number | boolean;

export type CollatorExpressionSpecification =
    ['collator', {
        'case-sensitive'?: boolean | ExpressionSpecification,
        'diacritic-sensitive'?: boolean | ExpressionSpecification,
        locale?: string | ExpressionSpecification}
    ]; // collator

export type InterpolationSpecification =
    | ['linear']
    | ['exponential', number]
    | ['cubic-bezier', number, number, number, number]

export type ExpressionSpecification =
    // types
    | ['array', ExpressionSpecification] // array
    | ['array', 'string' | 'number' | 'boolean', ExpressionSpecification] // array
    | ['array', 'string' | 'number' | 'boolean', number, ExpressionSpecification] // array
    | ['boolean', unknown | ExpressionSpecification, ...(unknown | ExpressionSpecification)[]] // boolean
    | CollatorExpressionSpecification
    | ['format', ...(string | ['image', ExpressionSpecification] | ExpressionSpecification | {'font-scale'?: number | ExpressionSpecification, 'text-font'?: ExpressionSpecification, 'text-color'?: ColorSpecification | ExpressionSpecification, 'vertical-align'?: 'bottom' | 'center' | 'top'})[]] // string
    | ['image', string | ExpressionSpecification] // image
    | ['literal', unknown]
    | ['number', unknown | ExpressionSpecification, ...(unknown | ExpressionSpecification)[]] // number
    | ['number-format', number | ExpressionSpecification, {'locale'?: string | ExpressionSpecification, 'currency'?: string | ExpressionSpecification, 'min-fraction-digits'?: number | ExpressionSpecification, 'max-fraction-digits'?: number | ExpressionSpecification}] // string
    | ['object', unknown | ExpressionSpecification, ...(unknown | ExpressionSpecification)[]] // object
    | ['string', unknown | ExpressionSpecification, ...(unknown | ExpressionSpecification)[]] // string
    | ['to-boolean', unknown | ExpressionSpecification] // boolean
    | ['to-color', unknown | ExpressionSpecification, ...(unknown | ExpressionSpecification)[]] // color
    | ['to-number', unknown | ExpressionSpecification, ...(unknown | ExpressionSpecification)[]] // number
    | ['to-string', unknown | ExpressionSpecification] // string
    | ['typeof', unknown | ExpressionSpecification] // string
    // feature data
    | ['accumulated']
    | ['feature-state', string | ExpressionSpecification]
    | ['geometry-type'] // string
    | ['id']
    | ['line-progress'] // number
    | ['properties'] // object
    // lookup
    | ['at', number | ExpressionSpecification, ExpressionSpecification]
    | ['get', string | ExpressionSpecification, ExpressionSpecification?]
    | ['global-state', string]
    | ['has', string | ExpressionSpecification, ExpressionSpecification?]
    | ['in', null | ExpressionInputType | ExpressionSpecification, string | ExpressionSpecification]
    | ['index-of', null | ExpressionInputType | ExpressionSpecification, string | ExpressionSpecification, (number | ExpressionSpecification)?] // number
    | ['length', string | ExpressionSpecification]
    | ['slice', string | ExpressionSpecification, number | ExpressionSpecification, (number | ExpressionSpecification)?]
    // Decision
    | ['!', boolean | ExpressionSpecification] // boolean
    | ['!=', null | ExpressionInputType | ExpressionSpecification, null | ExpressionInputType | ExpressionSpecification, CollatorExpressionSpecification?] // boolean
    | ['<', string | number | ExpressionSpecification, string | number | ExpressionSpecification, CollatorExpressionSpecification?] // boolean
    | ['<=', string | number | ExpressionSpecification, string | number | ExpressionSpecification, CollatorExpressionSpecification?] // boolean
    | ['==', null | ExpressionInputType | ExpressionSpecification, null | ExpressionInputType | ExpressionSpecification, CollatorExpressionSpecification?] // boolean
    | ['>', string | number | ExpressionSpecification, string | number | ExpressionSpecification, CollatorExpressionSpecification?] // boolean
    | ['>=', string | number | ExpressionSpecification, string | number | ExpressionSpecification, CollatorExpressionSpecification?] // boolean
    | ['all', ...(boolean | ExpressionSpecification)[]] // boolean
    | ['any', ...(boolean | ExpressionSpecification)[]] // boolean
    | ['case', boolean | ExpressionSpecification, null | ExpressionInputType | ExpressionSpecification,
        ...(boolean | null | ExpressionInputType | ExpressionSpecification)[], null | ExpressionInputType | ExpressionSpecification]
    | ['coalesce', ...(ExpressionInputType | ExpressionSpecification)[]] // at least two inputs required
    | ['match', string | number | ExpressionSpecification,
        string | number | string[] | number[], null | ExpressionInputType | ExpressionSpecification,
        ...(string | number | string[] | number[] | null | ExpressionInputType | ExpressionSpecification)[], // repeated as above
        null | ExpressionInputType | ExpressionSpecification]
    | ['within', GeoJSON.GeoJSON]
    // Ramps, scales, curves
    | ['interpolate', InterpolationSpecification, number | ExpressionSpecification,
        ...(number | ColorSpecification | ExpressionSpecification | ProjectionDefinitionSpecification)[]] // alternating number and number | ColorSpecification | ExpressionSpecification | ProjectionDefinitionSpecification
    | ['interpolate-hcl', InterpolationSpecification, number | ExpressionSpecification,
        ...(number | ColorSpecification | ExpressionSpecification)[]] // alternating number and ColorSpecificaton | ExpressionSpecification
    | ['interpolate-lab', InterpolationSpecification, number | ExpressionSpecification,
        ...(number | ColorSpecification | ExpressionSpecification)[]] // alternating number and ColorSpecification | ExpressionSpecification
    | ['step', number | ExpressionSpecification, ExpressionInputType | ExpressionSpecification,
        ...(number | ExpressionInputType | ExpressionSpecification)[]] // alternating number and ExpressionInputType | ExpressionSpecification
    // Variable binding
    | ['let', string, ExpressionInputType | ExpressionSpecification, ...(string | ExpressionInputType | ExpressionSpecification)[]]
    | ['var', string]
    // String
    | ['concat', ...(ExpressionInputType | ExpressionSpecification)[]] // at least two inputs required -> string
    | ['downcase', string | ExpressionSpecification] // string
    | ['is-supported-script', string | ExpressionSpecification] // boolean
    | ['resolved-locale', CollatorExpressionSpecification] // string
    | ['upcase', string | ExpressionSpecification] // string
    // Color
    | ['rgb', number | ExpressionSpecification, number | ExpressionSpecification, number | ExpressionSpecification] // color
    | ['rgba', number | ExpressionSpecification, number | ExpressionSpecification, number | ExpressionSpecification, number | ExpressionSpecification]
    | ['to-rgba', ColorSpecification | ExpressionSpecification]
    // Math
    | ['-', number | ExpressionSpecification, (number | ExpressionSpecification)?] // number
    | ['*', number | ExpressionSpecification, number | ExpressionSpecification, ...(number | ExpressionSpecification)[]] // number
    | ['/', number | ExpressionSpecification, number | ExpressionSpecification] // number
    | ['%', number | ExpressionSpecification, number | ExpressionSpecification] // number
    | ['^', number | ExpressionSpecification, number | ExpressionSpecification] // number
    | ['+', ...(number | ExpressionSpecification)[]] // at least two inputs required -> number
    | ['abs', number | ExpressionSpecification] // number
    | ['acos', number | ExpressionSpecification] // number
    | ['asin', number | ExpressionSpecification] // number
    | ['atan', number | ExpressionSpecification] // number
    | ['ceil', number | ExpressionSpecification] // number
    | ['cos', number | ExpressionSpecification] // number
    | ['distance', GeoJSON.GeoJSON] // number
    | ['e'] // number
    | ['floor', number | ExpressionSpecification] // number
    | ['ln', number | ExpressionSpecification] // number
    | ['ln2'] // number
    | ['log10', number | ExpressionSpecification] // number
    | ['log2', number | ExpressionSpecification] // number
    | ['max', number | ExpressionSpecification, ...(number | ExpressionSpecification)[]] // number
    | ['min', number | ExpressionSpecification, ...(number | ExpressionSpecification)[]] // number
    | ['pi'] // number
    | ['round', number | ExpressionSpecification] // number
    | ['sin', number | ExpressionSpecification] // number
    | ['sqrt', number | ExpressionSpecification] // number
    | ['tan', number | ExpressionSpecification] // number
    // Zoom
    | ['zoom'] // number
    // Heatmap
    | ['heatmap-density'] // number
    // Elevation
    | ['elevation'] // number
    // Global state
    | ['global-state', string] // unknown

export type ExpressionFilterSpecification = boolean | ExpressionSpecification

export type LegacyFilterSpecification =
    // Existential
    | ['has', string]
    | ['!has', string]
    // Comparison
    | ['==', string, string | number | boolean]
    | ['!=', string, string | number | boolean]
    | ['>', string, string | number | boolean]
    | ['>=', string, string | number | boolean]
    | ['<', string, string | number | boolean]
    | ['<=', string, string | number | boolean]
    // Set membership
    | ['in', string, ...(string | number | boolean)[]]
    | ['!in', string, ...(string | number | boolean)[]]
    // Combining
    | ['all', ...LegacyFilterSpecification[]]
    | ['any', ...LegacyFilterSpecification[]]
    | ['none', ...LegacyFilterSpecification[]]

export type FilterSpecification = ExpressionFilterSpecification | LegacyFilterSpecification

export type TransitionSpecification = {
    duration?: number,
    delay?: number
};

// Note: doesn't capture interpolatable vs. non-interpolatable types.

export type CameraFunctionSpecification<T> =
      { type: 'exponential', stops: Array<[number, T]> }
    | { type: 'interval',    stops: Array<[number, T]> };

export type SourceFunctionSpecification<T> =
      { type: 'exponential', stops: Array<[number, T]>, property: string, default?: T }
    | { type: 'interval',    stops: Array<[number, T]>, property: string, default?: T }
    | { type: 'categorical', stops: Array<[string | number | boolean, T]>, property: string, default?: T }
    | { type: 'identity', property: string, default?: T };

export type CompositeFunctionSpecification<T> =
      { type: 'exponential', stops: Array<[{zoom: number, value: number}, T]>, property: string, default?: T }
    | { type: 'interval',    stops: Array<[{zoom: number, value: number}, T]>, property: string, default?: T }
    | { type: 'categorical', stops: Array<[{zoom: number, value: string | number | boolean}, T]>, property: string, default?: T };

export type PropertyValueSpecification<T> =
      T
    | CameraFunctionSpecification<T>
    | ExpressionSpecification;

export type DataDrivenPropertyValueSpecification<T> =
      T
    | CameraFunctionSpecification<T>
    | SourceFunctionSpecification<T>
    | CompositeFunctionSpecification<T>
    | ExpressionSpecification;

export type SchemaSpecification = {
    default?: unknown
};

// State
export type StateSpecification = Record<string, SchemaSpecification>;

export type FontFace = string | {
    url: string,
    "unicode-range"?: string[]
};

export type FontFacesSpecification = Record<string, FontFace>;

${objectDeclaration('StyleSpecification', spec.$root)}

${objectDeclaration('LightSpecification', spec.light)}

${objectDeclaration('SkySpecification', spec.sky)}

${objectDeclaration('ProjectionSpecification', spec.projection)}

${objectDeclaration('TerrainSpecification', spec.terrain)}

${spec.source.map(key => {
    let str = objectDeclaration(sourceTypeName(key), spec[key]);
    if (sourceTypeName(key) === 'GeoJSONSourceSpecification') {
        // This is done in order to overcome the type system's inability to express this type:
        str = str.replace(/unknown/, 'GeoJSON.GeoJSON | string');
    }
    return str;
}).join('\n\n')}

export type SourceSpecification =
${spec.source.map(key => `    | ${sourceTypeName(key)}`).join('\n')}

${layerTypes.map(key => layerType(key)).join('\n\n')}

export type LayerSpecification =
${layerTypes.map(key => `    | ${layerTypeName(key)}`).join('\n')};

`);
