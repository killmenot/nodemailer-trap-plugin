var addressParser = require('./utils').addressParser;
var addressFormatter = require('./utils').addressFormatter;
var format = require('string-format');
var escapeStringRegexp = require('escape-string-regexp');

function isValidPassthroughType(passthrough) {
  return typeof passthrough === 'function' ||
    typeof passthrough === 'string' ||
    passthrough instanceof RegExp;
}

function shouldPassthrough(passthrough, toAddr) {
  if (typeof passthrough === 'function') {
    return passthrough(toAddr);
  }

  if (typeof passthrough === 'string') {
    passthrough = new RegExp(escapeStringRegexp(passthrough));
  }

  return passthrough.test(toAddr);
}

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

      if (toAddrs.length === 0) {
        return callback();
      }

      if (!to) {
        return callback(new Error('options.to is missed.')); 
      }

      if (passthrough) {
        if (!isValidPassthroughType(passthrough)) {
          return callback(new Error('options.passthrough can be only a string, regex or function.'));
        }

        if (toAddrs.length > 1) {
          return callback(new Error('options.passthrough can be used with a single recipient only.'));
        }

        if (shouldPassthrough(passthrough, toAddrs.join())) {
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
