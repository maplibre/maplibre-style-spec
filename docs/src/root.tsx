// @refresh reload
import {Suspense} from 'solid-js';
import {onMount} from 'solid-js';
import {render} from 'solid-js/web';
import {
    A,
    Body,
    ErrorBoundary,
    FileRoutes,
    Head,
    Html,
    Link,
    Meta,
    Routes,
    Scripts,
    Title,
} from 'solid-start';
import {Sidebar} from './components/Sidebar/sidebar';
import {Header} from './components/Header/Header';
import {App} from './components/App/App';
import './root.module.scss';

export default function Root() {

    onMount(() => {
        const appRoot = document.getElementById('app');
        if (appRoot) {
            render(() => <App />, appRoot);
        }
    });

    return (
        <Html lang="en">
            <Head>
                <Title>MapLibre Styles Docs</Title>
                <Meta charset="utf-8" />
                <Meta name="viewport" content="width=device-width, initial-scale=1" />
                {/* <Link href='https://fonts.googleapis.com/css?family=Open+Sans' rel='stylesheet' type='text/css' /> */}

                <Link rel="preconnect" href="https://fonts.googleapis.com" />
                <Link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
                <Link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&display=swap" rel="stylesheet" />

                <Link href="https://unpkg.com/@fortawesome/fontawesome-free@6.4.0/css/fontawesome.css" rel="stylesheet" />
                <Link href="https://unpkg.com/@fortawesome/fontawesome-free@6.4.0/css/brands.css" rel="stylesheet" />
                <Link href="https://unpkg.com/@fortawesome/fontawesome-free@6.4.0/css/solid.css" rel="stylesheet" />

            </Head>
            <Body>
                <Suspense>
                    <ErrorBoundary>
                        <App>
                            <Routes>
                                <FileRoutes />
                            </Routes>
                        </App>
                    </ErrorBoundary>
                </Suspense>
                <Scripts />
            </Body>
        </Html>
    );
}
