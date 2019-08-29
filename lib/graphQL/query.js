"use strict";
// import { ActivityListFeedsResponseLinksCurrentUserOrganization } from "@octokit/rest"
// export class PRCommitters {
//     private owner: string
//     private repo: string
//     private number: number
//     private cursor: string
//     constructor(owner: string, repo: string, number: number, cursor: string) {
//         this.owner = owner
//         this.repo = repo
//         this.number = number
//         this.cursor = cursor
//     }
//     getPRCommitters(owner: string, repo: string, number: number, cursor: string) {
//         number = typeof number === 'string' ? parseInt(number) : number
//         let query = `
//             query($owner:String! $name:String! $number:Int! $cursor:String!){
//                 repository(owner: $owner, name: $name) {
//                 pullRequest(number: $number) {
//                     commits(first: 100, after: $cursor) {
//                         totalCount
//                         edges {
//                             node {
//                                 commit {
//                                     author {
//                                         email
//                                         name
//                                         user {
//                                             id
//                                             databaseId
//                                             login
//                                         }
//                                     }
//                                     committer {
//                                         name
//                                         user {
//                                             id
//                                             databaseId
//                                             login
//                                         }
//                                     }
//                                 }
//                             }
//                             cursor
//                         }
//                         pageInfo {
//                             endCursor
//                             hasNextPage
//                         }
//                     }
//                 }
//             }
//         }`.replace(/ /g, '')
//         let variables = {
//             owner: owner,
//             name: repo,
//             number: number,
//             cursor: cursor
//         }
//         return JSON.stringify({ query, variables })
//     }
// }
// // module.exports = {
// //     getPRCommitters: (owner, repo, number, cursor) => {
// //         number = typeof number === 'string' ? parseInt(number) : number
// //         let query = `
// //             query($owner:String! $name:String! $number:Int! $cursor:String!){
// //                 repository(owner: $owner, name: $name) {
// //                 pullRequest(number: $number) {
// //                     commits(first: 100, after: $cursor) {
// //                         totalCount
// //                         edges {
// //                             node {
// //                                 commit {
// //                                     author {
// //                                         email
// //                                         name
// //                                         user {
// //                                             id
// //                                             databaseId
// //                                             login
// //                                         }
// //                                     }
// //                                     committer {
// //                                         name
// //                                         user {
// //                                             id
// //                                             databaseId
// //                                             login
// //                                         }
// //                                     }
// //                                 }
// //                             }
// //                             cursor
// //                         }
// //                         pageInfo {
// //                             endCursor
// //                             hasNextPage
// //                         }
// //                     }
// //                 }
// //             }
// //         }`.replace(/ /g, '')
// //         let variables = {
// //             owner: owner,
// //             name: repo,
// //             number: number,
// //             cursor: cursor
// //         }
// //         return JSON.stringify({ query, variables })
// //     }
// // }
