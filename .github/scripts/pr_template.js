const github = require('@actions/github');
const { Octokit } = require("@octokit/core");

async function run() {
    try {
        const context = github.context;
        const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

        const prNumber = context.payload.pull_request.number;
        const owner = context.repo.owner;
        const repo = context.repo.repo;

        // load the PR
        const { data: pr } = await octokit.rest.pulls.get({
            owner,
            repo,
            pull_number: prNumber,
        });

        // Append the PR template to the existing PR body
        const newBody = `## Descrição das Mudanças 🛠\\n\\nPor favor, descreva de forma clara e concisa as mudanças feitas.\\n\\n## Tipo de Release 🚀\\n\\n- [ ] Maintenance\\n- [ ] Minor\\n- [ ] Major\\n\\n## Deseja adicionar ao Release Notes? 📝\\n\\n- [ ] Não\\n- [ ] Sim\\n\\n## Checklist de pré-review 🧢\\n\\n- [ ] O título do PR está descritivo e <b>sem</b> a taskID do ClickUp?\\n- [ ] Fiz uma auto-revisão do meu próprio código\\n- [ ] Adicionei comentários para facilitar a revisão, quando houver complexidade no código\\n- [ ] Atualizei a documentação, se necessário\\n\\n## Observações 🔍\\n\\nPor favor, informe qualquer tipo de observação que possa ser importante.\n\n${pr.body}`;

        // Update the PR description
        await octokit.rest.pulls.update({
            owner,
            repo,
            pull_number: prNumber,
            body: newBody,
        });
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

run();
