
import {Title} from '@solidjs/meta';
import {HttpStatusCode} from '@solidjs/start';

export default function NotFound() {
    return (
        <main>
            <Title>Not Found</Title>
            <HttpStatusCode code={404} />
            <h2>Page Not Found</h2>
        </main>
    );
}
