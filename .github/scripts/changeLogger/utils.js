function extractInfo($, prData) {
    // Initialize an object to hold the extracted information
    let info = {};

    const releaseTypeList = $("#pr-release-type>ul li");
    let releaseType;
    $(releaseTypeList).each((liIndex, li) => {
        let isInputChecked = $(li).find("input").is(":checked");
        if (isInputChecked) releaseType = $(li).text().trim().toLowerCase();
    });
    const releaseOptionList = $("#pr-release-option>ul li");
    let releaseOption;
    $(releaseOptionList).each((liIndex, li) => {
        let isInputChecked = $(li).find("input").is(":checked");
        if (isInputChecked) releaseOption = $(li).text().trim().toLowerCase();
    });

    info.title = $("#pr-title").text().trim() || "No title provided";
    info.description = $("#pr-description").text().trim() || "No description provided";
    info.releaseType = releaseType || "maintenance";
    info.addToReleaseNotes = releaseOption === "não" ? false : true;
    info.observations = $("#pr-observations").text().trim() || "";
    info.assignees = [];
    prData.assignees.forEach(data => {
        info.assignees.push({ name: data.login, image: data.avatar_url })
    })

    return info;
}


async function createRelease(octokit, info, tagName, owner, repo) {
    // Create a body for the release based on the other information
    let body = `## ${info.title}\n\n`;
    body += `### ${info.description}\n\n`;
    body += `#### ${info.observations}\n\n`;
    if (info.assignees.length > 0) body += `## Autores\n\n${info.assignees.map(data => `<div>${data.name} <br/> <img src="${data.image}" width="45px" /></div>`)}`

    const date = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = date.toLocaleDateString("en-US", options);


    // Create the release
    const data = await octokit.request('POST /repos/{owner}/{repo}/releases', {
        owner, repo,
        tag_name: tagName,
        name: `${tagName} (${formattedDate})`,
        body: body,
        draft: false,
        prerelease: false,
    })

    console.log(`Created release with ID: ${data.data.id}`);
}


function getNextVersion(tagName, releaseType) {
    // Get the numbers from the tag name by removing the 'v' and splitting on '.'
    let [major, minor, patch] = tagName.substring(1).split('.').map(Number);

    // Increment the appropriate number based on the release type
    if (releaseType === "major") {
        major++;
        minor = 0;
        patch = 0;
    } else if (releaseType === "minor") {
        minor++;
        patch = 0;
    } else if (releaseType === "patch") {
        patch++;
    }

    // Return the new version number
    return `v${major}.${minor}.${patch}`;
}


async function createTag(octokit, owner, repo, releaseType) {

    // Get the latest release to find out the current version number
    let latestVersion = "";
    const tagRequest = await octokit.request('GET /repos/{owner}/{repo}/tags', {
        owner, repo
    })
    if (tagRequest.data.length === 0) latestVersion = "v0.1.0";
    else latestVersion = tagRequest.data[0].name;

    // Get the next version number based on the release type
    const nextVersion = getNextVersion(latestVersion, releaseType);

    const commitRequest = await octokit.request('GET /repos/{owner}/{repo}/commits/{ref}', {
        owner, repo,
        ref: 'HEAD',
    })

    // Create the tag
    await octokit.request('POST /repos/{owner}/{repo}/git/refs', {
        owner, repo,
        ref: `refs/tags/${nextVersion}`,
        sha: commitRequest.data.sha,
    })

    console.log(`Created tag: ${nextVersion}`);

    return nextVersion;
}

module.exports = {
    extractInfo, createRelease, createTag
}