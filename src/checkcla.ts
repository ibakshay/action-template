import getCommitters from './graphql'
import octokit from './octokit'
import * as core from '@actions/core'
import { context } from '@actions/github'
import prComment from './pullRequestComment'
import _ from 'lodash'
import { cpus } from 'os'

interface CommittersDetails {
    name: string,
    id: number,
    pullRequestNo: number
}
// userMap 
interface CommitterMap {
    signed?: CommittersDetails[],
    notSigned?: CommittersDetails[],
    unknown?: CommittersDetails[]
}
let committerMap: CommitterMap = {}

function prepareCommiterMap(committers: CommittersDetails[], clas): CommitterMap {
    committerMap.notSigned = committers.filter(committer => !clas.signedContributors.some(cla => committer.id === cla.id))
    committerMap.signed = committers.filter(committer => clas.signedContributors.some(cla => committer.id === cla.id))
    committers.map((committer) => { if (!committer.id) { committerMap.unknown!.push(committer) } })
    return committerMap

}
function checkCommittersCLA(committers: CommittersDetails[], clas: CommittersDetails[]): CommittersDetails[] {
    const unsignedContributors = _.differenceBy(committers, clas, 'id')
    const signedContributors = committers.filter(signedCommitter => clas.some(cla => signedCommitter.id === cla.id))
    console.log("signed committers are :" + JSON.stringify(signedContributors))
    return unsignedContributors
}
export async function getclas() {

    let signed: boolean = false
    //getting the path of the cla from the user
    const pathToClaSignatures = core.getInput('pathtoclasignatures')
    if (!pathToClaSignatures || pathToClaSignatures == '') {
        core.setFailed('Path to CLA file is not specified')  // keep default path
    }
    const branch = core.getInput('branch')
    let result, clas
    const committers = await getCommitters() as CommittersDetails[]
    try {
        result = await octokit.repos.getContents({
            owner: context.repo.owner,
            repo: context.repo.repo,
            path: pathToClaSignatures,
            ref: branch
        })

    } catch (error) {
        if (error.status === 404) {
            committerMap.notSigned = committers
            committerMap.signed = []
            committerMap.unknown = []
            prComment(signed, committerMap)
            const initialContent = { signedContributors: [] }
            const initalContentString = JSON.stringify(initialContent, null, 2)
            const initalContentBinary = Buffer.from(initalContentString).toString('base64')
            const response = await octokit.repos.createOrUpdateFile({
                owner: context.repo.owner,
                repo: context.repo.repo,
                path: pathToClaSignatures,
                message: 'creating signed Contributors file',
                content: initalContentBinary,
                branch: branch
            })
            if (response) {
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
    await prComment(signed, committerMap)
    clas.signedContributors.push(...committerMap.notSigned)
    let contentString = JSON.stringify(clas, null, 2)
    let contentBinary = Buffer.from(contentString).toString('base64')
    try {
        await octokit.repos.createOrUpdateFile({
            owner: context.repo.owner,
            repo: context.repo.repo,
            path: pathToClaSignatures,
            sha: result.data.sha,
            message: 'test commit',
            content: contentBinary,
            branch: branch
        })

    }

    catch (err) {
        core.setFailed(err.message)
        throw new Error("error will updating the JSON file" + err)
    }
    return clas


}
