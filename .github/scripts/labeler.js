const { Octokit } = require("@octokit/core");
const github = require('@actions/github');

const context = github.context;

// Create a new Octokit instance
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

// Extract the relevant information from the GitHub Actions context
const owner = "AntonioGally";
const repo = "github-actions-learning";
const pull_number = context.payload.pull_request.number;
const branch_name = context.payload.pull_request.head.label;

// Define a mapping from commit type to label
const commitTypeToLabel = {
    feat: 'Feature',
    fix: 'Bug',
    docs: 'Documentation',
    style: 'UI/UX',
    perf: 'Performance',
    refactor: 'Refactor',
    test: 'Tests',
    build: 'Build',
    itsm: 'ITSM'
    // Add more mappings as necessary
};

// Define a function to get all commit messages for a PR
async function getCommitMessages() {
    const commits = await octokit.request(`GET /repos/${owner}/${repo}/pulls/${pull_number}/commits`);

    return commits.data.map(commit => commit.commit.message);
}

// Define a function to apply a label to a PR
async function applyLabel(label) {
    await octokit.request(`POST /repos/${owner}/${repo}/issues/${pull_number}/labels`, {
        labels: [label]
    });
}

// Get the commit messages and apply labels
getCommitMessages().then(commitMessages => {
    commitMessages.forEach(message => {
        // This regex looks for a pattern like "type(scope): description" at the start of the commit message
        const match = message.match(/^(\w+)(\(.+\))?: .+/);

        if (match) {
            const commitType = match[1];
            const label = commitTypeToLabel[commitType];

            if (label) {
                applyLabel(label);
            }
        } else if (branch_name.indexOf("itsm") > -1) {
            applyLabel(commitTypeToLabel["itsm"]);
        }
    });
}).catch(console.error);
