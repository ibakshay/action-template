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
        const response = yield octokit_1.default.reactions.listForIssueComment({
            owner: github_1.context.repo.owner,
            repo: github_1.context.repo.repo,
            comment_id: commentId
        });
        let reactedCommitters = [];
        response.data.map((reactedCommitter) => {
            reactedCommitters.push({
                name: reactedCommitter.user.login,
                id: reactedCommitter.user.id,
                createdAt: reactedCommitter.created_at
            });
        });
        //checking if the reacted committers are not the signed committers(not in the storage file) and filtering only the unsigned committers
        reactedCommitterMap.newSigned = committerMap.notSigned.filter(committer => reactedCommitters.some(cla => committer.id === cla.id));
        //checking if the reacted users are only the contributors who has committed in the same PR (This is needed for the PR Comment and changing the status to success when all the contributors has reacted to the PR)
        reactedCommitterMap.onlyCommitters = committers.filter(committer => reactedCommitters.some(reactedCommitter => committer.id == reactedCommitter.id));
        console.log('reacted committers map is ' + JSON.stringify(reactedCommitterMap));
        return reactedCommitterMap;
    });
}
exports.default = reaction;
