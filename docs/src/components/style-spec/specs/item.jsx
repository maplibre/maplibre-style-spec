import React from 'react';
import PropTypes from 'prop-types';
import md from '../md';
import ReactMarkdown from 'react-markdown'

import { highlightJSON } from '../prism_highlight';
import entries from 'object.entries';
import SDKSupportTable from '../sdk_support_table';
// import Icon from '@mapbox/mr-ui/icon';
import Property from './property.jsx';
import Subtitle from './subtitle.jsx';

export default class Item extends React.Component {
    type(spec = this.props, plural = false) {
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
                                {this.type(
                                    typeof spec.value === 'string'
                                        ? { type: spec.value }
                                        : spec.value,
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

    requires(req, i) {
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

    render() {
        return (
            <React.Fragment>
                <Property
                    headingLevel={this.props.headingLevel}
                    id={this.props.id}
                >
                    {this.props.name}
                </Property>
                <Subtitle>
                    {this.props.kind === 'paint' && (
                        <React.Fragment>
                            <a href="/maplibre-gl-style-spec/style-spec/layers/#paint-property">
                                Paint
                            </a>{' '}
                            property.{' '}
                        </React.Fragment>
                    )}
                    {this.props.kind === 'layout' && (
                        <React.Fragment>
                            <a href="/maplibre-gl-style-spec/style-spec/layers/#layout-property">
                                Layout
                            </a>{' '}
                            property.{' '}
                        </React.Fragment>
                    )}

                    <React.Fragment>
                        {this.props.required ? 'Required' : 'Optional'}
                        {this.type()}
                        {'minimum' in this.props && 'maximum' in this.props && (
                            <span>
                                {' '}
                                between <code>
                                    {this.props.minimum}
                                </code> and <code>{this.props.maximum}</code>{' '}
                                inclusive
                            </span>
                        )}
                        {'minimum' in this.props && !('maximum' in this.props) && (
                            <span>
                                {' '}
                                greater than or equal to{' '}
                                <code>{this.props.minimum}</code>
                            </span>
                        )}
                        {!('minimum' in this.props) && 'maximum' in this.props && (
                            <span>
                                {' '}
                                less than or equal to{' '}
                                <code>{this.props.minimum}</code>
                            </span>
                        )}
                        .{' '}
                    </React.Fragment>

                    {this.props.values &&
                        !Array.isArray(this.props.values) && ( // skips $root.version
                            <React.Fragment>
                                One of{' '}
                                {Object.keys(this.props.values)
                                    .map((opt, i) => (
                                        <code key={i}>
                                            {JSON.stringify(opt)}
                                        </code>
                                    ))
                                    .reduce((prev, curr) => [prev, ', ', curr])}
                                .{' '}
                            </React.Fragment>
                        )}

                    {this.props.units && (
                        <React.Fragment>
                            Units in <var>{this.props.units}</var>.{' '}
                        </React.Fragment>
                    )}

                    {this.props.default !== undefined && (
                        <React.Fragment>
                            Defaults to{' '}
                            <code>{JSON.stringify(this.props.default)}</code>.{' '}
                        </React.Fragment>
                    )}

                    {this.props.requires && (
                        <React.Fragment>
                            {this.props.requires.map((r, i) =>
                                this.requires(r, i)
                            )}{' '}
                        </React.Fragment>
                    )}

                    {this.props.expression &&
                        (this.props.expression.interpolated ||
                            this.props.expression.parameters.includes(
                                'feature-state'
                            )) && (
                            <React.Fragment>
                                Supports{' '}
                                {this.props.expression.parameters.includes(
                                    'feature-state'
                                ) && (
                                    <em className="color-gray">
                                        <a href="/maplibre-gl-style-spec/style-spec/expressions/#feature-state">
                                            {/* <Icon
                                                name="combine"
                                                inline={true}
                                            /> */}
                                            <code>feature-state</code>
                                        </a>
                                    </em>
                                )}
                                {this.props.expression.interpolated &&
                                    this.props.expression.parameters.includes(
                                        'feature-state'
                                    ) &&
                                    ' and '}
                                {this.props.expression.interpolated && (
                                    <a href="/maplibre-gl-style-spec/style-spec/expressions/#interpolate">
                                        {/* <Icon
                                            name="smooth-ramp"
                                            inline={true}
                                        /> */}
                                        <code>interpolate</code>
                                    </a>
                                )}
                                expressions.{' '}
                            </React.Fragment>
                        )}

                    {this.props.transition && (
                        <React.Fragment>
                            {/* <Icon name="opacity" inline={true} /> */}
                            Transitionable.{' '}
                        </React.Fragment>
                    )}
                </Subtitle>

                {this.props.doc && (
                    <div className="mb12 style-spec-item-doc">
                        <ReactMarkdown>{this.props.doc}</ReactMarkdown>
                    </div>
                )}

                {this.props.values &&
                    !Array.isArray(this.props.values) && ( // skips $root.version
                        <div className="my12 style-spec-item-dl">
                            <dl>
                                {entries(this.props.values).map(
                                    ([v, { doc }], i) => [
                                        <dt key={`${i}-dt`}>
                                            <code>{JSON.stringify(v)}</code>:
                                        </dt>,
                                        <dd key={`${i}-dd`} className="mb12">
                                                <ReactMarkdown>{doc}</ReactMarkdown>
                                        </dd>
                                    ]
                                )}
                            </dl>
                        </div>
                    )}

                {this.props.example &&
                    highlightJSON(
                        `"${this.props.name}": ${JSON.stringify(
                            this.props.example,
                            null,
                            2
                        )}`
                    )}

                {this.props['sdk-support'] && (
                    <div className="mt12">
                        <SDKSupportTable {...this.props['sdk-support']} />
                    </div>
                )}
            </React.Fragment>
        );
    }
}

Item.propTypes = {
    id: PropTypes.string,
    name: PropTypes.string,
    kind: PropTypes.string,
    required: PropTypes.bool,
    minimum: PropTypes.number,
    maximum: PropTypes.number,
    values: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    default: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.bool,
        PropTypes.number,
        PropTypes.array,
        PropTypes.object
    ]),
    requires: PropTypes.array,
    function: PropTypes.object,
    transition: PropTypes.bool,
    doc: PropTypes.string,
    example: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.array,
        PropTypes.number,
        PropTypes.object
    ]),
    'sdk-support': PropTypes.object,
    units: PropTypes.string,
    headingLevel: PropTypes.oneOf(['2', '3']),
    expression: PropTypes.object
};
