var addressParser = require('./utils').addressParser;
var addressFormatter = require('./utils').addressFormatter;
var format = require('string-format');

function trap(options) {
    options = options || {};

    var subject = options.subject || '[DEBUG] - To: {0}, Subject: {1}';
    var to = options.to || '';
    var passthrough = options.passthrough || false;

    return function(mail, callback) {
      var toAddrs;

      if (!mail || !mail.data) {
        return callback();
      }

      toAddrs = addressParser(mail.data.to || '').map(function (addr) {
        return addressFormatter(addr);
      });

      if (passthrough) {
        if (toAddrs.length > 1) {
          return callback(new Error('options.passthrough can be used only with a single recipient only.'));
        }

        if (typeof passthrough === 'string') {
          passthrough = new RegExp(passthrough);
        }

        if (passthrough.test(toAddrs.join())) {
          return callback();
        }
      }

      //TODO: intercept cc
      //TODO: intercept bcc
      mail.data.subject = format(subject, toAddrs.join(','), mail.data.subject);
      mail.data.to = to;
      callback();
    };
}

module.exports = trap;
