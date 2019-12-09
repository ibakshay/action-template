import octokit from './octokit'
import * as core from '@actions/core';
import { context } from '@actions/github'
import { CommitterMap, CommittersDetails, ReactedCommitterMap, CommentedCommitterMap } from './interfaces'
import prComment from './pullRequestComment';


export default async function reaction(commentId, committerMap: CommitterMap, committers) {
    let reactedCommitterMap = {} as ReactedCommitterMap
    let commentedCommitterMap = {} as CommentedCommitterMap
    let prResponse = await octokit.issues.listComments({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: context.issue.number
    })
    let listOfPRCommentsDetails = [] as CommittersDetails[]
    let filteredListOfPRCommentsDetails = [] as CommittersDetails[]

    prResponse.data.map((prComment) => {
        listOfPRCommentsDetails.push({
            name: prComment.user.login,
            id: prComment.user.id,
            comment_id: prComment.id,
            body: prComment.body.toLowerCase(),
            created_at: prComment.created_at,
            updated_at: prComment.updated_at
        })
    })

    listOfPRCommentsDetails.map((comment) => {
        if (comment.body!.match(/.*i \s*have \s*read \s*the \s*cla \s*document \s*and \s*i \s*hereby \s*sign \s*the \s*cla.*/) && comment.name !== 'github-actions[bot]') {
            filteredListOfPRCommentsDetails.push(comment)
        }
    })

    for (var i = 0; i < filteredListOfPRCommentsDetails.length; i++) {
        delete filteredListOfPRCommentsDetails[i].body
    }

    // //checking if the reacted committers are not the signed committers(not in the storage file) and filtering only the unsigned committers
    commentedCommitterMap.newSigned = filteredListOfPRCommentsDetails.filter(commentedCommitter => committerMap.notSigned!.some(notSignedCommitter => commentedCommitter.id === notSignedCommitter.id))

    console.log("the new commented committers(signed) are :" + JSON.stringify(commentedCommitterMap, null, 3))

    //checking if the commented users are only the contributors who has committed in the same PR (This is needed for the PR Comment and changing the status to success when all the contributors has reacted to the PR)
    commentedCommitterMap.onlyCommitters = committers.filter(committer => filteredListOfPRCommentsDetails.some(commentedCommitter => committer.id == commentedCommitter.id))

    console.log("the list of PR contributor's comments are " + JSON.stringify(filteredListOfPRCommentsDetails, null, 3))

    // const response = await octokit.reactions.listForIssueComment({
    //     owner: context.repo.owner,
    //     repo: context.repo.repo,
    //     comment_id: commentId
    // })
    // let reactedCommitters = [] as CommittersDetails[]
    // response.data.map((reactedCommitter) => {
    //     reactedCommitters.push({
    //         name: reactedCommitter.user.login,
    //         id: reactedCommitter.user.id,
    //         created_at: reactedCommitter.created_at
    //     })
    // })
    // // //checking if the reacted committers are not the signed committers(not in the storage file) and filtering only the unsigned committers
    // reactedCommitterMap.newSigned = reactedCommitters.filter(reactedCommitter => committerMap.notSigned!.some(notSignedCommitter => reactedCommitter.id === notSignedCommitter.id))

    // //checking if the reacted users are only the contributors who has committed in the same PR (This is needed for the PR Comment and changing the status to success when all the contributors has reacted to the PR)
    // reactedCommitterMap.onlyCommitters = committers.filter(committer => reactedCommitters.some(reactedCommitter => committer.id == reactedCommitter.id))
    return commentedCommitterMap

}