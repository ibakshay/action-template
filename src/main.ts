import * as core from '@actions/core'
import { context } from '@actions/github'
const io = require('@actions/io')
import octokit from './octokit'
import getCommitters from './graphql'
import { getclas } from './checkcla'
import { GitHub } from '@actions/github'



async function run() {
  try {
    console.log('CLA Assistant GitHub Action is running')
    console.log('the contect is ' + JSON.stringify(context))
    //const myInput = core.getInput('myInput')
    const clas = await getclas()

  } catch (error) {
    core.setFailed(error.message)
  }

}
run()