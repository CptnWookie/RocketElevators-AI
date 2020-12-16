/* *
 * This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
 * Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
 * session persistence, api calls, and more.
 * */
const Alexa = require('ask-sdk-core');

const getRemoteData = function(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? require("https") : require("http");
    const request = client.get(url, response => {
      if (response.statusCode < 200 || response.statusCode > 299) {
        reject(new Error("Failed with status code: " + response.statusCode));
      }
      const body = [];
      response.on("data", chunk => body.push(chunk));
      response.on("end", () => resolve(body.join("")));
    });
    request.on("error", err => reject(err));
  });
};

const GetGreetingsHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "LaunchRequest";
  },

  handle(handlerInput) {
    let outputSpeech = "Greetings! How can I help you?";

    return handlerInput.responseBuilder
      .speak(outputSpeech)
      .reprompt(outputSpeech)
      .getResponse();
  }
};

const GetRemoteDataHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name ===
        "GetRocketElevatorsStatusIntent"
    );
  },
  async handle(handlerInput) {
    let outputSpeech = "";
    
    //Get all the elevators from the Rest Api
    const totalElevatorsAPI = await getRemoteData(
      "https://restapi2020.azurewebsites.net/api/elevators"
    );
    const totalElev = Object.keys(JSON.parse(totalElevatorsAPI)).length;
    outputSpeech += `There are currently ${totalElev} elevators deployed in the `;
    
    //Get all the buildings from the Rest Api
    const totalBuildingsAPI = await getRemoteData(
      "https://restapi2020.azurewebsites.net/api/buildings"
    );
    const totalBuild = Object.keys(JSON.parse(totalBuildingsAPI)).length;
    outputSpeech += `${totalBuild} buildings of your `;

    //Get all the customers from the Rest Api
    const totalCustomersAPI = await getRemoteData(
      "https://restapi2020.azurewebsites.net/api/customers"
    );
    const totalCust = Object.keys(JSON.parse(totalCustomersAPI)).length;
    outputSpeech += `${totalCust} customers. `;
    
    //Get all the elevators that are not operational from the Rest Api
    const elevatorsStatus = await getRemoteData(
      "https://restapi2020.azurewebsites.net/api/elevators/not-operating"
    );
    const elevNotRunning = Object.keys(JSON.parse(elevatorsStatus)).length;
    outputSpeech += ` Currently, ${elevNotRunning} elevators are not in Running Status and are being serviced. `;

    //Get all the batteries from the Rest Api
    const totalBatteriesAPI = await getRemoteData(
      "https://restapi2020.azurewebsites.net/api/batteries"
    );
    const totalBatt = Object.keys(JSON.parse(totalBatteriesAPI)).length;
    outputSpeech += ` ${totalBatt} Battreries are deployed across `;
    
    //Get all the numbers of cities from the Rest Api
    const totalCitiesAPI = await getRemoteData(
      "https://restapi2020.azurewebsites.net/api/addresses/cities"
    );
    const totalCities = Object.keys(JSON.parse(totalCitiesAPI)).length;
    outputSpeech += `${totalCities} cities. `;

    //Get all the quotes from the Rest Api
    const totalQuotesAPI = await getRemoteData(
      "https://restapi2020.azurewebsites.net/api/quotes"
    );
    const totalQuotes = Object.keys(JSON.parse(totalQuotesAPI)).length;
    outputSpeech += ` On another note, you currently have ${totalQuotes} quotes awaiting processing. `;

    //Get all the leads from the Rest Api
    const totalLeadsAPI = await getRemoteData(
      "https://restapi2020.azurewebsites.net/api/Leads"
    );
    const totalLeads = Object.keys(JSON.parse(totalLeadsAPI)).length;
    outputSpeech += ` You also have ${totalLeads} leads in your contact requests. `;

    return handlerInput.responseBuilder
      .speak(outputSpeech)
      .reprompt(outputSpeech)
      .getResponse();
  }
};

// Get elevator status by id
const GetStatusHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name ===
        "GetStatusIntent"
    );
  },
  async handle(handlerInput) {
    let outputSpeech = "This is the default message.";
    const id = handlerInput.requestEnvelope.request.intent.slots.idtype.value;


    const elevatorStatus = await getRemoteData(
      "https://restapi2020.azurewebsites.net/api/elevators/" +id
    );

    const elevator = JSON.parse(elevatorStatus).status;

    outputSpeech = `The status of elevator ${id} is ${elevator}` ;

    return handlerInput.responseBuilder
      .speak(outputSpeech)
      .reprompt()
      .getResponse();
  }
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak("Sorry, I did not get that. Please say it again.")
      .reprompt("Sorry, I did not get that. Please say it again.")
      .getResponse();
  }
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    GetGreetingsHandler,
    GetRemoteDataHandler,
    GetStatusHandler
    //HelpIntentHandler,
    //CancelAndStopIntentHandler,
    //SessionEndedRequestHandler
  )
  //.addErrorHandlers(ErrorHandler)
  .lambda();