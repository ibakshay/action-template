import octokit from './octokit'
import * as core from '@actions/core';
import { context } from '@actions/github'
import { CommitterMap, CommittersDetails, ReactedCommitterMap, ReactedCommitterMap2 } from './interfaces'


export default async function reaction(commentId, committerMap: CommitterMap, committers) {
    console.log("In Reaction file")
    let reactedCommitterMap = {} as ReactedCommitterMap
    let reactedCommitterMap2 = {} as ReactedCommitterMap2
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
    //checking if the reacted committers are not the signed committers(not in the storage file) and filtering only the unsigned committers
    // reactedCommitterMap.newSigned = reactedCommitters.filter(reactedCommitter => committerMap.notSigned!.some(notSignedCommitter => reactedCommitter.id === notSignedCommitter.id))
    // console.log("the first  reacted Committers are " + JSON.stringify(reactedCommitterMap, null, 2))
    //reactedCommitterMap2 = reactedCommitterMap


    reactedCommitters.forEach((reactedCommitter) => {
        committerMap.notSigned!.map((notSignedCommitter) => {
            if (notSignedCommitter.id === reactedCommitter.id) {
                reactedCommitterMap.newSigned.push(notSignedCommitter)
            }
        })
    })
    console.log("the Mapped reacted Committers are " + JSON.stringify(reactedCommitterMap2, null, 2))

    //checking if the reacted users are only the contributors who has committed in the same PR (This is needed for the PR Comment and changing the status to success when all the contributors has reacted to the PR)
    reactedCommitterMap.onlyCommitters = committers.filter(committer => reactedCommitters.some(reactedCommitter => committer.id == reactedCommitter.id))
    console.log("the second reacted Committers are " + JSON.stringify(reactedCommitterMap, null, 2))
    return reactedCommitterMap

}