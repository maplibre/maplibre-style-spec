// validates the schema of the input data

import {ValidationError} from "../error/validation_error";
import {getType} from "../util/get_type";
import {isExpression} from "../expression";
import {deepUnbundle, unbundle} from "../util/unbundle_jsonlint";
import {validateExpression} from "./validate_expression";
interface ValidateStateOptions {
  key: "state";
  value: unknown;
  valueSpec: any;
}

interface ValidateStatePropertyOptions {
  key: string;
  value: unknown;
}

export function validateState(options: ValidateStateOptions) {
  if (!isObjectLiteral(options.value)) {
    return [
      new ValidationError(
        options.key,
        options.value,
        `object expected, ${getType(options.value)} found`
      ),
    ];
  }

  const errors = [];

  for (const key in options.value) {
    const schema = options.value[key];
    const propertyErrors = validateStateProperty({
      value: schema,
      key: `${options.key}.${key}`,
    });
    errors.push(...propertyErrors);
  }

  return errors;
}

export function validateStateProperty(options: ValidateStatePropertyOptions) {
  if (isExpression(deepUnbundle(options.value))) {
    return validateExpression(options);
  }

  return validateSchema(options.value, options.key);
}

export function validateSchema(value: unknown, key: string) {
  if (!isObjectLiteral(value)) {
    return [
      new ValidationError(
        key,
        value,
        `object expected, ${getType(value)} found`
      ),
    ];
  }
  if (value.type === undefined && value.enum === undefined) {
    return [
      new ValidationError(
        `${key}.value`,
        value,
        'schema must have a "type" or "enum" property'
      ),
    ];
  }
  if (value.default === undefined) {
    return [
      new ValidationError(`${key}`, value, "default is required"),
    ];
  }

  switch (unbundle(value.type)) {
    case "string":
      return validateString(value, key);
    case "number":
      return validateNumber(value, key);
    case "boolean":
      return validateBoolean(value, key);
    case "array": {
      return validateArray(value, key);
    }
    default: {
      if (value.type !== undefined) {
        return [
          new ValidationError(
            "type",
            value.type,
            "expected string, number or boolean"
          ),
        ];
      }
    }
  }

  return validateEnum(value, key);
}

export function validateString(schema: Record<string, unknown>, key: string) {
  if (typeof unbundle(schema.default) !== "string") {
    return [
      new ValidationError(`${key}.default`, schema.default, "string expected"),
    ];
  }

  return [];
}
export function validateNumber(schema: Record<string, unknown>, key: string) {
  const defaultValue = unbundle(schema.default);
  if (defaultValue === undefined) {
    return [
      new ValidationError(
        `${key}.default`,
        schema.default,
        "default is required"
      ),
    ];
  }

  if (typeof defaultValue !== "number") {
    return [
      new ValidationError(`${key}.default`, schema.default, "number expected"),
    ];
  }

  const minimum = unbundle(schema.minimum);
  if (minimum !== undefined) {
    if (typeof minimum !== "number") {
      return [
        new ValidationError(
          `${key}.default`,
          schema.default,
          "must be a number"
        ),
      ];
    }

    if (defaultValue < minimum) {
      return [
        new ValidationError(
          `${key}.default`,
          schema.default,
          `must be greater than or equal to ${minimum}`
        ),
      ];
    }
  }

  const maximum = unbundle(schema.maximum);
  if (maximum !== undefined) {
    if (typeof maximum !== "number") {
      return [
        new ValidationError(
          `${key}.default`,
          schema.default,
          "must be a number"
        ),
      ];
    }

    if (defaultValue > maximum) {
      return [
        new ValidationError(
          `${key}.default`,
          schema.default,
          `must be less than or equal to ${maximum}`
        ),
      ];
    }
  }

  return [];
}

export function validateEnum(schema: Record<string, unknown>, key: string) {
  if (!Array.isArray(schema.enum)) {
    return [
      new ValidationError(`${key}.enum`, schema.enum, "expected an array"),
    ];
  }

  if (schema.enum.length === 0) {
    return [
      new ValidationError(
        `${key}.enum`,
        schema.enum,
        "expected at least 1 element"
      ),
    ];
  }

  if (
    !(deepUnbundle(schema.enum) as any[]).includes(unbundle(schema.default))
  ) {
    return [
      new ValidationError(
        `${key}.default`,
        schema.default,
        "expected one of the enum values: " + schema.enum.join(", ")
      ),
    ];
  }

  return [];
}

export function validateArray(schema: Record<string, unknown>, key: string) {
  if (!Array.isArray(schema.default)) {
    return [
      new ValidationError(`${key}.default`, schema.default, "array expected"),
    ];
  }

  if (schema.items === undefined) {
    return [new ValidationError(`${key}.items`, schema.items, "is required")];
  }

  if (!isObjectLiteral(schema.items)) {
    return [
      new ValidationError(`${key}.items`, schema.items, "object expected"),
    ];
  }

  if (schema.items.type === undefined && schema.items.enum === undefined) {
    return [
      new ValidationError(
        `${key}.items`,
        schema.items,
        'must have a "type" or "enum" property'
      ),
    ];
  }

  const errors = [];

  schema.default.forEach((item: unknown, index: number) => {
    const itemErrors = validateSchema(
      {
        ...(schema.items as Record<string, unknown>),
        default: item,
      },
      `${key}[${index}]`
    );

    errors.push(...itemErrors);
  });

  return errors;
}

export function validateBoolean(schema: Record<string, unknown>, key: string) {
  if (typeof unbundle(schema.default) != "boolean") {
    return [
      new ValidationError(`${key}.default`, schema.default, "boolean expected"),
    ];
  }

  return [];
}

function isObjectLiteral(
  anything: unknown
): anything is Record<string, unknown> {
  return Boolean(anything) && anything.constructor === Object;
}
