# Schema

The value for `state` properties. Defines the default state property value, and its type.

The schema definition follows a subset of [JSON Schema](https://json-schema.org/) but is more strict in terms of what properties are required.

## Data types

### enum


The `enum` keyword is used to restrict a value to a fixed set of values. It must be an array with at least one element, where each element is unique.

```json
{  
    "enum": ["red", "amber", "green"],
    "default": "red"
}
```

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

### array

Arrays are used for ordered elements. Type of items in an array is defined with required `items`. Allowed item types are all schema types. 

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

A default value is required for each data type and is defined with the `default` keyword. The value of the default will be validated against the data type during style validation.


## Annotations

The `title` and `description` keywords must be strings. A "title" will preferably be short, whereas a "description" will provide a more lengthy explanation of the purpose of the data described by the schema.