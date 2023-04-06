import style from './toc.module.scss';
import {For, Show, createEffect, createSignal, onCleanup} from 'solid-js';
// import scrollto

interface TableOfContentsProps {
    class?: string;
    mode: 'large' | 'small';
}

export function TableOfContents(props: TableOfContentsProps) {
    // Create state for the active link and headers
    const [activeLink, setActiveLink] = createSignal('');
    // const [headers, setHeaders] = createSignal<{ id: string; title: string | null }[]>([]);
    const [domHeaders, setDomHeaders] = createSignal<HTMLElement[]>([]);

    // Define a selector for the headers to include in the table of contents
    const headerSelector = props.mode === 'large' ? 'h2, h3' : 'h2';

    // Function to handle scroll event
    const handleScroll = () => {
        let closestHeader: string | undefined;
        let closestDistance = Infinity;

        // setDomHeaders(headers().map(({id}) => document.getElementById(id)!));

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
        // Set the active link based on the closest header
        setActiveLink(closestHeader || '');
        if (closestHeader) {

            const headerElement = document.getElementById(`toc-link-${closestHeader}`);
            console.log('closestHeader', closestHeader);
            if (headerElement) {
                const topPos = headerElement.offsetTop;

                console.log('topPos', topPos);

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
        // Add the scroll event listener when the window object is available
            window.addEventListener('scroll', handleScroll);
        }
    });

    // Clean up the event listener when the component is unmounted
    onCleanup(() => {
        if (typeof window !== 'undefined') {
            window.removeEventListener('scroll', handleScroll);
        }
    });

    // const handleLinkClick = (event: Event, id: string) => {
    //     event.preventDefault();
    //     const headerElement = document.getElementById(id);
    //     headerElement?.scrollIntoView({behavior: 'smooth'});
    // };

    // Render the table of contents with the headers and active link state
    return (
        <aside class={`${props.class} ${style.toc_outer_container} ${style[`${props.mode}TOC`]}`}>
            <div class={`${props.class} ${style.toc_viewport}`} ref={setTOCRef}>
                <Show when={domHeaders().length > 0}>
                    <nav>
                        <div class={style.navItems}>
                            <Show when={props.mode === 'large'}><h3 style={{cursor: 'pointer'}}class={style.header} onClick={() => {
                                // const contentWindow = document.getElementById('app_wrap')!;
                                // console.log(contentWindow);
                                // console.log(contentWindow.scrollTop);
                                document.documentElement.scrollTop = 0;
                                // contentWindow.scrollTop = 0;
                            }}>On This Page</h3>
                            </Show>
                            <ul>
                                <For each={domHeaders()}>{(header) => (
                                    <li>

                                        {/* href={`#${header.id}`} */}
                                        <a id={`toc-link-${header.id}`} href={`#${header.id}`} classList={{
                                            [style.anchor_H1]: header.tagName === 'H1',
                                            [style.anchor_H2]: header.tagName === 'H2',
                                            [style.anchor_H3]: header.tagName === 'H3',
                                            [style.active]: header.id === activeLink()
                                        }} >
                                            {/* }} onClick={(event) => handleLinkClick(event, header.id)}> */}
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
