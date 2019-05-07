/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

// Module dependencies
var express    = require('express'),
  bodyParser   = require('body-parser');

module.exports = function (app) {
  // When running in Bluemix add rate-limitation
  // and some other features around security
  if (process.env.VCAP_APPLICATION)
    require('./security')(app);

  // Setup static public directory
  app.use(express.static(__dirname + '/../app/public'));
  app.set('view engine', 'jade');
  app.set('views', __dirname + '/../app/views');

  app.use(bodyParser.urlencoded({ extended: true, limit: '1mb' }));
  app.use(bodyParser.json({ limit: '1mb' }));

  // Setup static public directory
  app.use(express.static(__dirname + '/../public'));

};
