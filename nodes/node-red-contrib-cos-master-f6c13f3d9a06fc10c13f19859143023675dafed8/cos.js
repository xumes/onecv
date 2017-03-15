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


module.exports = function(RED) {
    "use strict";

    // require any external libraries ....
    
    // Object Storage Get Node - Main Function
    function CloudObjectStorageGetNode(n) {
        // Create a RED node
        RED.nodes.createNode(this,n);

        // Store local copies of the node configuration (as defined in the .html)
        this.mode = n.mode;
        this.objectname = n.objectname;
        this.bucket = n.bucket;
        this.filename = n.filename;
        this.filepath = n.filepath;
        this.name = n.name;

        // Retrieve the Object Storage config node
        this.cosconfig = RED.nodes.getNode(n.cosconfig);

        // copy "this" object in case we need it in context of callbacks of other functions.
        var node = this;

        // Check if the Config to the Service is given 
        if (this.cosconfig) {
            // Do something with:
            node.status({fill:"green",shape:"ring",text:"ready"});
        } else {
            // No config node configured
	    node.status({fill:"red",shape:"ring",text:"error"});
	    node.error('Object Storage get (err): No object storage configuration found!');
	    return;
        }

        // respond to inputs....
        this.on('input', function (msg) {
            // Local Vars and Modules
	    var ObjectStore = require('./lib/CloudObjectStorage');
            var fsextra = require("fs-extra");
            var fs = require("fs");
            var localdir = __dirname;
            var uuid = require('node-uuid').v4();

            var mode;
	    var filename;
	    var filepath;
	    var objectname; 
	    var filefqn;
	    var bucket;

	    // Help Debug
	    console.log('CloudObjectStorage Get (log): Init done');

	    // Set the status to green
            node.status({fill:"green",shape:"dot",text:"connected"});
            
	    // Check mode
            if ((msg.mode) && (msg.mode.trim() !== "")) {
         	mode = msg.mode;
            } else {
         	if (node.mode) {
         	    mode = node.mode;
         	} else {
         	    mode = "1";
         	}
            }

            // Check ObjectName 
            if ((msg.objectname) && (msg.objectname.trim() !== "")) {
         	objectname = msg.objectname;
            } else {
     		objectname = node.objectname;
            }

            // Check Filename
            if ((msg.filename) && (msg.filename.trim() !== "")) {
         	filename = msg.filename;
            } else {
     		filename = node.filename;
            }

	    // Check filepath
            if ((msg.filepath) && (msg.filepath.trim() !== "")) {
         	filepath = msg.filepath;
            } else {
         	if (node.filepath) {
         	    filepath = node.filepath;
         	} else {
         	    filepath = localdir;
         	}
            }

            // Set FQN for this file
     	    filefqn = filepath + filename;
            
 	    // Check bucket
            if ((msg.bucket) && (msg.bucket.trim() !== "")) {
         	bucket = msg.bucket;
            } else {
         	if (node.bucket) {
         	    bucket = node.bucket;
         	} else {
         	    bucket = "Pictures";
         	}
            }
            
     	    // Enable the Object Storage Service Call
     	    var os = new ObjectStore(node.cosconfig.key, node.cosconfig.secret, node.cosconfig.endpoint, bucket);

            // mode is buffermode or filebased
	    if (mode == "0") {
	        // If File exists with objectname - write to file the content 
		var sess = os.existsFile(objectname);
		sess.then(function(r) {
		    if (r === true) {
			var getsess = os.downloadFile(objectname);
		        getsess.then(function (r) {
		    	    // Download into new File 
		    	    var opt = {
		    		encoding : null
		    	    };
		    	    fs.writeFileSync(filefqn, r.body, opt);
		    	    msg.payload = filefqn;
		    	    msg.objectname = objectname;
		    	    
		    	    // Set the node-status
		    	    node.status({fill:"green",shape:"ring",text:"ready"});

		    	    // Send the output back 
		    	    node.send(msg);
		        });
		    } else {
	    		// Send error back 
	    	        node.error("objstore store get (err): Object not found", msg);	        		
		    }
		});
		
		// console log
		console.log('objstore store get (log): write into file - ', filefqn);
	    } else {
		// store the obj directly from msg.payload
		// var buf = new Buffer(msg.payload, "binary");	 
	        
	        // If File exists with objectname - write to file the content 
		var sess = os.existsFile(objectname);
		sess.then(function(r) {
		    if (r === true) {
                        var getsess = os.downloadFile(objectname);
		        getsess.then(function (r) {
		            msg.objectname = objectname;
		    	    msg.payload = r.body;
		    	    console.log('objectstore get (log): object loaded');
		    	    
		    	    // Set the node-status
		    	    node.status({fill:"green",shape:"ring",text:"ready"});

		    	    // Send the output back 
		    	    node.send(msg);
		        });
		    } else {
	    		// Send error back 
	    	        node.error("objstore store get (err): Object not found", msg);	        		
		    }
		}, function (error) { console.log(error); });		        
		// console log
		console.log('objstore store get (log): write into msg.payload');
	    }
        });

        // respond to close....
        this.on("close", function() {
            // Called when the node is shutdown - eg on redeploy.
            // Allows ports to be closed, connections dropped etc.
            // eg: node.client.disconnect();
        });
    }
    RED.nodes.registerType("cos-get",CloudObjectStorageGetNode);

    // Object Storage Put Node - Main Function
    function CloudObjectStoragePutNode(n) {
        // Create a RED node
        RED.nodes.createNode(this,n);

        // Store local copies of the node configuration (as defined in the .html)
        this.filename = n.filename;
        this.mode = n.mode;
        this.formattype = n.formattype;
        this.audioformat = n.audioformat;
        this.imageformat = n.imageformat;
        this.filepath = n.filepath;
        this.objectmode = n.objectmode;
        this.objectname = n.objectname;
        this.bucket = n.bucket;
        this.name = n.name;

        // Retrieve the Object Storage config node
        this.cosconfig = RED.nodes.getNode(n.cosconfig);

        // copy "this" object in case we need it in context of callbacks of other functions.
        var node = this;

        // Check if the Config to the Service is given 
        if (this.cosconfig) {
            // Do something with:
            node.status({fill:"green",shape:"ring",text:"ready"});
        } else {
            // No config node configured
	    node.status({fill:"red",shape:"ring",text:"error"});
	    node.error('Object Storage Put (err): No object storage configuration found!');
	    return;
        }

        // respond to inputs....
        this.on('input', function (msg) {
            // Local Vars and Modules
	    var ObjectStore = require('./lib/CloudObjectStorage');
            var fsextra = require("fs-extra");
            var fs = require("fs");
            var localdir = __dirname;
            var uuid = require('node-uuid').v4();

            var mode;
            var formattype;
	    var filename;
	    var filepath;
	    var audioformat;
	    var imageformat;
	    var fileformat;
	    var objectname; 
	    var filefqn;
	    var bucket;
	    var objectmode;
	    var mimetype;

	    // Set the status to green
            node.status({fill:"green",shape:"dot",text:"connected"});
            
	    // Check mode
            if ((msg.mode) && (msg.mode.trim() !== "")) {
         	mode = msg.mode;
            } else {
         	if (node.mode) {
         	    mode = node.mode;
         	} else {
         	    mode = "1";
         	}
            }

            // Check if audio or file to set right format
            if ((msg.formattype) && (msg.formattype.trim() !== "")) {
         	if (formattype == "0") {         			
                    // Check fileformat
                    if ((msg.imageformat) && (msg.imageformat.trim() !== "")) {
                 	imageformat = msg.imageformat;
                    } else {
                 	if (node.imageformat) {
                 	    imageformat = node.imageformat;
                 	} else {
                 	    imageformat = "jpeg";
                 	}
                    }
                    fileformat = imageformat;
         	} else {         			
                    // Check audioformat
                    if ((msg.audioformat) && (msg.audioformat.trim() !== "")) {
                 	audioformat = msg.audioformat;
                    } else {
                 	if (node.audioformat) {
                 	    audioformat = node.audioformat;
                 	} else {
                 	    audioformat = "jpeg";
                 	}
                    }
                    fileformat = audioformat;
         	}
            }

            // Check Filename
            if ((msg.filename) && (msg.filename.trim() !== "")) {
         	filename = msg.filename;
            } else {
         	if (node.filename) {
         	    filename = node.filename;
         	} else {
         	    if (fileformat == 'jpeg') {
         		filename = "pic_" + uuid + '.jpg';         				
         	    } else {
         		filename = "pic_" + uuid + '.' + fileformat;         				         				
         	    }
         	}
            }

	    // Check filepath
            if ((msg.filepath) && (msg.filepath.trim() !== "")) {
         	filepath = msg.filepath;
            } else {
         	if (node.filepath) {
         	    filepath = node.filepath;
         	} else {
         	    filepath = localdir;
         	}
            }
            
            // Set the right mime-format
            if (formattype == "0") {         		
             	mimetype = 'image/' + fileformat;
            } else {
             	mimetype = 'audio/' + fileformat;
            }

            // Set FQN for this file
     	    filefqn = filepath  + filename;

            // Check objectmode
            if ((msg.objectmode) && (msg.objectmode.trim() !== "")) {
         	objectmode = msg.objectmode;
            } else {
         	if (node.objectmode) {
         	    objectmode = node.objectmode;
         	} 
            }
            
            // Check objectname and define against objectmode
            if (objectmode == "0") {
     		objectname = filename;
            } else if (objectmode == "1") {
         	if (formattype == "0") {
         	    objectname = "pic_" + uuid + '.jpg';         		         		         			
         	} else {
         	    objectname = "audio_" + uuid + '.wav';         		         		
         	}
            } else {
             	if ((msg.objectname) && (msg.objectname.trim() !== "")) {
             	    objectname = msg.objectname;
             	} else {
             	    if (node.objectname) {
             		objectname = node.objectname;
             	    } else {
             		if (formattype == "0") {
			    objectname = "image_" + uuid + '.jpg';
             		} else {
                 	    objectname = "audio_" + uuid + '.wav';
             		}
             	    }
             	}
            }

 	    // Check bucket
            if ((msg.bucket) && (msg.bucket.trim() !== "")) {
         	bucket = msg.bucket;
            } else {
         	if (node.bucket) {
         	    bucket = node.bucket;
         	} else {
         	    if (formattype == "0") {
             		bucket = "Image";         				
         	    } else {
             		bucket = "Audio";         				
         	    }
         	}
            }
            
     	    // Enable the Object Storage Service Call
     	    var os = new ObjectStore(node.cosconfig.key, node.cosconfig.secret, node.cosconfig.endpoint, bucket);
     	    
            // mode is buffermode or filebased
	    if (mode == "0") {
	        // Upload from File 
		var readStream = fs.createReadStream(filefqn);
		
		// get Filesize
		var stats = fs.statSync(filefqn);
		var fileSizeInBytes = stats['size'];
		
		var sess = os.uploadFile(objectname, mimetype, readStream, fileSizeInBytes);
		sess.then(function(url){
			console.log('objstore store put (log): Url to uploaded file:', url);

			// Provide the needed Feedback
			msg.payload = msg.file;
			msg.objectname = objectname;
			msg.filefqn = filefqn;
			msg.url = url;
			
			// Set the node-status
			node.status({fill:"green",shape:"ring",text:"ready"});
			
		        // Send the output back 
		        node.send(msg);
		});

		// console log
		console.log('objstore store put (log): write - ', filefqn);
	    } else {
		// store the obj directly from msg.payload
		var buf = new Buffer(msg.payload, "binary");	 
	        
		var sess = os.uploadFile(objectname, mimetype, buf, buf.length);
		sess.then(function(url){
			console.log('objstore store put (log): Url to uploaded file:', url);

			// Provide the needed Feedback
			msg.payload = msg.file;
			msg.objectname = objectname;
			msg.filefqn = filefqn;
			msg.url = url;

			// Set the node-status
			node.status({fill:"green",shape:"ring",text:"ready"});
			
		        // Send the output back 
		        node.send(msg);
		    });
	    }
        });

        // respond to close....
        this.on("close", function() {
            // Called when the node is shutdown - eg on redeploy.
            // Allows ports to be closed, connections dropped etc.
            // eg: node.client.disconnect();
        });
    }
    RED.nodes.registerType("cos-put",CloudObjectStoragePutNode);

    // Object Storage Del Node - Main Function
    function CloudObjectStorageDelNode(n) {
        // Create a RED node
        RED.nodes.createNode(this,n);

        // Store local copies of the node configuration (as defined in the .html)
        this.objectname = n.objectname;
        this.bucket = n.bucket;
        this.name = n.name;

        // Retrieve the Object Storage config node
        this.cosconfig = RED.nodes.getNode(n.cosconfig);

        // copy "this" object in case we need it in context of callbacks of other functions.
        var node = this;

        // Check if the Config to the Service is given 
        if (this.cosconfig) {
            // Do something with:
            node.status({fill:"green",shape:"ring",text:"ready"});
        } else {
            // No config node configured
	    node.status({fill:"red",shape:"ring",text:"error"});
	    node.error('Object Storage Del (err): No object storage configuration found!');
	    return;
        }

        // respond to inputs....
        this.on('input', function (msg) {
            // Local Vars and Modules
	    var ObjectStore = require('./lib/CloudObjectStorage');

	    var objectname; 
	    var bucket;

	    // Set the status to green
            node.status({fill:"green",shape:"dot",text:"connected"});         	
            
            // Check ObjectName
            if ((msg.objectname) && (msg.objectname.trim() !== "")) {
	        objectname = msg.objectname;
            } else {
	        objectname = node.objectname;
            }

 	    // Check bucket
            if ((msg.bucket) && (msg.bucket.trim() !== "")) {
         	bucket = msg.bucket;
            } else {
         	if (node.bucket) {
         	    bucket = node.bucket;
         	} else {
         	    bucket = "Pictures";
         	}
            }
            
     	    // Enable the Object Storage Service Call
     	    var os = new ObjectStore(node.cosconfig.key, node.osconfig.secret, node.osconfig.endpoint, bucket);
     	    
	    // Delete the file if exists    
	    var sess = os.existsFile(objectname);
	    sess.then(function() {
	        console.log('Object Storage Del (log): file exists:', objectname);
	        return os.deleteFile(objectname);
	    })
	        .then(function(res){
	            console.log('Object Storage Del (log): file deleted:', objectname);
	        });

            node.status({fill:"green",shape:"ring",text:"ready"});

            // console log
	    
            // Send the output back - here no feedback
            // node.send(msg);
        });

        // respond to close....
        this.on("close", function() {
            // Called when the node is shutdown - eg on redeploy.
            // Allows ports to be closed, connections dropped etc.
            // eg: node.client.disconnect();
        });
    }
    RED.nodes.registerType("cos-del",CloudObjectStorageDelNode);

    // Object Storage Config Node
    function CloudObjectStorageConfigNode(n) {
        // Create a RED node
	RED.nodes.createNode(this,n);
	

	// Store local copies of the node configuration (as defined in the .html)
	this.key = n.key;
	this.secret = n.secret;
	this.endpoint = n.endpoint;		
	this.name = n.name;
    }
    RED.nodes.registerType("cos-config",CloudObjectStorageConfigNode);
};
