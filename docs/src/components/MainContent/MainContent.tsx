import style from './maincontent.module.scss'

interface MainContentProps {
    children?: any;
    class?: string;
}

export function MainContent(props: MainContentProps) {
    return (
        <main class={`${style.mainContentContainer} ${props.class}`}>
            {props.children}
        </main>
    )
}
