import {Sidebar} from '../Sidebar/sidebar';
import {MainContent} from '../MainContent/MainContent';
import style from './app.module.scss';
import {Header} from '../Header/Header';
import { TableOfContents } from '../TableOfContents/TableOfContents';

export function App(props: { children?: any }) {
    return (
        <>
            <div class={style.app_wrap} id="app_wrap">

                <Header />
                <div class={style.container}>
                    <Sidebar />
                    <MainContent>{props.children}</MainContent>

                    {/* <div class={style.onlyShowLg}> */}
                    <TableOfContents mode="large" />
                    {/* </div> */}

                </div>
            </div>

        </>
    );
}

