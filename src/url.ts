import * as core from '@actions/core'


export function pathToCLADocument() {
    const pathToCLADocument = core.getInput('pathToCLADocument')
    console.log('The path to document is ' + pathToCLADocument)
    return pathToCLADocument
}