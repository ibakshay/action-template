import octokit from './octokit'
import * as core from '@actions/core';
import { context } from '@actions/github'
import { CommitterMap, CommittersDetails, ReactedCommitterMap } from './interfaces'


export default async function reaction(commentId, committerMap: CommitterMap, committers) {
    let reactedCommitterMap = {} as ReactedCommitterMap
    const response = await octokit.reactions.listForIssueComment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        comment_id: commentId
    })
    let reactedCommitters = [] as CommittersDetails[]
    response.data.map((reactedCommitter) => {
        reactedCommitters.push({
            name: reactedCommitter.user.login,
            id: reactedCommitter.user.id
        })
    })
    //checking if the reacted committers are not the signed committers(not in the storage file) and filtering only the unsigned committers
    //reactedCommitterMap.newSigned = committerMap.notSigned!.filter(committer => reactedCommitters.some(cla => committer.id === cla.id))
    committerMap.notSigned!.filter(committer => reactedCommitters.some(cla => committer.id === cla.id))
    console.log('committerMap.notSigned map is ' + JSON.stringify(committerMap, null, 2))
    reactedCommitterMap.newSigned = committerMap.notSigned as CommittersDetails[]
    console.log('committerMap.notSigned map is ' + JSON.stringify(reactedCommitterMap.newSigned, null, 2))
    //checking if the reacted users are only the contributors who has committed in the same PR (This is needed for the PR Comment and changing the status to success when all the contributors has reacted to the PR)
    reactedCommitterMap.onlyCommitters = committers.filter(committer => reactedCommitters.some(reactedCommitter => committer.id == reactedCommitter.id))
    return reactedCommitterMap

}