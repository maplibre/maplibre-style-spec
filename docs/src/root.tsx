// @refresh reload
import {Suspense} from 'solid-js';
import {
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
import {App} from './components/app/app';
import './root.module.scss';

export default function Root() {

    return (
        <Html lang="en" >
            <Head>
                <Title>MapLibre Style Spec</Title>
                <Meta charset="utf-8" />
                <Meta name="viewport" content="width=device-width, initial-scale=1" />
                <Link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&display=swap" rel="stylesheet" />
                <Link rel="icon" type="image/x-icon" href={`${import.meta.env.BASE_URL}favicon.ico`} />
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
