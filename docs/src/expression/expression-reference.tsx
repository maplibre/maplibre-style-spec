import {groupedExpressions} from './expression-types';
import SDKSupportTable from '../components/sdk-support-table/sdk-support-table';
import {renderSignature} from './render-signature';
import Property from '~/components/property.jsx';
import related from './expressions-related.json';
import {Markdown} from '~/components/markdown/markdown.jsx';

interface IExpressionReference {
    group: string;

}

export default function ExpressionReference (props: IExpressionReference) {

    const group = groupedExpressions.filter(
        (g) => g.name === props.group
    )[0];

    const SubHeading = ({children}) => (
        <h4
            style={{'font-size': '15px', 'font-weight': 900, 'line-height': '24px'}}
            class="txt-bold mb6 unprose pt0"
        >
            {children}
        </h4>
    );

    const Related = ({links}) => {
        if (!links || !links.length === 0) return;
        return (
            <>
                <SubHeading>Related</SubHeading>
                <ul class="mb18">
                    {links.map((link) => (
                        <li>
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
            {doc && <div class="mb12"><Markdown content={doc} /></div>}
            {/* Syntax */}
            <SubHeading>Syntax</SubHeading>
            {type.map((overload) => (

                <div>
                    <Markdown content={`
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

