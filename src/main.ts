import * as core from '@actions/core'
import { context } from '@actions/github'
const io = require('@actions/io')
import octokit from './octokit'
import getCommitters from './graphql'
import { getclas } from './cla'


async function run() {
  try {
    console.log('CLA Assistant GitHub Action is running')
    const myInput = core.getInput('myInput')

    const clas = await getclas()


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