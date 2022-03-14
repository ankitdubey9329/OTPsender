let fs = require('fs');

if(process.env.NODE_ENV!=="production"){
    require("dotenv").config()
}

let fetchDetails = require('./../utils/fetchdetails.js');
let logger = require(__dirname + '/../logger/jsLogger.js');
// let otpAuth = require('./otpAuth.json');


let twilio = require('twilio');
const dotenv=require('dotenv').config();

const sid=process.env.SID;
const token=process.env.TOKEN;
const number=process.env.NUMBER;


//This module will authenticate credentials of using Twilio API and finally send a text message to
//concerned contact number.

module.exports = {
	sendmessage : function(messageJson, callback) { 
		try{
			var client = new twilio.RestClient(sid, token);
		} catch(error) {
			logger.error("Could not create Twilio messaging REST client due to : " + error);
			callback("error");
		}
		if(Object.keys(messageJson).length > 0) {
			// Pass in parameters to the REST API using an object literal notation. The
			// REST client will handle authentication and response serialzation.
			try{
				client.sms.messages.create({
				    to:messageJson["contact"],
				    from:number,
				    body:messageJson["text_message"]
				}, function(error, message) {
				    if (!error) {
				        var dataToSave = {};
				        fetchDetails.getRecord(messageJson["contact"], function(record) {
				        	dataToSave["Name"] = record["Name"] + " " + record["Surname"];
				        });
				        dataToSave["Time"] = message.dateCreated;
				        dataToSave["Body"] = messageJson["text_message"].match(/is:([^&]+)./)[1].trim();
				        logger.info('Success! The SID for this SMS message is: ' + message.sid);
				        logger.info('Message sent on: ' + message.dateCreated);
				        //Write successfully sent data to local file. 
				        appendObject(dataToSave);
				        callback(message);
				    } else {
				        logger.error('Oops! There was an error. ' + JSON.stringify(error));
				        callback("error");
				    }
				});
			} catch(exception) {
				logger.error("Exception occurred - " + exception);
				callback(error);
			}
		} else {
			logger.warn("Received invalid contact information to proceed.");
			callback("error");
		} 
		
		// This method writes all sent messages to local text file. Data is written to ensure entry
		// of most recently sent data to occur on top.  
		function appendObject(message) {
			try{
				var messageStatusFile = fs.readFileSync(__dirname + '/../messageStatus/status.json');
				var status = JSON.parse(messageStatusFile);
				status.unshift(message);
				var statusWriteFile = JSON.stringify(status);
				fs.writeFileSync(__dirname + '/../messageStatus/status.json', statusWriteFile); 
			} catch(ioerror) {
				logger.error("Error in writing record " + message + " to file.");				
			}
		}
	}
}
