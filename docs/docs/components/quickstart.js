import React from 'react';
import urls from './urls';
import Copyable from './copyable';
import ControlToggleSet from '@mapbox/mr-ui/control-toggle-set';

class Quickstart extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedMethod: 'cdn-select'
        };
    }

    mapOptions = `{
    container: 'map',
    style: 'https://demotiles.maplibre.org/style.json', // stylesheet location
    center: [-74.5, 40], // starting position [lng, lat]
    zoom: 9 // starting zoom
}`;

    renderCdn() {
        const cdnMapHtml = `
<div id='map' style='width: 400px; height: 300px;'></div>
<script>
var map = new maplibregl.Map(${this.mapOptions});
</script>`;
        return (
            <div id="quickstart-cdn">
                <p>
                    Include the JavaScript and CSS files in the{' '}
                    <code>&lt;head&gt;</code> of your HTML file.
                </p>
                <Copyable lang="markup">{`
<script src='${urls.js()}'></script>
<link href='${urls.css()}' rel='stylesheet' />
`}</Copyable>

                <p>
                    Include the following code in the <code>&lt;body&gt;</code>{' '}
                    of your HTML file.
                </p>
                <Copyable lang="markup">{cdnMapHtml}</Copyable>
            </div>
        );
    }

    renderBundler() {
        const bundlerMapJs = `
import maplibregl from 'maplibre-gl'; // or "const maplibregl = require('maplibre-gl');"

const map = new maplibregl.Map(${this.mapOptions});`;
        return (
            <div id="quickstart-bundler">
                <p>Install the npm package.</p>
                <Copyable lang="markup">{`
npm install --save maplibre-gl
`}</Copyable>

                <p>
                    Include the CSS file in the <code>&lt;head&gt;</code> of
                    your HTML file.
                </p>
                <Copyable lang="markup">{`
<link href='${urls.css()}' rel='stylesheet' />
`}</Copyable>

                <p>
                    Include the following code in the <code>&lt;body&gt;</code>{' '}
                    of your HTML file.
                </p>
                <Copyable lang="javascript">{bundlerMapJs}</Copyable>
            </div>
        );
    }

    renderContents(selectedMethod) {
        if (selectedMethod === 'cdn-select') return this.renderCdn();
        if (selectedMethod === 'bundler-select') return this.renderBundler();
    }

    render() {
        return (
            <div>
                <ControlToggleSet
                    id="select-quickstart"
                    themeToggleGroup="bg-blue py3 px3 my12"
                    themeToggle="txt-s py3 toggle--white toggle--active-blue"
                    onChange={(value) => {
                        this.setState({ selectedMethod: value });
                    }}
                    value={this.state.selectedMethod}
                    options={[
                        {
                            label: 'CDN',
                            value: 'cdn-select'
                        },
                        {
                            label: 'Module bundler',
                            value: 'bundler-select'
                        }
                    ]}
                />
                {this.renderContents(this.state.selectedMethod)}
            </div>
        );
    }
}

export default Quickstart;
