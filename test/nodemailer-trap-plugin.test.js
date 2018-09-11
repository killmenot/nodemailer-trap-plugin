'use strict';

const expect = require('chai').expect;
const trap = require('../').trap;
const format = require('string-format');

describe('trap', () => {
  let plugin, mail, options;

  beforeEach(() => {
    options = {
      to: 'admin@example.org'
    };
  });

  it('should stop processing when no mail', (done) => {
    plugin = trap(options);

    plugin(mail, () => {
      done();
    });
  });

  it('should stop processing when no mail.data', (done) => {
    mail = {};

    plugin = trap(options);

    plugin(mail, () => {
      done();
    });
  });

  it('should throw error when options.to is missed', (done) => {
    mail = {
      data: {
        to: 'foo@example.org',
        subject: 'Hello'
      }
    };

    plugin = trap();

    plugin(mail, (err) => {
      expect(err.message).to.match(/options\.to is missed\./);
      done();
    });
  });

  it('should replace mail.to', (done) => {
    mail = {
      data: {
        to: 'foo@example.org',
        subject: 'Hello'
      }
    };

    plugin = trap(options);

    plugin(mail, () => {
      expect(mail.data.subject).to.equal('[DEBUG] - To: foo@example.org, Subject: Hello');
      done();
    });
  });

  describe('to', () => {
    beforeEach(() => {
      mail = {
        data: {
          subject: 'Hello'
        }
      };
    });

    context('empty', () => {
      it('should not be trapped', (done) => {
        plugin = trap(options);

        plugin(mail, () => {
          expect(mail.data.to).to.equal(undefined);
          expect(mail.data.subject).to.equal('Hello');
          done();
        });
      });
    });

    context('plain email address', () => {
      beforeEach(() => {
        mail.data.to = 'foo@example.org';
      });

      it('should be trapped', (done) => {
        plugin = trap(options);

        plugin(mail, () => {
          expect(mail.data.subject).to.equal('[DEBUG] - To: foo@example.org, Subject: Hello');
          done();
        });
      });

      it('should be passthrough', (done) => {
        options.passthrough = /.*?@example\.org/gi;

        plugin = trap(options);

        plugin(mail, () => {
          expect(mail.data.to).to.equal('foo@example.org');
          expect(mail.data.subject).to.equal('Hello');
          done();
        });
      });
    });

    context('email address with formatted name', () => {
      beforeEach(() => {
        mail.data.to = '"John Doe" <john.doe@example.org>';
      });

      it('should be trapped', (done) => {
        plugin = trap(options);

        plugin(mail, () => {
          expect(mail.data.subject).to.equal('[DEBUG] - To: "John Doe" <john.doe@example.org>, Subject: Hello');
          done();
        });
      });

      it('should be passthrough', (done) => {
        options.passthrough = /.*?@example\.org/;

        plugin = trap(options);

        plugin(mail, () => {
          expect(mail.data.to).to.equal('"John Doe" <john.doe@example.org>');
          expect(mail.data.subject).to.equal('Hello');
          done();
        });
      });
    });

    context('address object', () => {
      beforeEach(() => {
        mail.data.to = {
          name: 'Jane Doe',
          address: 'jane.doe@example.org'
        };
      });

      it('should be trapped', (done) => {
        plugin = trap(options);

        plugin(mail, () => {
          expect(mail.data.subject).to.equal('[DEBUG] - To: "Jane Doe" <jane.doe@example.org>, Subject: Hello');
          done();
        });
      });

      it('should be passthrough', (done) => {
        options.passthrough = /.*?@example\.org/;

        plugin = trap(options);

        plugin(mail, () => {
          expect(mail.data.to).to.eql({
            name: 'Jane Doe',
            address: 'jane.doe@example.org'
          });
          expect(mail.data.subject).to.equal('Hello');
          done();
        });
      });
    });

    context('mixed', () => {
      beforeEach(() => {
        mail.data.to = [
          'foo@example.org',
          '"Bar Bar" bar@example.org',
          '"Jane Doe" <jane.doe@example.org>, "John, Doe" <john.doe@example.org>', {
            name: 'Baz',
            address: 'baz@example.org'
          }
        ];
      });

      it('should be trapped', (done) => {
        plugin = trap(options);

        plugin(mail, () => {
          const addrs = [
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

  describe('options.subject', () => {
    beforeEach(() => {
      mail = {
        data: {
          to: 'admin@example.org',
          subject: 'Hello'
        }
      };
    });

    it('without formatting', (done) => {
      options = {
        to: 'admin@example.org',
        subject: 'custom subject'
      };

      plugin = trap(options);

      plugin(mail, () => {
        expect(mail.data.subject).to.equal('custom subject');
        done();
      });
    });

    it('with formatting', (done) => {
      options = {
        to: 'admin@example.org',
        subject: '{0}{1}{2}'
      };

      plugin = trap(options);

      plugin(mail, () => {
        expect(mail.data.subject).to.equal('admin@example.orgHello');
        done();
      });
    });
  });

  describe('options.passthrough', () => {
    beforeEach(() => {
      options = {
        to: 'admin@example.org',
        passthrough: /foo/
      };

      mail = {
        data: {
          to: 'foo@example.org',
          subject: 'Hello',
        }
      };
    });

    it('should throw error for multiple to recipients when using options.passthrough', (done) => {
      mail.data.to = [
        'foo@example.org',
        'bar@example.org',
      ];

      plugin = trap(options);

      plugin(mail, (err) => {
        expect(err.message).to.match(/options\.passthrough can be used with a single recipient only\./);
        done();
      });
    });

    it('should throw error if options.passthrough is wrong type', (done) => {
      options = {
        to: 'admin@example.org',
        passthrough: 12345,
      };

      mail.data.to = 'foo@example.org';

      plugin = trap(options);

      plugin(mail, (err) => {
        expect(err.message).to.match(/options\.passthrough can be only a string, regex or function\./);
        done();
      });
    });

    context('regexp passed', () => {
      beforeEach(() => {
        options = {
          to: 'admin@example.org',
          passthrough: /.*?@example\.org/
        };

        mail = {
          data: {
            to: 'foo@example.org',
            subject: 'Hello',
          }
        };
      });

      it('should not be trapped', (done) => {
        mail.data.to = 'foo@example.org';

        plugin = trap(options);

        plugin(mail, () => {
          expect(mail.data.to).to.equal('foo@example.org');
          expect(mail.data.subject).to.equal('Hello');
          done();
        });
      });
    });

    context('string passed', () => {
      beforeEach(() => {
        options = {
          to: 'admin@example.org',
          passthrough: 'foo'
        };

        mail = {
          data: {
            to: 'foo@example.org',
            subject: 'Hello',
          }
        };
      });

      it('should not be trapped', (done) => {
        mail.data.to = 'foo@example.org';

        plugin = trap(options);

        plugin(mail, () => {
          expect(mail.data.to).to.equal('foo@example.org');
          expect(mail.data.subject).to.equal('Hello');
          done();
        });
      });
    });

    context('function passed', () => {
      beforeEach(() => {
        options = {
          to: 'admin@example.org',
          passthrough: function (addr) {
            return addr === 'foo@example.org';
          }
        };

        mail = {
          data: {
            to: 'foo@example.org',
            subject: 'Hello',
          }
        };
      });

      it('should not be trapped', (done) => {
        mail.data.to = 'foo@example.org';

        plugin = trap(options);

        plugin(mail, () => {
          expect(mail.data.to).to.equal('foo@example.org');
          expect(mail.data.subject).to.equal('Hello');
          done();
        });
      });
    });

    it('should be trapped', (done) => {
      mail.data.to = [
        'bar@example.org'
      ];

      plugin = trap(options);

      plugin(mail, () => {
        expect(mail.data.to).to.equal('admin@example.org');
        expect(mail.data.subject).to.equal('[DEBUG] - To: bar@example.org, Subject: Hello');
        done();
      });
    });
  });
});
