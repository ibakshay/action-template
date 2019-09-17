import * as core from '@actions/core'


export function pathToCLADocument() {
    const pathToCLADocument = core.getInput('pathToCLADocument')
    console.log('The path to document is ' + JSON.stringify(pathToCLADocument))
    return pathToCLADocument
}