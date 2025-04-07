## Data types

State property values must adhere to the types defined below.


### number

The `number` type is used for any numeric type, either integers or floating point numbers.

```json
{  
    "type": "number",
    "minimum": 0, // optional
    "maximum": 100, // optional
    "default": 42
}
```

You can define range using optional `minimum` and `maximum` keywords. Range is inclusive.

### string

The `string` type is used for strings of text. It may contain Unicode characters.

```json
{  
    "type": "string",
    "default": "Montréal"
}
```

### boolean

The `boolean` type matches only two special values: `true` and `false`.

```json
{  
    "type": "boolean",
    "default": true
}
```

### enum

The `enum` keyword is used to restrict a value to a fixed set of values. It must be an array with at least one element, where each element is unique.

```json
{  
    "enum": ["red", "amber", "green"],
    "default": "red"
}
```

### array

Arrays are used for multiple elements. Type of items in an array is defined with required `items`.

```json
{  
    "type": "array",
    "items": {
        "type": "string"
    },
    "default": ["red", "amber", "green"]
}
```

## Default values

All data types can have optional `default` property. The value of the `default` property will be validated against the data type during style validation.
