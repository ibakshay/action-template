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
const graphql_1 = __importDefault(require("./graphql"));
const octokit_1 = __importDefault(require("./octokit"));
const core = __importStar(require("@actions/core"));
const github_1 = require("@actions/github");
const pullRequestComment_1 = __importDefault(require("./pullRequestComment"));
const lodash_1 = __importDefault(require("lodash"));
let committerMap = {};
function prepareCommiterMap(committers, clas) {
    committerMap.notSigned = committers.filter(committer => !clas.signedContributors.some(cla => committer.id === cla.id));
    committerMap.signed = committers.filter(committer => clas.signedContributors.some(cla => committer.id === cla.id));
    committers.map((committer) => { if (!committer.id) {
        committerMap.unknown.push(committer);
    } });
    return committerMap;
}
function checkCommittersCLA(committers, clas) {
    const unsignedContributors = lodash_1.default.differenceBy(committers, clas, 'id');
    const signedContributors = committers.filter(signedCommitter => clas.some(cla => signedCommitter.id === cla.id));
    console.log("signed committers are :" + JSON.stringify(signedContributors));
    return unsignedContributors;
}
function getclas() {
    return __awaiter(this, void 0, void 0, function* () {
        let signed = false;
        //getting the path of the cla from the user
        const pathToClaSignatures = core.getInput('pathtoclasignatures');
        if (!pathToClaSignatures || pathToClaSignatures == '') {
            core.setFailed('Path to CLA file is not specified'); // keep default path
        }
        const branch = core.getInput('branch');
        let result, clas;
        const committers = yield graphql_1.default();
        try {
            result = yield octokit_1.default.repos.getContents({
                owner: github_1.context.repo.owner,
                repo: github_1.context.repo.repo,
                path: pathToClaSignatures,
                ref: branch
            });
        }
        catch (error) {
            if (error.status === 404) {
                committerMap.notSigned = committers;
                committerMap.signed = [];
                committerMap.unknown = [];
                pullRequestComment_1.default(signed, committerMap);
                const initialContent = { signedContributors: [] };
                const initalContentString = JSON.stringify(initialContent, null, 2);
                const initalContentBinary = Buffer.from(initalContentString).toString('base64');
                const response = yield octokit_1.default.repos.createOrUpdateFile({
                    owner: github_1.context.repo.owner,
                    repo: github_1.context.repo.repo,
                    path: pathToClaSignatures,
                    message: 'creating signed Contributors file',
                    content: initalContentBinary,
                    branch: branch
                });
                if (response) {
                    return;
                }
                core.setFailed('error occured when creating the signed contributors file ' + error);
            }
            else {
                core.setFailed(error.message);
            }
        }
        clas = Buffer.from(result.data.content, 'base64').toString();
        clas = JSON.parse(clas);
        committerMap.notSigned = committers.filter(committer => !clas.signedContributors.some(cla => committer.id === cla.id));
        committerMap.signed = committers.filter(committer => clas.signedContributors.some(cla => committer.id === cla.id));
        committers.map((committer) => { if (!committer.id) {
            committerMap.unknown.push(committer);
        } });
        console.log('unsigned contributors are: ' + JSON.stringify(committerMap.notSigned));
        console.log('signed contributors are: ' + JSON.stringify(committerMap.signed));
        if (committerMap.notSigned.length === 0) {
            signed = true;
        }
        yield pullRequestComment_1.default(signed, committerMap);
        clas.signedContributors.push(...committerMap.notSigned);
        let contentString = JSON.stringify(clas, null, 2);
        let contentBinary = Buffer.from(contentString).toString('base64');
        try {
            yield octokit_1.default.repos.createOrUpdateFile({
                owner: github_1.context.repo.owner,
                repo: github_1.context.repo.repo,
                path: pathToClaSignatures,
                sha: result.data.sha,
                message: 'test commit',
                content: contentBinary,
                branch: branch
            });
        }
        catch (err) {
            core.setFailed(err.message);
            throw new Error("error will updating the JSON file" + err);
        }
        return clas;
    });
}
exports.getclas = getclas;
