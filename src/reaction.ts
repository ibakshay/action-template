import octokit from './octokit'
import * as core from '@actions/core';
import { context } from '@actions/github'
import { CommitterMap, CommittersDetails, ReactedCommitterMap } from './interfaces'


export default async function reaction(commentId, committerMap: CommitterMap, committers) {
    let reactedCommitterMap = {} as ReactedCommitterMap
    let bufferCommitters = [] as CommittersDetails[]
    const response = await octokit.reactions.listForIssueComment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        comment_id: commentId
    })
    let reactedCommitters = [] as CommittersDetails[]
    response.data.map((reactedCommitter) => {
        reactedCommitters.push({
            name: reactedCommitter.user.login,
            id: reactedCommitter.user.id,
            createdAt: reactedCommitter.created_at
        })
    })
    console.log("I am in reacted file")
    //checking if the reacted committers are not the signed committers(not in the storage file) and filtering only the unsigned committers
    reactedCommitters.filter(reactedCommitter => committerMap.notSigned!.some(notSignedCommitter => reactedCommitter.id === notSignedCommitter.id))
    console.log("I am in reacted file2 ")
    //bufferCommitters = reactedCommitterMap.newSigned

    reactedCommitters.forEach(reactedCommitter => {
        committerMap.notSigned!.forEach(notSignedCommitter => {
            if (notSignedCommitter && reactedCommitter) {
                if (reactedCommitter.id === notSignedCommitter.id) {
                    if (notSignedCommitter.pullRequestNo) {
                        reactedCommitter = {
                            ...reactedCommitter,
                            pullRequestNo: notSignedCommitter.pullRequestNo
                        }
                        bufferCommitters.push(reactedCommitter)
                        console.log('Becky  map is ' + JSON.stringify(reactedCommitter, null, 2))

                    }
                }

            }

        })
    })
    console.log('Akshay  map is ' + JSON.stringify(bufferCommitters, null, 2))
    reactedCommitterMap.newSigned = bufferCommitters
    //checking if the reacted users are only the contributors who has committed in the same PR (This is needed for the PR Comment and changing the status to success when all the contributors has reacted to the PR)
    reactedCommitterMap.onlyCommitters = committers.filter(committer => reactedCommitters.some(reactedCommitter => committer.id == reactedCommitter.id))
    console.log('reacted committers map is ' + JSON.stringify(reactedCommitterMap, null, 2))
    return reactedCommitterMap

}