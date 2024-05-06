import * as fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import styleSpec from '../../../src/reference/v8.json';
import { typeToMarkdownLink } from '../../../build/generate-docs';

test("ensure all types have documentation", async () => {
  /**
   * Recusive function that gets all {"type": "something"} from object.
   * 
   * @param obj (part of) style spec
   * @param acc accumulator
   * @returns set of all types found in style spec
   */
  function getTypesFromStyleSpec(obj: any, acc: Set<string> = new Set()) {
    if (typeof obj.type === 'string') return acc.add(obj.type);
    Object.entries(obj).filter(([key, value]) => key !== 'type' && typeof value === 'object').map(([key, value]) => value).forEach(obj => getTypesFromStyleSpec(obj, acc));
    return acc;
  }

  const cachedHeadings: Record<string, Set<string>> = {};
  /**
   * Reads all headings from filename
   * @param filename 
   * @returns all headings (lowercased) from file
   */
  async function getTypesFromDocumentation(filename: string) {
    if (cachedHeadings[filename]) return cachedHeadings[filename];
    const typesMd = await fs.open(`docs/${filename}`);
    const typesFromDocumentation: Set<string> = new Set();
    for await (const line of typesMd.readLines()) {
      if (!line.startsWith("#")) continue;
      const heading = line.split(/[#]+/)[1].trim().toLowerCase();
      typesFromDocumentation.add(heading);
    }
    cachedHeadings[filename] = typesFromDocumentation;
    return typesFromDocumentation;
  }

  // we don't care about missing documentation for these types
  const excludedTypes = new Set([
    "*",
    "source",
    "function",
    "expression",
    "property-type"
  ]);
  const typesFromStyleSpec = [...getTypesFromStyleSpec(styleSpec)].filter(type => !excludedTypes.has(type));

  for (const type of typesFromStyleSpec) {
    // get link to documentation for type
    const markdownLink = typeToMarkdownLink(type);
    if (!markdownLink) throw new Error(`Failed to generate markdown link for type '${type}'`)
    const { link, anchor } = markdownLink;

    // check if documentation link exists
    if (!existsSync(`docs/${link}`)) throw Error(`Type '${type}' links to '${link}' which does not seem to exist`);

    // check if anchor heading is correct
    if (anchor) {
      const typesFromDocumentation = await getTypesFromDocumentation(link);
      if (!typesFromDocumentation.has(anchor)) throw new Error(`Type '${type}' has anchor '${anchor}' which does not exist in '${link}'`)
    }
  }
});