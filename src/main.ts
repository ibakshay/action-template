import * as core from '@actions/core';
import * as mongoose from 'mongoose'



async function run() {
  try {
    console.log("CLA Assistant lite action is running")
    mongoose.connect('mongodb://cla:AwS9DZkHb9rMBMqd@ds061076.mlab.com:27481/cla-assistant-lite-test', { useNewUrlParser: true })
    const Schema = mongoose.Schema
    const cla = new Schema({
      username: { type: String, required: true, unique: true },
      userid: { type: Number, required: false, unique: false }
    })
    const newModel = mongoose.model('clas', cla)
    const newDocument = newModel({ username: 'ibakshay', userid: 13945 })
    newDocument.save()

  } catch (error) {
    core.setFailed(error.message)
  }
}

run();
