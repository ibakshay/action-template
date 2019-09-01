"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const fs = require('fs');
const io = require('@actions/io');
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const myInput = core.getInput('myInput');
            console.log(`The path to CLA is   ${myInput}`);
            // This should be a token with access to your repository scoped in as a secret.
            const myToken = core.getInput('myToken');
            const octokit = new github.GitHub(myToken);
            // console.log(github.context.payload.pull_request!.head)
            const args1 = {
                owner: github.context.repo.owner,
                repo: github.context.repo.repo,
                issue_number: github.context.issue.number
            };
            let committers = [];
            const extractUserFromCommit = (commit) => commit.author.user || commit.committer.user || commit.author || commit.committer;
            let response = yield octokit.graphql(`
    query($owner:String! $name:String! $number:Int! $cursor:String!){
        repository(owner: $owner, name: $name) {
        pullRequest(number: $number) {
            commits(first: 100, after: $cursor) {
                totalCount
                edges {
                    node {
                        commit {
                            author {
                                email
                                name
                                user {
                                    id
                                    databaseId
                                    login
                                }
                            }
                            committer {
                                name
                                user {
                                    id
                                    databaseId
                                    login
                                }
                            }
                        }
                    }
                    cursor
                }
                pageInfo {
                    endCursor
                    hasNextPage
                }
            }
        }
    }
}`.replace(/ /g, ''), {
                owner: args1.owner,
                name: args1.repo,
                number: args1.issue_number,
                cursor: ''
            });
            //  console.log(query)
            response.repository.pullRequest.commits.edges.forEach(edge => {
                let committer = extractUserFromCommit(edge.node.commit);
                let user = {
                    name: committer.login || committer.name,
                    id: committer.databaseId || ''
                };
                try {
                    if (committers.length === 0 || committers.map((c) => {
                        return c.name;
                    }).indexOf(user.name) < 0) {
                        committers.push(user);
                    }
                }
                catch (e) {
                    throw new Error(e);
                }
            });
            console.log(committers);
            /* Graphql end for getting committers */
            const args2 = {
                owner: github.context.repo.owner,
                repo: github.context.repo.repo,
                path: 'cla.json',
                ref: 'master'
            };
            let signedContributors;
            try {
                signedContributors = yield octokit.repos.getContents(args2).then(({ data }) => {
                    data.content;
                });
            }
            catch (e) {
                throw new Error("error reading contributor file: " + e);
            }
            // let pathToCla = './cla.json'
            // let file
            // try {
            //   file = fs.readFileSync(pathToCla, 'utf8');
            // } catch (err) {
            //   throw new Error("CLA file not found.");
            // }
            console.log("The contributors are :" + JSON.stringify(signedContributors));
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
run();
