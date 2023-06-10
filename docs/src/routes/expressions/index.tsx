import ExpressionReference from '~/expression/expression-reference';
import {Markdown} from '~/components/markdown/markdown';

function Expressions() {

    return (
        <div>
            <Markdown content={`
# Expressions

The value for any [layout property](${import.meta.env.BASE_URL}layers/#layout-property), [paint property](${import.meta.env.BASE_URL}layers/#paint-property), or [filter](${import.meta.env.BASE_URL}layers/#filter) may be specified as an _expression_. An expression defines a formula for computing the value of the property using the _operators_ described below. The set of expression operators provided by MapLibre includes:

- Mathematical operators for performing arithmetic and other operations on numeric values
- Logical operators for manipulating boolean values and making conditional decisions
- String operators for manipulating strings
- Data operators, providing access to the properties of source features
- Camera operators, providing access to the parameters defining the current map view

Expressions are represented as JSON arrays. The first element of an expression array is a string naming the expression operator, e.g. [\`"*"\`](#*) or [\`"case"\`](#case). Elements that follow (if any) are the _arguments_ to the expression. Each argument is either a literal value (a string, number, boolean, or \`null\`), or another expression array.

\`\`\`json
[expression_name, argument_0, argument_1, ...]
\`\`\`

## Data expressions

A _data expression_ is any expression that access feature data -- that is, any expression that uses one of the data operators: [\`get\`](#get), [\`has\`](#has), [\`id\`](#id), [\`geometry-type\`](#geometry-type), [\`properties\`](#properties), or [\`feature-state\`](#feature-state). Data expressions allow a feature's properties or state to determine its appearance. They can be used to differentiate features within the same layer and to create data visualizations.

\`\`\`json
{
    "circle-color": [
        "rgb",
        // red is higher when feature.properties.temperature is higher
        ["get", "temperature"],
        // green is always zero
        0,
        // blue is higher when feature.properties.temperature is lower
        ["-", 100, ["get", "temperature"]]
    ]
}
\`\`\`

This example uses the [\`get\`](#get) operator to get the \`temperature\` value of each feature. That value is used to compute arguments to the [\`rgb\`](#rgb) operator, defining a color in terms of its red, green, and blue components.

Data expressions are allowed as the value of the [\`filter\`](${import.meta.env.BASE_URL}layers/#filter) property, and as values for most paint and layout properties. However, some paint and layout properties do not yet support data expressions. The level of support is indicated by the "data-driven styling" row of the "SDK Support" table for each property. Data expressions with the [\`feature-state\`](#feature-state) operator are allowed only on paint properties.



## Camera expressions

A _camera expression_ is any expression that uses the [\`zoom\`](#zoom) operator. Such expressions allow the appearance of a layer to change with the map's zoom level. Camera expressions can be used to create the appearance of depth and to control data density.

\`\`\`json
{
    "circle-radius": [
        "interpolate", ["linear"], ["zoom"],
        // zoom is 5 (or less) -> circle radius will be 1px
        5, 1,
        // zoom is 10 (or greater) -> circle radius will be 5px
        10, 5
    ]
}
\`\`\`

This example uses the [\`interpolate\`](#interpolate) operator to define a linear relationship between zoom level and circle size using a set of input-output pairs. In this case, the expression indicates that the circle radius should be 1 pixel when the zoom level is 5 or below, and 5 pixels when the zoom is 10 or above. Between the two zoom levels, the circle radius will be linearly interpolated between 1 and 5 pixels

Camera expressions are allowed anywhere an expression may be used. When a camera expression used as the value of a layout or paint property, it must be in one of the following forms:

\`\`\`json
[ "interpolate", interpolation, ["zoom"], ... ]
\`\`\`

Or:

\`\`\`json
[ "step", ["zoom"], ... ]
\`\`\`

Or:

\`\`\`json
[
    "let",
    ... variable bindings...,
    [ "interpolate", interpolation, ["zoom"], ... ]
]
\`\`\`

Or:

\`\`\`json
[
    "let",
    ... variable bindings...,
    [ "step", ["zoom"], ... ]
]
\`\`\`

That is, in layout or paint properties, \`["zoom"]\` may appear only as the input to an outer [\`interpolate\`](#interpolate) or [\`step\`](#step) expression, or such an expression within a [\`let\`](#let) expression.

There is an important difference between layout and paint properties in the timing of camera expression evaluation. Paint property camera expressions are re-evaluated whenever the zoom level changes, even fractionally. For example, a paint property camera expression will be re-evaluated continuously as the map moves between zoom levels 4.1 and 4.6. A _layout property_ camera expression is evaluated only at integer zoom levels. It will _not_ be re-evaluated as the zoom changes from 4.1 to 4.6 -- only if it goes above 5 or below 4.

## Composition

A single expression may use a mix of data operators, camera operators, and other operators. Such composite expressions allows a layer's appearance to be determined by a combination of the zoom level _and_ individual feature properties.

\`\`\`json
{
    "circle-radius": [
        "interpolate", ["linear"], ["zoom"],
        // when zoom is 0, set each feature's circle radius to the value of its "rating" property
        0, ["get", "rating"],
        // when zoom is 10, set each feature's circle radius to four times the value of its "rating" property
        10, ["*", 4, ["get", "rating"]]
    ]
}
\`\`\`

An expression that uses both data and camera operators is considered both a data expression and a camera expression, and must adhere to the restrictions described above for both.

## Type system

The input arguments to expressions, and their result values, use the same set of [types](#types) as the rest of the style specification: boolean, string, number, color, and arrays of these types. Furthermore, expressions are _type safe_: each use of an expression has a known result type and required argument types, and the SDKs verify that the result type of an expression is appropriate for the context in which it is used. For example, the result type of an expression in the [\`filter\`](${import.meta.env.BASE_URL}layers/#filter) property must be [boolean](#types-boolean), and the arguments to the [\`+\`](#+) operator must be [numbers](#types-number).

When working with feature data, the type of a feature property value is typically not known ahead of time by the SDK. To preserve type safety, when evaluating a data expression, the SDK will check that the property value is appropriate for the context. For example, if you use the expression \`["get", "feature-color"]\` for the [\`circle-color\`](#paint-circle-circle-color) property, the SDK will verify that the \`feature-color\` value of each feature is a string identifying a valid [color](#types-color). If this check fails, an error will be indicated in an SDK-specific way (typically a log message), and the default value for the property will be used instead.


In most cases, this verification will occur automatically wherever it is needed. However, in certain situations, the SDK may be unable to automatically determine the expected result type of a data expression from surrounding context. For example, it is not clear whether the expression \`["&lt;", ["get", "a"], ["get", "b"]]\` is attempting to compare strings or numbers. In situations like this, you can use one of the _type assertion_ expression operators to indicate the expected type of a data expression: \`["&lt;", ["number", ["get", "a"]], ["number", ["get", "b"]]]\`. A type assertion checks that the feature data matches the expected type of the data expression. If this check fails, it produces an error and causes the whole expression to fall back to the default value for the property being defined. The assertion operators are [\`array\`](#types-array), [\`boolean\`](#types-boolean), [\`number\`](#types-number), and [\`string\`](#types-string).

Expressions perform only one kind of implicit type conversion: a data expression used in a context where a [color](#types-color) is expected will convert a string representation of a color to a color value. In all other cases, if you want to convert between types, you must use one of the _type conversion_ expression operators: [\`to-boolean\`](#types-to-boolean), [\`to-number\`](#types-to-number), [\`to-string\`](#types-to-string), or [\`to-color\`](#types-to-color). For example, if you have a feature property that stores numeric values in string format, and you want to use those values as numbers rather than strings, you can use an expression such as \`["to-number", ["get", "property-name"]]\`.

If an expression accepts an array argument and the user supplies an array literal, that array _must_ be wrapped in a \`literal\` expression (see the examples below). When GL-JS encounters an array in a style-spec property value, it will assume that the array is an expression and try to parse it; the library has no way to distinguish between an expression which failed validation and an array literal unless the developer makes this distinction explicit with the \`literal\` operator. The \`literal\` operator is not necessary if the array is returned from a sub-expression, e.g. \`["in", 1, ["get", "myArrayProp"]]\`.

\`\`\`json
// will throw an error
{
    "circle-color": ["in", 1, [1, 2, 3]]
}

// will work as expected
{
    "circle-color": ["in", 1, ["literal", [1, 2, 3]]]
}
\`\`\`

`} />

            <Markdown content={`
## Types

The expressions in this section are for testing for and converting between different data types like strings, numbers, and boolean values.

Often, such tests and conversions are unnecessary, but they may be necessary in some expressions where the type of a certain sub-expression is ambiguous. They can also be useful in cases where your feature data has inconsistent types; for example, you could use \`to-number\` to make sure that values like \`"1.5"\` (instead of \`1.5\`) are treated as numeric values.

`} />

            <ExpressionReference group='Types' />
            <Markdown content='## Feature data' />
            <ExpressionReference group='Feature data' />
            <Markdown content='## Lookup' />

            <ExpressionReference group='Lookup' />
            <Markdown content={`
## Decision

The expressions in this section can be used to add conditional logic to your styles. For example, the [\`'case'\`](#case)  expression provides "if/then/else" logic, and [\`'match'\`](#match) allows you to map specific values of an input expression to different output expressions.
`} />

            <ExpressionReference group='Decision' />

            <Markdown content='## Ramps, scales, curves' />

            <ExpressionReference group='Ramps, scales, curves' />

            <Markdown content='## Variable binding' />

            <ExpressionReference group='Variable binding' />

            <Markdown content='## String' />

            <ExpressionReference group='String' />

            <Markdown content='## Color' />

            <ExpressionReference group='Color' />

            <Markdown content='## Math' />

            <ExpressionReference group='Math' />

            <Markdown content='## Zooming' />

            <ExpressionReference group='Zoom' />

            <Markdown content='## Heatmap' />

            <ExpressionReference group='Heatmap' />

        </div>
    );
}

export default Expressions;
