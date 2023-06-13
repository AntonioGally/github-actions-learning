const github = require('@actions/github');
const marked = require('marked');
const cheerio = require('cheerio');
const { Octokit } = require("@octokit/core");
const { extractInfo, createTag, createRelease } = require("./utils");



async function main() {
    const context = github.context;
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

    // const prNumber = 15;
    // const owner = "AntonioGally";
    // const repo = "github-actions-learning";
    const prNumber = context.payload.pull_request.number;
    const owner = context.repo.owner;
    const repo = context.repo.repo;

    // Get information about the closed PR
    const prRequest = await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}', {
        owner,
        repo,
        pull_number: prNumber,
    });

    // Extracting info from pr desc
    const html = marked.marked(prRequest.data.body, { mangle: false, headerIds: false });
    const $ = cheerio.load(html);
    const info = extractInfo($, prRequest.data);

    // Creating new tag version
    const nextVersion = await createTag(octokit, owner, repo, info.releaseType);

    info.addToReleaseNotes && await createRelease(octokit, info, nextVersion, owner, repo);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});

