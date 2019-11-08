import octokit from './octokit'
import * as core from '@actions/core'
import { context } from '@actions/github'
import { pathToCLADocument } from './url'
import { CommitterMap, CommittersDetails, LabelName } from './interfaces'
import { userInfo } from 'os'

function addLabel() {
    return octokit.issues.addLabels({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: context.issue.number,
        labels: ['CLA Not Signed :worried:']
    })
}

async function updateLabel(signed: boolean, labelName: LabelName) {
    try {
        const getLabel = await octokit.issues.getLabel({
            owner: context.repo.owner,
            repo: context.repo.repo,
            name: labelName.current_name
        })
        if (getLabel) {
            return
        }

    } catch (error) {
        if (error.status === 404) {
            if (signed) {
                labelName = {
                    current_name: 'CLA Not Signed :worried:',
                    name: 'CLA signed :smiley:'
                }
            }
            else {
                labelName = {
                    current_name: 'CLA signed :smiley:',
                    name: 'CLA Not Signed :worried:'
                }
            }
            return octokit.issues.updateLabel({
                owner: context.repo.owner,
                repo: context.repo.repo,
                current_name: labelName.current_name,
                name: labelName.name
            })

        }
        core.setFailed("error when creating a label :" + error)

    }


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

function commentContent(signed: boolean, committerMap: CommitterMap) {
    const labelName = {} as LabelName
    if (signed) {
        labelName.current_name = 'CLA signed :smiley:'
        //updateLabel(signed, labelName)
        return `**CLA Assistant Lite** All committers have signed the CLA. :smiley:`
    }
    /* TODO: Unhandled Promise Rejection  */
    labelName.current_name = 'CLA Not Signed :worried:'
    //updateLabel(signed, labelName)
    let committersCount = 1
    if (committerMap && committerMap.signed && committerMap.notSigned) {
        committersCount = committerMap.signed.length + committerMap.notSigned.length
    }
    let you = (committersCount > 1 ? 'you all' : 'you')
    let text = `**CLA Assistant Lite:** <br/>Thank you for your submission, we really appreciate it. Like many open source projects, we ask that ${you} sign our [Contributor License Agreement](${pathToCLADocument()}) before we can accept your contribution. You can sign the CLA by reacting to this comment with :+1: <br/>`
    if (committersCount > 1 && committerMap && committerMap.signed && committerMap.notSigned) {
        text += `**${committerMap.signed.length}** out of **${committerMap.signed.length + committerMap.notSigned.length}** committers have signed the CLA. <br/>`
        committerMap.signed.forEach((signedCommitter) => {
            text += `<br/>:white_check_mark: @${signedCommitter.name}`
        })
        committerMap.notSigned.forEach((unsignedCommitter) => {
            text += `<br/>:x: @${unsignedCommitter.name}`
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

async function reaction(commentId, committerMap: CommitterMap, committers) {
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
    //checking if the reacted committers are not the signed committers(not in the storage file) and filtering out only the unsigned committers
    reactedCommitters = committerMap.notSigned!.filter(committer => reactedCommitters.some(cla => committer.id === cla.id))
    console.log("the reacted users are: " + JSON.stringify(reactedCommitters))
    return reactedCommitters

}


export default async function prComment(signed: boolean, committerMap: CommitterMap, committers) {
    try {

        const prComment = await getComment()
        const body = commentContent(signed, committerMap)
        if (!prComment) {
            return octokit.issues.createComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: context.issue.number,
                body: body
            })
        }
        else if (prComment && prComment.id) {
            if (signed) {
                console.log("HELLOW WORLD")
                return octokit.issues.updateComment({
                    owner: context.repo.owner,
                    repo: context.repo.repo,
                    comment_id: prComment.id,
                    body: body
                })

            }
            const reactedCommitters = await reaction(prComment.id, committerMap, committers)
            //checking if all the unsigned committers have reacted to the PR comment (this is needed for changing the content of the PR comment to "All committers have signed the CLA")
            const reactedCommittersFlag = committers.some(committer => reactedCommitters.some(reactedCommitter => committer.id === reactedCommitter.id))
            console.log("test--------------> and the result is " + reactedCommittersFlag)
            await octokit.issues.updateComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                comment_id: prComment.id,
                body: body
            })

            // const values = await Promise.all([reaction(prComment.id, committerMap, committers), octokit.issues.updateComment({
            //     owner: context.repo.owner,
            //     repo: context.repo.repo,
            //     comment_id: prComment.id,
            //     body: body
            // })])
            //console.log(values[0])
            //const reactedCommitters = values[0]
            return reactedCommitters
        }

    } catch (e) {
        core.setFailed('Error occured when creating or editing the comments of the pull request: ' + e.message)
    }

}
