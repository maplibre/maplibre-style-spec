import {useNavigate} from 'solid-start';
import style from './header.module.scss';
import {setShowNavOverlay} from '../app/app';

// random image
const logo = '/maplibre-logo-big.svg';

export function Header() {
    const navigate = useNavigate();

    return (
        <header class={style.header}>

            <div class={style.SideMenuButton} onclick={() => { setShowNavOverlay(prev => !prev); }}><i class="fa-solid fa-bars"></i></div>

            <div class={style.logoContainer} onclick={() => {
                navigate('/');
            }}>

                <img src={logo} alt='logo' class={style.logo} />

                <div class={style.title_container}>
                    <span
                        class={style.title}

                    >
          Style Specification
                    </span>
                </div>
            </div>
        </header>
    );
}
