/* globals context, beforeEach, describe, it */

'use strict';

var expect = require('chai').expect;
var trap = require('../').trap;
var format = require('string-format');

describe('trap', function () {
  var plugin, mail, options;

  beforeEach(function () {
    options = {
      to: 'admin@example.org'
    };
  });

  it('default options', function (done) {
    var obj = {
      options: {}
    };

    plugin = trap(obj.options);
    
    plugin(mail, function () {
      expect(obj.options.subject).to.equal('[DEBUG] - To: {0}, Subject: {1}');
      expect(obj.options.to).to.equal('');
      done();
    });
  });

  it('should stop processing when no mail', function (done) {
    plugin = trap(options);

    plugin(mail, function () {
      done();
    });
  });

  it('should stop processing when no mail.data', function (done) {
    mail = {};

    plugin = trap(options);

    plugin(mail, function () {
      done();
    });
  });

  it('should replace mail.to', function (done) {
    mail = {
      data: {
        to: 'foo@example.org',
        subject: 'Hello'
      }
    };

    plugin = trap(options);

    plugin(mail, function () {
      expect(mail.data.subject).to.equal('[DEBUG] - To: foo@example.org, Subject: Hello');
      done();
    });
  });

  describe('to', function () {
    beforeEach(function () {
      mail = {
        data: {
          subject: 'Hello'
        }
      };
    });

    context('plain email address', function () {
      beforeEach(function () {
        mail.data.to = 'foo@example.org';
      });

      it('should be trapped', function (done) {
        plugin = trap(options);

        plugin(mail, function () {
          expect(mail.data.subject).to.equal('[DEBUG] - To: foo@example.org, Subject: Hello');
          done();
        });
      });

      it('should be passthrough', function (done) {
        options.passthrough = /.*?@example\.org/gi;

        plugin = trap(options);

        plugin(mail, function () {
          expect(mail.data.to).to.equal('foo@example.org');
          expect(mail.data.subject).to.equal('Hello');
          done();
        });
      });
    });

    context('email address with formatted name', function () {
      beforeEach(function () {
        mail.data.to = '"John Doe" <john.doe@example.org>';
      });

      it('should be trapped', function (done) {
        plugin = trap(options);

        plugin(mail, function () {
          expect(mail.data.subject).to.equal('[DEBUG] - To: "John Doe" <john.doe@example.org>, Subject: Hello');
          done();
        });
      });

      it('should be passthrough', function (done) {
        options.passthrough = /.*?@example\.org/;

        plugin = trap(options);

        plugin(mail, function () {
          expect(mail.data.to).to.equal('"John Doe" <john.doe@example.org>');
          expect(mail.data.subject).to.equal('Hello');
          done();
        });
      });
    });

    context('address object', function () {
      beforeEach(function () {
        mail.data.to = {
          name: 'Jane Doe',
          address: 'jane.doe@example.org'
        };
      });

      it('should be trapped', function (done) {
        plugin = trap(options);

        plugin(mail, function () {
          expect(mail.data.subject).to.equal('[DEBUG] - To: "Jane Doe" <jane.doe@example.org>, Subject: Hello');
          done();
        });
      });

      it('should be passthrough', function (done) {
        options.passthrough = /.*?@example\.org/;

        plugin = trap(options);

        plugin(mail, function () {
          expect(mail.data.to).to.eql({
            name: 'Jane Doe',
            address: 'jane.doe@example.org'
          });
          expect(mail.data.subject).to.equal('Hello');
          done();
        });
      });
    });

    context('mixed', function () {
      beforeEach(function () {
        mail.data.to = [
          'foo@example.org',
          '"Bar Bar" bar@example.org',
          '"Jane Doe" <jane.doe@example.org>, "John, Doe" <john.doe@example.org>',
          {
            name: 'Baz',
            address: 'baz@example.org'
          }
        ];
      });

      it('should be trapped', function (done) {
        plugin = trap(options);

        plugin(mail, function () {
          var addrs = [
            'foo@example.org',
            '"Bar Bar" <bar@example.org>',
            '"Jane Doe" <jane.doe@example.org>',
            '"John, Doe" <john.doe@example.org>',
            '"Baz" <baz@example.org>'
          ];
          expect(mail.data.subject).to.equal(format('[DEBUG] - To: {0}, Subject: Hello', addrs.join(',')));
          done();
        });
      });
    });
  });

  it('should use custom options.subject', function (done) {
    options = {
      subject: 'custom subject'
    };

    mail = {
      data: {}
    };

    plugin = trap(options);

    plugin(mail, function () {
      expect(mail.data.subject).to.equal('custom subject');
      done();
    });
  });

  it('should use formatted options.subject', function (done) {
    options = {
      subject: '{0}{1}{2}'
    };

    mail = {
      data: {
        to: 'admin@example.org',
        subject: 'Hello'
      }
    };

    plugin = trap(options);

    plugin(mail, function () {
      expect(mail.data.subject).to.equal('admin@example.orgHello');
      done();
    });
  });

  it('should throw error for multiple to recipients when using options.passthrough', function (done) {
    options = {
      passthrough: /.*?@example\.org/
    };

    mail = {
      data: {
        to: [
          'foo@example.org',
          'bar@example.org',
        ]
      }
    };

    plugin = trap(options);

    plugin(mail, function (err) {
      expect(err).to.match(/options\.passthrough can be used only with a single recipient only\./);
      done();
    });
  });
});
