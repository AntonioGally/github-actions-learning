const { Octokit } = require("@octokit/core");
const github = require('@actions/github');

const context = github.context;

// Create a new Octokit instance
const octokit = new Octokit({ auth: `oie_hihi` });

// Extract the relevant information from the GitHub Actions context
const owner = "looqbox";
const repo = "web-interface";
const pull_number = 1272;
// const head_branch_name = context.payload.pull_request.head.label;
const head_branch_name = "feature/CU-864eufghu"


function getTaskId(inputString) {
    const regex = /#(\w+)|CU-(\w+)/g;
    const matches = inputString.match(regex);
    let taskIds = [];

    if (matches) {
        taskIds = matches.map(match => match.replace(/#|CU-/g, ''));
    }

    return taskIds;
}

async function getTaskIdFromCommitsAndBranch() {
    const commits = await octokit.request(`GET /repos/${owner}/${repo}/pulls/${pull_number}/commits`);
    const commitMessages = commits.data.map(commit => commit.commit.message);

    const setMessage = new Set();

    commitMessages.forEach(commitMessage => {
        let taskId = getTaskId(commitMessage)[0];
        if (taskId) setMessage.add(taskId);
    });

    let taskIdFromBranch = getTaskId(head_branch_name)[0];
    if (taskIdFromBranch) setMessage.add(taskIdFromBranch);

    return [...setMessage];
}


async function changeTaskStatus(taskId) {
    const fetch = (await import('node-fetch')).default;

    const body = JSON.stringify({
        status: "em revisão"
    });

    const headers = {
        "Content-Type": "application/json",
        "Authorization": "pk_43136115_CS96XE5X72I5RJIX7N2RH5GM9R7YKQKE",
    };

    const response = await fetch(`https://api.clickup.com/api/v2/task/${taskId}`, {
        method: 'PUT',
        headers: headers,
        body: body
    });

    if (!response.ok) {
        throw new Error(`HTTP error \n status: ${response.status}`);
    }
}


async function init() {
    const taskIds = await getTaskIdFromCommitsAndBranch();
    for (let idx = 0; idx < taskIds.length; idx++) {
        await changeTaskStatus(taskIds[idx]);
    }
}

init();