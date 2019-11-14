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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github_1 = require("@actions/github");
const io = require('@actions/io');
const octokit_1 = __importDefault(require("./octokit"));
const checkcla_1 = require("./checkcla");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('CLA Assistant GitHub Action has started');
            console.log('the PR No is ' + JSON.stringify(github_1.context.issue.number));
            //const myInput = core.getInput('myInput')
            const clas = yield checkcla_1.getclas();
            const rateLimit = yield octokit_1.default.rateLimit.get();
            console.log(JSON.stringify(rateLimit.data.resources, null, 4));
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
run();
