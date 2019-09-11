import * as core from '@actions/core';
import mongoose = require('mongoose');



async function run() {
  try {
    console.log("CLA Assistant lite action is running")
    mongoose.connect('mongodb://cla:AwS9DZkHb9rMBMqd@ds123346.mlab.com:23346/cla-lite', {
      useNewUrlParser: true
    })
    const Schema = mongoose.Schema
    const cla = new Schema({
      username: { type: String, required: true, unique: false },
      userid: { type: Number, required: false, unique: false }
    })
    const newModel = mongoose.model('clas', cla)
    const newDocument = newModel({ username: 'becky', userid: 7556978 })
    newDocument.save()
    return

  } catch (error) {
    core.setFailed(error.message)
  }
}

run();
