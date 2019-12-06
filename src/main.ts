import * as core from '@actions/core'
import { context } from '@actions/github'
const io = require('@actions/io')
import octokit from './octokit'
import getCommitters from './graphql'
import { getclas } from './checkcla'
import { lockPullRequest } from './pullRequestLock'
import { GitHub } from '@actions/github'



async function run() {
  try {
    //const lock = core.getInput('lock')
    const pullRequestNo: number = context.issue.number
    core.debug('context payload is ' + JSON.stringify(context, null, 2))
    core.debug('CLA Assistant GitHub Action has started')
    core.debug('the PR No is ' + JSON.stringify(pullRequestNo))
    if (context.payload.action === 'closed') {
      return lockPullRequest(pullRequestNo)
    }
    else {
      await getclas(pullRequestNo)
      // const rateLimit = await octokit.rateLimit.get()
      // console.log(JSON.stringify(rateLimit.data.resources, null, 4))
    }

  } catch (error) {
    core.setFailed(error.message)
  }

}
run()