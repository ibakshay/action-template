import * as core from '@actions/core';
import * as github from '@actions/github'
const io = require('@actions/io')
import octokit from './octokit'


async function run() {
  try {
    core.debug('CLA Assistant GitHub Action is running')
    const myInput = core.getInput('myInput')
    //console.log(`The path to CLA is   ${myInput}`);

    // This should be a token with access to your repository scoped in as a secret.
    const myToken = core.getInput('myToken')
    const args1 = {
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      issue_number: github.context.issue.number
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
      owner: args1.owner,
      name: args1.repo,
      number: args1.issue_number,
      cursor: ''
    })
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
    const args2 = {
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      path: 'cla.json',
      ref: 'master'
    }

    let result, content
    try {
      result = await octokit.repos.getContents(args2)
      //console.log(result)
      content = Buffer.from(result.data.content, 'base64').toString()
      console.log(JSON.parse(content))
    } catch (e) {
      throw new Error("error reading contributor file: " + e)
    }
    let testJSON = {
      name: "akshay",
      id: 2344
    }
    let updateFile, contentBinary
    let contentString = JSON.stringify(testJSON)
    contentBinary = Buffer.from(contentString).toString('base64')
    const args3 = {
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      path: 'cla.json',
      ref: 'master',
      sha: result.data.sha,
      message: 'test commit',
      content: contentBinary
    }

    try {
      updateFile = await octokit.repos.createOrUpdateFile(args3)
    } catch (e) {
      throw new Error("error updating  contributor file: " + e)
    }
  } catch (error) {
    core.setFailed(error.message);
  }

}

run();
    // let pathToCla = './cla.json'
    // let file
    // try {
    //   file = fs.readFileSync(pathToCla, 'utf8');
    // } catch (err) {
    //   throw new Error("CLA file not found.");
    // }