const github = require('@actions/github');
const { Octokit } = require("@octokit/core");

async function run() {

    const newPRBody = '## Descrição das Mudanças 🛠\r\n' +
        '\r\n' +
        'Por favor, descreva de forma clara e concisa as mudanças feitas.\r\n' +
        '\r\n' +
        '## Tipo de Release 🚀\r\n' +
        '\r\n' +
        '- [ ] Maintenance\r\n' +
        '- [ ] Minor\r\n' +
        '- [ ] Major\r\n' +
        '\r\n' +
        '## Deseja adicionar ao Release Notes? 📝\r\n' +
        '\r\n' +
        '- [ ] Não\r\n' +
        '- [ ] Sim\r\n' +
        '\r\n' +
        '## Checklist de pré-review 🧢\r\n' +
        '\r\n' +
        '- [ ] O título do PR está descritivo e <b>sem</b> a taskID do ClickUp?\r\n' +
        '- [ ] Fiz uma auto-revisão do meu próprio código\r\n' +
        '- [ ] Adicionei comentários para facilitar a revisão, quando houver complexidade no código\r\n' +
        '- [ ] Atualizei a documentação, se necessário\r\n' +
        '\r\n' +
        '## Observações 🔍\r\n' +
        '\r\n' +
        'Por favor, informe qualquer tipo de observação que possa ser importante.'

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

run();
