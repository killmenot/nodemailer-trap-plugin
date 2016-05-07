var addressParser = require('./utils').addressParser;
var addressFormatter = require('./utils').addressFormatter;
var format = require('string-format');

function trap(options) {
    options = options || {};
    options.subject = options.subject || '[DEBUG] - To: {0}, Subject: {1}';
    options.to = options.to || '';

    return function(mail, callback) {
      var toAddrs = '';

      if (!mail || !mail.data) {
          return callback();
      }

      //TODO: intercept cc
      //TODO: intercept bcc

      if (mail.data.to) {
        toAddrs = addressParser(mail.data.to)
          .map(function (addr) {
            return addressFormatter(addr);
          })
          .join(',');
      }

      mail.data.subject = format(options.subject, toAddrs, mail.data.subject);
      mail.data.to = options.to;
      callback();
    };
}

module.exports = trap;
