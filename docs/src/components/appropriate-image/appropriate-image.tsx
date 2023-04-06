import style from './appropriate-image.module.scss';

export function AppropriateImage (props: {imageId: string; alt: string}) {

    const src = `${import.meta.env.BASE_URL}img/src/${props.imageId}.png`;
    return (
        <>
            <img class={style.image} src={src} alt=""  />
        </>
    );

}
