const github = require('@actions/github');
const { Octokit } = require("@octokit/core");
const fs = require("fs")

async function run() {

    let newPRBody = "";
    fs.readFile("../PULL_REQUEST_TEMPLATE/release_template.md", (err, data) => { newPRBody = data.toString() })

    try {
        const context = github.context;
        const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

        const prNumber = context.payload.pull_request.number;
        const owner = context.repo.owner;
        const repo = context.repo.repo;

        await octokit.request('PATCH /repos/{owner}/{repo}/pulls/{pull_number}', {
            owner,
            repo,
            pull_number: prNumber,
            body: newPRBody,
        });
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}