import style from './appropriate-image.module.scss';

export function AppropriateImage ({imageId}:any) {

    const src = `/img/src/${imageId}.png`;
    return (
        <>
            <img class={style.image} src={src} alt=""  />
        </>
    );

}
