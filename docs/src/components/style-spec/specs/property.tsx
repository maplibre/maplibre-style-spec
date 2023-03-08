import React from 'react';

interface IProps {
    id: string;
    children: React.ReactNode;
    headingLevel?: '2' | '3';
}

export default function Property ({headingLevel = '2', id, children}:IProps) {

    const Heading = `h${headingLevel}`;
    return (
        <Heading id={id} className="unprose txt-mono anchor txt-l mb3 mt24">
            <a
                className="style-spec-property unprose cursor-pointer color-blue-on-hover block"
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
