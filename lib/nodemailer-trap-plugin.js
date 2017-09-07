var addressParser = require('./utils').addressParser;
var addressFormatter = require('./utils').addressFormatter;
var format = require('string-format');
var escapeStringRegexp = require('escape-string-regexp');

function isValidPassthroughType(passthrough) {
  return typeof passthrough === 'function' ||
    typeof passthrough === 'string' ||
    passthrough instanceof RegExp;
}

function shouldPassthrough(passthrough, toAddrs) {
  if (typeof passthrough === 'function') {
    return Boolean(passthrough(toAddrs.join()));
  }

  if (typeof passthrough === 'string') {
    passthrough = new RegExp(escapeStringRegexp(passthrough));
  }

  if (passthrough instanceof RegExp) {
    return passthrough.test(toAddrs.join());
  }
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

      if (passthrough) {
        if (toAddrs.length > 1) {
          return callback(new Error('options.passthrough can be used with a single recipient only.'));
        }

        if (!isValidPassthroughType(passthrough)) {
          return callback(new Error('options.passthrough can be only a string, regex or function.'));
        }

        if (shouldPassthrough(passthrough, toAddrs)) {
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
