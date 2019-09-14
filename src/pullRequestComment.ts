import octokit from './octokit'
import * as core from '@actions/core'
import { context } from '@actions/github'

async function getComment() {
    try {
        const response = await octokit.issues.listComments({
            owner: context.repo.owner,
            repo: context.repo.repo,
            issue_number: context.issue.number
        })

        return response.data.find(comment => comment.body.match(/.*CLA Assistant Lite.*/))
    } catch (e) {
        core.setFailed('Error occured when getting  all the comments of the pull request: ' + e.message)
    }

}

function commentContent(signed: boolean) {
    if (signed) {
        return `**CLA Assistant Lite** All committers have signed the CLA.`
    }
    return `**CLA Assistant Lite:** Thank you for your submission, we really appreciate it. Like many open source projects, we ask that you sign our Contributor License Agreement before we can accept your contribution. You can respond with  :+1:  to this comment for signing the CLA`

}


export default async function prComment(signed: boolean) {
    try {
        const prComment = await getComment()
        const body = commentContent(signed)
        if (!signed && !prComment) {
            return octokit.issues.createComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: context.issue.number,
                body: body
            })
        }

    } catch (e) {
        core.setFailed('Error occured when creating or editing the comments of the pull request: ' + e.message)
    }

}
