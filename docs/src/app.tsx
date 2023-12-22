import { Link, Meta, Title, MetaProvider } from "@solidjs/meta";
import { FileRoutes } from "@solidjs/start";
import { App } from "./components/app/app";
import "./root.module.scss";
import { Router } from "@solidjs/router";

export default function Root() {
  return (
    <Router
      root={(props) => (
        <MetaProvider>
          <Title>MapLibre Style Spec</Title>
          <Meta charset="utf-8" />
          <Meta name="viewport" content="width=device-width, initial-scale=1" />
          <Link
            href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&display=swap"
            rel="stylesheet"
          />
          <Link
            rel="icon"
            type="image/x-icon"
            href={`${import.meta.env.BASE_URL}favicon.ico`}
          />
          <Link
            href="https://unpkg.com/@fortawesome/fontawesome-free@6.4.0/css/fontawesome.css"
            rel="stylesheet"
          />
          <Link
            href="https://unpkg.com/@fortawesome/fontawesome-free@6.4.0/css/brands.css"
            rel="stylesheet"
          />
          <Link
            href="https://unpkg.com/@fortawesome/fontawesome-free@6.4.0/css/solid.css"
            rel="stylesheet"
          />
          <App>{props.children}</App>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
