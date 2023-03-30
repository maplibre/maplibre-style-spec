import {Title} from 'solid-start';
import {HttpStatusCode} from 'solid-start/server';

export default function NotFound() {
    return (
        <main>
            <Title>Not Found</Title>
            <HttpStatusCode code={404} />
            <h2>Page Not Found</h2>
        </main>
    );
}
