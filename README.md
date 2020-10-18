
# The Nodemailer plugin to intercept emails for non production environments

[![npm version](https://badge.fury.io/js/nodemailer-trap-plugin.svg)](https://badge.fury.io/js/nodemailer-trap-plugin) [![Build Status](https://travis-ci.org/killmenot/nodemailer-trap-plugin.svg?branch=master)](https://travis-ci.org/killmenot/nodemailer-trap-plugin) [![Coverage Status](https://coveralls.io/repos/github/killmenot/nodemailer-trap-plugin/badge.svg?branch=master)](https://coveralls.io/github/killmenot/nodemailer-trap-plugin?branch=master) [![Dependency Status](https://david-dm.org/killmenot/nodemailer-trap-plugin.svg)](https://david-dm.org/killmenot/nodemailer-trap-plugin.svg)


## Install

Install from npm

    npm install nodemailer-trap-plugin --save


## Usage

#### 1. Load the `trap` function

```javascript
var trap = require('nodemailer-trap-plugin').trap;
```

#### 2. Attach it as a 'compile' handler for a nodemailer transport object

```javascript
nodemailerTransport.use('compile', trap(options))
```

Where **options**

-   **to** - the email address used to send emails to. Default: `''`
-   **subject** - the subject formatted. Default: `'[DEBUG] - To: {0}, Subject: {1}'`
-   **passthrough** - the regex / string / function to passthrough emails without modification (*It works only for single recipient*). Default: `false`.


## Example

```javascript
var nodemailer = require('nodemailer');
var trap = require('nodemailer-trap-plugin').trap;
var transporter = nodemailer.createTransport();

transporter.use('compile', trap({
  to: 'admin@example.org',
  passthrough: '@domain.com'
}));

// first email
transporter.sendMail({
  from: 'noreply@example.org',
  to: 'john.doe@example.com',
  subject: 'Hello John'
});

// second email
transporter.sendMail({
  from: 'noreply@example.org',
  to: 'jane@domain.com',
  subject: 'Hello Jane'
});

```

The first email has been sent to `admin@example.org` with subject `"[DEBUG] - To: john.doe@example.com, Subject: john.doe@example.com"`

The second email has been delivered to recipient without modifications because `to` field is satisfied `options.passthrough`


## passthrough

#### String

```javascript
var nodemailer = require('nodemailer');
var trap = require('nodemailer-trap-plugin').trap;
var transporter = nodemailer.createTransport();

transporter.use('compile', trap({
  to: 'admin@example.org',
  passthrough: '@domain.com'
}));

```

#### Regex

```javascript
var nodemailer = require('nodemailer');
var trap = require('nodemailer-trap-plugin').trap;
var transporter = nodemailer.createTransport();

transporter.use('compile', trap({
  to: 'admin@example.org',
  passthrough: /.*?@domain\.com/
}));

```

#### Function

```javascript
var nodemailer = require('nodemailer');
var trap = require('nodemailer-trap-plugin').trap;
var transporter = nodemailer.createTransport();

transporter.use('compile', trap({
  to: 'admin@example.org',
  passthrough: function (toAddress) {
    return toAddress.indexOf('@domain.com') > -1;
  }
}));

```


## Release History

See the [CHANGELOG](/CHANGELOG.md).


## Contributors

See the [list of project's contributors!](CONTRIBUTORS.md)


## License

The MIT License (MIT)

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.

