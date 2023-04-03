import {A, useNavigate} from 'solid-start';
import style from './header.module.scss';

// random image
const logo = '/maplibre-logo-big.svg';

export function Header() {
    const navigate = useNavigate();

    return (
        <header class={style.header}>

            <button class={style.SideMenuButton}>Open menu</button>

            <div class={style.logoContainer} onclick={() => {
                navigate('/');
            }}>

                <img src={logo} alt='logo' class={style.logo} />

                <div class={style.title_container}>
                    <span
                        class={style.title}

                    >
          Style Spec Docs
                    </span>
                </div>
            </div>
        </header>
    );
}
