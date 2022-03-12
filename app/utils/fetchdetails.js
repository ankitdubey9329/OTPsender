let fs = require('fs');
let logger = require(__dirname + '/../logger/jsLogger.js');
let url = require('url');
let contactList = require('./../statics/contactlist.json');

module.exports = {
	getRecord : function(query, callback) {
		contactList.forEach(function(obj, i){
		    if(obj.Contact === query){
		        var nameError = "";
		        var contactError = "";
		        var error;
		        if(!((obj.Name + " " + obj.Surname).match(/^([a-zA-Z\s]+$)/))) {
	        		nameError = "Invalid Name." 
		        }
		        if(!(obj.Contact.match(/^([0-9\+]+$)/)) || !(obj.Contact.toString().length == 13)) {
		        	contactError = "Invalid Number."
		        }
		        if(nameError || contactError) {
		        	error = {};
		        	error["name"] = obj.Name + " " + obj.Surname;
		        	error["nameError"] = nameError;
		        	error["contact"] = obj.Contact;
		        	error["contactError"] = contactError;
		        	throw new Error(JSON.stringify(error));
		        } else {
		        	callback(obj);
		    	}
		    }
		});
	},

	getQueryFromURL: function(requestUrl, callback) {
		var url_parts = url.parse(requestUrl, true);
    	var query;
    	if(url_parts) {
    	query = url_parts.search;
    	if(query) {
    		query = query.replace(/^\?/,"");
    		query = query.replace(/%20/," ");
    		callback(query);
    	}
    }
	},

	getRandomSixDigitNumber: function(callback) {
		callback(Math.floor(Math.random() * 899999 + 100000));
	},

	refreshCacheForFile: function(filepath, callback) {
		try{
			fs.watchFile(filepath, function (current, previous) {
		        if (current.mtime.toString() !== previous.mtime.toString()) {
		          logger.info("Will reload: " + filepath);
		          delete require.cache[require.resolve(filepath)];
		          sentOTP = require(filepath); 
		          callback(true);
		        } else {
		            callback(false);
		        } 
    		});
		} catch(error) {
			logger.error(error);
			callback(false);
		}
	}

};