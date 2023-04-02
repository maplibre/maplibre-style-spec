import {Sidebar} from '../Sidebar/sidebar';
import {MainContent} from '../MainContent/MainContent';
import {TableOfContents} from '../TableOfContents/TableOfContents';
import style from './App.module.scss';
import {Header} from '../Header/Header';

export function App(props: { children?: any }) {
    return (
        <>

            <Header />
            <div class={style.container}>
                <Sidebar class={style.sidebar} />
                <MainContent class={style.mainContent}>{props.children}</MainContent>
                <TableOfContents class={`${style.tableOfContents}`} />
            </div>

        </>
    );
}

