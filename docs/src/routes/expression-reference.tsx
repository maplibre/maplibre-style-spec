import ExpressionReference from '~/components/style-spec/specs/expression-reference';
import {SolidMd} from '~/utils/SolidMd';
export const title = 'Root';

function Root() {

    return (
        <div>
            <SolidMd content={`
# Expression reference



## Types

The expressions in this section are for testing for and converting between different data types like strings, numbers, and boolean values.

Often, such tests and conversions are unnecessary, but they may be necessary in some expressions where the type of a certain sub-expression is ambiguous. They can also be useful in cases where your feature data has inconsistent types; for example, you could use \`to-number\` to make sure that values like \`"1.5"\` (instead of \`1.5\`) are treated as numeric values.

`} />

            <ExpressionReference group='Types' />
            <SolidMd content='## Feature data' />
            <ExpressionReference group='Feature data' />
            <SolidMd content='## Lookup' />

            <ExpressionReference group='Lookup' />
            <SolidMd content={`
## Decision

The expressions in this section can be used to add conditional logic to your styles. For example, the [\`'case'\`](#case)  expression provides "if/then/else" logic, and [\`'match'\`](#match) allows you to map specific values of an input expression to different output expressions.
`} />

            <ExpressionReference group='Decision' />

            <SolidMd content='## Ramps, scales, curves' />

            <ExpressionReference group='Ramps, scales, curves' />

            <SolidMd content='## Variable binding' />

            <ExpressionReference group='Variable binding' />

            <SolidMd content='## String' />

            <ExpressionReference group='String' />

            <SolidMd content='## Color' />

            <ExpressionReference group='Color' />

            <SolidMd content='## Math' />

            <ExpressionReference group='Math' />

            <SolidMd content='## Zooming' />

            <ExpressionReference group='Zoom' />

            <SolidMd content='## Heatmap' />

            <ExpressionReference group='Heatmap' />
        </div>
    );
}

export default Root;
