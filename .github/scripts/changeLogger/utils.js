const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const marked = require('marked');
const cheerio = require('cheerio');

function extractInfo(prData) {
    const html = marked.marked(prData.body, { mangle: false, headerIds: false });
    const $ = cheerio.load(html);

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


function generateDate() {
    const date = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString("en-US", options);
}

async function createRelease(octokit, info, tagName, owner, repo) {
    // Create a body for the release based on the other information
    let body = `## ${info.title}\n\n`;
    body += `### ${info.description}\n\n`;
    body += `#### ${info.observations}\n\n`;
    if (info.assignees.length > 0) body += `## Autores\n\n${info.assignees.map(data => `<div>${data.name} <br/> <img src="${data.image}" width="45px"/></div>`)}`

    // Create the release
    const data = await octokit.request('POST /repos/{owner}/{repo}/releases', {
        owner, repo,
        tag_name: tagName,
        name: `${tagName} (${generateDate()})`,
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

function createLog(prDescInfo, commits, tagName) {
    let body = `## ${tagName} (${generateDate()}) \n`;
    body += `<p> <b> ${prDescInfo.title} </b> </p> \n`;
    body += `<p> ${prDescInfo.description} </p> \n`;
    body += `<P> ${prDescInfo.observations} </p> \n\n`;
    body += `<details> <summary><h2>Commits</h2></summary> \n\n`
    body += `| Commit | Messsage | Author |\n`;
    body += `| -- | -- | -- |\n`;
    commits.forEach(data => {
        body += `| <a href="${data.url}">${data.minSha}</a> | ${data.message} | <img width="30px" src="${data.authorImage}"/> \n`
    })
    body += `\n</details>`
    return body;
}

async function appendToChangelog(prDescInfo, prNumber, tagName, owner, repo, octokit) {
    const commitsRequest = await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}/commits', {
        owner, repo,
        pull_number: prNumber,
    })
    let commitsArray = commitsRequest.data.map((data) => ({
        url: data.html_url,
        minSha: data.sha.substring(0, 7),
        message: data.commit.message,
        authorImage: data.author.avatar_url
    }));

    const logInfo = createLog(prDescInfo, commitsArray, tagName);

    const changelogPath = path.join(__dirname, '../../../CHANGELOG.md');

    // Read the existing content
    const oldContent = fs.readFileSync(changelogPath, 'utf8');

    // Concatenate the new content at the beginning
    const newContent = `${logInfo}\n\n${oldContent}`;

    // Write the new content back to the file
    fs.writeFileSync(changelogPath, newContent, 'utf8');

    // Add, commit, and push the changes
    execSync('git config --global user.email "antonio.gally@gmail.com"', { stdio: 'inherit' });
    execSync('git config --global user.name "AntonioGally"', { stdio: 'inherit' });
    execSync('git add ../../CHANGELOG.md', { stdio: 'inherit' });
    execSync('git commit -m "docs: :memo: Updating changelog"', { stdio: 'inherit' });
    execSync('git push', { stdio: 'inherit' });
}

module.exports = {
    extractInfo, createRelease, createTag, appendToChangelog
}