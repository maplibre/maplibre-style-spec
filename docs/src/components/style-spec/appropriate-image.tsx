// import { scopeAppropriateImage } from '@mapbox/appropriate-images-react';
// import imageConfig from '../img/dist/image.config.json'; // eslint-disable-line
// // image.config.json is generated on build

// // See https://github.com/mapbox/appropriate-images-react#appropriateimage
// // The required prop is `imageId`, which must correspond to a key in the
// // imageConfig.
// const AppropriateImage = scopeAppropriateImage(imageConfig, {
//     transformUrl: (url) => require(`img/s/${url}`).default // eslint-disable-line
// });

// export default AppropriateImage;

import React from 'react';

export default class AppropriateImage extends React.Component {
    render() {
        const {imageId} = this.props;
        const src = `/img/src/${imageId}.png`;
        return (
            <>
                <img src={src} alt=""  />

            </>
        );
    }
}
