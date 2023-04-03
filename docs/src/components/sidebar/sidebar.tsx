import style from './sidebar.module.scss';
import './sidebar.css';
import {A} from 'solid-start';
import {pages} from '~/pages';

interface SidebarProps {
    class?: string;
}

export function Sidebar(props: SidebarProps) {

    return (
        <>
            <aside class={`${style.sidebar_outer_container} ${props.class}`}>
                <div class={`${style.sidebar_viewport}`}>
                    <div class={style.sidebar_inner_container}>
                        <div class={style.navItems}>
                            <ul>
                                {pages.map((page) => (
                                    <li>
                                        <A end={true} class="sidebar-link" href={page.path.replace('/', '')}>{page.title}</A>
                                    </li>
                                ))}
                                <li>
                                    <a target="_blank" href="https://github.com/maplibre/maplibre-gl-style-spec/blob/main/CHANGELOG.md">Changelog</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}

// export function Sidebar(props: SidebarProps) {

//     return (
//         <aside class={`${style.sidebar} ${props.class}`}>
//             <h1 class={style.header}>MapLibre Styles Docs</h1>
//             <hr />
//             <div class={style.navItems}>
//                 <ul>
//                     {docs.map((doc) => (
//                         <li>
//                             <a href={doc.link}>{doc.title}</a>
//                         </li>
//                     ))}
//                 </ul>
//             </div>
//         </aside>
//     );
// }
