
'use strict';

var express = require('express'),
	secure = require('secure'),
	request = require('supertest');

function injectProtocol(proto) {
	return function(req, res, next) {
		req.headers['x-forwarded-proto'] = proto;
		next();
	};
}

describe('secure', function() {

	beforeEach(function() {
		this.app = express();
		this.app.set('trust proxy', true);
	});

	it('should redirect when not secure', function(done) {
		this.app.use(injectProtocol('http'));
		this.app.use(secure());
		this.app.get('/', function(req, res) {
			res.status(200).send('foo');
		});
		request(this.app)
			.get('/')
			.expect(302)
			.end(done);
	});

	it('should pass when secure', function(done) {
		this.app.use(injectProtocol('https'));
		this.app.use(secure());
		this.app.get('/', function(req, res) {
			res.status(200).send('foo');
		});
		request(this.app)
			.get('/')
			.expect(200, 'foo')
			.end(done);
	});

	it('should include the correct location header', function(done) {
		this.app.use(injectProtocol('http'));
		this.app.use(secure());
		this.app.get('/', function(req, res) {
			res.status(200).send('foo');
		});
		request(this.app)
			.get('/foo?bar=4')
			.expect('Location', 'https://127.0.0.1/foo?bar=4')
			.end(done);
	});

	it('should include honor the host option', function(done) {
		this.app.use(injectProtocol('http'));
		this.app.use(secure({host: 'foobar:32'}));
		this.app.get('/', function(req, res) {
			res.status(200).send('foo');
		});
		request(this.app)
			.get('/foo?bar=4')
			.expect('Location', 'https://foobar:32/foo?bar=4')
			.end(done);
	});

});
