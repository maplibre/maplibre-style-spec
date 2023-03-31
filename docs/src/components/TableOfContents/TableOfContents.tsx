import style from './TableOfContents.module.scss';
import {createEffect, createSignal, onCleanup} from 'solid-js';
// import scrollto

import {useNavigate, useLocation} from 'solid-start';

interface TableOfContentsProps {
    class?: string;
}

export function TableOfContents(props: TableOfContentsProps) {
    // Create state for the active link and headers
    const [activeLink, setActiveLink] = createSignal('');
    const [headers, setHeaders] = createSignal<{ id: string; title: string | null }[]>([]);

    // Define a selector for the headers to include in the table of contents
    const headerSelector = 'h2, h3';

    // Function to handle scroll event
    const handleScroll = () => {
        let closestHeader;
        let closestDistance = Infinity;

        // Iterate through headers to find the closest one to the top of the viewport
        headers().forEach(({id}) => {
            const header = document.getElementById(id);
            if (header) {
                const distance = Math.abs(header.getBoundingClientRect().top);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestHeader = id;
                }
            }
        });

        // Set the active link based on the closest header
        setActiveLink(closestHeader || '');
    };

    // Effect to set up the table of contents and scroll event listener
    createEffect(() => {
        if (typeof window !== 'undefined' && typeof document !== 'undefined') {
            const pageHeaders = Array.from(
                document.querySelectorAll(headerSelector)
            ).map((header, index) => {
                const title = header.textContent;
                const id = header.id || (title ? `${title.replace(/\s+/g, '-').toLowerCase()}-${index}` : '');
                if (!header.id) {
                    header.id = id;
                }
                return {id, title};
            });
            setHeaders(pageHeaders);

            // Add the scroll event listener when the window object is available
            window.addEventListener('scroll', handleScroll);
        }

        // Clean up the event listener when the component is unmounted
        onCleanup(() => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('scroll', handleScroll);
            }
        });
    });

    const navigate = useNavigate();
    const location: any = useLocation();

    const handleLinkClick = (event: Event, id: string) => {
        event.preventDefault();
        // navigate(`${location.pathname}#${id}`, { scroll: false, replace: true });
        const headerElement = document.getElementById(id);
        headerElement?.scrollIntoView({behavior: 'smooth'});
    };

    // Render the table of contents with the headers and active link state
    return (
        <div class={`${props.class} ${style.tableOfContents}`}>
            <h3 class={style.header}>On This Page</h3>
            <nav>
                <div class={style.navItems}>
                    <ul>
                        {headers().map(({id, title}) => (
                            <li class={id === activeLink() ? style.active : ''}>
                                <a href={'#'} onClick={(event) => handleLinkClick(event, id)}>
                                    {title}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </nav>
        </div>
    );
}
