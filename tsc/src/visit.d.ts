import type { StylePropertySpecification } from './style-spec';
import type { StyleSpecification, SourceSpecification, LayerSpecification, PropertyValueSpecification, DataDrivenPropertyValueSpecification } from './types.g';
export declare function eachSource(style: StyleSpecification, callback: (_: SourceSpecification) => void): void;
export declare function eachLayer(style: StyleSpecification, callback: (_: LayerSpecification) => void): void;
type PropertyCallback = (a: {
    path: [string, 'paint' | 'layout', string];
    key: string;
    value: PropertyValueSpecification<unknown> | DataDrivenPropertyValueSpecification<unknown>;
    reference: StylePropertySpecification;
    set: (a: PropertyValueSpecification<unknown> | DataDrivenPropertyValueSpecification<unknown>) => void;
}) => void;
export declare function eachProperty(style: StyleSpecification, options: {
    paint?: boolean;
    layout?: boolean;
}, callback: PropertyCallback): void;
export {};
