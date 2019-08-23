import * as core from '@actions/core';
import * as github from '@actions/github'

async function run() {
  try {
    const myInput = core.getInput('myInput');
    core.debug(`Hello ${myInput}`);

    // This should be a token with access to your repository scoped in as a secret.
    const myToken = core.getInput('myToken');
    const octokit = new github.GitHub(myToken);

    const args = {
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      issue_number: github.context.issue.number,
      body: 'Hello World'
    }
    const responseToIssue = await octokit.issues.createComment(args)


  } catch (error) {
    core.setFailed(error.message);
  }

}

run();
