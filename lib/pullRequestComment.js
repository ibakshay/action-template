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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const octokit_1 = __importDefault(require("./octokit"));
const core = __importStar(require("@actions/core"));
const github_1 = require("@actions/github");
function getComment() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield octokit_1.default.issues.listComments({
                owner: github_1.context.repo.owner,
                repo: github_1.context.repo.repo,
                issue_number: github_1.context.issue.number
            });
            return response.data.find(comment => comment.body.match(/.*CLA Assistant Lite.*/));
        }
        catch (e) {
            core.setFailed('Error occured when getting  all the comments of the pull request: ' + e.message);
        }
    });
}
function commentContent(signed) {
    if (signed) {
        return `**CLA Assistant Lite** All committers have signed the CLA.`;
    }
    return `**CLA Assistant Lite:** Thank you for your submission, we really appreciate it. Like many open source projects, we ask that you sign our Contributor License Agreement before we can accept your contribution. You can respond with  :+1:  to this comment for signing the CLA`;
}
function prComment(signed, commiterMap) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log(JSON.stringify(commiterMap));
            const prComment = yield getComment();
            const body = commentContent(signed);
            if (!signed && !prComment) {
                return octokit_1.default.issues.createComment({
                    owner: github_1.context.repo.owner,
                    repo: github_1.context.repo.repo,
                    issue_number: github_1.context.issue.number,
                    body: body
                });
            }
        }
        catch (e) {
            core.setFailed('Error occured when creating or editing the comments of the pull request: ' + e.message);
        }
    });
}
exports.default = prComment;
