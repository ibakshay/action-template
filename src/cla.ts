import getCommitters from './graphql'
import octokit from './octokit'
import * as core from '@actions/core'
import { context } from '@actions/github'


export async function getclas() {
    console.log('hello from cla')
    //getting the path of the cla from the user
    const pathToCla = core.getInput('pathtocla')
    const branch = core.getInput('branch')
    let result, clas
    try {
        result = await octokit.repos.getContents({
            owner: context.repo.owner,
            repo: context.repo.repo,
            path: pathToCla,
            ref: branch
        })
        clas = Buffer.from(result.data.content, 'base64').toString()
        console.log("stringy: --->" + clas)
        clas = JSON.parse(clas)
        console.log("Object: --->" + clas)
        return clas
    } catch (err) {
        console.log(err)
        core.debug(err.message)

    }


}
