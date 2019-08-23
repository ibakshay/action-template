import * as core from '@actions/core';

async function run() {
  try {
    const myInput = core.getInput('myInput');
    console.log('Testing if the logging works in GitHub Logging console')
    core.debug('Test if debeugger works');
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
