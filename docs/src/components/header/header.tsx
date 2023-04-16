import {useNavigate} from 'solid-start';
import style from './header.module.scss';
import {setShowNavOverlay} from '../app/app';

const logo = `${import.meta.env.BASE_URL}maplibre-logo-dark.svg`;

export function Header() {
    const navigate = useNavigate();

    return (
        <header class={style.header}>

            <div class={style.side_menu_button} onclick={() => { setShowNavOverlay(prev => !prev); }}><i class="fa-solid fa-bars"></i></div>

            <div class={style.logo_container} onclick={() => {
                navigate('/');
            }}>

                <img src={logo} alt='logo' class={style.logo} />

                <div class={style.title_container}>
                    <span
                        class={style.title}

                    >
          Style Spec
                    </span>
                </div>
            </div>
        </header>
    );
}
