const core = require('@actions/core');

const myInput = core.getInput('inputName', { required: true });
const myBooleanInput = core.getBooleanInput('booleanInputName', { required: true });
core.info('look this log', { myInput, myBooleanInput });
core.setOutput('outputKey', 'outputVal');