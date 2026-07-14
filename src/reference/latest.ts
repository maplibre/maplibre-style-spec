import v8 from './v8.json' with {type: 'json'};

/**
 * The style specification reference, i.e. the contents of `v8.json`, Inferred from the JSON itself.
 */
export type StyleSpecificationReference = typeof v8;

const latest: StyleSpecificationReference = v8;

export {latest};
