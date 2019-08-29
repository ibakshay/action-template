import * as core from '@actions/core';
import * as github from '@actions/github'
//import { PRCommitters } from './graphQL/query'


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

    // var graphql = new PRCommitters(args.owner, args.repo, args.issue_number, '')
    // var query = graphql.getPRCommitters(args.owner, args.repo, args.issue_number, '')

    // const { query, variables } = graphQL.getPRCommitters(args.owner, args.repo, args.issue_number, '')
    let variables = {
      owner: args.owner,
      name: args.repo,
      number: args.issue_number,
      cursor: ''
    }
    //console.error(github.context)

    let response = await octokit.graphql(`
    query($owner:String! $name:String! $number:Int! $cursor:String!){
        repository(owner: $owner, name: $name) {
        pullRequest(number: $number) {
            commits(first: 100, after: $cursor) {
                totalCount
                edges {
                    node {
                        commit {
                            author {
                                email
                                name
                                user {
                                    id
                                    databaseId
                                    login
                                }
                            }
                            committer {
                                name
                                user {
                                    id
                                    databaseId
                                    login
                                }
                            }
                        }
                    }
                    cursor
                }
                pageInfo {
                    endCursor
                    hasNextPage
                }
            }
        }
    }
}`.replace(/ /g, ''), {
      owner: args.owner,
      name: args.repo,
      number: args.issue_number,
      cursor: ''
    })
    //  console.log(query)
    console.log(response.repository.pullRequest.commits)

    //const responseToIssue = await octokit.issues.createComment(args)
    //  console.error('Thank you for creating the issue --dev-release')
    //}



  } catch (error) {
    core.setFailed(error.message);
  }

}

run();
