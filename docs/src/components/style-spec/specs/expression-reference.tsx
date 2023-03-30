import {groupedExpressions} from '../../data/types';
import SDKSupportTable from '../sdk_support_table';
import {renderSignature} from './render-signature';
import Property from './property.jsx';
import related from '../../data/expressions-related.json';
import {SolidMd} from '~/utils/SolidMd.jsx';

interface IExpressionReference {
    group: string;

}

export default function ExpressionReference (props: IExpressionReference) {

    const group = groupedExpressions.filter(
        (g) => g.name === props.group
    )[0];
    debugger;

    const SubHeading = ({children}) => (
        <h3
            style={{'font-size': '15px', 'line-height': '24px'}}
            class="txt-bold mb6 unprose pt0"
        >
            {children}
        </h3>
    );

    const Related = ({links}) => {
        if (!links || !links.length === 0) return;
        return (
            <>
                <SubHeading>Related</SubHeading>
                <ul class="mb18">
                    {links.map((link) => (
                        <li key={link.title}>
                            <a href={link.href}>{link.title}</a>
                        </li>
                    ))}
                </ul>
            </>
        );
    };
    return group.expressions.map(({name, doc, type, sdkSupport}) => (

        <>
            {/* Section heading */}
            <Property
                id={`${group.name === 'Types' ? 'types-' : ''}${name}`}
            >
                {name}
            </Property>
            {/* Description */}
            {doc && <div class="mb12"><SolidMd content={doc} /></div>}
            {/* Syntax */}
            <SubHeading>Syntax</SubHeading>
            {type.map((overload, i) => (

                <div>
                    <SolidMd content={`
\`\`\`javascript
${renderSignature(name, overload)}
\`\`\`
                    `} />
                    {/* {highlightJavascript(renderSignature(name, overload))} */}
                </div>
            ))}
            {/* Show related links if available */}
            {related[name] && <Related links={related[name]} />}
            {/* Show SDK support table if available */}

            {sdkSupport && <SDKSupportTable supportItems={sdkSupport} /> }
        </>
    ));
}

