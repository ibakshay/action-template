import * as core from '@actions/core';
import * as github from '@actions/github'
const graphQL = require('./graphql/query.ts')

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
      issue_number: github.context.issue.number
    }

    const { query, variables } = graphQL.getPRCommitters(args.owner, args.repo, args.issue_number, '')

    let response = await octokit.graphql(query, variables)
    console.log(query)
    console.log(variables)

    //const responseToIssue = await octokit.issues.createComment(args)
    console.error('Thank you for creating the issue --dev-release')
    //}
    console.error(github.context)


  } catch (error) {
    core.setFailed(error.message);
  }

}

run();
