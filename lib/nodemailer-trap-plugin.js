var addressParser = require('./utils').addressParser;
var addressFormatter = require('./utils').addressFormatter;
var format = require('string-format');

function trap(options) {
    options = options || {};
    options.subject = options.subject || '[DEBUG] - To: {0}, Subject: {1}';
    options.to = options.to || '';
    options.passthrough = options.passthrough || '';

    return function(mail, callback) {
      var toAddrs;

      if (!mail || !mail.data) {
        return callback();
      }

      toAddrs = addressParser(mail.data.to || '').map(function (addr) {
        return addressFormatter(addr);
      });

      if (options.passthrough) {
        if (toAddrs.length > 1) {
          return callback(new Error('options.passthrough can be used only with a single recipient only.'));
        }

        if (options.passthrough.test(toAddrs.join())) {
          return callback();
        }
      }

      //TODO: intercept cc
      //TODO: intercept bcc
      mail.data.subject = format(options.subject, toAddrs.join(','), mail.data.subject);
      mail.data.to = options.to;
      callback();
    };
}

module.exports = trap;
