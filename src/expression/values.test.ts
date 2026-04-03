import {
    CollatorType,
    ColorArrayType,
    ColorType,
    FormattedType,
    NumberArrayType,
    PaddingType,
    ProjectionDefinitionType,
    VariableAnchorOffsetCollectionType
} from './types';
import {Collator} from './types/collator';
import {Color} from './types/color';
import {ColorArray} from './types/color_array';
import {Formatted} from './types/formatted';
import {NumberArray} from './types/number_array';
import {Padding} from './types/padding';
import {ProjectionDefinition} from './types/projection_definition';
import {VariableAnchorOffsetCollection} from './types/variable_anchor_offset_collection';
import {typeOf} from './values';
import {describe, test, expect} from 'vitest';

describe('typeOf', () => {
    test('typeOf', () => {
        expect(typeOf(Color.red)).toBe(ColorType);
        expect(typeOf(ProjectionDefinition.parse('mercator'))).toBe(ProjectionDefinitionType);
        expect(typeOf(new Collator(false, false, null))).toBe(CollatorType);
        expect(typeOf(Formatted.factory('a'))).toBe(FormattedType);
        expect(typeOf(Padding.parse(1))).toBe(PaddingType);
        expect(typeOf(NumberArray.parse(1))).toBe(NumberArrayType);
        expect(typeOf(ColorArray.parse('red'))).toBe(ColorArrayType);
        expect(typeOf(VariableAnchorOffsetCollection.parse(['top', [2, 2]]))).toBe(
            VariableAnchorOffsetCollectionType
        );
    });
});
