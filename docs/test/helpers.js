import { execa } from 'execa';

function filterTags(tagList) {
    const filtered = tagList.filter(matchesRE);
    return filtered;
}

function matchesRE(str) {
    return /v([A-Z([0-9]+\.[0-9]+\.[0-9]+)$/.test(str);
}

async function latestStableTag() {
    await execa('git fetch --tags', {
        shell: true
    });

    // Get the maplibre-gl package's servsions from npm, sorted by semver.
    const { stdout } = await execa(`npm info maplibre-gl versions --json`, {
        shell: true
    }).catch((err) => {
        console.error(`Failed to list tags. ${JSON.stringify(err, null, 2)}`);
    });
    const suffixRe = new RegExp(`(-([beta]+|[rc]+|[alpha]+)(\\.?[0-9]+?)?)`);
    const stableReleases = JSON.parse(stdout).filter(
        (ver) => !ver.match(suffixRe)
    );
    return `v${stableReleases.pop()}`;
}

async function currentTag() {
    /* There's no way to guarantee that only one Tag is associated with a given
     * SHA, so we need to get all of the tags associated with a the current
     * Tag's SHA, then filter them by the stable release version naming pattern.
     */
    const { stdout: currentRev } = await execa(`git rev-parse HEAD`, {
        shell: true
    });

    const { stdout: revList } = await execa(`git rev-list -n 1 ${currentRev}`, {
        shell: true
    }).catch((err) => {
        console.error(
            `Failed to fetch rev list for current tag. ${JSON.stringify(
                err,
                null,
                2
            )}`
        );
    });

    const possibleTags = await execa(`git tag --contains ${revList}`, {
        shell: true
    }).then((res) => {
        // Git returns the tag list in multiple lines
        return res.stdout.split('\n');
    });

    const matchedTags = filterTags(possibleTags);

    return matchedTags[0];
}

module.exports = {
    filterTags,
    latestStableTag,
    currentTag
};
