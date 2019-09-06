import * as core from '@actions/core'
import * as github from '@actions/github'
const io = require('@actions/io')
import octokit from './octokit'
import getCommitters from './graphql'
import { getclas } from './cla'


async function run() {
  try {
    core.debug('CLA Assistant GitHub Action is running')
    const myInput = core.getInput('myInput')
    // This should be a token with access to your repository scoped in as a secret.
    //const myToken = core.getInput('myToken')

    // const committers = await getCommitters()
    // console.debug(committers)
    // const args2 = {
    //   owner: github.context.repo.owner,
    //   repo: github.context.repo.repo,
    //   path: 'cla.json',
    //   ref: 'master'
    // }

    // let result, content
    // try {
    //   result = await octokit.repos.getContents(args2)
    //   //console.log(result)
    //   content = Buffer.from(result.data.content, 'base64').toString()
    //   // console.log(JSON.parse(content))
    // } catch (e) {
    //   throw new Error("error reading contributor file: " + e)
    // }

    const clas = await getclas()
    clas.contributors.forEach(element => {
      console.log(element.name + "id is " + element.id)
    })

    // let testJSON = {
    //   name: "akshay",
    //   id: 2344
    // }
    // let updateFile, contentBinary
    // let contentString = JSON.stringify(testJSON)
    // contentBinary = Buffer.from(contentString).toString('base64')
    // const args3 = {
    //   owner: github.context.repo.owner,
    //   repo: github.context.repo.repo,
    //   path: 'cla.json',
    //   ref: 'master',
    //   sha: result.data.sha,
    //   message: 'test commit',
    //   content: contentBinary
    // }

    // try {
    //   updateFile = await octokit.repos.createOrUpdateFile(args3)
    // } catch (e) {
    //   throw new Error("error updating  contributor file: " + e)
    // }
  } catch (error) {
    core.setFailed(error.message);
  }

}

run();




    // let pathToCla = './cla.json'
    // let file
    // try {
    //   file = fs.readFileSync(pathToCla, 'utf8');
    // } catch (err) {
    //   throw new Error("CLA file not found.");
    // }