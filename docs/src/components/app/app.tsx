import {Sidebar} from '../sidebar/sidebar';
import {MainContent} from '../maincontent/maincontent';
import style from './app.module.scss';
import overlayStyle from './overlay-style.module.scss';
import {Header} from '../header/header';
import {TableOfContents} from '../toc/toc';
import {For, Show, createSignal, JSXElement} from 'solid-js';
import {pages} from '~/pages';

export const [showNavOverlay, setShowNavOverlay] = createSignal(false);

export function openNav() {
    setShowNavOverlay(true);
}

export function closeNav() {
    setShowNavOverlay(false);
}

export function App(props: { children?: JSXElement }) {
    return (
        <div class={style.app_wrap} id="app_wrap">
            <Show when={showNavOverlay()}>
                <div class={overlayStyle.overlay}>
                    <div>
                        <Header />
                        <ul>

                            <For each={pages}>{(page) => (
                                <li>
                                    <a onClick={() => {
                                        setShowNavOverlay(false);
                                    }} classList={{'sidebar-link': true, 'active': `${import.meta.env.BASE_URL}${page.path}` === location.pathname}} href={`${import.meta.env.BASE_URL}${page.path}`}>{page.title}</a>
                                </li>
                            )}
                            </For>
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
    );
}

