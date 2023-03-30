// @refresh reload
import { Suspense } from "solid-js";
import { onMount } from 'solid-js';
import { render } from 'solid-js/web';
import {
  A,
  Body,
  ErrorBoundary,
  FileRoutes,
  Head,
  Html,
  Meta,
  Routes,
  Scripts,
  Title,
} from "solid-start";
import { Sidebar } from "./components/Sidebar/sidebar";
import { Header } from "./components/Header/Header";
import { App } from "./components/App/App";
import "./root.module.scss";

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
