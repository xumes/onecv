# node-red-contrib-cos

A <a href="http://nodered.org" target="_new">Node-RED</a> node to store, delete
and restore objects from the <a href="http://bluemix.net" target="_new">IBM
Bluemix</a> cloud object storage service.

## Install
-------

Run the following command in the root directory of your Node-RED install or home
directory (usually ~/.node-red) and will also install needed libraries.
```sh
        npm install node-red-contrib-cos
```

## Usage
-----

Provides a few nodes to easily manage the containers and objects for the <a
href="http://bluemix.net" target="_new">IBM Bluemix</a> Cloud Object Storage
service. You can specify the credentials from the Service if you run locally on
a device (e.g. Raspberry Pi with the provided credentials) or it will use the
VCAP_SERVICES.

This node helps to deliver images (up to 5MB) as a payload via the S3 REST API
Interface.

### COS Put

Saves the given object to the IBM Cloud Object Storage Service into the given
container. This also will create the container if not existing (with public
viewable rights).

### COS Get

Restores the object from the IBM Cloud Object Storage Service as a payload or a
local file.

### COS Delete

Deletes the given object of the given container from the IBM Cloud Object
Storage Service.
