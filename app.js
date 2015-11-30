var fs = require('fs');
var path = require('path');
var storage = require('node-persist');
storage.initSync();
var crypto = require('crypto');
var request = require("request");
var _ = require('underscore');
var portfinder = require('portfinder');

var configPath = path.join(__dirname, "config.json");
var config = JSON.parse(fs.readFileSync(configPath));
var _veraIP = config.VeraIP;

console.log("Starting Vera HomeKit Bridge...");
getVeraDevices(_veraIP);

function getVeraDevices(veraIP) {
  var url = "http://" + veraIP + ":3480/data_request?id=lu_sdata"

  request({ url: url, json: true },
          function (error, response, body) {
            processDevices(body.devices);
            processScenes(body.scenes);
          }
         );
}

function processScenes(scenes) {
  scenes.forEach(function(scene) {
    if (scene.name.indexOf(" - Off") == -1){
      offScene = _.find(scenes, function(offScene){ return offScene.name == scene.name.replace(" - On", " - Off")});
      createScene(scene, offScene);
    }
  });
}

function processDevices(devices) {
  devices.forEach(function(device) {
    switch (device.category) {
      case 2: // CATEGORY #2 - Dimmable Light:
        createDimmableLight(device);
      break;

      case 3: // CATEGORY #3 - Switch
        if (config.GarageDoors.indexOf(device.name) > -1 ) {
          createGarageDoor(device);
        } else {
          createLight(device);
        }
      break;

      case 7: // CATEGORY #7 - Door lock
        if (config.GarageDoors.indexOf(device.name) > -1 ) {
          createGarageDoor(device);
        } else {
          createLock(device);
        }
      break;
      case 8: // CATEGORY #2 - Window Covering (They act just like a dimmable light):
        createDimmableLight(device);
      break;
    }
  });
}

function createScene(scene, offScene) {
  var Scene = require("./accessories/Scene.js");
  var accessory = new Scene.initializeWithDevice(_veraIP, scene, offScene);
  createHomeKitAccessory(accessory);
}

function createDimmableLight(device) {
  var DimmableLight = require("./accessories/DimmableLight.js");
  var accessory = new DimmableLight.initializeWithDevice(_veraIP, device);
  createHomeKitAccessory(accessory);
}

function createLight(device) {
  var Light = require("./accessories/Light.js");
  var accessory = new Light.initializeWithDevice(_veraIP, device);
  createHomeKitAccessory(accessory);
}

function createLock(device) {
  var Lock = require("./accessories/Lock.js");
  var accessory = new Lock.initializeWithDevice(_veraIP, device);
  createHomeKitAccessory(accessory);
}

function createGarageDoor(device) {
  var GarageDoor = require("./accessories/GarageDoor.js");
  var accessory = new GarageDoor.initializeWithDevice(_veraIP, device);
  createHomeKitAccessory(accessory);
}

// Pull in required HAP-NodeJS stuff
var accessory_Factor = new require("./lib/HAP-NodeJS/lib/Accessory.js");
var accessory_Loader = new require("./lib/HAP-NodeJS/lib/AccessoryLoader.js");
var service_Factor = new require("./lib/HAP-NodeJS/lib/Service.js");
var characteristic_Factor = new require("./lib/HAP-NodeJS/lib/Characteristic.js");

var nextServer = 0;
var accessoryServers = [];
var usernames = {};

function createHomeKitAccessory(accessory) {

  var name = accessory.name;
  // create a unique "username" for this accessory based on the default display name
  var username = createUsername(name);
  if (usernames[username]) {
    console.log("Cannot create another accessory with the same name '" + name + "'. The 'name' property must be unique for each accessory.");
    return;
  }

  // remember that we used this name already
  usernames[username] = name;
  var pincode = config.PIN;

  //to be loaded by new accessory loader
  var accessoryJSON = {};
  accessoryJSON["displayName"] = accessory.name;
  accessoryJSON["username"] = username;
  accessoryJSON["pincode"] = pincode;

  var services = accessory.getServices();
  accessoryJSON["services"] = services;

  console.log("Create accessory: " + accessory.name);

  portfinder.basePort = 51826
  portfinder.getPort(function (err,port) {

    var accessory = accessory_Loader.parseAccessoryJSON(accessoryJSON);
    accessoryServers[nextServer] = accessory;
    accessory.publish({
      port: parseInt(port),
      username: accessory.username,
      pincode: accessory.pincode
    });
  });

  nextServer++;
}
//
// Creates a unique "username" for HomeKit from a hash of the given string
function createUsername(str) {

  // Hash str into something like "098F6BCD4621D373CADE4E832627B4F6"
  var hash = crypto.createHash('md5').update(str).digest("hex").toUpperCase();

  // Turn it into a MAC-address-looking "username" for HomeKit
  return hash[0] + hash[1] + ":" +
    hash[2] + hash[3] + ":" +
    hash[4] + hash[5] + ":" +
    hash[6] + hash[7] + ":" +
    hash[8] + hash[9] + ":" +
    hash[10] + hash[11];
}
