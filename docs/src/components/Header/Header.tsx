import {A, useNavigate} from 'solid-start';
import style from './header.module.scss';
// random image
const logo = '/maplibre-logo-big.svg';

export function Header() {
    const navigate = useNavigate();
    return (
        <header class={style.header}>
            <div class={style.logoContainer}>
                <A href='/'>
                    <img src={logo} alt='logo' class={style.logo} />
                </A>
                <span
                    class={style.title}
                    onclick={() => {
                        navigate('/');
                    }}
                >
          Style Spec Docs
                </span>
            </div>
        </header>
    );
}
