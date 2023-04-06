import {useLocation} from 'solid-start';
import {TableOfContents} from '../toc/toc';
import style from './maincontent.module.scss';
import '../collapse/collapse.scss';
import {Collapsible} from '@kobalte/core';

interface MainContentProps {
    children?: any;
    class?: string;
}

export function MainContent(props: MainContentProps) {

    const location = useLocation();

    return (
        <main class={`${style.mainContentContainer} ${props.class}`} >

            <div class={style.mainContent_paddingContainer}>

                <Collapsible.Root class={'collapsible'}>
                    <Collapsible.Trigger class={'collapsible__trigger'}>Table of contents<i class={`fa-solid fa-chevron-down ${'collapsible__trigger-icon'}`}></i></Collapsible.Trigger>
                    <Collapsible.Content class={'collapsible__content'}><TableOfContents mode='small' /></Collapsible.Content>
                </Collapsible.Root>

                <div class={style.row}>
                    <div id="ContentWindow" class={style.docItems}>{props.children}</div>
                </div>

                <div class={style.scrollToTop} onClick={() => {
                    document.documentElement.scrollTop = 0;
                }}><i class="fa-solid fa-arrow-up"></i></div>

                <a class={style.githubLink} target="_blank"  href="https://github.com/maplibre/maplibre-gl-style-spec"><i class="fa-brands fa-github"></i> MapLibre Style repository</a>
                <a class={style.githubLink} target="_blank" href={`https://github.com/maplibre/maplibre-gl-style-spec/blob/main/docs/src/routes${location.pathname === '/' ? '/index' : location.pathname}.tsx`}><i class="fa-brands fa-github"></i> Edit page layout</a>
            </div>
        </main>
    );
}
