import style from './toc.module.scss';
import {For, Show, createEffect, createSignal, onCleanup} from 'solid-js';

export function TableOfContents(props: {
    class?: string;
    mode: 'large' | 'small';
}) {
    // Create state for the active link and headers
    const [activeLink, setActiveLink] = createSignal('');
    const [domHeaders, setDomHeaders] = createSignal<HTMLElement[]>([]);

    // Define a selector for the headers to include in the table of contents
    const headerSelector = props.mode === 'large' ? 'h2, h3' : 'h2';

    // Function to handle scroll event
    const handleScroll = () => {
        let closestHeader: string | undefined;
        let closestDistance = Infinity;

        // Iterate through headers to find the closest one to the top of the viewport
        domHeaders().forEach((header) => {
            if (header) {
                const distance = Math.abs(header.getBoundingClientRect().top);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestHeader = header.id;
                }
            }
        });

        setActiveLink(closestHeader || '');
        if (closestHeader) {

            const headerElement = document.getElementById(`toc-link-${closestHeader}`);

            if (headerElement) {
                const topPos = headerElement.offsetTop;

                if (tocRef()) {
                    tocRef()!.scrollTop = topPos - 200;
                }
            }

        }
    };

    // Effect to set up the table of contents and scroll event listener
    createEffect(() => {
        if (typeof window !== 'undefined' && typeof document !== 'undefined') {
            const contentWindow = document.getElementById('ContentWindow')!;
            const pageHeaders = Array.from(

                contentWindow.querySelectorAll(headerSelector)
            ).map((header, index) => {
                const title = header.textContent;
                const id = header.id || (title ? `${title.replace(/\s+/g, '-').toLowerCase()}-${index}` : '');
                if (!header.id) {
                    header.id = id;
                }
                return {id, title};
            });
            setDomHeaders(pageHeaders.map(({id}) => document.getElementById(id)!));
        }
    });
    const [tocRef, setTOCRef] = createSignal<HTMLElement>();

    createEffect(() => {
        if (typeof window !== 'undefined' && typeof document !== 'undefined') {
            window.addEventListener('scroll', handleScroll);
        }
    });

    onCleanup(() => {
        if (typeof window !== 'undefined') {
            window.removeEventListener('scroll', handleScroll);
        }
    });

    const handleLinkClick = (event: Event, id: string) => {

        event.preventDefault();
        const headerElement = document.getElementById(id);

        if (headerElement) {
            const scrollTop = headerElement.offsetTop + 60;

            // Different browsers...
            // @ts-ignore
            window.scrollTop = scrollTop;
            window.document.body.scrollTop = scrollTop;
            window.document.documentElement.scrollTop = scrollTop;
            history.pushState(null, '', `${location.pathname}#${id}`);
        }
    };

    return (
        <aside class={`${props.class} ${style.toc_outer_container} ${style[`${props.mode}TOC`]}`}>
            <div class={`${props.class} ${style.toc_viewport}`} style={{'scroll-behavior': 'smooth'}} ref={setTOCRef}>
                <Show when={domHeaders().length > 0}>
                    <nav>
                        <div class={style.nav_items}>
                            <Show when={props.mode === 'large'}><h3 style={{cursor: 'pointer'}}class={style.header} onClick={() => {
                                document.documentElement.scrollTop = 0;
                            }}>On This Page</h3>
                            </Show>
                            <ul>
                                <For each={domHeaders()}>{(header) => (
                                    <li>

                                        <a id={`toc-link-${header.id}`} href={'#'} classList={{
                                            [style.anchor_h1]: header.tagName === 'H1',
                                            [style.anchor_h2]: header.tagName === 'H2',
                                            [style.anchor_h3]: header.tagName === 'H3',
                                            [style.active]: header.id === activeLink()
                                        }} onClick={(event) => handleLinkClick(event, header.id)}>
                                            {header.id.startsWith('paint-') ? <span class={style.paintIcon}><i class="fa-solid fa-palette"></i></span> : null}
                                            {header.id.startsWith('layout-') ? <span class={style.layoutIcon}><i class="fa-solid fa-pen"></i></span> : null}

                                            {header.innerText}
                                        </a>
                                    </li>
                                )}</For>
                            </ul>
                        </div>
                    </nav>
                </Show>
            </div>
        </aside>
    );

}
