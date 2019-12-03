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
    // checking if the reacted committers are not the signed committers(not in the storage file) and filtering only the unsigned committers

    reactedCommitterMap.newSigned = reactedCommitters.filter(reactedCommitter => committerMap.notSigned!.some(notSignedCommitter => reactedCommitter.id === notSignedCommitter.id))
    function addPullRequestNo(reactedCommitter, notSignedCommitter) {
        if (reactedCommitter.id === notSignedCommitter.id) {
            reactedCommitter = {
                ...reactedCommitter,
                pullRequestNo: notSignedCommitter.pullRequestNo
            }
            console.log("tictic" + JSON.stringify(reactedCommitter))
        }
        console.log("blabla" + JSON.stringify(reactedCommitter))
        return reactedCommitter

    }
    reactedCommitterMap.newSigned = reactedCommitters.filter(reactedCommitter => committerMap.notSigned!.filter(notSignedCommitter => addPullRequestNo(reactedCommitter, notSignedCommitter)))
    console.log("the first  reacted Committers are " + JSON.stringify(reactedCommitterMap, null, 2))
    //reactedCommitterMap2 = reactedCommitterMap


    // committerMap.notSigned!.forEach((notSignedCommitter) => {
    //     reactedCommitters!.map((reactedCommitter) => {
    //         if (notSignedCommitter.id === reactedCommitter.id) {
    //             reactedCommitter = {
    //                 ...reactedCommitter,
    //                 createdAt: notSignedCommitter.createdAt
    //             }
    //             console.log("akshay is great " + JSON.stringify(reactedCommitter, null, 2))

    //         }
    //reactedCommitterMap.newSigned.push(reactedCommitter)
    //console.log("AKSHAY IS GREAT  ----> " + JSON.stringify(reactedCommitterMap, null, 2))

    // })
    //     })
    // console.log("the Mapped reacted Committers are " + JSON.stringify(reactedCommitterMap, null, 2))

    //checking if the reacted users are only the contributors who has committed in the same PR (This is needed for the PR Comment and changing the status to success when all the contributors has reacted to the PR)
    reactedCommitterMap.onlyCommitters = committers.filter(committer => reactedCommitters.some(reactedCommitter => committer.id == reactedCommitter.id))
    console.log("the second reacted Committers are " + JSON.stringify(reactedCommitterMap, null, 2))
    return reactedCommitterMap

}