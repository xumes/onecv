/**
 * Copyright 2016 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Authors: Olaf Hahn, Harald Seipp
 **/
var CloudObjectStorage = require('./lib/CloudObjectStorage');
var fsextra = require("fs-extra");
var fs = require("fs");
var localdir = __dirname;
var creds = require('../cos-js/credentials.json');
var cos = new CloudObjectStorage(creds.key, creds.secret, creds.endpoint, "hs-almaden-test");
var objectname = "test_upload.txt";
var bucket = "test";

var sess = cos.existsFile(objectname);
sess.then(function(r) {
    if (r === true) {
	var getsess = cos.deleteFile(objectname);
	getsess.then(function (r) {
	    if (r === true) {
              console.error("Deleted: ", objectname);
            } else {
              console.error("Error deleting: ", objectname);
           }
	});
    } else {
	// Send error back 
	console.error("objstore store delete (err): Object not found", objectname);
    }
});

