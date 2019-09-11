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
    //core.setFailed('Testing build failure')

    const clas = await getclas()

  } catch (error) {
    core.setFailed(error.message)
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