import octokit from './octokit'
import * as core from '@actions/core'
import { context } from '@actions/github'
import { pathToCLADocument } from './url'

interface CommittersDetails {
    name: string,
    id: number,
    pullRequestNo: number
}

interface CommitterMap {
    signed?: CommittersDetails[],
    notSigned?: CommittersDetails[],
    unknown?: CommittersDetails[]
}

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

function commentContent(signed: boolean, committerMap?: CommitterMap) {
    if (signed) {
        return `**CLA Assistant Lite** All committers have signed the CLA.`
    }
    console.log("I am from prComment and path to cla is :" + pathToCLADocument)

    let committersCount = 1
    if (committerMap && committerMap.signed && committerMap.notSigned) {
        committersCount = committerMap.signed.length + committerMap.notSigned.length
    }
    let you = (committersCount > 1 ? 'you all' : 'you')
    let text = `**CLA Assistant Lite:** <br/>Thank you for your submission, we really appreciate it. Like many open source projects, we ask that ${you} sign our [Contributor License Agreement](${pathToCLADocument}) before we can accept your contribution.<br/>`
    if (committersCount > 1 && committerMap && committerMap.signed && committerMap.notSigned) {
        text += `** ${committerMap.signed.length} ** out of ** ${committerMap.signed.length + committerMap.notSigned.length} ** committers have signed the CLA. <br/>`
        committerMap.signed.forEach((signedCommitter) => {
            text += `<br/>:white_check_mark: ${signedCommitter.name}`
        })
        committerMap.notSigned.forEach((unsignedCommitter) => {
            text += `<br/>:x: ${unsignedCommitter.name}`
        })
        text += '<br/>'
    }
    if (committerMap && committerMap.unknown && committerMap.unknown.length > 0) {
        let seem = (committerMap.unknown.length > 1 ? 'seem' : 'seems')
        text += `<hr/>**${committerMap.unknown.join(', ')}** ${seem} not to be a GitHub user.`
        text += ' You need a GitHub account to be able to sign the CLA. If you have already a GitHub account, please [add the email address used for this commit to your account](https://help.github.com/articles/why-are-my-commits-linked-to-the-wrong-user/#commits-are-not-linked-to-any-user).<br/>'

    }

    return text

}


export default async function prComment(signed: boolean, committerMap?: CommitterMap) {
    try {
        console.log(JSON.stringify(committerMap))
        const prComment = await getComment()
        const body = commentContent(signed, committerMap)
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
