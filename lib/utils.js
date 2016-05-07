var util = require('util');
var addressparser = require('addressparser');

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

module.exports = {
  addressFormatter: addressFormatter,
  addressParser: addressParser
};
