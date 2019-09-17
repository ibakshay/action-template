import * as core from '@actions/core'


export function pathToCLADocument() {
    const pathToCLADocument = core.getInput('pathToCLADocument')
    return pathToCLADocument
}