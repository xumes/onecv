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
 *
 * Implements the Cloud Object Storage Class for communication
 **/

'use strict'; 
var knox = require('knox');
var Promise = require('bluebird');

// Constructor for new ObjectStorage
function CloudObjectStorage (key, secret, endpoint, bucket) {
        this.client = knox.createClient({
	    key: key,
	    secret: secret,
	    endpoint: endpoint,
	    bucket: bucket
	});
}

// Method to check if a File exists
CloudObjectStorage.prototype.existsFile  = function (filename) {
    var cos = this;
    return new Promise(function(resolve, reject) {
	console.log("Cos.client:", cos.client);
	cos.client.headFile(filename, function(err, res) {
	    console.log("filename=", filename);
	    if (res.statusCode === 200) {
		console.log("Success");
		console.log("Headers:\n", res.headers);
		resolve(true);
	    } else {
		console.error("failed status=", res.statusCode);
	    }
	});
    });
};
  
//Method to delete File if it exists
CloudObjectStorage.prototype.deleteFile  = function (filename) {
    var cos = this;
    return new Promise(function(resolve, reject) {
	cos.client.deleteFile(filename, function (err, res) {
	    if (res.statusCode === 204)
		resolve(true);
	});
    });
};
	
// Method to upload a file to a container
CloudObjectStorage.prototype.uploadFile = function (filename, mimetype, buffer, size){
    var cos = this;
    return new Promise(function(resolve, reject) {
	var req = cos.client.put(filename, {
	    'Content-Length': size
	    , 'Content-Type': mimetype
	});
	
	buffer.pipe(req);
	
	req.on('response', function(res) {
	    if (200 == res.statusCode) {
		console.log('saved, url: ' + req.url);
		resolve(req.url);
	    } else {
		console.log('error: ' + res.statusCode);
	    }
	});
    });
};

// Method to download a file from a Container
CloudObjectStorage.prototype.downloadFile = function (filename) {
    var cos = this;
    return new Promise(function(resolve, reject) {
	var buffers = [];
	var response;

	cos.client.get(filename).on('response', function(res) {
	    response = res;
	    console.log(res.statusCode);
	    console.log(res.headers);
	    res.on('data', function(chunk) {
		buffers.push(chunk);
	    });
	    
	    res.on('end', function(chunk) {
		var ret = {
    		    "filename" : filename,
    		    "type" : response.headers['content-type'],
    		    "length" : response.headers['content-length'],
		    "body" : Buffer.concat(buffers)
		};
		resolve(ret);
	    });
	}).end();
    });
};


// Export the Class
module.exports = CloudObjectStorage;
