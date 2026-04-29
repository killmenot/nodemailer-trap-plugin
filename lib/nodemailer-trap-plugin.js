'use strict';

const addressParser = require('./utils').addressParser;
const addressFormatter = require('./utils').addressFormatter;
const format = require('string-format');
const escapeStringRegexp = require('escape-string-regexp');

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

  const subject = options.subject || '[DEBUG] - To: {0}, Subject: {1}';
  const to = options.to || '';
  const passthrough = options.passthrough || false;

  return (mail, callback) => {
    if (!mail || !mail.data) {
      return callback();
    }

    const toAddrs = addressParser(mail.data.to || '').map(x => addressFormatter(x));

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

    // TODO: intercept cc
    // TODO: intercept bcc
    mail.data.subject = format(subject, toAddrs.join(','), mail.data.subject);
    mail.data.to = to;

    callback();
  };
}

module.exports = trap;
