const github = require('@actions/github');
const { Octokit } = require("@octokit/core");
const { extractInfo, createTag, createRelease, appendToChangelog } = require("./utils");



async function main() {
    const context = github.context;
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

    // const prNumber = 18;
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

    const prDescInfo = extractInfo(prRequest.data);

    const nextVersion = await createTag(octokit, owner, repo, prDescInfo.releaseType);

    prDescInfo.addToReleaseNotes && await createRelease(octokit, prDescInfo, nextVersion, owner, repo);

    await appendToChangelog(prDescInfo, prNumber, nextVersion, owner, repo, octokit);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});

