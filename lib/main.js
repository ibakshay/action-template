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
const graphQL = require('./graphql/query');
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const myInput = core.getInput('myInput');
            console.log(`My input is  ${myInput}`);
            // This should be a token with access to your repository scoped in as a secret.
            const myToken = core.getInput('myToken');
            const octokit = new github.GitHub(myToken);
            //if (github.context.payload.action === 'opened') {
            const args = {
                owner: github.context.repo.owner,
                repo: github.context.repo.repo,
                issue_number: github.context.issue.number
            };
            const { query, variables } = graphQL.getPRCommitters(args.owner, args.repo, args.issue_number, '');
            let response = yield octokit.graphql(query, variables);
            console.log(query);
            console.log(variables);
            //const responseToIssue = await octokit.issues.createComment(args)
            console.error('Thank you for creating the issue --dev-release');
            //}
            console.error(github.context);
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
run();
