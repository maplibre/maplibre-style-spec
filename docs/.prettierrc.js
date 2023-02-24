module.exports = {
    ...require('@mapbox/prettier-config-docs'),
    tabWidth: 4,
    singleQuote: true,
    overrides: [
        {
            files: '*.html',
            options: {
                quoteProps: 'preserve'
            }
        },
        {
            files: '*.json',
            options: {
                tabWidth: 2
            }
        }
    ]
};
