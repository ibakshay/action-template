import getCommitters from './graphql'
import octokit from './octokit'
import * as core from '@actions/core'
import { context } from '@actions/github'
import prComment from './pullRequestComment'
import { CommitterMap, CommittersDetails } from './interfaces'


let committerMap: CommitterMap = {}

function prepareCommiterMap(committers: CommittersDetails[], clas): CommitterMap {
    committerMap.notSigned = committers.filter(committer => !clas.signedContributors.some(cla => committer.id === cla.id))
    committerMap.signed = committers.filter(committer => clas.signedContributors.some(cla => committer.id === cla.id))
    committers.map((committer) => { if (!committer.id) { committerMap.unknown!.push(committer) } })
    return committerMap

}

async function updateFile(pathToClaSignatures, sha, contentBinary, branch) {
    /* TODO: add dynamic  Message content  */
    await octokit.repos.createOrUpdateFile({
        owner: context.repo.owner,
        repo: context.repo.repo,
        path: pathToClaSignatures,
        sha: sha,
        message: 'test commit',
        content: contentBinary,
        branch: branch
    })
}

async function createFile(pathToClaSignatures, contentBinary, branch): Promise<object> {
    /* TODO: add dynamic  Message content  */
    let response = await octokit.repos.createOrUpdateFile({
        owner: context.repo.owner,
        repo: context.repo.repo,
        path: pathToClaSignatures,
        message: 'Creating file for storing CLA Signatures',
        content: contentBinary,
        branch: branch
    })
    return response


}
export async function getclas() {

    let signed: boolean = false
    //getting the path of the cla from the user
    const pathToClaSignatures = core.getInput('pathtoclasignatures')
    if (!pathToClaSignatures || pathToClaSignatures == '') {
        core.setFailed('Path to CLA file is not specified')  // keep default path
    }
    const branch = core.getInput('branch')
    let result, clas, sha
    const committers = await getCommitters() as CommittersDetails[]
    try {
        result = await octokit.repos.getContents({
            owner: context.repo.owner,
            repo: context.repo.repo,
            path: pathToClaSignatures,
            ref: branch
        })
        sha = result.data.sha

    } catch (error) {
        if (error.status === 404) {
            committerMap.notSigned = committers
            committerMap.signed = []
            committers.map((committer) => { if (!committer.id) { committerMap.unknown!.push(committer) } })

            const initialContent = { signedContributors: [] }
            const initalContentString = JSON.stringify(initialContent, null, 2)
            const initalContentBinary = Buffer.from(initalContentString).toString('base64')
            const promise = Promise.all([createFile(pathToClaSignatures, initalContentBinary, branch), prComment(signed, committerMap, committers)])
            if (promise) {
                core.setFailed(`committers of pull request ${context.issue.number}  has to sign the CLA`)
                return
            }
            core.setFailed('error occured when creating the signed contributors file ' + error)

        }
        else {
            core.setFailed(error.message)
        }

    }
    clas = Buffer.from(result.data.content, 'base64').toString()
    clas = JSON.parse(clas)
    committerMap.notSigned = committers.filter(committer => !clas.signedContributors.some(cla => committer.id === cla.id))
    committerMap.signed = committers.filter(committer => clas.signedContributors.some(cla => committer.id === cla.id))
    committers.map((committer) => { if (!committer.id) { committerMap.unknown!.push(committer) } })
    console.log('unsigned contributors are: ' + JSON.stringify(committerMap.notSigned))
    console.log('signed contributors are: ' + JSON.stringify(committerMap.signed))
    if (committerMap.notSigned.length === 0) {
        signed = true
    }
    try {

        /* Parallel GitHub Api call for updating both the prComment and the Signature File and then wait for both the promises to be resolved */
        const prCommentResponse: CommittersDetails[] = await prComment(signed, committerMap, committers) as CommittersDetails[]
        console.log("prCommentResponse is ------> " + JSON.stringify(prCommentResponse))
        /* pushing the unsigned contributors to the CLA Json File */
        clas.signedContributors.push(...prCommentResponse)
        let contentString = JSON.stringify(clas, null, 2)
        let contentBinary = Buffer.from(contentString).toString('base64')
        //Promise.all([prComment(signed, committerMap, committers), updateFile(pathToClaSignatures, sha, contentBinary, branch)])
        await updateFile(pathToClaSignatures, sha, contentBinary, branch)
        /* return when there are no unsigned committers */
        if ((committerMap.notSigned === undefined || committerMap.notSigned.length === 0) || prCommentResponse) {
            console.log("Passed")
            return
        }
        else {
            core.setFailed(`committers of ${context.issue.number}  has to sign the CLA`)
        }
    }

    catch (err) {
        core.setFailed(err.message)
        throw new Error("error will updating the JSON file" + err)
    }
    return clas


}