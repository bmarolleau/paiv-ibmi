# express-secure-only

Express middleware to ensure you're running over HTTPS.

![build status](http://img.shields.io/travis/izaakschroeder/express-secure-only.svg?style=flat)
![coverage](http://img.shields.io/coveralls/izaakschroeder/express-secure-only.svg?style=flat)
![license](http://img.shields.io/npm/l/express-secure-only.svg?style=flat)
![version](http://img.shields.io/npm/v/express-secure-only.svg?style=flat)
![downloads](http://img.shields.io/npm/dm/express-secure-only.svg?style=flat)

Features:
 * Redirect requests to their HTTPS equivalents

```javascript
var express = require('express'),
	secure = require('express-secure-only'),
	app = express();

app.use(secure());
app.get('/', function(req, res) {
	res.status(200).send('Hello world.');
});
app.listen();
```

Usage with a custom host or port:

```javascript

app.use(secure({
    host: 'localhost:3001'
}));

```