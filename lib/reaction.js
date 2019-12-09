"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const octokit_1 = __importDefault(require("./octokit"));
const github_1 = require("@actions/github");
function reaction(commentId, committerMap, committers) {
    return __awaiter(this, void 0, void 0, function* () {
        let reactedCommitterMap = {};
        let commentedCommitterMap = {};
        let prResponse = yield octokit_1.default.issues.listComments({
            owner: github_1.context.repo.owner,
            repo: github_1.context.repo.repo,
            issue_number: github_1.context.issue.number
        });
        let listOfPRCommentsDetails = [];
        let filteredListOfPRCommentsDetails = [];
        prResponse.data.map((prComment) => {
            listOfPRCommentsDetails.push({
                name: prComment.user.login,
                id: prComment.user.id,
                comment_id: prComment.id,
                body: prComment.body.toLowerCase(),
                created_at: prComment.created_at,
                updated_at: prComment.updated_at
            });
        });
        listOfPRCommentsDetails.map((comment) => {
            if (comment.body.match(/.*i \s*have \s*read \s*the \s*cla \s*document \s*and \s*i \s*hereby \s*sign \s*the \s*cla.*/) && comment.name !== 'github-actions[bot]') {
                filteredListOfPRCommentsDetails.push(comment);
            }
        });
        for (var i = 0; i < filteredListOfPRCommentsDetails.length; i++) {
            delete filteredListOfPRCommentsDetails[i].body;
        }
        // //checking if the reacted committers are not the signed committers(not in the storage file) and filtering only the unsigned committers
        commentedCommitterMap.newSigned = filteredListOfPRCommentsDetails.filter(commentedCommitter => committerMap.notSigned.some(notSignedCommitter => commentedCommitter.id === notSignedCommitter.id));
        console.log("the new commented committers(signed) are :" + JSON.stringify(commentedCommitterMap, null, 3));
        //checking if the commented users are only the contributors who has committed in the same PR (This is needed for the PR Comment and changing the status to success when all the contributors has reacted to the PR)
        commentedCommitterMap.onlyCommitters = committers.filter(committer => filteredListOfPRCommentsDetails.some(commentedCommitter => committer.id == commentedCommitter.id));
        console.log("the list of PR contributor's comments are " + JSON.stringify(filteredListOfPRCommentsDetails, null, 3));
        // const response = await octokit.reactions.listForIssueComment({
        //     owner: context.repo.owner,
        //     repo: context.repo.repo,
        //     comment_id: commentId
        // })
        // let reactedCommitters = [] as CommittersDetails[]
        // response.data.map((reactedCommitter) => {
        //     reactedCommitters.push({
        //         name: reactedCommitter.user.login,
        //         id: reactedCommitter.user.id,
        //         created_at: reactedCommitter.created_at
        //     })
        // })
        // // //checking if the reacted committers are not the signed committers(not in the storage file) and filtering only the unsigned committers
        // reactedCommitterMap.newSigned = reactedCommitters.filter(reactedCommitter => committerMap.notSigned!.some(notSignedCommitter => reactedCommitter.id === notSignedCommitter.id))
        // //checking if the reacted users are only the contributors who has committed in the same PR (This is needed for the PR Comment and changing the status to success when all the contributors has reacted to the PR)
        // reactedCommitterMap.onlyCommitters = committers.filter(committer => reactedCommitters.some(reactedCommitter => committer.id == reactedCommitter.id))
        return commentedCommitterMap;
    });
}
exports.default = reaction;
