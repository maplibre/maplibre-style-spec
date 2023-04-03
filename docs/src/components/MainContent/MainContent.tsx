import {TableOfContents} from '../TableOfContents/TableOfContents';
import style from './maincontent.module.scss';

interface MainContentProps {
    children?: any;
    class?: string;
}

export function MainContent(props: MainContentProps) {
    return (
        <main class={`${style.mainContentContainer} ${props.class}`}>
            <div class={style.mainContent_paddingContainer}>
                <div class={style.row}>
                    <div class={style.docItems}>{props.children}</div>
                </div>
            </div>
        </main>
    );
}
