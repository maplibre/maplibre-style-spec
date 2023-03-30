interface IProps {
    id: string;
    children: any;
    headingLevel?: '2' | '3';
}

export default function Property ({headingLevel = '2', id, children}:IProps) {

    const Heading = `h${headingLevel}`;
    return (
        <Heading id={id} class="unprose txt-mono anchor txt-l mb3 mt24">
            <a
                class="style-spec-property unprose cursor-pointer color-blue-on-hover block"
                href={`#${id}`}
            >
                {children}
            </a>
        </Heading>
    );

}

// Migrated from these PropTypes to TypeScript types:
//
// Property.defaultProps = {
//     headingLevel: '2'
// };

// Property.propTypes = {
//     id: PropTypes.string.isRequired,
//     children: PropTypes.node.isRequired,
//     headingLevel: PropTypes.oneOf(['2', '3'])
// };
