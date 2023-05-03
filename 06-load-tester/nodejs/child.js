"use strict";

const axios = require("axios");
const argv = require('minimist')(process.argv.slice(2));
const {faker} = require('@faker-js/faker');

(async () => {

  // console.log(argv.method);
  // console.log(argv.url);
  
  axios.interceptors.request.use(function (config) {
    config.metadata = { startTime: new Date()}
    return config;
  }, function (error) {
    return Promise.reject(error);
  });

  axios.interceptors.response.use(function (response) {
    response.config.metadata.endTime = new Date()
    response.duration = response.config.metadata.endTime - response.config.metadata.startTime
    return response;
  }, function (error) {
    return Promise.reject(error);
  });

  if(argv.method == 'get'){
    axios.get(argv.url)
    .then((response) => {
      const responseMessage = response.duration.toString() + ' | ' +  response.status + ' | ' + response.statusText + ' | ' + JSON.stringify(response.data);
      process.stdout.write(responseMessage);
      process.exitCode = 0;
    })
    .catch((error) => {
      process.exitCode = 1;
    })
  }else if(argv.method == 'post'){
    // node index.js --child_process=1000 --url=/api/v1/users --method=post
    /**curl -X 'POST' \
  'https://blockchain.varahabazaar.com/api/v1/users' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'representativeEmail=email1%40example.com&representativeName=Minima%20Explic&representativePassword=password&representativeOrganisation=org1&representativeRole=customer_users'
  
  curl -X 'POST' \
  'http://20.246.186.81:3010/api/v1/users' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'representativeEmail=enetur%40nonsint.co&representativeName=Illum%20Porro%20Quisqua&representativePassword=password&representativeOrganisation=org1&representativeRole=customer_users'
  */
    // JSON.parse(argv.body)
    const payload = {
      representativeEmail: faker.internet.email(),
      representativeName: faker.name.firstName() + " " + faker.name.firstName(),
      representativePassword: "password",
      representativeOrganisation: faker.helpers.arrayElement(['org1', 'org2']),
      representativeRole: faker.helpers.arrayElement(["project_manager", "customer_users"])
    }
    axios.post(argv.url, payload)
    .then((response) => {
      const responseMessage = response.status + ' | ' + response.statusText + ' | ' + JSON.stringify(response.data) + ' | ' + response.duration.toString();
      process.stdout.write(responseMessage);
      process.exitCode = 0;
    })
    .catch((error) => {
      process.exitCode = 1;
    })
  }else{
    process.exitCode = 0;
  }

  
})();
