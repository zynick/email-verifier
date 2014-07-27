'use strict';
/* jshint node: true */

var request = require('request');
var _       = require('underscore');


// get input email
var email = process.argv[2];


// get token
request('http://verify-email.org', function (error, response, body) {
  if (error || response.statusCode !== 200) {
    return console.log('ops error');
  }

  // process cookie
  var cookie = response.headers['set-cookie'];
      cookie = cookie[0].split(';')[0]; // super hard code!

  var lines = body.split('\n');

  _.each(lines, function (line) {
    if (line.indexOf('input type="hidden"') > 0) {
      var chunks = line.split('"');

      _.each(chunks, function (chunk) {
        if (chunk.length === 32) {
          return call(cookie, chunk);
        }
      });
    }
  });
});


function call(cookie, token) {

  var options = {
    url: 'http://verify-email.org/index.php?check=' + encodeURIComponent(email) + '&option=com_emailverifier&view=emailverifier&layout=verify&format=raw&' + token + '=1&submitEmail=Verify',
    headers: {
      Cookie: cookie
    }
  };

  request(options, function (error, response, body) {
    if (error || response.statusCode !== 200) {
      return console.log('ops second error');
    }

    var lines = body.split('\n');

    _.each(lines, function (line) {
      if (line.indexOf('Result: ') > 0) {
        var value = line.split('Result: ')[1].split('<')[0]; // super hard code x2!!
        console.log(value);
      }
    });

    var start = body.indexOf('<pre>');
    if (start > 0) {
      start += 5;
      var end = body.indexOf('</pre>');
      var length = end - start;
      
      var data = body.substr(start, length);
          data = data.replace('/<br/>/g', '\n');
          data = decodeURIComponent(data);
          data = _.unescape(data);
      
      console.log(data);
    } else {
      console.log(body);
    }
    
  });
}