import { render } from 'solid-js/web';
import { Header } from '../Header/Header';
import { Sidebar } from '../Sidebar/Sidebar';
import { MainContent } from '../MainContent/MainContent';
import { TableOfContents } from '../TableOfContents/TableOfContents';
import style from './App.module.scss';

export function App(props: { children?: any }) {
    return (
        <>
            <div class={style.outerContainer}>
                <Header />
                <div class={style.container}>
                    <Sidebar class={style.sidebar} />
                    <MainContent class={style.mainContent}>{props.children}</MainContent>
                    <TableOfContents class={`${style.tableOfContents}`} />
                </div>
            </div>
        </>
    );
}

