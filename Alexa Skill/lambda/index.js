/* *
 * This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
 * Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
 * session persistence, api calls, and more.
 * */
const Alexa = require('ask-sdk-core');
const http = require("https");

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

// ----- the 2 next function are to change elevator status with id and status -----
const ChangeStatusHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "ChangeStatusIntent"
    );
  },
  async handle(handlerInput) {
    const elevatorID = handlerInput.requestEnvelope.request.intent.slots.id.value;
    const status = handlerInput.requestEnvelope.request.intent.slots.status.value;
    var capitalizedStatus = uppercaseFirstCharacter(status);

    //var result = await httpPutElevatorStatus(elevatorID, capitalizedStatus);
    let say = "";
    
    await httpPutElevatorStatus(elevatorID, capitalizedStatus)
            .then((response) => {
                say = response;
            })
            .catch((err) => {
                say = err.message;
                console.log(`ERROR: ${err.message}`);
            });
    
    //let say = result;

    return handlerInput.responseBuilder
      .speak(say)
      .reprompt()
      .getResponse();
  }
};

const httpPutElevatorStatus = (elevatorID, capitalizedStatus) => new Promise((resolve, reject) => {
  //return new Promise((resolve, reject) => {
    const putData = `{"status":"${capitalizedStatus}"}`;
    
    console.log(elevatorID, capitalizedStatus);
    var options = {
      hostname: "restapi2020.azurewebsites.net", // here is the end points
      path: `/api/Elevators/4`,
      headers: {
        "Content-Type": "application/json"
        //"Content-Length": Buffer.byteLength(putData)
      },
      method: "PUT"
    };
    var req = http.request(options, res => {
      var responseString = "";
      res.on("data", chunk => {
        responseString = responseString + chunk;
      });
      res.on("end", () => {
        console.log("Received: " + responseString);
        resolve(responseString);
      });
      res.on("error", e => {
        console.log("ERROR: " + e);
        reject();
      });
    });
    
    req.on('error', (err) => reject(err));
    req.write(putData);
    req.end();
    
})

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

//all elevator info 
const GetElevatorInfoHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name ===
        "GetElevatorInfoIntent"
    );
  },
  async handle(handlerInput) {
    let outputSpeech = "This is the default message.";
    const id = handlerInput.requestEnvelope.request.intent.slots.idtype.value;

    const elevatorData = await getRemoteData(
      "https://restapi2020.azurewebsites.net/api/elevators/" + id
    );

    const inspectionCertificate = JSON.parse(elevatorData).inspection_certificate;
    const elevatorstatus = JSON.parse(elevatorData).status;
    const elevatorclass = JSON.parse(elevatorData).model;


    outputSpeech = `the elevator ${id} status is ${elevatorstatus}. The last inspection certificate number is  ${inspectionCertificate}. The elevator model is ${elevatorclass}.`;

    return handlerInput.responseBuilder
      .speak(outputSpeech)
      .reprompt()
      .getResponse();
  }
};

// customer info
const GetCustomerInfoHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name ===
        "GetCustomerInfoHandler"
    );
  },
  async handle(handlerInput) {
    let outputSpeech = "This is the default message.";
    const id = handlerInput.requestEnvelope.request.intent.slots.idtype.value;

    const customerData = await getRemoteData(
      "https://restapi2020.azurewebsites.net/api/customers/" + id
    );

    const customerName = JSON.parse(customerData).company_name;
    const companyContact = JSON.parse(customerData).full_name_company_contact;
    const companyPhone = JSON.parse(customerData).company_contact_phone;


    outputSpeech = `The name of the company with ID ${id}  is ${customerName}. The company contact's name is ${companyContact} and the phone number is ${companyPhone}.`;

    return handlerInput.responseBuilder
      .speak(outputSpeech)
      .reprompt()
      .getResponse();
  }
};

// goodbye
const GoodbyeHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      (handlerInput.requestEnvelope.request.intent.name ===
        "AMAZON.CancelIntent" ||
        handlerInput.requestEnvelope.request.intent.name ===
          "AMAZON.StopIntent")
    );
  },
  handle(handlerInput) {
    const speechText = "Goodbye!";

    return handlerInput.responseBuilder.speak(speechText).getResponse();
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

function uppercaseFirstCharacter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    GetGreetingsHandler,
    GetRemoteDataHandler,
    GetStatusHandler,
    GetElevatorInfoHandler,
    GoodbyeHandler,
    GetCustomerInfoHandler,
    GetRemoteDataHandler,
    ChangeStatusHandler
    
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();