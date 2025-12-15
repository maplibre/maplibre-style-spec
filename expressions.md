# Expressions

The value for any `layout` property, `paint` property, or `filter` property may be specified as an _expression_. An expression defines a formula for computing the value of the property using the _operators_ described below. The set of expression operators provided by MapLibre includes:

- Mathematical operators for performing arithmetic and other operations on numeric values
- Logical operators for manipulating boolean values and making conditional decisions
- String operators for manipulating strings
- Data operators, providing access to the properties of source features
- Camera operators, providing access to the parameters defining the current map view

Expressions are represented as JSON arrays. The first element of an expression array is a string naming the expression operator, e.g. `"*"` or [`"case"`](#case). Elements that follow (if any) are the _arguments_ to the expression. Each argument is either a literal value (a string, number, boolean, or `null`), or another expression array.

```json
[expression_name, argument_0, argument_1, ...]
```

## Data expressions

A _data expression_ is any expression that access feature data -- that is, any expression that uses one of the data operators: [`get`](#get), [`has`](#has), [`id`](#id), [`geometry-type`](#geometry-type), [`properties`](#properties), or [`feature-state`](#feature-state). Data expressions allow a feature's properties or state to determine its appearance. They can be used to differentiate features within the same layer and to create data visualizations.

```json
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
```

This example uses the [`get`](#get) operator to get the `temperature` value of each feature. That value is used to compute arguments to the [`rgb`](#rgb) operator, defining a color in terms of its red, green, and blue components.

Data expressions are allowed as the value of the `filter` property, and as values for most paint and layout properties. However, some paint and layout properties do not yet support data expressions. The level of support is indicated by the "data-driven styling" row of the "SDK Support" table for each property. Data expressions with the [`feature-state`](#feature-state) operator are allowed only on paint properties.



## Camera expressions

A _camera expression_ is any expression that uses the [`zoom`](#zoom) operator. Such expressions allow the appearance of a layer to change with the map's zoom level. Camera expressions can be used to create the appearance of depth and to control data density.

```json
{
    "circle-radius": [
        "interpolate", ["linear"], ["zoom"],
        // zoom is 5 (or less) -> circle radius will be 1px
        5, 1,
        // zoom is 10 (or greater) -> circle radius will be 5px
        10, 5
    ]
}
```

This example uses the [`interpolate`](#interpolate) operator to define a linear relationship between zoom level and circle size using a set of input-output pairs. In this case, the expression indicates that the circle radius should be 1 pixel when the zoom level is 5 or below, and 5 pixels when the zoom is 10 or above. Between the two zoom levels, the circle radius will be linearly interpolated between 1 and 5 pixels

Camera expressions are allowed anywhere an expression may be used. When a camera expression used as the value of a layout or paint property, it must be in one of the following forms:

```json
[ "interpolate", interpolation, ["zoom"], ... ]
```

Or:

```json
[ "step", ["zoom"], ... ]
```

Or:

```json
[
    "let",
    ... variable bindings...,
    [ "interpolate", interpolation, ["zoom"], ... ]
]
```

Or:

```json
[
    "let",
    ... variable bindings...,
    [ "step", ["zoom"], ... ]
]
```

That is, in layout or paint properties, `["zoom"]` may appear only as the input to an outer [`interpolate`](#interpolate) or [`step`](#step) expression, or such an expression within a [`let`](#let) expression.

There is an important difference between layout and paint properties in the timing of camera expression evaluation. Paint property camera expressions are re-evaluated whenever the zoom level changes, even fractionally. For example, a paint property camera expression will be re-evaluated continuously as the map moves between zoom levels 4.1 and 4.6. A _layout property_ camera expression is evaluated only at integer zoom levels. It will _not_ be re-evaluated as the zoom changes from 4.1 to 4.6 -- only if it goes above 5 or below 4.

## Composition

A single expression may use a mix of data operators, camera operators, and other operators. Such composite expressions allows a layer's appearance to be determined by a combination of the zoom level _and_ individual feature properties.

```json
{
    "circle-radius": [
        "interpolate", ["linear"], ["zoom"],
        // when zoom is 0, set each feature's circle radius to the value of its "rating" property
        0, ["get", "rating"],
        // when zoom is 10, set each feature's circle radius to four times the value of its "rating" property
        10, ["*", 4, ["get", "rating"]]
    ]
}
```

An expression that uses both data and camera operators is considered both a data expression and a camera expression, and must adhere to the restrictions described above for both.

## Type system

The input arguments to expressions, and their result values, use the same set of [types](types.md) as the rest of the style specification: boolean, string, number, color, and arrays of these types. Furthermore, expressions are _type safe_: each use of an expression has a known result type and required argument types, and the SDKs verify that the result type of an expression is appropriate for the context in which it is used. For example, the result type of an expression in the `filter` property must be [boolean](types.md#boolean), and the arguments to the `"+"` operator must be [numbers](types.md#number).

When working with feature data, the type of a feature property value is typically not known ahead of time by the SDK. To preserve type safety, when evaluating a data expression, the SDK will check that the property value is appropriate for the context. For example, if you use the expression `["get", "feature-color"]` for the [`circle-color`](layers.md#circle-color) property, the SDK will verify that the `feature-color` value of each feature is a string identifying a valid [color](types.md#color). If this check fails, an error will be indicated in an SDK-specific way (typically a log message), and the default value for the property will be used instead.


In most cases, this verification will occur automatically wherever it is needed. However, in certain situations, the SDK may be unable to automatically determine the expected result type of a data expression from surrounding context. For example, it is not clear whether the expression `["<", ["get", "a"], ["get", "b"]]` is attempting to compare strings or numbers. In situations like this, you can use one of the _type assertion_ expression operators to indicate the expected type of a data expression: `["<", ["number", ["get", "a"]], ["number", ["get", "b"]]]`. A type assertion checks that the feature data matches the expected type of the data expression. If this check fails, it produces an error and causes the whole expression to fall back to the default value for the property being defined. The assertion operators are [`array`](types.md#array), [`boolean`](types.md#boolean), [`number`](types.md#number), and [`string`](types.md#string).

Expressions perform only one kind of implicit type conversion: a data expression used in a context where a [color](types.md#color) is expected will convert a string representation of a color to a color value. In all other cases, if you want to convert between types, you must use one of the _type conversion_ expression operators: [`to-boolean`](#to-boolean), [`to-number`](#to-number), [`to-string`](#to-string), or [`to-color`](#to-color). For example, if you have a feature property that stores numeric values in string format, and you want to use those values as numbers rather than strings, you can use an expression such as `["to-number", ["get", "property-name"]]`.

If an expression accepts an array argument and the user supplies an array literal, that array _must_ be wrapped in a `literal` expression (see the examples below). When GL-JS encounters an array in a style-spec property value, it will assume that the array is an expression and try to parse it; the library has no way to distinguish between an expression which failed validation and an array literal unless the developer makes this distinction explicit with the `literal` operator. The `literal` operator is not necessary if the array is returned from a sub-expression, e.g. `["in", 1, ["get", "myArrayProp"]]`.

```json
// will throw an error
{
    "circle-color": ["in", 1, [1, 2, 3]]
}

// will work as expected
{
    "circle-color": ["in", 1, ["literal", [1, 2, 3]]]
}
```
## Variable binding


### let
Binds expressions to named variables, which can then be referenced in the result expression using `["var", "variable_name"]`.

 - [Visualize population density](https://maplibre.org/maplibre-gl-js/docs/examples/visualize-population-density/)

Syntax:
```js
["let", var_name_1, var_value_1, ..., var_name_n, var_value_n, expression]: any
```

- `var_name_i`: `string literal`- The name of the i-th variable.
- `var_value_i`: `any`- The value of the i-th variable.
- `expression`: `any`- The expression within which the named variables can be referenced.

Example:
```json
"some-property": [
    "let",
    "someNumber",
    500,
    [
        "interpolate",
        ["linear"],
        ["var", "someNumber"],
        274,
        "#edf8e9",
        1551,
        "#006d2c"
    ]
]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.41.0|6.0.0|4.0.0|


### var
References variable bound using `let`.

 - [Visualize population density](https://maplibre.org/maplibre-gl-js/docs/examples/visualize-population-density/)

Syntax:
```js
["var", var_name]: any
```

- `var_name`: `string literal`- The name of the variable bound using `let`.

Example:
```json
"some-property": ["var", "density"]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.41.0|6.0.0|4.0.0|

## Types


### literal
Provides a literal array or object value.

 - [Display and style rich text labels](https://maplibre.org/maplibre-gl-js/docs/examples/display-and-style-rich-text-labels/)

Syntax:
```js
["literal", json_object]: object
["literal", json_array]: array
```

- `json_object`: `JSON object`
- `json_array`: `JSON array`

Example:
```json
"some-property": [
    "literal",
    ["DIN Offc Pro Italic", "Arial Unicode MS Regular"]
]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.41.0|6.0.0|4.0.0|


### array
Asserts that the input is an array (optionally with a specific item type and length). If, when the input expression is evaluated, it is not of the asserted type or length, then this assertion will cause the whole expression to be aborted.

Syntax:
```js
["array", value]: array
["array", type, value]: array<type>
["array", type, length, value]: array<type, length>
```

- `value`: `any`
- `type`: `string | number | boolean`- The asserted type of the input array.
- `length`: `number literal`- The asserted length of the input array.

Example:
```json
"some-property": ["array", "string", 3, ["literal", ["a", "b", "c"]]]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.41.0|6.0.0|4.0.0|


### typeof
Returns a string describing the type of the given value.

Syntax:
```js
["typeof", value]: string
```

- `value`: `any`

Example:
```json
"some-property": ["typeof", ["get", "name"]]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.41.0|6.0.0|4.0.0|


### string
Asserts that the input value is a string. If multiple values are provided, each one is evaluated in order until a string is obtained. If none of the inputs are strings, the expression is an error.

Syntax:
```js
["string", value_1, ..., value_n]: string
```

- `value_i`: `any`

Example:
```json
"some-property": ["string", ["get", "name"]]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.41.0|6.0.0|4.0.0|


### number
Asserts that the input value is a number. If multiple values are provided, each one is evaluated in order until a number is obtained. If none of the inputs are numbers, the expression is an error.

Syntax:
```js
["number", value_1, ..., value_n]: number
```

- `value_i`: `any`

Example:
```json
"some-property": ["number", ["get", "population"]]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.41.0|6.0.0|4.0.0|


### boolean
Asserts that the input value is a boolean. If multiple values are provided, each one is evaluated in order until a boolean is obtained. If none of the inputs are booleans, the expression is an error.

 - [Create a hover effect](https://maplibre.org/maplibre-gl-js/docs/examples/create-a-hover-effect/)

Syntax:
```js
["boolean", value_1, ..., value_n]: boolean
```

- `value_i`: `any`

Example:
```json
"some-property": ["boolean", ["feature-state", "hover"], false]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.41.0|6.0.0|4.0.0|


### object
Asserts that the input value is an object. If multiple values are provided, each one is evaluated in order until an object is obtained. If none of the inputs are objects, the expression is an error.

Syntax:
```js
["object", value_1, ..., value_n]: object
```

- `value_i`: `any`

Example:
```json
"some-property": ["object", ["get", "some-property"]]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.41.0|6.0.0|4.0.0|


### collator
Returns a `collator` for use in locale-dependent comparison operations. Use `resolved-locale` to test the results of locale fallback behavior.

Syntax:
```js
["collator", options]: collator
```

- `options`: `{case-sensitive?: boolean, diacritic-sensitive?: boolean, locale?: string}`  
Parameters:
    
    - `case-sensitive`: `boolean` - If characters of different case-ness are considered different
    - `diacritic-sensitive`: `boolean` - If characters with different diacritics are considered different
    - `locale`: `string` - IETF language tag of the locale to use. If none is provided, the default locale is used. If the requested locale is not available, the `collator` will use a system-defined fallback locale.

Example:
```json
"some-property": [
    "collator",
    {
        "case-sensitive": true,
        "diacritic-sensitive": true,
        "locale": "fr"
    }
]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.45.0|6.5.0|4.2.0|


### format
Returns a `formatted` string for displaying mixed-format text in the `text-field` property. The input may contain a string literal or expression, including an [`'image'`](#image) expression. Strings may be followed by a style override object.

 - [Change the case of labels](https://maplibre.org/maplibre-gl-js/docs/examples/change-case-of-labels/)

 - [Display and style rich text labels](https://maplibre.org/maplibre-gl-js/docs/examples/display-and-style-rich-text-labels/)

Syntax:
```js
["format", input_1, style_overrides_1?, ..., input_n, style_overrides_n?]: formatted
```

- `input_i`: `string | image`
- `style_overrides_i`: `{text-font?: string, text-color?: color, font-scale?: number, vertical-align?: "bottom" | "center" | "top"}`  
Parameters:
    
    - `text-font`: `string` - Overrides the font stack specified by the root layout property.
    - `text-color`: `color` - Overrides the color specified by the root paint property.
    - `font-scale`: `number` - Applies a scaling factor on `text-size` as specified by the root layout property.
    - `vertical-align`: `"bottom" | "center" | "top"` - Aligns a vertical text section or image in relation to the row it belongs to. Refer to [the design proposal](https://github.com/maplibre/maplibre-style-spec/issues/832) for more details.  
        Possible values are:
        - `"bottom"` *default* - align the bottom of this section with the bottom of other sections.
    ![Visual representation of bottom alignment](https://github.com/user-attachments/assets/0474a2fd-a4b2-417c-9187-7a13a28695bc)
        - `"center"` - align the center of this section with the center of other sections.
    ![Visual representation of center alignment](https://github.com/user-attachments/assets/92237455-be6d-4c5d-b8f6-8127effc1950)
        - `"top"` - align the top of this section with the top of other sections.
    ![Visual representation of top alignment](https://github.com/user-attachments/assets/45dccb28-d977-4abb-a006-4ea9792b7c53)

Example:
```json
"some-property": [
    "format",
    ["upcase", ["get", "FacilityName"]],
    {"font-scale": 0.8},
    "\n\n",
    {},
    ["downcase", ["get", "Comments"]],
    {"font-scale": 0.6, "vertical-align": "center"}
]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.48.0|6.7.0|4.6.0|
|text-font|0.48.0|6.7.0|4.6.0|
|font-scale|0.48.0|6.7.0|4.6.0|
|text-color|1.3.0|7.3.0|4.10.0|
|vertical-align|5.1.0|❌ ([#3055](https://github.com/maplibre/maplibre-native/issues/3055))|❌ ([#3055](https://github.com/maplibre/maplibre-native/issues/3055))|
|image|1.6.0|8.6.0|5.7.0|


### image
Returns an `image` type for use in `icon-image`, `*-pattern` entries and as a section in the `format` expression. If set, the `image` argument will check that the requested image exists in the style and will return either the resolved image name or `null`, depending on whether or not the image is currently in the style. This validation process is synchronous and requires the image to have been added to the style before requesting it in the `image` argument.

 - [Use a fallback image](https://maplibre.org/maplibre-gl-js/docs/examples/use-a-fallback-image/)

Syntax:
```js
["image", image_name]: image
```

- `image_name`: `string`

Example:
```json
"some-property": ["image", "marker_15"]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|1.4.0|8.6.0|5.7.0|


### number-format
Converts the input number into a string representation using the provided format_options.

 - [Display HTML clusters with custom properties](https://maplibre.org/maplibre-gl-js/docs/examples/display-html-clusters-with-custom-properties/)

Syntax:
```js
["number-format", input, format_options]: string
```

- `input`: `number`- number to format
- `format_options`: `{locale?: string, currency?: string, min-fraction-digits?: number, max-fraction-digits?: number}`- Format options for the number  
Parameters:
    
    - `locale`: `string` - Specifies the locale to use, as a BCP 47 language tag
    - `currency`: `string` - An ISO 4217 code to use for currency-style formatting
    - `min-fraction-digits`: `number` - Minimum number of fractional digits to include
    - `max-fraction-digits`: `number` - Maximum number of fractional digits to include

Example:
```json
"some-property": [
    "number-format",
    ["get", "mag"],
    {"min-fraction-digits": 1, "max-fraction-digits": 1}
]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.54.0|8.4.0|✅|


### to-string
Converts the input value to a string. If the input is `null`, the result is `""`. If the input is a boolean, the result is `"true"` or `"false"`. If the input is a number, it is converted to a string as specified by the ["NumberToString" algorithm](https://tc39.github.io/ecma262/#sec-tostring-applied-to-the-number-type) of the ECMAScript Language Specification. If the input is a color, it is converted to a string of the form `"rgba(r,g,b,a)"`, where `r`, `g`, and `b` are numerals ranging from 0 to 255, and `a` ranges from 0 to 1. Otherwise, the input is converted to a string in the format specified by the [`JSON.stringify`](https://tc39.github.io/ecma262/#sec-json.stringify) function of the ECMAScript Language Specification.

 - [Create a time slider](https://maplibre.org/maplibre-gl-js/docs/examples/create-a-time-slider/)

Syntax:
```js
["to-string", value]: string
```

- `value`: `any`

Example:
```json
"some-property": ["to-string", ["get", "mag"]]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.41.0|6.0.0|4.0.0|


### to-number
Converts the input value to a number, if possible. If the input is `null` or `false`, the result is 0. If the input is `true`, the result is 1. If the input is a string, it is converted to a number as specified by the ["ToNumber Applied to the String Type" algorithm](https://tc39.github.io/ecma262/#sec-tonumber-applied-to-the-string-type) of the ECMAScript Language Specification. If multiple values are provided, each one is evaluated in order until the first successful conversion is obtained. If none of the inputs can be converted, the expression is an error.

Syntax:
```js
["to-number", value_1, ..., value_n]: number
```

- `value_i`: `any`

Example:
```json
"some-property": ["to-number", "someProperty"]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.41.0|6.0.0|4.0.0|


### to-boolean
Converts the input value to a boolean. The result is `false` when the input is an empty string, 0, `false`, `null`, or `NaN`; otherwise it is `true`.

Syntax:
```js
["to-boolean", value]: boolean
```

- `value`: `any`

Example:
```json
"some-property": ["to-boolean", "someProperty"]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.41.0|6.0.0|4.0.0|


### to-color
Converts the input value to a color. If multiple values are provided, each one is evaluated in order until the first successful conversion is obtained. If none of the inputs can be converted, the expression is an error.

 - [Visualize population density](https://maplibre.org/maplibre-gl-js/docs/examples/visualize-population-density/)

Syntax:
```js
["to-color", value_1, ..., value_n]: color
```

- `value_i`: `any`

Example:
```json
"some-property": ["to-color", "#edf8e9"]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.41.0|6.0.0|4.0.0|

## Lookup


### at
Retrieves an item from an array.

Syntax:
```js
["at", index, array]: T
```

- `index`: `number`- The index into `array`.
- `array`: `array<T>`- The array of items to retrieve the specified item from.

Example:
```json
"some-property": ["at", 1, ["literal", ["a", "b", "c"]]]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.41.0|6.0.0|4.0.0|


### in
Determines whether an item exists in an array or a substring exists in a string.

 - [Measure distances](https://maplibre.org/maplibre-gl-js/docs/examples/measure-distances/)

Syntax:
```js
["in", item, array]: boolean
["in", substring, string]: boolean
```

- `item`: `T`- The needle to search for within `array`.
- `array`: `array<T>`- The haystack through which to search for `item`.
- `substring`: `string`- The needle to search for within `string`.
- `string`: `string`- The haystack through which to search for `substring`.

Example:
```json
"some-property": ["in", "$type", "Point"]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|1.6.0|9.1.0|5.8.0|


### index-of
Returns the first position at which an item can be found in an array or a substring can be found in a string, or `-1` if the input cannot be found. Accepts an optional index from where to begin the search. In a string, a UTF-16 surrogate pair counts as a single position.

Syntax:
```js
["index-of", item, array, from_index?]: number
["index-of", substring, string, from_index?]: number
```

- `item`: `T`- The needle to search for within `array`.
- `array`: `array<T>`- The haystack through which to search for `item`.
- `substring`: `string`- The needle to search for within `string`.
- `string`: `string`- The haystack through which to search for `substring`.
- `from_index`: `number`- The index from where to begin the search.

Example:
```json
"some-property": ["index-of", "foo", ["baz", "bar", "hello", "foo", "world"]]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|1.10.0|10.3.0|6.0.0|


### slice
Returns a subarray from an array or a substring from a string from a specified start index, or between a start index and an end index if set. The return value is inclusive of the start index but not of the end index. In a string, a UTF-16 surrogate pair counts as a single position.

Syntax:
```js
["slice", array, start_index, end_index?]: array<T>
["slice", string, start_index, end_index?]: string
```

- `array`: `array<T>`- The original array from which to extract the subarray.
- `string`: `string`- The original string from which to extract the substring.
- `start_index`: `number`- The inclusive index from which `slice` extracts items or characters from the subarray or substring.
- `end_index`: `number`- The non-inclusive index up to which `slice` extracts items or characters from the subarray or substring.

Example:
```json
"some-property": ["slice", ["get", "name"], 0, 3]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|1.10.0|10.3.0|6.0.0|


### global-state
Retrieves a property value from global state that can be set with platform-specific APIs. Defaults can be provided using the [`state`](https://maplibre.org/maplibre-style-spec/root/#state) root property. Returns `null` if no value nor default value is set for the retrieved property.

Syntax:
```js
["global-state", property_name]: any
```

- `property_name`: `string literal`- The name of the global state property to retrieve.

Example:
```json
"some-property": ["global-state", "someProperty"]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|5.6.0|❌ ([#3302](https://github.com/maplibre/maplibre-native/issues/3302))|❌ ([#3302](https://github.com/maplibre/maplibre-native/issues/3302))|


### get
Retrieves a property value from the current feature's properties, or from another object if a second argument is provided. Returns null if the requested property is missing.

 - [Change the case of labels](https://maplibre.org/maplibre-gl-js/docs/examples/change-case-of-labels/)

 - [Display HTML clusters with custom properties](https://maplibre.org/maplibre-gl-js/docs/examples/display-html-clusters-with-custom-properties/)

 - [Extrude polygons for 3D indoor mapping](https://maplibre.org/maplibre-gl-js/docs/examples/extrude-polygons-for-3d-indoor-mapping/)

Syntax:
```js
["get", property_name, object?]: any
```

- `property_name`: `string`- The name of the property to retrieve the value of.
- `object`: `object`- The object to retrieve the value from.

Example:
```json
"some-property": ["get", "someProperty"]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.41.0|6.0.0|4.0.0|


### has
Tests for the presence of a property value in the current feature's properties, or from another object if a second argument is provided.

 - [Create and style clusters](https://maplibre.org/maplibre-gl-js/docs/examples/create-and-style-clusters/)

Syntax:
```js
["has", property_name, object?]: boolean
```

- `property_name`: `string`- The name of the property to test for the presence of.
- `object`: `object`- The object in which to test for the presence of the `property_name` property.

Example:
```json
"some-property": ["has", "someProperty"]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.41.0|6.0.0|4.0.0|


### length
Gets the length of an array or string. In a string, a UTF-16 surrogate pair counts as a single position.

Syntax:
```js
["length", array_or_string]: number
```

- `array_or_string`: `array | string`

Example:
```json
"some-property": ["length", ["get", "myArray"]]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.41.0|6.0.0|4.0.0|

## Decision


### case
Selects the first output whose corresponding test condition evaluates to true, or the fallback value otherwise.

 - [Create a hover effect](https://maplibre.org/maplibre-gl-js/docs/examples/create-a-hover-effect/)

 - [Display HTML clusters with custom properties](https://maplibre.org/maplibre-gl-js/docs/examples/display-html-clusters-with-custom-properties/)

Syntax:
```js
["case", condition_1, output_1, ..., condition_n, output_n, fallback]: any
```

- `condition_i`: `boolean`
- `output_i`: `any`
- `fallback`: `any`- The result when no condition evaluates to true.

Example:
```json
"some-property": [
    "case",
    ["boolean", ["feature-state", "hover"], false],
    1,
    0.5
]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.41.0|6.0.0|4.0.0|


### match
Selects the output whose label value matches the input value, or the fallback value if no match is found. The input can be any expression (e.g. `["get", "building_type"]`). Each label must be either:

 - a single literal value; or

 - an array of literal values, whose values must be all strings or all numbers (e.g. `[100, 101]` or `["c", "b"]`). The input matches if any of the values in the array matches, similar to the `"in"` operator.

Each label must be unique. If the input type does not match the type of the labels, the result will be the fallback value.

Syntax:
```js
["match", input, label_1, output_1, ..., label_n, output_n, fallback]: any
```

- `input`: `string | number`- Any expression.
- `label_i`: `string literal | number literal | array<string literal> | array<number literal>`- The i-th literal value or array of literal values to match the input against.
- `output_i`: `any`- The result when the i-th label is the first label to match the input.
- `fallback`: `any`- The result when no label matches the input.

Example:
```json
"some-property": [
    "match",
    ["get", "building_type"],
    "residential",
    "#f00",
    "commercial",
    "#0f0",
    "#000"
]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.41.0|6.0.0|4.0.0|


### coalesce
Evaluates each expression in turn until the first non-null value is obtained, and returns that value.

 - [Use a fallback image](https://maplibre.org/maplibre-gl-js/docs/examples/use-a-fallback-image/)

Syntax:
```js
["coalesce", expression_1, ..., expression_n]: any
```

- `expression_i`: `any`

Example:
```json
"some-property": [
    "coalesce",
    ["image", ["concat", ["get", "icon"], "_15"]],
    ["image", "marker_15"]
]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.41.0|6.0.0|4.0.0|


### ==
Returns `true` if the input values are equal, `false` otherwise. The comparison is strictly typed: values of different runtime types are always considered unequal. Cases where the types are known to be different at parse time are considered invalid and will produce a parse error. Accepts an optional `collator` argument to control locale-dependent string comparisons.

 - [Add multiple geometries from one GeoJSON source](https://maplibre.org/maplibre-gl-js/docs/examples/multiple-geometries/)

 - [Create a time slider](https://maplibre.org/maplibre-gl-js/docs/examples/timeline-animation/)

 - [Display buildings in 3D](https://maplibre.org/maplibre-gl-js/docs/examples/display-buildings-in-3d/)

 - [Filter symbols by toggling a list](https://maplibre.org/maplibre-gl-js/docs/examples/filter-symbols-by-toggling-a-list/)

Syntax:
```js
["==", input_1, input_2, collator?]: boolean
```

- `input_1`: `any`
- `input_2`: `any`
- `collator`: `collator`- Options for locale-dependent comparison.

Example:
```json
"some-property": ["==", "$type", "Polygon"]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.41.0|6.0.0|4.0.0|
|collator|0.45.0|6.5.0|4.2.0|


### !=
Returns `true` if the input values are not equal, `false` otherwise. The comparison is strictly typed: values of different runtime types are always considered unequal. Cases where the types are known to be different at parse time are considered invalid and will produce a parse error. Accepts an optional `collator` argument to control locale-dependent string comparisons.

 - [Display HTML clusters with custom properties](https://maplibre.org/maplibre-gl-js/docs/examples/display-html-clusters-with-custom-properties/)

Syntax:
```js
["!=", input_1, input_2, collator?]: boolean
```

- `input_1`: `any`
- `input_2`: `any`
- `collator`: `collator`- Options for locale-dependent comparison.

Example:
```json
"some-property": ["!=", "cluster", true]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.41.0|6.0.0|4.0.0|
|collator|0.45.0|6.5.0|4.2.0|


### >
Returns `true` if the first input is strictly greater than the second, `false` otherwise. The arguments are required to be either both strings or both numbers; if during evaluation they are not, expression evaluation produces an error. Cases where this constraint is known not to hold at parse time are considered in valid and will produce a parse error. Accepts an optional `collator` argument to control locale-dependent string comparisons.

Syntax:
```js
[">", string_1, string_2, collator?]: boolean
[">", number_1, number_2, collator?]: boolean
```

- `string_i`: `string`
- `number_i`: `number`
- `collator`: `collator`- Options for locale-dependent comparison.

Example:
```json
"some-property": [">", ["get", "mag"], 2]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.41.0|6.0.0|4.0.0|
|collator|0.45.0|6.5.0|4.2.0|


### <
Returns `true` if the first input is strictly less than the second, `false` otherwise. The arguments are required to be either both strings or both numbers; if during evaluation they are not, expression evaluation produces an error. Cases where this constraint is known not to hold at parse time are considered in valid and will produce a parse error. Accepts an optional `collator` argument to control locale-dependent string comparisons.

 - [Display HTML clusters with custom properties](https://maplibre.org/maplibre-gl-js/docs/examples/display-html-clusters-with-custom-properties/)

Syntax:
```js
["<", string_1, string_2, collator?]: boolean
["<", number_1, number_2, collator?]: boolean
```

- `string_i`: `string`
- `number_i`: `number`
- `collator`: `collator`- Options for locale-dependent comparison.

Example:
```json
"some-property": ["<", ["get", "mag"], 2]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.41.0|6.0.0|4.0.0|
|collator|0.45.0|6.5.0|4.2.0|


### >=
Returns `true` if the first input is greater than or equal to the second, `false` otherwise. The arguments are required to be either both strings or both numbers; if during evaluation they are not, expression evaluation produces an error. Cases where this constraint is known not to hold at parse time are considered in valid and will produce a parse error. Accepts an optional `collator` argument to control locale-dependent string comparisons.

 - [Display HTML clusters with custom properties](https://maplibre.org/maplibre-gl-js/docs/examples/display-html-clusters-with-custom-properties/)

Syntax:
```js
[">=", string_1, string_2, collator?]: boolean
[">=", number_1, number_2, collator?]: boolean
```

- `string_i`: `string`
- `number_i`: `number`
- `collator`: `collator`- Options for locale-dependent comparison.

Example:
```json
"some-property": [">=", ["get", "mag"], 6]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.41.0|6.0.0|4.0.0|
|collator|0.45.0|6.5.0|4.2.0|


### <=
Returns `true` if the first input is less than or equal to the second, `false` otherwise. The arguments are required to be either both strings or both numbers; if during evaluation they are not, expression evaluation produces an error. Cases where this constraint is known not to hold at parse time are considered in valid and will produce a parse error. Accepts an optional `collator` argument to control locale-dependent string comparisons.

Syntax:
```js
["<=", string_1, string_2, collator?]: boolean
["<=", number_1, number_2, collator?]: boolean
```

- `string_i`: `string`
- `number_i`: `number`
- `collator`: `collator`- Options for locale-dependent comparison.

Example:
```json
"some-property": ["<=", ["get", "mag"], 6]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.41.0|6.0.0|4.0.0|
|collator|0.45.0|6.5.0|4.2.0|


### all
Returns `true` if all the inputs are `true`, `false` otherwise. The inputs are evaluated in order, and evaluation is short-circuiting: once an input expression evaluates to `false`, the result is `false` and no further input expressions are evaluated.

 - [Display HTML clusters with custom properties](https://maplibre.org/maplibre-gl-js/docs/examples/display-html-clusters-with-custom-properties/)

Syntax:
```js
["all", input_1, ..., input_n]: boolean
```

- `input_i`: `boolean`

Example:
```json
"some-property": ["all", [">=", ["get", "mag"], 4], ["<", ["get", "mag"], 5]]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.41.0|6.0.0|4.0.0|


### any
Returns `true` if any of the inputs are `true`, `false` otherwise. The inputs are evaluated in order, and evaluation is short-circuiting: once an input expression evaluates to `true`, the result is `true` and no further input expressions are evaluated.

Syntax:
```js
["any", input_1, ..., input_n]: boolean
```

- `input_i`: `boolean`

Example:
```json
"some-property": ["any", [">=", ["get", "mag"], 4], ["<", ["get", "mag"], 5]]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.41.0|6.0.0|4.0.0|


### !
Logical negation. Returns `true` if the input is `false`, and `false` if the input is `true`.

 - [Create and style clusters](https://maplibre.org/maplibre-gl-js/docs/examples/create-and-style-clusters/)

Syntax:
```js
["!", input]: boolean
```

- `input`: `boolean`

Example:
```json
"some-property": ["!", ["has", "point_count"]]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.41.0|6.0.0|4.0.0|


### within
Returns `true` if the evaluated feature is fully contained inside a boundary of the input geometry, `false` otherwise. The input value can be a valid GeoJSON of type `Polygon`, `MultiPolygon`, `Feature`, or `FeatureCollection`. Supported features for evaluation:

- `Point`: Returns `false` if a point is on the boundary or falls outside the boundary.

- `LineString`: Returns `false` if any part of a line falls outside the boundary, the line intersects the boundary, or a line's endpoint is on the boundary.

Syntax:
```js
["within", geojson]: boolean
```

- `geojson`: `GeoJSON object`

Example:
```json
"some-property": [
    "within",
    {
        "type": "Polygon",
        "coordinates": [
            [[0, 0], [0, 5], [5, 5], [5, 0], [0, 0]]
        ]
    }
]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|1.9.0|9.1.0|5.8.0|

## Ramps, scales, curves


### step
Produces discrete, stepped results by evaluating a piecewise-constant function defined by pairs of input and output values ("stops"). The `input` may be any numeric expression (e.g., `["get", "population"]`). Stop inputs must be numeric literals in strictly ascending order.

Returns the output value of the stop just less than the input, or the first output if the input is less than the first stop.

 - [Create and style clusters](https://maplibre.org/maplibre-gl-js/docs/examples/create-and-style-clusters/)

Syntax:
```js
["step", input, output_0, stop_input_1, stop_output_1, ..., stop_input_n, stop_output_n]: any
```

- `input`: `number`- Any numeric expression.
- `output_0`: `any`- The result when the `input` is less than the first stop.
- `stop_input_i`: `number literal`- The value of the i-th stop against which the `input` is compared.
- `stop_output_i`: `any`- The result when the i-th stop is the last stop less than the `input`.

Example:
```json
"some-property": ["step", ["get", "point_count"], 20, 100, 30, 750, 40]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.42.0|6.0.0|4.0.0|


### interpolate
Produces continuous, smooth results by interpolating between pairs of input and output values ("stops"). The `input` may be any numeric expression (e.g., `["get", "population"]`). Stop inputs must be numeric literals in strictly ascending order. The output type must be `number`, `array<number>`, `color`, `array<color>`, or `projection`.

 - [Animate map camera around a point](https://maplibre.org/maplibre-gl-js/docs/examples/animate-camera-around-point/)

 - [Change building color based on zoom level](https://maplibre.org/maplibre-gl-js/docs/examples/change-building-color-based-on-zoom-level/)

 - [Create a heatmap layer](https://maplibre.org/maplibre-gl-js/docs/examples/heatmap-layer/)

 - [Visualize population density](https://maplibre.org/maplibre-gl-js/docs/examples/visualize-population-density/)

Syntax:
```js
["interpolate", interpolation_type, input, stop_input_1, stop_output_1, ..., stop_input_n, stop_output_n]: number | array<number> | color | array<color> | projection
```

- `interpolation_type`: `interpolation`- The interpolation type.  
    An interpolation defines how to transition between items. The first element of an interpolation array is a string naming the interpolation operator, e.g. `"linear"` or `"exponential"`. Elements that follow (if any) are the _arguments_ to the interpolation.  
    Possible values are:  
        - `["linear"]`: Interpolates linearly between the pair of stops just less than and just greater than the input  
        - `["exponential", base]`: Interpolates exponentially between the stops just less than and just greater than the input.  
            Parameters are:  
            `base`: rate at which the output increases in `f(x) = x^r`. Values higher than 1 increase, close to one behaves linearly, and below one decrease.  
        - `["cubic-bezier", x1, y1, x2, y2]`: Interpolates using the cubic bézier curve defined by the given control points.  
            Parameters are:  
            `x1`: X-coordinate of the first control point. Must be between zero and one for a valid monotonic easing curve. Controls how quickly the curve speeds up at the beginning.  
            `y1`: Y-coordinate of the first control point. Typically between zero and one, but may exceed this range for overshoot effects. Influences the starting slope of the curve.  
            `x2`: X-coordinate of the second control point. Must be between zero and one for a valid monotonic easing curve. Controls when the curve begins to decelerate toward the end.  
            `y2`: Y-coordinate of the second control point. Typically between zero and one, but may exceed this range for overshoot effects. Influences the ending slope of the curve.
- `input`: `number`- Any numeric expression.
- `stop_input_i`: `number literal`- The value of the i-th stop against which the `input` is compared.
- `stop_output_i`: `number | array<number> | color | array<color> | projection`- The output value corresponding to the i-th stop.

Example:
```json
"some-property": [
    "interpolate",
    ["linear"],
    ["zoom"],
    15,
    0,
    15.05,
    ["get", "height"]
]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.42.0|6.0.0|4.0.0|


### interpolate-hcl
Produces continuous, smooth results by interpolating between pairs of input and output values ("stops"). Works like `interpolate`, but the output type must be `color` or `array<color>`, and the interpolation is performed in the Hue-Chroma-Luminance color space.

Syntax:
```js
["interpolate-hcl", interpolation_type, input, stop_input_1, stop_output_1, ..., stop_input_n, stop_output_n]: color | array<color>
```

- `interpolation_type`: `interpolation`- The interpolation type.  
    An interpolation defines how to transition between items. The first element of an interpolation array is a string naming the interpolation operator, e.g. `"linear"` or `"exponential"`. Elements that follow (if any) are the _arguments_ to the interpolation.  
    Possible values are:  
        - `["linear"]`: Interpolates linearly between the pair of stops just less than and just greater than the input  
        - `["exponential", base]`: Interpolates exponentially between the stops just less than and just greater than the input.  
            Parameters are:  
            `base`: rate at which the output increases in `f(x) = x^r`. Values higher than 1 increase, close to one behaves linearly, and below one decrease.  
        - `["cubic-bezier", x1, y1, x2, y2]`: Interpolates using the cubic bézier curve defined by the given control points.  
            Parameters are:  
            `x1`: X-coordinate of the first control point. Must be between zero and one for a valid monotonic easing curve. Controls how quickly the curve speeds up at the beginning.  
            `y1`: Y-coordinate of the first control point. Typically between zero and one, but may exceed this range for overshoot effects. Influences the starting slope of the curve.  
            `x2`: X-coordinate of the second control point. Must be between zero and one for a valid monotonic easing curve. Controls when the curve begins to decelerate toward the end.  
            `y2`: Y-coordinate of the second control point. Typically between zero and one, but may exceed this range for overshoot effects. Influences the ending slope of the curve.
- `input`: `number`
- `stop_input_i`: `number literal`
- `stop_output_i`: `color | array<color>`

Example:
```json
"some-property": [
    "interpolate-hcl",
    ["linear"],
    ["zoom"],
    15,
    "#f00",
    15.05,
    "#00f"
]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.49.0|❌ ([#2784](https://github.com/maplibre/maplibre-native/issues/2784))|❌ ([#2784](https://github.com/maplibre/maplibre-native/issues/2784))|


### interpolate-lab
Produces continuous, smooth results by interpolating between pairs of input and output values ("stops"). Works like `interpolate`, but the output type must be `color` or `array<color>`, and the interpolation is performed in the CIELAB color space.

Syntax:
```js
["interpolate-lab", interpolation_type, input, stop_input_1, stop_output_1, ..., stop_input_n, stop_output_n]: color | array<color>
```

- `interpolation_type`: `interpolation`- The interpolation type.  
    An interpolation defines how to transition between items. The first element of an interpolation array is a string naming the interpolation operator, e.g. `"linear"` or `"exponential"`. Elements that follow (if any) are the _arguments_ to the interpolation.  
    Possible values are:  
        - `["linear"]`: Interpolates linearly between the pair of stops just less than and just greater than the input  
        - `["exponential", base]`: Interpolates exponentially between the stops just less than and just greater than the input.  
            Parameters are:  
            `base`: rate at which the output increases in `f(x) = x^r`. Values higher than 1 increase, close to one behaves linearly, and below one decrease.  
        - `["cubic-bezier", x1, y1, x2, y2]`: Interpolates using the cubic bézier curve defined by the given control points.  
            Parameters are:  
            `x1`: X-coordinate of the first control point. Must be between zero and one for a valid monotonic easing curve. Controls how quickly the curve speeds up at the beginning.  
            `y1`: Y-coordinate of the first control point. Typically between zero and one, but may exceed this range for overshoot effects. Influences the starting slope of the curve.  
            `x2`: X-coordinate of the second control point. Must be between zero and one for a valid monotonic easing curve. Controls when the curve begins to decelerate toward the end.  
            `y2`: Y-coordinate of the second control point. Typically between zero and one, but may exceed this range for overshoot effects. Influences the ending slope of the curve.
- `input`: `number`
- `stop_input_i`: `number literal`
- `stop_output_i`: `color | array<color>`

Example:
```json
"some-property": [
    "interpolate-lab",
    ["linear"],
    ["zoom"],
    15,
    "#f00",
    15.05,
    "#00f"
]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.49.0|❌ ([#2784](https://github.com/maplibre/maplibre-native/issues/2784))|❌ ([#2784](https://github.com/maplibre/maplibre-native/issues/2784))|

## Math


### ln2
Returns the mathematical constant ln(2).

Syntax:
```js
["ln2"]: number
```


Example:
```json
"some-property": ["ln2"]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.41.0|6.0.0|4.0.0|


### pi
Returns the mathematical constant pi.

Syntax:
```js
["pi"]: number
```


Example:
```json
"some-property": ["pi"]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.41.0|6.0.0|4.0.0|


### e
Returns the mathematical constant e.

Syntax:
```js
["e"]: number
```


Example:
```json
"some-property": ["e"]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.41.0|6.0.0|4.0.0|


### +
Returns the sum of the inputs.

Syntax:
```js
["+", input_1, ..., input_n]: number
```

- `input_i`: `number`

Example:
```json
"some-property": ["+", 2, 3]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.41.0|6.0.0|4.0.0|


### *
Returns the product of the inputs.

Syntax:
```js
["*", input_1, ..., input_n]: number
```

- `input_i`: `number`

Example:
```json
"some-property": ["*", 2, 3]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.41.0|6.0.0|4.0.0|


### -
For two inputs, returns the result of subtracting the second input from the first. For a single input, returns the result of subtracting it from 0.

Syntax:
```js
["-", input_1, input_2]: number
["-", single_input]: number
```

- `input_1`: `number`- The number from which to subtract `input_2`.
- `input_2`: `number`- The number to subtract from `input_1`.
- `single_input`: `number`- The number to subtract from 0.

Example:
```json
"some-property": ["-", 10]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.41.0|6.0.0|4.0.0|


### /
Returns the result of floating point division of the first input by the second.

 - [Visualize population density](https://maplibre.org/maplibre-gl-js/docs/examples/visualize-population-density/)

Syntax:
```js
["/", input_1, input_2]: number
```

- `input_1`: `number`- The dividend.
- `input_2`: `number`- The divisor.

Example:
```json
"some-property": ["/", ["get", "population"], ["get", "sq-km"]]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.41.0|6.0.0|4.0.0|


### %
Returns the remainder after integer division of the first input by the second.

Syntax:
```js
["%", input_1, input_2]: number
```

- `input_1`: `number`- The dividend.
- `input_2`: `number`- The divisor.

Example:
```json
"some-property": ["%", 10, 3]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.41.0|6.0.0|4.0.0|


### ^
Returns the result of raising the first input to the power specified by the second.

Syntax:
```js
["^", input_1, input_2]: number
```

- `input_1`: `number`- The base.
- `input_2`: `number`- The exponent.

Example:
```json
"some-property": ["^", 2, 3]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.41.0|6.0.0|4.0.0|


### sqrt
Returns the square root of the input.

Syntax:
```js
["sqrt", input]: number
```

- `input`: `number`- The radicand.

Example:
```json
"some-property": ["sqrt", 9]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.42.0|6.0.0|4.0.0|


### log10
Returns the base-ten logarithm of the input.

Syntax:
```js
["log10", input]: number
```

- `input`: `number`

Example:
```json
"some-property": ["log10", 8]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.41.0|6.0.0|4.0.0|


### ln
Returns the natural logarithm of the input.

Syntax:
```js
["ln", input]: number
```

- `input`: `number`

Example:
```json
"some-property": ["ln", 8]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.41.0|6.0.0|4.0.0|


### log2
Returns the base-two logarithm of the input.

Syntax:
```js
["log2", input]: number
```

- `input`: `number`

Example:
```json
"some-property": ["log2", 8]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.41.0|6.0.0|4.0.0|


### sin
Returns the sine of the input.

Syntax:
```js
["sin", input]: number
```

- `input`: `number`

Example:
```json
"some-property": ["sin", 1]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.41.0|6.0.0|4.0.0|


### cos
Returns the cosine of the input.

Syntax:
```js
["cos", input]: number
```

- `input`: `number`

Example:
```json
"some-property": ["cos", 1]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.41.0|6.0.0|4.0.0|


### tan
Returns the tangent of the input.

Syntax:
```js
["tan", input]: number
```

- `input`: `number`

Example:
```json
"some-property": ["tan", 1]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.41.0|6.0.0|4.0.0|


### asin
Returns the arcsine of the input.

Syntax:
```js
["asin", input]: number
```

- `input`: `number`

Example:
```json
"some-property": ["asin", 1]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.41.0|6.0.0|4.0.0|


### acos
Returns the arccosine of the input.

Syntax:
```js
["acos", input]: number
```

- `input`: `number`

Example:
```json
"some-property": ["acos", 1]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.41.0|6.0.0|4.0.0|


### atan
Returns the arctangent of the input.

Syntax:
```js
["atan", input]: number
```

- `input`: `number`

Example:
```json
"some-property": ["atan", 1]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.41.0|6.0.0|4.0.0|


### min
Returns the minimum value of the inputs.

Syntax:
```js
["min", input_1, ..., input_n]: number
```

- `input_i`: `number`

Example:
```json
"some-property": ["min", 1, 2]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.41.0|6.0.0|4.0.0|


### max
Returns the maximum value of the inputs.

Syntax:
```js
["max", input_1, ..., input_n]: number
```

- `input_i`: `number`

Example:
```json
"some-property": ["max", 1, 2]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.41.0|6.0.0|4.0.0|


### round
Rounds the input to the nearest integer. Halfway values are rounded away from zero. For example, `["round", -1.5]` evaluates to -2.

Syntax:
```js
["round", input]: number
```

- `input`: `number`

Example:
```json
"some-property": ["round", 1.5]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.45.0|6.0.0|4.0.0|


### abs
Returns the absolute value of the input.

Syntax:
```js
["abs", input]: number
```

- `input`: `number`

Example:
```json
"some-property": ["abs", -1.5]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.45.0|6.0.0|4.0.0|


### ceil
Returns the smallest integer that is greater than or equal to the input.

Syntax:
```js
["ceil", input]: number
```

- `input`: `number`

Example:
```json
"some-property": ["ceil", 1.5]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.45.0|6.0.0|4.0.0|


### floor
Returns the largest integer that is less than or equal to the input.

Syntax:
```js
["floor", input]: number
```

- `input`: `number`

Example:
```json
"some-property": ["floor", 1.5]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.45.0|6.0.0|4.0.0|


### distance
Returns the shortest distance in meters between the evaluated feature and the input geometry. The input value can be a valid GeoJSON of type `Point`, `MultiPoint`, `LineString`, `MultiLineString`, `Polygon`, `MultiPolygon`, `Feature`, or `FeatureCollection`. Distance values returned may vary in precision due to loss in precision from encoding geometries, particularly below zoom level 13.

Syntax:
```js
["distance", geojson]: number
```

- `geojson`: `GeoJSON object`

Example:
```json
"some-property": ["distance", {"type": "Point", "coordinates": [0, 0]}]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|4.2.0|9.2.0|5.9.0|

## Color


### to-rgba
Returns a four-element array containing the input color's red, green, blue, and alpha components, in that order.

Syntax:
```js
["to-rgba", color]: array
```

- `color`: `color`

Example:
```json
"some-property": ["to-rgba", "#ff0000"]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.41.0|6.0.0|4.0.0|


### rgb
Creates a color value from red, green, and blue components, which must range between 0 and 255, and an alpha component of 1. If any component is out of range, the expression is an error.

Syntax:
```js
["rgb", red, green, blue]: color
```

- `red`: `number`
- `green`: `number`
- `blue`: `number`

Example:
```json
"some-property": ["rgb", 255, 0, 0]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.41.0|6.0.0|4.0.0|


### rgba
Creates a color value from red, green, blue components, which must range between 0 and 255, and an alpha component which must range between zero and one. If any component is out of range, the expression is an error.

Syntax:
```js
["rgba", red, green, blue, alpha]: color
```

- `red`: `number`
- `green`: `number`
- `blue`: `number`
- `alpha`: `number`

Example:
```json
"some-property": ["rgba", 255, 0, 0, 1]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.41.0|6.0.0|4.0.0|

## Feature data


### properties
Gets the feature properties object.  Note that in some cases, it may be more efficient to use ["get", "property_name"] directly.

Syntax:
```js
["properties"]: object
```


Example:
```json
"some-property": ["properties"]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.41.0|6.0.0|4.0.0|


### feature-state
Retrieves a property value from the current feature's state. Returns null if the requested property is not present on the feature's state. A feature's state is not part of the GeoJSON or vector tile data, and must be set programmatically on each feature. When `source.promoteId` is not provided, features are identified by their `id` attribute, which must be an integer or a string that can be cast to an integer. When `source.promoteId` is provided, features are identified by their `promoteId` property, which may be a number, string, or any primitive data type. Note that ["feature-state"] can only be used with paint properties that support data-driven styling.

 - [Create a hover effect](https://maplibre.org/maplibre-gl-js/docs/examples/create-a-hover-effect/)

Syntax:
```js
["feature-state", property_name]: any
```

- `property_name`: `string`

Example:
```json
"some-property": ["feature-state", "hover"]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.46.0|❌ ([#1698](https://github.com/maplibre/maplibre-native/issues/1698))|❌ ([#1698](https://github.com/maplibre/maplibre-native/issues/1698))|


### geometry-type
Returns the feature's simple geometry type: `Point`, `LineString`, or `Polygon`. `MultiPoint`, `MultiLineString`, and `MultiPolygon` are returned as `Point`, `LineString`, and `Polygon`, respectively.

Syntax:
```js
["geometry-type"]: string
```


Example:
```json
"some-property": ["==", ["geometry-type"], "Polygon"]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.41.0|6.0.0|4.0.0|


### id
Gets the feature's id, if it has one.

Syntax:
```js
["id"]: any
```


Example:
```json
"some-property": ["id"]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.41.0|6.0.0|4.0.0|


### line-progress
Gets the progress along a gradient line. Can only be used in the `line-gradient` property.

Syntax:
```js
["line-progress"]: number
```


Example:
```json
"some-property": ["line-progress"]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.45.0|6.5.0|4.6.0|


### accumulated
Gets the value of a cluster property accumulated so far. Can only be used in the `clusterProperties` option of a clustered GeoJSON source.

Syntax:
```js
["accumulated"]: any
```


Example:
```json
"some-property": ["accumulated"]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.53.0|✅|✅|

## Zoom


### zoom
Gets the current zoom level.  Note that in style layout and paint properties, ["zoom"] may only appear as the input to a top-level "step" or "interpolate" expression.

Syntax:
```js
["zoom"]: number
```


Example:
```json
"some-property": [
    "interpolate",
    ["linear"],
    ["zoom"],
    15,
    0,
    15.05,
    ["get", "height"]
]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.41.0|6.0.0|4.0.0|

## Heatmap


### heatmap-density
Gets the kernel density estimation of a pixel in a heatmap layer, which is a relative measure of how many data points are crowded around a particular pixel. Can only be used in the `heatmap-color` property.

Syntax:
```js
["heatmap-density"]: number
```


Example:
```json
"some-property": ["heatmap-density"]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.41.0|6.0.0|4.0.0|

## Color Relief


### elevation
Gets the elevation of a pixel (in meters above the vertical datum reference of the `raster-dem` tiles) from a `raster-dem` source. Can only be used in the `color-relief-color` property of a `color-relief` layer.

Syntax:
```js
["elevation"]: number
```


Example:
```json
"some-property": ["elevation"]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|5.6.0|❌ ([#3408](https://github.com/maplibre/maplibre-native/issues/3408))|❌ ([#3408](https://github.com/maplibre/maplibre-native/issues/3408))|

## String


### is-supported-script
Returns `true` if the input string is expected to render legibly. Returns `false` if the input string contains sections that cannot be rendered without potential loss of meaning (e.g. Indic scripts that require complex text shaping, or right-to-left scripts if the `mapbox-gl-rtl-text` plugin is not in use in MapLibre GL JS).

Syntax:
```js
["is-supported-script", input]: boolean
```

- `input`: `string`

Example:
```json
"some-property": ["is-supported-script", "दिल्ली"]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.45.0|6.6.0|✅|


### upcase
Returns the input string converted to uppercase. Follows the Unicode Default Case Conversion algorithm and the locale-insensitive case mappings in the Unicode Character Database.

 - [Change the case of labels](https://maplibre.org/maplibre-gl-js/docs/examples/change-case-of-labels/)

Syntax:
```js
["upcase", input]: string
```

- `input`: `string`

Example:
```json
"some-property": ["upcase", ["get", "name"]]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.41.0|6.0.0|4.0.0|


### downcase
Returns the input string converted to lowercase. Follows the Unicode Default Case Conversion algorithm and the locale-insensitive case mappings in the Unicode Character Database.

 - [Change the case of labels](https://maplibre.org/maplibre-gl-js/docs/examples/change-case-of-labels/)

Syntax:
```js
["downcase", input]: string
```

- `input`: `string`

Example:
```json
"some-property": ["downcase", ["get", "name"]]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.41.0|6.0.0|4.0.0|


### concat
Returns a `string` consisting of the concatenation of the inputs. Each input is converted to a string as if by `to-string`.

 - [Add a generated icon to the map](https://maplibre.org/maplibre-gl-js/docs/examples/add-a-generated-icon-to-the-map/)

 - [Create a time slider](https://maplibre.org/maplibre-gl-js/docs/examples/create-a-time-slider/)

 - [Use a fallback image](https://maplibre.org/maplibre-gl-js/docs/examples/fallback-image/)

 - [Variable label placement](https://maplibre.org/maplibre-gl-js/docs/examples/variable-label-placement/)

Syntax:
```js
["concat", input_1, ..., input_n]: string
```

- `input_i`: `any`

Example:
```json
"some-property": ["concat", "square-rgb-", ["get", "color"]]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.41.0|6.0.0|4.0.0|


### resolved-locale
Returns the IETF language tag of the locale being used by the provided `collator`. This can be used to determine the default system locale, or to determine if a requested locale was successfully loaded.

Syntax:
```js
["resolved-locale", collator]: string
```

- `collator`: `collator`

Example:
```json
"some-property": [
    "resolved-locale",
    [
        "collator",
        {
            "case-sensitive": true,
            "diacritic-sensitive": false,
            "locale": "de"
        }
    ]
]
```


|SDK Support|MapLibre GL JS|MapLibre Native<br>Android|MapLibre Native<br>iOS
|-----------|--------------|-----------|-------
|basic functionality|0.45.0|6.5.0|4.2.0|

