
# The Nodemailer plugin to intercept emails for non production environments

[![Build Status](https://travis-ci.org/killmenot/nodemailer-trap-plugin.svg?branch=master)](https://travis-ci.org/killmenot/nodemailer-trap-plugin)
[![Build Status](https://travis-ci.org/killmenot/nodemailer-trap-plugin.svg?branch=master)](https://travis-ci.org/killmenot/nodemailer-trap-plugin)

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

Where

  * **options**
      * **to** - the email address used to send emails to. Default: `''`
      * **subject** - the subject formatted. Default: `'[DEBUG] - To: {0}, Subject: {1}'`

## Example

```javascript
var nodemailer = require('nodemailer');
var trap = require('nodemailer-trap-plugin').trap;
var transporter = nodemailer.createTransport();

transporter.use('compile', trap({
    to: 'admin@example.org'
}));
transporter.sendMail({
    from: 'jane.doe@example.org',
    to: 'john.doe@example.com',
    subject: 'Hello John'
});
```

## License

**MIT**
