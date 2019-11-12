export interface CommitterMap {
    signed?: CommittersDetails[],
    notSigned?: CommittersDetails[],
    unknown?: CommittersDetails[]
}

export interface ReactedCommitterMap {
    newSigned?: CommittersDetails[],
    onlyCommitters?: CommittersDetails[]
}

export interface CommittersDetails {
    name: string,
    id: number,
    pullRequestNo?: number
}

export interface LabelName {
    current_name: string,
    name: string
}