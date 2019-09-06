"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const octokit_1 = __importDefault(require("./octokit"));
const github_1 = require("@actions/github");
let committers;
function getCommitters() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let response = yield octokit_1.default.graphql(`
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
                owner: github_1.context.repo.owner,
                name: github_1.context.repo.repo,
                number: github_1.context.issue.number,
                cursor: ''
            });
            response.repository.pullRequest.commits.edges.forEach(edge => {
                let committer = extractUserFromCommit(edge.node.commit);
                let user = {
                    name: committer.login || committer.name,
                    id: committer.databaseId || ''
                };
                if (committers.length === 0 || committers.map((c) => {
                    return c.name;
                }).indexOf(user.name) < 0) {
                    committers.push(user);
                }
            });
        }
        catch (e) {
            console.log('graphql call to get the committers details failed:' + e);
        }
    });
}
exports.default = getCommitters;
const extractUserFromCommit = (commit) => commit.author.user || commit.committer.user || commit.author || commit.committer;
