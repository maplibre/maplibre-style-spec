// import { scopeAppropriateImage } from '@mapbox/appropriate-images-react';
// import imageConfig from '../img/dist/image.config.json'; // eslint-disable-line
// // image.config.json is generated on build

// // See https://github.com/mapbox/appropriate-images-react#appropriateimage
// // The required prop is `imageId`, which must correspond to a key in the
// // imageConfig.
// const AppropriateImage = scopeAppropriateImage(imageConfig, {
//     transformUrl: (url) => require(`img/s/${url}`).default // eslint-disable-line
// });

import style from './appropriate-image.module.scss';

export function AppropriateImage ({imageId}:any) {

    const src = `/img/src/${imageId}.png`;
    return (
        <>
            <img class={style.image} src={src} alt=""  />
        </>
    );

}
