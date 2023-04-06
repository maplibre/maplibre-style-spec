import SDKSupportTable from '../sdk-support-table/sdk-support-table';
import Property from '../property.jsx';
import Subtitle from '../subtitle.jsx';
import {Markdown} from '~/components/markdown/markdown';
import {Show} from 'solid-js';

export default function Item (props:{
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
}) {

    function type(spec = props, plural = false) {
        switch (spec.type) {
            case null:
            case '*':
                return;
            case 'light':
                return (
                    <span>
                        {' '}
                        <a href={`${import.meta.env.BASE_URL}light/`}>
                            light
                        </a>
                    </span>
                );
            case 'transition':
                return (
                    <span>
                        {' '}
                        <a href={`${import.meta.env.BASE_URL}transition/`}>
                            transition
                        </a>
                    </span>
                );
            case 'sources':
                return (
                    <span>
                        {' '}
                        object with{' '}
                        <a href={`${import.meta.env.BASE_URL}sources/`}>
                            source
                        </a>{' '}
                        values
                    </span>
                );
            case 'layer':
                return (
                    <span>
                        {' '}
                        <a href={`${import.meta.env.BASE_URL}layers/`}>
                            layer
                            <Show when={plural}>s</Show>
                        </a>
                    </span>
                );
            case 'array':
                return (
                    <span>
                        {' '}
                        <a href={`${import.meta.env.BASE_URL}types/#array`}>
                            array
                        </a>
                        <Show when={spec.value}>
                            <span>
                                {' of '}
                                {type(
                                    typeof spec.value === 'string' ?
                                        {type: spec.value} :
                                        spec.value,
                                    true
                                )}
                            </span>
                        </Show>
                    </span>
                );
            case 'filter':
                return (
                    <span>
                        {' '}
                        <a href={`${import.meta.env.BASE_URL}expressions/`}>
                            expression
                            <Show when={plural}>s</Show>
                        </a>
                    </span>
                );
            case 'layout':
                return (
                    <span>
                        {' '}
                        <a href={`${import.meta.env.BASE_URL}layers/#layout-property`}>
                            layout
                        </a>
                    </span>
                );
            case 'paint':
                return (
                    <span>
                        {' '}
                        <a href={`${import.meta.env.BASE_URL}layers/#paint-property`}>
                            paint
                        </a>
                    </span>
                );
            default:
                return (
                    <span>
                        {' '}
                        <a
                            href={`${import.meta.env.BASE_URL}types/#${spec.type}`}
                        >
                            <span>{spec.type}
                                <Show when={plural}>s</Show>
                            </span>
                        </a>
                    </span>
                );
        }
    }

    function requires(req) {
        if (typeof req === 'string') {
            return (
                <span>
                    <em>Requires</em> <var>{req}</var>.{' '}
                </span>
            );
        } else if (req['!']) {
            return (
                <span>
                    <em>Disabled by</em> <var>{req['!']}</var>.{' '}
                </span>
            );
        } else {
            const [name, value] = Object.entries(req)[0];
            if (Array.isArray(value)) {
                return (
                    <span>
                        <em>Requires</em> <var>{name}</var> to be{' '}
                        {value
                            .map((r) => (
                                <code>{JSON.stringify(r)}</code>
                            ))
                            .reduce((prev, curr) => [prev, ', or ', curr])}
                        <span>{'. '}</span>
                    </span>
                );
            } else {
                return (
                    <span>
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
                <Show when={props.kind === 'paint'}>
                    <a href={`${import.meta.env.BASE_URL}layers/#paint-property`}>
                                Paint
                    </a><span>{' property. '}</span>
                </Show>
                <Show when={props.kind === 'layout'}>
                    <a href={`${import.meta.env.BASE_URL}layers/#layout-property`}>
                                Layout
                    </a>{' property. '}
                </Show>

                <Show when={props.required} fallback="Optional">Required</Show>
                {type()}

                <Show when={!('minimum' in props) && 'maximum' in props}>
                    <span>
                        {' less than or equal to '}
                        <code>{props.minimum}</code>
                    </span>
                </Show>
                <span>{'. '}</span>

                <Show when={props.values &&
                        !Array.isArray(props.values)}>

                    <span>{'One of '}</span>
                    {Object.keys(props.values)
                        .map((opt) => (
                            <code>
                                {JSON.stringify(opt)}
                            </code>
                        ))
                        .reduce((prev, curr) => [prev, ', ', curr])}
                    <span>{'. '}</span>

                </Show>

                <Show when={props.units}>
                    Units in <var>{props.units}</var>.{' '}
                </Show>

                <Show when={props.default !== undefined}>

                    <span>{'Defaults to '}</span>
                    <code>{JSON.stringify(props.default)}</code>.{' '}

                </Show>

                <Show when={props.requires}>
                    {props.requires.map((r, i) =>
                        requires(r, i)
                    )}<span>{' '}</span>
                </Show>

                <Show when={props.expression &&
                        (props.expression.interpolated ||
                            props.expression.parameters.includes(
                                'feature-state'
                            ))}>
                    <span>{'Supports '}</span>
                    <Show when={props.expression.parameters.includes(
                        'feature-state'
                    )}>
                        <em class="color-gray">
                            <a href={`${import.meta.env.BASE_URL}expressions/#feature-state`}>

                                <code>feature-state</code>
                            </a>
                        </em>
                    </Show>
                    <Show when={props.expression.interpolated &&
                                    props.expression.parameters.includes(
                                        'feature-state'
                                    )}>
                        <span>{' and '}</span>
                    </Show>
                    <Show when={props.expression.interpolated}>
                        <a href={`${import.meta.env.BASE_URL}expressions/#interpolate`}>

                            <code>interpolate</code>
                        </a>
                    </Show>
                    <span>{' expressions. '}</span>
                </Show>

                <Show when={props.transition}>
                    <span>{'Transitionable. '}</span>
                </Show>
            </Subtitle>

            <Show when={props.doc}>
                <div class="mb12 style-spec-item-doc">
                    <Markdown content={props.doc} />
                </div>
            </Show>

            <Show when={props.values &&
                    !Array.isArray(props.values)}>
                <div class="my12 style-spec-item-dl">
                    <dl>
                        {Object.entries(props.values).map(
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
            </Show>

            <Show when={props.example}>
                <Markdown content={`
\`\`\`json
"${props.name}": ${JSON.stringify(
            props.example,
            null,
            2
        )}
\`\`\`
`} />
            </Show>

            <Show when={props['sdk-support']}>
                <div class="mt12">
                    <SDKSupportTable {...props['sdk-support']} />
                </div>
            </Show>
        </>
    );

}

