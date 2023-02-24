import 'regenerator-runtime/runtime.js';
import checkLinks from 'check-links';
import related from '../expressions-related.json';

describe('expressions-related', () => {
    Object.keys(related).map((section) => {
        const links = related[section];
        describe(section, () => {
            links.forEach((link) => {
                expect(link.title).toBeDefined();
                expect(link.href).toBeDefined();
            });
            it('No more than 5 related links per property', () => {
                expect(links.length).toBeLessThan(6);
            });
            it('All links are live', async () => {
                const allLinks = links.map((f) => f.href);
                const results = await checkLinks(allLinks, {
                    timeout: 30000,
                    retry: 1
                }).catch((err) => console.log(err));
                const broken = Object.keys(results).filter(
                    (f) => results[f].statusCode !== 200
                );
                expect(broken).toEqual([]);
            }, 30000);
        });
    });
});
