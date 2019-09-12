import * as core from '@actions/core';
import * as github from '@actions/github'

async function run() {
  try {
    const myInput = core.getInput('myInput');
    console.log(`My input is  ${myInput}`);

    // This should be a token with access to your repository scoped in as a secret.
    const myToken = core.getInput('myToken');
    const octokit = new github.GitHub(myToken);

    //if (github.context.payload.action === 'opened') {
    const args = {
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      issue_number: github.context.issue.number,
      body: 'Thank you for your submission, we really appreciate it. Like many open source projects, we ask that you sign our Contributor License Agreement before we can accept your contribution. You can respond with ' + +1 + 'to this comment for signing the CLA'
    }

    const responseToIssue = await octokit.issues.createComment(args)
    //console.error('Thank you for creating the issue')
    //}
    //console.error(github.context)


  } catch (error) {
    core.setFailed(error.message);
  }

}

run();
