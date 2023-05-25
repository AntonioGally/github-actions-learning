const core = require('@actions/core');

const clickupStatus = process.env.CLICKUP_STATUS;

core.info('look this log', { clickupStatus });