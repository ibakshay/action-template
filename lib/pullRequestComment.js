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
const url_1 = require("./url");
function addLabel() {
    return octokit_1.default.issues.addLabels({
        owner: github_1.context.repo.owner,
        repo: github_1.context.repo.repo,
        issue_number: github_1.context.issue.number,
        labels: ['CLA Not Signed :worried:']
    });
}
function updateLabel(signed, labelName) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const getLabel = yield octokit_1.default.issues.getLabel({
                owner: github_1.context.repo.owner,
                repo: github_1.context.repo.repo,
                name: labelName.current_name
            });
            if (getLabel) {
                return;
            }
        }
        catch (error) {
            if (error.status === 404) {
                if (signed) {
                    labelName = {
                        current_name: 'CLA Not Signed :worried:',
                        name: 'CLA signed :smiley:'
                    };
                }
                else {
                    labelName = {
                        current_name: 'CLA signed :smiley:',
                        name: 'CLA Not Signed :worried:'
                    };
                }
                return octokit_1.default.issues.updateLabel({
                    owner: github_1.context.repo.owner,
                    repo: github_1.context.repo.repo,
                    current_name: labelName.current_name,
                    name: labelName.name
                });
            }
            core.setFailed("error when creating a label :" + error);
        }
    });
}
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
function commentContent(signed, committerMap) {
    const labelName = {};
    if (signed) {
        labelName.current_name = 'CLA signed :smiley:';
        //updateLabel(signed, labelName)
        return `**CLA Assistant Lite** All committers have signed the CLA.`;
    }
    /* TODO: Unhandled Promise Rejection  */
    labelName.current_name = 'CLA Not Signed :worried:';
    //updateLabel(signed, labelName)
    let committersCount = 1;
    if (committerMap && committerMap.signed && committerMap.notSigned) {
        committersCount = committerMap.signed.length + committerMap.notSigned.length;
    }
    let you = (committersCount > 1 ? 'you all' : 'you');
    let text = `**CLA Assistant Lite:** <br/>Thank you for your submission, we really appreciate it. Like many open source projects, we ask that ${you} sign our [Contributor License Agreement](${url_1.pathToCLADocument()}) before we can accept your contribution. You can sign the CLA by reacting to this comment with :+1: <br/>`;
    if (committersCount > 1 && committerMap && committerMap.signed && committerMap.notSigned) {
        text += `**${committerMap.signed.length}** out of **${committerMap.signed.length + committerMap.notSigned.length}** committers have signed the CLA. <br/>`;
        committerMap.signed.forEach((signedCommitter) => {
            text += `<br/>:white_check_mark: @${signedCommitter.name}`;
        });
        committerMap.notSigned.forEach((unsignedCommitter) => {
            text += `<br/>:x: @${unsignedCommitter.name}`;
        });
        text += '<br/>';
    }
    if (committerMap && committerMap.unknown && committerMap.unknown.length > 0) {
        let seem = (committerMap.unknown.length > 1 ? 'seem' : 'seems');
        text += `<hr/>**${committerMap.unknown.join(', ')}** ${seem} not to be a GitHub user.`;
        text += ' You need a GitHub account to be able to sign the CLA. If you have already a GitHub account, please [add the email address used for this commit to your account](https://help.github.com/articles/why-are-my-commits-linked-to-the-wrong-user/#commits-are-not-linked-to-any-user).<br/>';
    }
    return text;
}
function prComment(signed, committerMap, committers) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const prComment = yield getComment();
            const commentId = prComment.id;
            const response = yield octokit_1.default.reactions.listForIssueComment({
                owner: github_1.context.repo.owner,
                repo: github_1.context.repo.repo,
                comment_id: commentId
            });
            console.log("response is " + response);
            let reactedCommitters = [];
            response.data.map((reactedCommitter) => {
                reactedCommitters.push({
                    name: reactedCommitter.user.login,
                    id: reactedCommitter.user.id
                });
            });
            //Check if the reactions are not in the storage file 
            reactedCommitters = committerMap.notSigned.filter(committer => reactedCommitters.some(cla => committer.id === cla.id));
            console.log("the reacted users are: " + JSON.stringify(reactedCommitters));
            console.log(`The comment response is ${JSON.stringify(prComment)}  and the comment id is ${commentId}`);
            const body = commentContent(signed, committerMap);
            if (!prComment) {
                // addLabel()
                return octokit_1.default.issues.createComment({
                    owner: github_1.context.repo.owner,
                    repo: github_1.context.repo.repo,
                    issue_number: github_1.context.issue.number,
                    body: body
                });
            }
            else if (prComment && prComment.id) {
                return octokit_1.default.issues.updateComment({
                    owner: github_1.context.repo.owner,
                    repo: github_1.context.repo.repo,
                    comment_id: prComment.id,
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
