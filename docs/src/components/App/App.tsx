import {Sidebar} from '../Sidebar/sidebar';
import {MainContent} from '../MainContent/MainContent';
import style from './app.module.scss';
import overlayStyle from './overlayStyle.module.scss';

import {Header} from '../Header/Header';
import {TableOfContents} from '../TableOfContents/TableOfContents';
import {Show, createSignal} from 'solid-js';
import {pages} from '~/pages';
import {A, useNavigate} from 'solid-start';

export const [showNavOverlay, setShowNavOverlay] = createSignal(false);

export function openNav() {
    setShowNavOverlay(true);
}

export function closeNav() {
    setShowNavOverlay(false);
}

export function App(props: { children?: any }) {

    const navigate = useNavigate();
    return (
        <>
            <div class={style.app_wrap} id="app_wrap">
                <Show when={showNavOverlay()}>
                    <div id="myNav" class={overlayStyle.overlay}>
                        {/* <a class="closebtn" onClick={closeNav}>&times;</a> */}
                        <div class="overlay-content">
                            <Header />
                            <ul>
                                {pages.map((page) => (
                                    <li>
                                        <A end={true} href='#' class="sidebar-link" onClick={(e) => {

                                            e.preventDefault();

                                            closeNav();

                                            navigate(page.path.replace('/', ''));

                                        }}>{page.title}</A>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </Show>
                <Header />
                <div class={style.container}>
                    <Sidebar />
                    <MainContent>{props.children}</MainContent>

                    {/* <div class={style.onlyShowLg}> */}
                    <TableOfContents mode="large" />
                    {/* </div> */}

                </div>
            </div>

        </>
    );
}

