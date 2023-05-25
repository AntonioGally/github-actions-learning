const core = require('@actions/core');

const myInput = core.getInput('inputName', { required: true });
const myBooleanInput = core.getBooleanInput('booleanInputName', { required: true });
const myMultilineInput = core.getMultilineInput('multilineInputName', { required: true });
core.info('look this log', { myInput, myBooleanInput, myMultilineInput });
core.setOutput('outputKey', 'outputVal');