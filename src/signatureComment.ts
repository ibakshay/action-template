import octokit from './octokit'
import { context } from '@actions/github'
import { CommitterMap, CommittersDetails, CommentedCommitterMap } from './interfaces'
const fetch = require("node-fetch");
import * as core from '@actions/core'

async function webhookSmartContract(newSignedCommitters: CommittersDetails[]) {

    try {
        const config = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newSignedCommitters)
        }
        const response = await fetch('https://smee.io/U0QcVDf68Leo2HEp', config)
        //const response = await res.json()
        console.log("the response of the webhook is " + response)
        if (response.success) {
            //return json
            return response
        }
    } catch (error) {
        core.setFailed('The webhook post request for storing signatures in smart contract failed' + error)
    }


}
export default async function signatureWithPRComment(commentId, committerMap: CommitterMap, committers) {
    let repoId = context.payload.repository
    console.log("the repository is " + JSON.stringify(repoId, null, 2))
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

    console.log("the new commented committers(signed) are :" + JSON.stringify(commentedCommitterMap.newSigned, null, 3))
    await webhookSmartContract(commentedCommitterMap.newSigned)


    //checking if the commented users are only the contributors who has committed in the same PR (This is needed for the PR Comment and changing the status to success when all the contributors has reacted to the PR)
    commentedCommitterMap.onlyCommitters = committers.filter(committer => filteredListOfPRComments.some(commentedCommitter => committer.id == commentedCommitter.id))

    console.log("the reacted signed committers comments are " + JSON.stringify(commentedCommitterMap.onlyCommitters, null, 3))


    return commentedCommitterMap

}