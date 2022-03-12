/*
  This is a simple configuration of logger customised for this project.
  Logger defined here can work in info, warn, debug and error levels. 
*/

var bunyan = require('bunyan');
var date = new Date(Date.now());
var id = date.getFullYear() + "." + (parseInt(date.getMonth())+1) + "." + date.getDate();
var logger = bunyan.createLogger({
  name: 'otpServer',
  streams: [{
       // Choose process.stdout to directly write logs to terminal.
       stream : process.stdout
       // This option writes log to a file located in logs folder in parent directory of 
       // project. 
       // type: 'rotating-file',
       // path: __dirname + "/../../logs/" + "application.log",
       // A new file is created after 6 hours of continuous uptime.
       // period: '6h',
       // 4 files are created for a day's operation. 
       // count: 4
  }]
});
module.exports = {
   info: function(msg){
      logger.info(msg);
    },
    warn: function(msg){
      logger.warn(msg);
    },
    debug: function(msg){
      logger.debug(msg);
    },
    error: function(msg){
      logger.error(msg);
    }
}

