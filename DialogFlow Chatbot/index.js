'use strict';

const axios = require('axios');

const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
  
  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }
  
  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }
  
  function statusHandler(agent){
    const idnumber = agent.parameters.idnumber;  
    return axios.get(`https://restapi2020.azurewebsites.net/api/elevators/status/${idnumber}`)
    .then((result) => {
      console.log(result);
      agent.add('Elevator ' + agent.parameters.idnumber + ' status: '+ result.data); 
    });
  }
  
  function elevatorsCountHandler(agent){
    return axios.get(`https://restapi2020.azurewebsites.net/api/elevators`);
  }
  
  function elevatorsNotRunningCountHandler(agent){
    return axios.get(`https://restapi2020.azurewebsites.net/api/elevators/not-operating`);
  }
  
  function batteriesCountHandler(agent){
    return axios.get(`https://restapi2020.azurewebsites.net/api/batteries`);
  }
  
  function buildingsCountHandler(agent){
    return axios.get(`https://restapi2020.azurewebsites.net/api/buildings`);
  }
  
  function citiesCountHandler(agent){
    return axios.get(`https://restapi2020.azurewebsites.net/api/addresses/cities`);
  }
  
  function customersCountHandler(agent){
    return axios.get(`https://restapi2020.azurewebsites.net/api/customers`);
  }
  
  function quotesCountHandler(agent){
    return axios.get(`https://restapi2020.azurewebsites.net/api/quotes`);
  }
  
  function leadsCountHandler(agent){
    return axios.get(`https://restapi2020.azurewebsites.net/api/leads`);
  }
  
  function infoFromApiHandler(agent) {
    return axios.all([elevatorsCountHandler(), elevatorsNotRunningCountHandler(), batteriesCountHandler(), buildingsCountHandler(), citiesCountHandler(), customersCountHandler(), quotesCountHandler(), leadsCountHandler()])
    .then(axios.spread(function (elevators, buildings, customers, elevatorsnotrunning, batteries, cities, quotes, leads) {
      const elevatorsTotal = elevators.data.length;
      const elevatorsNotRunningTotal = elevatorsnotrunning.data.length;
      const batteriesTotal = batteries.data.length;
      const buildingsTotal = buildings.data.length;
      const citiesTotal = cities.data.length;
      const customersTotal = customers.data.length;
      const quotesTotal = quotes.data.length;
      const leadsTotal = leads.data.length;
      agent.add(`Greetings! There are ${elevatorsTotal} elevators deployed in the ${buildingsTotal} buildings of your ${customersTotal} customers. Currently, ${elevatorsNotRunningTotal} elevators are not in Running Status and are being serviced. ${batteriesTotal} Batteries are deployed across ${citiesTotal} cities. On another note you currently have ${quotesTotal} quotes awaiting processing. You also have ${leadsTotal} leads in your contact requests.`);
     }));
  }
  
  
  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('status', statusHandler);
  intentMap.set('infoFromApi', infoFromApiHandler);
  intentMap.set('elevatorsCount', elevatorsCountHandler);
  intentMap.set('elevatorsNotRunningCount', elevatorsNotRunningCountHandler);
  intentMap.set('batteriesCount', batteriesCountHandler);
  intentMap.set('buildingsCount', buildingsCountHandler);
  intentMap.set('citiesCount', citiesCountHandler);
  intentMap.set('customersCount', customersCountHandler);
  intentMap.set('quotesCount', quotesCountHandler);
  intentMap.set('leadsCount', leadsCountHandler);
  agent.handleRequest(intentMap);
});