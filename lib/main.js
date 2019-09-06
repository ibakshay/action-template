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
const io = require('@actions/io');
const cla_1 = require("./cla");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            core.debug('CLA Assistant GitHub Action is running');
            const myInput = core.getInput('myInput');
            const clas = yield cla_1.getclas();
            // let testJSON = {
            //   name: "akshay",
            //   id: 2344
            // }
            // let updateFile, contentBinary
            // let contentString = JSON.stringify(testJSON)
            // contentBinary = Buffer.from(contentString).toString('base64')
            // const args3 = {
            //   owner: github.context.repo.owner,
            //   repo: github.context.repo.repo,
            //   path: 'cla.json',
            //   ref: 'master',
            //   sha: result.data.sha,
            //   message: 'test commit',
            //   content: contentBinary
            // }
            // try {
            //   updateFile = await octokit.repos.createOrUpdateFile(args3)
            // } catch (e) {
            //   throw new Error("error updating  contributor file: " + e)
            // }
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
run();
// let pathToCla = './cla.json'
// let file
// try {
//   file = fs.readFileSync(pathToCla, 'utf8');
// } catch (err) {
//   throw new Error("CLA file not found.");
// }
