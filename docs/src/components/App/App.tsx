import {Sidebar} from '../Sidebar/sidebar';
import {MainContent} from '../MainContent/MainContent';
import style from './app.module.scss';
import {Header} from '../Header/Header';

export function App(props: { children?: any }) {
    return (
        <>
            <div class={style.app_wrap}>

                <Header />
                <div class={style.container}>
                    <Sidebar />
                    <MainContent>{props.children}</MainContent>

                </div>
            </div>

        </>
    );
}

