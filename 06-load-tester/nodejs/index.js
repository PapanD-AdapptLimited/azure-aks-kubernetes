"use strict";

const dotenv = require('dotenv').config();
console.log("[BASE_URL]",process.env.BASE_URL)

const childProc = require("child_process");
let CHILD_PROCESSES = 3;
let URL = '/api/v1/ping';
let METHOD = 'get'
let BODY = ''

process.argv.forEach(function (val, index, array) {
  // console.log(index + ': ' + val);
  if(val.indexOf('--child_process') != -1){
    CHILD_PROCESSES = val.split('=')[1]
  }
  if(val.indexOf('--url') != -1){
    URL = val.split('=')[1]
  }
  if(val.indexOf('--method') != -1){
    METHOD = val.split('=')[1]
  }
  if(val.indexOf('--body') != -1){
    BODY = val.split('=')[1]
  }
  

});

console.log("[URL]", URL);
console.log("[METHOD]", METHOD);

(async () => {
  let times = [];
  let children = [];

  for (let i = 0; i < CHILD_PROCESSES; i++) {
    let childProcess = childProc.spawn("node", ["child.js", `--url=${process.env.BASE_URL}${URL}`, `--method=${METHOD}`, `--body=${BODY}`])
    children.push(childProcess);
  }

  let responses = children.map(function wait(child) {
    return new Promise(function c(res) {
      child.stdout.on('data', (data) => {
        console.log(`child stdout: ${data}`);
        times.push(parseInt(data));
      });
      child.on("exit", function (code) {
        if (code === 0) {
          res(true);
        } else {
          res(false);
        }
      });
    });
  });

  responses = await Promise.all(responses);

  if (responses.filter(Boolean).length == responses.length) {
    const sum = times.reduce((a, b) => a + b, 0);
    const avg = (sum / times.length) || 0;
    console.log(`average: ${avg}`);
    console.log("success!");
  } else {
    console.log("failures!");
  }
})();
