import octokit from './octokit'
import * as core from '@actions/core';
import { context } from '@actions/github'
import { CommitterMap, CommittersDetails, ReactedCommitterMap, CommittersCommentDetails } from './interfaces'
import prComment from './pullRequestComment';


export default async function reaction(commentId, committerMap: CommitterMap, committers) {
    let reactedCommitterMap = {} as ReactedCommitterMap
    let prResponse = await octokit.issues.listComments({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: context.issue.number
    })
    let listOfPRCommentsDetails = [] as CommittersCommentDetails[]

    prResponse.data.map((prComment) => {
        listOfPRCommentsDetails.push({
            name: prComment.user.login,
            id: prComment.user.id,
            comment_id: prComment.id,
            body: prComment.body,
            created_at: prComment.created_at,
            updated_at: prComment.updated_at
        })
    })

    //let regex = new RegExp()

    listOfPRCommentsDetails.filter((prComment) => {
        if (prComment.body.match(/.*CLA Assistant Lite.*/)) {
            return prComment
        }
    })

    console.log("the list of PR comments are " + JSON.stringify(listOfPRCommentsDetails, null, 3))


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
    // //checking if the reacted committers are not the signed committers(not in the storage file) and filtering only the unsigned committers
    reactedCommitterMap.newSigned = reactedCommitters.filter(reactedCommitter => committerMap.notSigned!.some(notSignedCommitter => reactedCommitter.id === notSignedCommitter.id))

    //checking if the reacted users are only the contributors who has committed in the same PR (This is needed for the PR Comment and changing the status to success when all the contributors has reacted to the PR)
    reactedCommitterMap.onlyCommitters = committers.filter(committer => reactedCommitters.some(reactedCommitter => committer.id == reactedCommitter.id))
    return reactedCommitterMap

}