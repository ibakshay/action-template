import getCommitters from './graphql'
import octokit from './octokit'
import * as core from '@actions/core'
import { context } from '@actions/github'
import prComment from './pullRequestComment'
import { CommitterMap, CommittersDetails, ReactedCommitterMap } from './interfaces'




function prepareCommiterMap(committers: CommittersDetails[], clas): CommitterMap {
    let committerMap: CommitterMap = {}
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
        message: '**CLA ASSISTANT ACTION** Creating file for storing CLA Signatures',
        content: contentBinary,
        branch: branch
    })
    return response


}
export async function getclas() {
    let committerMap = {} as CommitterMap

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
    committerMap = prepareCommiterMap(committers, clas) as CommitterMap
    console.log('unsigned contributors are: ' + JSON.stringify(committerMap.notSigned, null, 2))
    console.log('signed contributors are: ' + JSON.stringify(committerMap.signed, null, 2))
    if (committerMap.notSigned!.length === 0) {
        console.log("null check")
        signed = true
    }
    try {
        const reactedCommitters: ReactedCommitterMap = await prComment(signed, committerMap, committers) as ReactedCommitterMap
        /* pushing the unsigned contributors to the CLA Json File */
        if (signed) { return }
        if (reactedCommitters.newSigned) {
            clas.signedContributors.push(...reactedCommitters.newSigned)
            let contentString = JSON.stringify(clas, null, 2)
            let contentBinary = Buffer.from(contentString).toString('base64')
            //TODO: dont update the file if the committer DATA is already in the file

            //Promise.all([prComment(signed, committerMap, committers), updateFile(pathToClaSignatures, sha, contentBinary, branch)])
            await updateFile(pathToClaSignatures, sha, contentBinary, branch)

        }

        /* return when there are no unsigned committers */
        if ((committerMap.notSigned === undefined || committerMap.notSigned.length === 0) || reactedCommitters.allSignedFlag) {
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