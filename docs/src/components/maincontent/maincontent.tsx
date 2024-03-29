
import {TableOfContents} from '../toc/toc';
import style from './maincontent.module.scss';
import '../collapse/collapse.scss';
import {Collapsible} from '@kobalte/core';
import {JSXElement} from 'solid-js';
import {A, useLocation} from '@solidjs/router';

export function MainContent(props: {
    children?: JSXElement;
    class?: string;
}) {

    const location = useLocation();
    function getPage() {

        let pageSection = (location.pathname.split(import.meta.env.SERVER_BASE_URL))[1];

        if (typeof pageSection === 'string') {
            if (!pageSection.endsWith('/')) {
                pageSection = `${pageSection}/`;
            }

            if (!pageSection.startsWith('/')) {
                pageSection = `/${pageSection}`;
            }

            return pageSection;

        } else {
            return '';
        }
    }

    return (
        <main class={`${style.main_content_container} ${props.class}`} >

            <div class={style.main_content_padding_container}>

                <Collapsible.Root class={'collapsible'}>
                    <Collapsible.Trigger class={'collapsible__trigger'}>Table of contents<i class={`fa-solid fa-chevron-down ${'collapsible__trigger-icon'}`}></i></Collapsible.Trigger>
                    <Collapsible.Content class={'collapsible__content'}><TableOfContents mode='small' /></Collapsible.Content>
                </Collapsible.Root>

                <div class={style.row}>
                    <div id="ContentWindow" class={style.doc_items}>{props.children}</div>
                </div>

                <div class={style.scroll_to_top} onClick={() => {
                    document.documentElement.scrollTop = 0;
                }}><i class="fa-solid fa-arrow-up"></i></div>

                <A class={style.github_link} target="_blank"  href={'https://github.com/maplibre/maplibre-style-spec'}><i class="fa-brands fa-github"></i> MapLibre Style repository</A>
                <A class={style.github_link} target="_blank" href={`https://github.com/maplibre/maplibre-style-spec/blob/main/docs/src/routes${getPage()}index.tsx`}><i class="fa-brands fa-github"></i> Edit page</A>
            </div>
        </main>
    );
}
