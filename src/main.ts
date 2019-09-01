import * as core from '@actions/core';
import * as github from '@actions/github'
const fs = require('fs')
const io = require('@actions/io')


async function run() {
  try {
    const myInput = core.getInput('myInput');
    console.log(`The path to CLA is   ${myInput}`);

    // This should be a token with access to your repository scoped in as a secret.
    const myToken = core.getInput('myToken');
    const octokit = new github.GitHub(myToken);

    const args = {
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      issue_number: github.context.issue.number
    }
    let variables = {
      owner: args.owner,
      name: args.repo,
      number: args.issue_number,
      cursor: ''
    }



    /* Graphql start for getting committers */
    interface committersDetails {
      name: string,
      id: number
    }
    let committers: committersDetails[] = []
    const extractUserFromCommit = (commit) => commit.author.user || commit.committer.user || commit.author || commit.committer
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
    response.repository.pullRequest.commits.edges.forEach(edge => {
      let committer = extractUserFromCommit(edge.node.commit)
      let user = {
        name: committer.login || committer.name,
        id: committer.databaseId || ''
      }
      try {
        if (committers.length === 0 || committers.map((c) => {
          return c.name
        }).indexOf(user.name) < 0) {
          committers.push(user)
        }
      }

      catch (e) {
        throw new Error(e)
      }

    });

    console.log(committers)
    /* Graphql end for getting committers */
    let pathToCla = '../cla.json'
    let file
    try {
      file = fs.readFileSync(pathToCla, 'utf8');
    } catch (err) {
      throw new Error("CLA file not found.");
    }
    console.log("The contributors are :" + file)

  } catch (error) {
    core.setFailed(error.message);
  }

}

run();
