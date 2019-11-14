import * as core from '@actions/core'
import { context } from '@actions/github'
const io = require('@actions/io')
import octokit from './octokit'
import getCommitters from './graphql'
import { getclas } from './checkcla'
import { GitHub } from '@actions/github'



async function run() {
  try {
    console.log('CLA Assistant GitHub Action has started')
    console.log('the PR No is ' + JSON.stringify(context.issue.number))
    //const myInput = core.getInput('myInput')
    const clas = await getclas()
    // const rateLimit = await octokit.rateLimit.get()
    // console.log(JSON.stringify(rateLimit.data.resources, null, 4))

  } catch (error) {
    core.setFailed(error.message)
  }

}
run()