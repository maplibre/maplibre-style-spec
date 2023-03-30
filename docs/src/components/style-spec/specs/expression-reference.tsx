import {groupedExpressions} from '../../data/types.jsx';
import SDKSupportTable from '../sdk_support_table.jsx';
import {renderSignature} from './render-signature';
import Property from './property.jsx';
import related from '../../data/expressions-related.json';

interface IExpressionReference {
    group: string;
  
}

export default function ExpressionReference (props: IExpressionReference){
    
    const group = groupedExpressions.filter(
        (g) => g.name === props.group
    )[0];
    debugger;
    
    const SubHeading = ({children}) => (
        <h3
            style={{fontSize: '15px', lineHeight: '24px'}}
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

        < key={name}>
            {/* Section heading */}
            <Property
                id={`${group.name === 'Types' ? 'types-' : ''}${name}`}
            >
                {name}
            </Property>
            {/* Description */}
            {doc && <ReactMarkdown class="mb12">{doc}</ReactMarkdown>}
            {/* Syntax */}
            <SubHeading>Syntax</SubHeading>
            {type.map((overload, i) => (

                <div key={i}>
                    {highlightJavascript(renderSignature(name, overload))}
                </div>
            ))}
            {/* Show related links if available */}
            {related[name] && <Related links={related[name]} />}
            {/* Show SDK support table if available */}

            {sdkSupport && <SDKSupportTable supportItems={sdkSupport} /> }
        </>
    ));
}

