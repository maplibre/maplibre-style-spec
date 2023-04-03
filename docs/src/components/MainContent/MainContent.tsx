import {useLocation} from 'solid-start';
import {TableOfContents} from '../TableOfContents/TableOfContents';
import {Accordion, AccordionHeader} from '../accordion/accordion';
import style from './maincontent.module.scss';

interface MainContentProps {
    children?: any;
    class?: string;
}

export function MainContent(props: MainContentProps) {

    const location = useLocation();

    return (
        <main class={`${style.mainContentContainer} ${props.class}`}>

            <div class={style.mainContent_paddingContainer}>

                <Accordion class={style.toc_accordion}>
                    <AccordionHeader>Table of contents</AccordionHeader>
                    <TableOfContents mode='small' />
                </Accordion>

                <div class={style.row}>
                    <div id="ContentWindow" class={style.docItems}>{props.children}</div>
                </div>

                <div class={style.scrollToTop} onClick={() => {
                    document.documentElement.scrollTop = 0;
                }}><i class="fa-solid fa-arrow-up"></i></div>

                <a class={style.githubLink} target="_blank" href={`https://github.com/maplibre/maplibre-gl-style-spec/blob/main/docs/src/routes${location.pathname === '/' ? '/index' : location.pathname}.tsx`}><i class="fa-brands fa-github"></i> Edit page on GitHub</a>
            </div>
        </main>
    );
}
