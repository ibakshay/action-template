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
function default_1() {
    return __awaiter(this, void 0, void 0, function* () {
        //getting the path of the cla from the user
        const pathToCla = core.getInput('pathtocla');
        const branch = core.getInput('branch');
        let result, clas;
        try {
            result = yield octokit_1.default.repos.getContents({
                owner: github_1.context.repo.owner,
                repo: github_1.context.repo.repo,
                path: pathToCla,
                ref: branch
            });
            clas = Buffer.from(result.data.content, 'base64').toString();
            console.log("stringy: --->" + clas);
            clas = JSON.parse(clas);
            console.log("Object: --->" + clas);
            return clas;
        }
        catch (err) {
            core.debug(err.message);
        }
    });
}
exports.default = default_1;
