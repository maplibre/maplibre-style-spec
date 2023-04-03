import entries from 'object.entries';
import SDKSupportTable from '../sdk-support-table/sdk-support-table';
// import Icon from '@mapbox/mr-ui/icon';
import Property from '../property.jsx';
import Subtitle from '../subtitle.jsx';
import {Markdown} from '~/components/markdown/markdown';

interface IItem {
    id: string;
    name: string;
    kind: string;
    required: boolean;
    minimum: number;
    maximum: number;
    values?: string[] | object;
    default?: string | boolean | number |  string[] | object ;
    requires: string[];
    function: object;
    transition: boolean;
    example?: string  | number |  string[] | object ;
    'sdk-support': object;
    expression: object;
    headingLevel?: '2' | '3';

}

export default function Item (props:IItem) {

    function type(spec = props, plural = false) {
        switch (spec.type) {
            case null:
            case '*':
                return;
            case 'light':
                return (
                    <span>
                        {' '}
                        <a href="/maplibre-gl-style-spec/style-spec/light/">
                            light
                        </a>
                    </span>
                );
            case 'transition':
                return (
                    <span>
                        {' '}
                        <a href="/maplibre-gl-style-spec/style-spec/transition/">
                            transition
                        </a>
                    </span>
                );
            case 'sources':
                return (
                    <span>
                        {' '}
                        object with{' '}
                        <a href="/maplibre-gl-style-spec/style-spec/sources/">
                            source
                        </a>{' '}
                        values
                    </span>
                );
            case 'layer':
                return (
                    <span>
                        {' '}
                        <a href="/maplibre-gl-style-spec/style-spec/layers/">
                            layer
                            {plural && 's'}
                        </a>
                    </span>
                );
            case 'array':
                return (
                    <span>
                        {' '}
                        <a href="/maplibre-gl-style-spec/style-spec/types/#array">
                            array
                        </a>
                        {spec.value && (
                            <span>
                                {' '}
                                of{' '}
                                {type(
                                    typeof spec.value === 'string' ?
                                        {type: spec.value} :
                                        spec.value,
                                    true
                                )}
                            </span>
                        )}
                    </span>
                );
            case 'filter':
                return (
                    <span>
                        {' '}
                        <a href="/maplibre-gl-style-spec/style-spec/expressions/">
                            expression
                            {plural && 's'}
                        </a>
                    </span>
                );
            case 'layout':
                return (
                    <span>
                        {' '}
                        <a href="/maplibre-gl-style-spec/style-spec/layers/#layout-property">
                            layout
                        </a>
                    </span>
                );
            case 'paint':
                return (
                    <span>
                        {' '}
                        <a href="/maplibre-gl-style-spec/style-spec/layers/#paint-property">
                            paint
                        </a>
                    </span>
                );
            default:
                return (
                    <span>
                        {' '}
                        <a
                            href={`/maplibre-gl-style-spec/style-spec/types/#${spec.type}`}
                        >
                            {spec.type}
                            {plural && 's'}
                        </a>
                    </span>
                );
        }
    }

    function requires(req, i) {
        if (typeof req === 'string') {
            return (
                <span key={i}>
                    <em>Requires</em> <var>{req}</var>.{' '}
                </span>
            );
        } else if (req['!']) {
            return (
                <span key={i}>
                    <em>Disabled by</em> <var>{req['!']}</var>.{' '}
                </span>
            );
        } else {
            const [name, value] = entries(req)[0];
            if (Array.isArray(value)) {
                return (
                    <span key={i}>
                        <em>Requires</em> <var>{name}</var> to be{' '}
                        {value
                            .map((r, i) => (
                                <code key={i}>{JSON.stringify(r)}</code>
                            ))
                            .reduce((prev, curr) => [prev, ', or ', curr])}
                        .{' '}
                    </span>
                );
            } else {
                return (
                    <span key={i}>
                        <em>Requires</em> <var>{name}</var> to be{' '}
                        <code>{JSON.stringify(value)}</code>.{' '}
                    </span>
                );
            }
        }
    }

    return (
        <>
            <Property
                headingLevel={props.headingLevel}
                id={props.id}
            >
                {props.name}
            </Property>
            <Subtitle>
                {props.kind === 'paint' && (
                    <>
                        <a href="/maplibre-gl-style-spec/style-spec/layers/#paint-property">
                                Paint
                        </a>{' '}
                            property.{' '}
                    </>
                )}
                {props.kind === 'layout' && (
                    <>
                        <a href="/maplibre-gl-style-spec/style-spec/layers/#layout-property">
                                Layout
                        </a>{' '}
                            property.{' '}
                    </>
                )}

                <>
                    {props.required ? 'Required' : 'Optional'}
                    {type()}
                    {'minimum' in props && 'maximum' in props && (
                        <span>
                            {' '}
                                between <code>
                                {props.minimum}
                            </code> and <code>{props.maximum}</code>{' '}
                                inclusive
                        </span>
                    )}
                    {'minimum' in props && !('maximum' in props) && (
                        <span>
                            {' '}
                                greater than or equal to{' '}
                            <code>{props.minimum}</code>
                        </span>
                    )}
                    {!('minimum' in props) && 'maximum' in props && (
                        <span>
                            {' '}
                                less than or equal to{' '}
                            <code>{props.minimum}</code>
                        </span>
                    )}
                        .{' '}
                </>

                {props.values &&
                        !Array.isArray(props.values) && ( // skips $root.version
                    <>
                                One of{' '}
                        {Object.keys(props.values)
                            .map((opt, i) => (
                                <code key={i}>
                                    {JSON.stringify(opt)}
                                </code>
                            ))
                            .reduce((prev, curr) => [prev, ', ', curr])}
                                .{' '}
                    </>
                )}

                {props.units && (
                    <>
                            Units in <var>{props.units}</var>.{' '}
                    </>
                )}

                {props.default !== undefined && (
                    <>
                            Defaults to{' '}
                        <code>{JSON.stringify(props.default)}</code>.{' '}
                    </>
                )}

                {props.requires && (
                    <>
                        {props.requires.map((r, i) =>
                            requires(r, i)
                        )}{' '}
                    </>
                )}

                {props.expression &&
                        (props.expression.interpolated ||
                            props.expression.parameters.includes(
                                'feature-state'
                            )) && (
                    <>
                                Supports{' '}
                        {props.expression.parameters.includes(
                            'feature-state'
                        ) && (
                            <em class="color-gray">
                                <a href="/maplibre-gl-style-spec/style-spec/expressions/#feature-state">

                                    <code>feature-state</code>
                                </a>
                            </em>
                        )}
                        {props.expression.interpolated &&
                                    props.expression.parameters.includes(
                                        'feature-state'
                                    ) &&
                                    ' and '}
                        {props.expression.interpolated && (
                            <a href="/maplibre-gl-style-spec/style-spec/expressions/#interpolate">

                                <code>interpolate</code>
                            </a>
                        )}
                                expressions.{' '}
                    </>
                )}

                {props.transition && (
                    <>
                            Transitionable.{' '}
                    </>
                )}
            </Subtitle>

            {props.doc && (
                <div class="mb12 style-spec-item-doc">
                    <Markdown content={props.doc} />
                </div>
            )}

            {props.values &&
                    !Array.isArray(props.values) && ( // skips $root.version
                <div class="my12 style-spec-item-dl">
                    <dl>
                        {entries(props.values).map(
                            ([v, {doc}], i) => [
                                <dt key={`${i}-dt`}>
                                    <code>{JSON.stringify(v)}</code>:
                                </dt>,
                                <dd key={`${i}-dd`} class="mb12">
                                    <Markdown content={doc} />
                                </dd>
                            ]
                        )}
                    </dl>
                </div>
            )}

            {props.example &&
                    <Markdown content={`
\`\`\`json
"${props.name}": ${JSON.stringify(
            props.example,
            null,
            2
        )}
\`\`\`
`} />
            }

            {props['sdk-support'] && (
                <div class="mt12">
                    <SDKSupportTable {...props['sdk-support']} />
                </div>
            )}
        </>
    );

}

