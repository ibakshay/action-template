import * as core from '@actions/core'
import { context } from '@actions/github'
const io = require('@actions/io')
import octokit from './octokit'
import getCommitters from './graphql'
import { getclas } from './checkcla'


async function run() {
  try {
    console.log('CLA Assistant GitHub Action is running')
    const myInput = core.getInput('myInput')
    const clas = await getclas()

  } catch (error) {
    core.setFailed(error.message)
  }

}
run()