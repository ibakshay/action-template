import getCommitters from './graphql'
import octokit from './octokit'
import * as core from '@actions/core'
import { context } from '@actions/github'
import prComment from './pullRequestComment'

export async function getclas() {
    let signed = false
    console.log('hello from cla')
    //getting the path of the cla from the user
    const pathToClaSignatures = core.getInput('pathtoclasignatures')
    if (!pathToClaSignatures || pathToClaSignatures == '') {
        core.setFailed('Path to CLA file is not specified')  // keep default path
    }
    const branch = core.getInput('branch')
    let result, clas
    const committers = await getCommitters()
    console.log(committers)
    try {
        result = await octokit.repos.getContents({
            owner: context.repo.owner,
            repo: context.repo.repo,
            path: pathToClaSignatures,
            ref: branch
        })

    } catch (error) {
        if (error.status === 404) {
            prComment(signed)
            const initialContent = { contributorsSignedCLA: [] }
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
    console.log("stringy: --->" + clas)
    clas = JSON.parse(clas)

    clas.contributorsSignedCLA.push({ "name": "Vandana", "id": 12345 })
    clas.contributorsSignedCLA.forEach(element => {
        console.log(element.name + "id is " + element.id)
    })
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


    } catch (err) {
        core.setFailed(err.message)
        throw new Error("error will updating the JSON file" + err)
    }
    return clas


}
