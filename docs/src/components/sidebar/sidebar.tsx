import style from './sidebar.module.scss';
import './sidebar.css';

import {pages} from '~/pages';
import {For} from 'solid-js';
import {A} from '@solidjs/router';

export function Sidebar(props: {
    class?: string;
}) {

    return (
        <>
            <aside class={`${style.sidebar_outer_container} ${props.class}`}>
                <div class={`${style.sidebar_viewport}`}>
                    <div class={style.sidebar_inner_container}>
                        <div class={style.nav_items}>
                            <ul>
                                <For each={pages}>{(page) => (
                                    <li>
                                        <A end={true} classList={{'sidebar-link': true}} href={`/${import.meta.env.SERVER_BASE_URL}${page.path}`}>{page.title}</A>
                                    </li>
                                )}
                                </For>
                                <li>
                                    <A  target="_blank" href="https://github.com/maplibre/maplibre-gl-style-spec/blob/main/CHANGELOG.md">Changelog</A>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
