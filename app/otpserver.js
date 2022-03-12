/*
    This server file handles all routing and control which component to show in view for a particular
    action made in web. 
*/

// Native & 3rd party libraries.
let bodyParser = require('body-parser');
let express = require('express');
let ejs = require('ejs');
let path = require('path');
let app = express();



// Using resources from other modules, static files available locally
let contactList = require(__dirname + '/statics/contactlist.json');
let fetchDetails = require(__dirname + '/utils/fetchdetails.js');
let logger = require(__dirname + '/logger/jsLogger.js');
let otpManagerPath = __dirname + '/messageStatus/status.json';
let sendOTP = require(__dirname +'/managers/otpmanager.js');
let sentOTP = require(otpManagerPath);

process.setMaxListeners(0);

// set the view engine to ejs
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended: true
}));

// index page 
app.get('/', function(req, res) {
    res.render('pages/index');
});

// contact-list page 
app.get('/contact-list.ejs', function(req, res) {
    res.render('pages/contact-list', {contactList:contactList});
});

// contact-info page. In event of input validation faliure, error page will be 
// shown.
app.get('/contact-info.ejs', function(req, res) {
    fetchDetails.getQueryFromURL(req.url, function(query) {
	    try{
            fetchDetails.getRecord(query, function(record) {
    	    		res.render('pages/contact-info', {record:record});
    	    	}
    	    );
        } catch(error) {
            var err = error.toString();
            err = err.replace(/Error: /,"");
            err = JSON.parse(err);
            res.render('pages/error-info', {error:err});
        }
	});
});

// message-compose page. In event of any error/exception, will be 
// redirected to home page. 
app.get('/message-compose.ejs', function(req, res) {
    var messageForContact = {};
    try{
        fetchDetails.getQueryFromURL(req.url, function(query) {
        	messageForContact["contact"] = query;
        	fetchDetails.getRandomSixDigitNumber(function(random) {
        		messageForContact["random"] = random;
        		res.render('pages/message-compose', {messageForContact:messageForContact});
        	});
        });
    } catch(error) {
        logger.error(error);
        res.render('pages/index');
    }
});

// Send message page. In event of any error, redirected to home page. 
app.post('/send-otp', function(req, res) {
    var messageJson = {};
    try{
        messageJson["contact"] = req.body.contact;
        messageJson["text_message"] = req.body.text_message;
        sendOTP.sendmessage(messageJson, function(data) {
        	var message = {};
        	if(!(data === "error")) {
        		message["Status"] = "SUCCESS";
        		res.render('pages/otp-confirmation', {message:message})
        	} else {
        		message["Status"] = "FAILURE";
        		res.render('pages/otp-confirmation', {message:message})
        	}
        });
    }  catch(error) {
        logger.error(error);
        res.render('pages/index');
    }   
});

// Page to list all sent OTPs. This implements hot loading of file.
// This is achieved by clearing server cache for this file everytime
// this route is hit. 
app.get('/sent-otps.ejs', function(req, res) {
    delete require.cache[require.resolve(otpManagerPath)];
    sentOTP = require(otpManagerPath);
    res.render('pages/sent-otps', {sentOTP:sentOTP});
});

app.listen(process.env.PORT || 3000);
logger.info('OTP app listening on 3000.');