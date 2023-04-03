import {SmallTOC} from '../SmallTOC/SmallTOC';
import {Accordion, AccordionHeader} from '../accordion/accordion';
import style from './maincontent.module.scss';

interface MainContentProps {
    children?: any;
    class?: string;
}

export function MainContent(props: MainContentProps) {
    return (
        <main class={`${style.mainContentContainer} ${props.class}`}>

            <div class={style.mainContent_paddingContainer}>

                <Accordion class={style.toc_accordion}>
                    <AccordionHeader>Table of contents</AccordionHeader>
                    <SmallTOC />
                </Accordion>

                <div class={style.row}>
                    <div id="ContentWindow" class={style.docItems}>{props.children}</div>
                </div>

                <div class={style.scrollToTop} onClick={() => {
                    document.documentElement.scrollTop = 0;
                }}><i class="fa-solid fa-arrow-up"></i></div>
            </div>
        </main>
    );
}
