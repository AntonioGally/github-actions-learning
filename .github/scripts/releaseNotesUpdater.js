const github = require('@actions/github');
const marked = require('marked');
const cheerio = require('cheerio');
const { GoogleSpreadsheet } = require('google-spreadsheet');

const context = github.context;

const formMap = {
    "Área": "departament",
    "Versão": "version",
    "Alvo": "target",
    "Tipo": "type",
    "Título": "title",
    "Descrição": "description",
    "Origem": "origin"
}

async function getValuesFromIssue() {
    const issueDescription = context.payload.issue.body;

    const html = marked.marked(issueDescription);

    const $ = cheerio.load(html);

    const data = {};
    $("h3").each(function () {
        const key = $(this).text();
        let value = $(this).next().text();
        if (value === "No response" || value === "None") value = "-";
        data[formMap[key]] = value;
    });

    return data;
}

async function loadSpreadSheet() {
    const doc = new GoogleSpreadsheet('1CtBuyMzO4KZGTFxUIi5MyrKKtLa2A9gMmkZ40SIxujY');

    await doc.useServiceAccountAuth({
        "type": "service_account",
        "project_id": "gh-integration-389019",
        "private_key_id": "e4d7dc679ac5cc822b4f8f8cd1eae515abcb269b",
        "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCsAdMS5BK8SluC\nDWD1ky3dqDTJNMD0j5TM/nA0yAPBFBKbClBwY3kHJ42wAeY+k9Etf9DTXlt9dW1Y\nmX3vRGwYSMiSKHq1lSunG1flgy3N0bglQ7zJem/aspNMjL5zuwDXwx8bxRwx0+an\nPhFbkedqtQsz8vKRWBi9l16qYEa5XvG0PGUhdFavZ9zYIzyx8yqpwXTLT3WpLSOl\nly9BBso/IEYe/Xt3PPGMOxVoRFrFpf9LwcTJtsmewZDl9yE56OSx/aDTD9CtpUHO\nobu3gUZHaUF6DLPf9UALVAPZ4fKn5g+eRr/E4CLmsYJwxX4ZG39G6BvDhtN6wQWI\npEIkYa2JAgMBAAECggEAFKXya+ffnOVTN1k6TLiSjrOIxKeVyzXqP7KCjz98feLW\nOfDix58VUgfMQTb1KAlwGKVpkNoYowaj7fkdDko5LLAeDbeYxXAHCbwlUMquxrCY\nibaoNMqDH26E8rFJkpR+DSih9SA0GoIsw+JWTJcG//8EPYP6XPrFm4rOhSbiDpH2\nD6VEKvlUiBIS6mWBXxLkKL6i/0kS11bA4JXCYlWUIxBEnY0wMx0ZUY5uT5QbZIQ+\nh+WmfNCHZafLhStITxjKyfXAruxs7Jy7/uquPEn4vSqsuDRf/mepjb/v9Vd5S8ut\nDChJ2maESQkf30tnnvXvqpdPKigwKxtHQHL0gspHwQKBgQDV1T5fvMuem3VhBDl1\nPTQ050CKaMHsDGz563tyhmJfOYGJ+RNBQnuMEbAt5zixAtvgC1Ava9qeV+8Y0KiJ\nDGKiBYk+bAAPvesQxZYnzwDAR+K1P2CBSAhbMIYPk+4wCYm6EcqBMxNxh0WuBw0W\n+Ob1vTscKc3bHou5bheVraCAqQKBgQDN7R7HUtPE7SG5WoquNekuX/iZCaCDKgL8\nIrhJuL9+AzUBvZ1PnZ0oP+v/7uMJtYZpuymJHdIjzX+wmSH/x+YcUS2+XOfQ2OU2\nyCehYXiCcmDQMVz26gjtsTG/WqyZV01thyueQVlIqmNZEqil6oEZgozhnbJ77x6l\nXI7naxZx4QKBgHA4W2WvFUWF3JIvv1/R4QYqnuqEk9EnrEF03fJ6qEHFUkBwoTRM\nib42wjk08cGj+HSaO1jHx5H2IBrr1qcmAtV5Bk/mKhoY17aTm3wE3SYME+R/AEyY\n2xnQW2rtfcFkIA2wrJAll/yqu1zbgnkd40fwKYdcQRbP7xA/wMzitCsRAoGBAMN9\nwCJptzDUDZfxJIaOF3g3E8H1KbRbRconC9ywztnKIaAtahITBwcW5+xn1JF7CseF\nLsFE1iG3DOmR9nzkQMfRKSP2/vt9bNy81yKVbdooy0/aDO867o74EMogQoqwHolE\nMVxjnWcmmnoNBJ2+KiEVlrj5BGAzeVxyqhd3yi8BAoGAKqXPWdGsPwBh0loeDMIe\nYS0fYQjCzytak+Qfrb+1RgwUMFFU89/zbIuCEUJkbsHs6KVawrXBHdatsmtscTvO\nWYkjd7H2pbD6M9DHz6VqNluQHtg/xJ+TlfKCF9vlMR8K1ua4n2MdkOXDkVYpKlDv\nXmOp5Ifj1n1QsHJT6VMhGMg=\n-----END PRIVATE KEY-----\n",
        "client_email": "gh-integration@gh-integration-389019.iam.gserviceaccount.com",
        "client_id": "103859397099574770168",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/gh-integration%40gh-integration-389019.iam.gserviceaccount.com",
        "universe_domain": "googleapis.com"
    });

    await doc.loadInfo(); // loads document properties and worksheets

    const sheet = doc.sheetsById[550290534];

    const issueData = await getValuesFromIssue();

    await sheet.addRow(createNewRow(issueData));
}

function createNewRow(data) {
    let date = new Date();
    let month = date.getMonth() + 1
    let formattedMonth = month < 10 ? `0${month}` : month;
    let formattedYear = date.getFullYear();

    return {
        'Data': `${formattedMonth}/${formattedYear}`,
        'Componente': data.departament,
        'Versão': data.version,
        'Alvo': data.target,
        'Tipo': data.type,
        'Título': data.title,
        'Nota': data.description,
        'Origem da Demanda': data.origin
    }
}

loadSpreadSheet();