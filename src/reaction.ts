import octokit from './octokit'
import _ from 'lodash'
import * as core from '@actions/core';
import { context } from '@actions/github'
import { CommitterMap, CommittersDetails, ReactedCommitterMap, ReactedCommitterMap2 } from './interfaces'

// function update(array1, array2) {
//     var findPerson = id => array2.find(person => person.id === id);

//     array1.forEach(person => {
//       var person2 = findPerson(person.id));
//       var {eyeColour} = person2;
//       Object.assign(person, {eyeColour});
//     });
//   }

function testFoo(reactedCommitters, committerMap) {
    var akshay = id => committerMap.find(notSignedCommitter => id === notSignedCommitter.id)
    reactedCommitters.forEach(reactedCommitter => {
        var becky = akshay(reactedCommitter.id)
        var { pullRequestNo } = becky
        Object.assign(reactedCommitter, { pullRequestNo })
    })
    return reactedCommitters
}


export default async function reaction(commentId, committerMap: CommitterMap, committers) {
    console.log("In Reaction file")
    let reactedCommitterMap = {} as ReactedCommitterMap
    let bufferCommitters = [] as CommittersDetails[]
    const response = await octokit.reactions.listForIssueComment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        comment_id: commentId
    })
    let reactedCommitters = [] as CommittersDetails[]
    response.data.map((reactedCommitter) => {
        reactedCommitters.push({
            name: reactedCommitter.user.login,
            id: reactedCommitter.user.id,
            createdAt: reactedCommitter.created_at
        })
    })

    // checking if the reacted committers are not the signed committers(not in the storage file) and filtering only the unsigned committers

    // function addPullRequestNo(reactedCommitter, notSignedCommitter) {
    //     if (reactedCommitter.id === notSignedCommitter.id) {
    //         reactedCommitter = {
    //             ...reactedCommitter,
    //             pullRequestNo: notSignedCommitter.pullRequestNo

    //         }
    //         console.log("tictic" + JSON.stringify(reactedCommitter))
    //     }
    //     console.log("blabla" + JSON.stringify(reactedCommitter))
    //     return reactedCommitter

    bufferCommitters = _.merge(reactedCommitters, _.map(committerMap.notSigned, function (obj) {
        return _.pick(obj, 'id', 'pullRequestNo')
    }))
    console.log("the sdadasdas  reacted Committers are " + JSON.stringify(bufferCommitters, null, 2))

    // }

    // reactedCommitterMap.newSigned = committerMap.notSigned!.filter(notSignedCommitter => reactedCommitters.filter(reactedCommitter => addPullRequestNo(reactedCommitter, notSignedCommitter)))
    //reactedCommitterMap.newSigned = reactedCommitters.filter(reactedCommitter => committerMap.notSigned!.filter(notSignedCommitter => addPullRequestNo(reactedCommitter, notSignedCommitter)))
    reactedCommitterMap.newSigned = committerMap.notSigned!.filter(committer => bufferCommitters.some(cla => committer.id === cla.id))
    console.log("the first  reacted Committers are " + JSON.stringify(reactedCommitterMap.newSigned, null, 2))
    //testFoo(reactedCommitters, bufferCommitter)
    // var result = _.merge( arr1, _.map( arr2, function( obj ) {
    //     return _.pick( obj, 'id', 'eyeColour' );
    // }));



    //checking if the reacted users are only the contributors who has committed in the same PR (This is needed for the PR Comment and changing the status to success when all the contributors has reacted to the PR)
    reactedCommitterMap.onlyCommitters = committers.filter(committer => reactedCommitters.some(reactedCommitter => committer.id == reactedCommitter.id))
    console.log("the second reacted Committers are " + JSON.stringify(reactedCommitterMap, null, 2))
    return reactedCommitterMap

}