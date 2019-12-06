export interface CommitterMap {
    signed?: CommittersDetails[],
    notSigned?: CommittersDetails[],
    unknown?: CommittersDetails[]
}

export interface ReactedCommitterMap {
    newSigned: CommittersDetails[],
    onlyCommitters?: CommittersDetails[],
    allSignedFlag: boolean
}

export interface CommittersDetails {
    name: string,
    id: number,
    pullRequestNo?: number,
    createdAt?: string
}

export interface LabelName {
    current_name: string,
    name: string
}

export interface CommittersCommentDetails {
    name: string,
    id: number,
    comment_id: number,
    body: string,
    created_at: string,
    updated_at: string
}