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
const mongoose = require("mongoose");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("CLA Assistant lite action is running");
            mongoose.connect('mongodb://cla:AwS9DZkHb9rMBMqd@123346.mlab.com:23346/cla-lite', {
                useNewUrlParser: true
            });
            const Schema = mongoose.Schema;
            const cla = new Schema({
                username: { type: String, required: true, unique: false },
                userid: { type: Number, required: false, unique: false }
            });
            const newModel = mongoose.model('clas', cla);
            const newDocument = newModel({ username: 'becky', userid: 7556978 });
            newDocument.save();
            return;
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
run();
