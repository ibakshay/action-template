import * as core from '@actions/core'


export function pathToCLADocument() {
    const pathToCLADocument = core.getInput('pathToCLADocument')
    console.log(pathToCLADocument)
    return pathToCLADocument
}