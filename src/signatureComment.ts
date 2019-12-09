import octokit from './octokit'
import { context } from '@actions/github'
import { CommitterMap, CommittersDetails, CommentedCommitterMap } from './interfaces'


export default async function signatureWithPRComment(commentId, committerMap: CommitterMap, committers) {
    let commentedCommitterMap = {} as CommentedCommitterMap
    let prResponse = await octokit.issues.listComments({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: context.issue.number
    })
    let listOfPRComments = [] as CommittersDetails[]
    let filteredListOfPRComments = [] as CommittersDetails[]

    prResponse.data.map((prComment) => {
        listOfPRComments.push({
            name: prComment.user.login,
            id: prComment.user.id,
            comment_id: prComment.id,
            body: prComment.body.toLowerCase(),
            created_at: prComment.created_at,
            updated_at: prComment.updated_at
        })
    })

    listOfPRComments.map((comment) => {
        if (comment.body!.match(/.*i \s*have \s*read \s*the \s*cla \s*document \s*and \s*i \s*hereby \s*sign \s*the \s*cla.*/) && comment.name !== 'github-actions[bot]') {
            filteredListOfPRComments.push(comment)
        }
    })

    for (var i = 0; i < filteredListOfPRComments.length; i++) {
        delete filteredListOfPRComments[i].body
    }

    // //checking if the reacted committers are not the signed committers(not in the storage file) and filtering only the unsigned committers
    commentedCommitterMap.newSigned = filteredListOfPRComments.filter(commentedCommitter => committerMap.notSigned!.some(notSignedCommitter => commentedCommitter.id === notSignedCommitter.id))

    console.log("the new commented committers(signed) are :" + JSON.stringify(commentedCommitterMap, null, 3))

    //checking if the commented users are only the contributors who has committed in the same PR (This is needed for the PR Comment and changing the status to success when all the contributors has reacted to the PR)
    commentedCommitterMap.onlyCommitters = committers.filter(committer => filteredListOfPRComments.some(commentedCommitter => committer.id == commentedCommitter.id))

    console.log("the reacted signed committers comments are " + JSON.stringify(commentedCommitterMap.onlyCommitters, null, 3))


    return commentedCommitterMap

}