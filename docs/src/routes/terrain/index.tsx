import {Markdown} from '~/components/markdown/markdown';
import ref from '../../../../style-spec/specification.json';
import {Items} from '../../components/items/items';
function Root() {

    const md = `# Terrain

Add 3D terrain to the map.`;

    return (
        <div>
            <Markdown content={md} />
            <Items headingLevel='3' entry={ref.terrain} />
        </div>
    );
}

export default Root;
