// LeftSidebar.tsx
import style from './RightSidebar.module.scss';

export function RightSidebar() {
    return (
        <aside class={style.rightSidebar}>
            <a href="#heading1">Heading 1</a>
            <a href="#heading2">Heading 2</a>
        </aside>
    );
}
