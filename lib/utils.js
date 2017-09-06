var util = require('util');
var addressparser = require('addressparser');
var escapeStringRegexp = require('escape-string-regexp');

function addressFormatter(addr) {
  if (addr.address && addr.name) {
    return util.format('"%s" <%s>', addr.name, addr.address);
  }

  return addr.address;
}

function addressParser(addrs) {
  if (!Array.isArray(addrs)) {
    addrs = [addrs];
  }

  return addrs
    .map(function (addr) {
      if (typeof addr === 'object') {
        return [addr];
      }

      return addressparser(addr);
    })
    .reduce(function (previous, current) {
      return previous.concat(current);
    });
}

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

  return false;
}

module.exports = {
  addressFormatter: addressFormatter,
  addressParser: addressParser,
  isValidPassthroughType: isValidPassthroughType,
  shouldPassthrough: shouldPassthrough,
};
