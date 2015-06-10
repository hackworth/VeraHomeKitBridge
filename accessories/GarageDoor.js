var types = require("../lib/HAP-NodeJS/accessories/types.js");
var request = require("request");


function GarageDoor(veraIP, device) {
  this.device = device;
  this.veraIP = veraIP;
  this.name = device.name;
}

function CorrectUrn(founddevice) {
    switch (founddevice.split(',')[2]) {
      case "urn:schemas-micasaverde-com:device:DoorLock:1":
        return "urn:micasaverde-com:serviceId:DoorLock1";
      break;
      case "urn:schemas-upnp-org:device:BinaryLight:1":
        return "urn:upnp-org:serviceId:SwitchPower1";
      break;
    }
}

GarageDoor.prototype = {

  onSetUnlocked: function(unlocked) {


    if (!unlocked) {
      console.log("Opening the " + this.device.name);
    } else {
      console.log("Closing the " + this.device.name);
    }

    var binaryState = unlocked ? 0 : 1;
    var self = this;

    request.get({ url: "http://" + self.veraIP + ":3480/data_request?id=finddevice&devnum=" + self.device.id },
                function (error, response, body) {
                  self.urn = CorrectUrn(body);
                  request.get({url: "http://" + self.veraIP + ":3480/data_request?id=lu_action&output_format=xml&DeviceNum=" + self.device.id + "&serviceId=" + self.urn + "&action=SetTarget&newTargetValue=" + binaryState},
                              function(err, response, body) {
                                if (!err && response.statusCode == 200) {
                                  if (!unlocked) {
                                    console.log("The " + self.device.name + " has been opened");
                                  } else {
                                    console.log("The " + self.device.name + " has been closed");
                                  }
                                } else {
                                  console.log("Error '" + err + "' opening/closing the " + self.device.name + ":  " + body);
                                }
                              }
                             );
                }
               );
  },

  /**
   *  This method is called when the user tries to identify this accessory
   */
  onIdentify: function(identify) {
    if (identify) {
      console.log("User wants to identify this accessory");
    } else {
      console.log("User is finished identifying this accessory");
    }
  },

  getServices: function() {
    var that = this;
    return [{

      sType: types.ACCESSORY_INFORMATION_STYPE,
      characteristics: [{
        cType: types.NAME_CTYPE,
        onUpdate: null,
        perms: ["pr"],
        format: "string",
        initialValue: "Garage Door Opener",
        supportEvents: false,
        supportBonjour: false,
        manfDescription: "Name of the accessory",
        designedMaxLength: 255
      },{
        cType: types.MANUFACTURER_CTYPE,
        onUpdate: null,
        perms: ["pr"],
        format: "string",
        initialValue: "Oltica",
        supportEvents: false,
        supportBonjour: false,
        manfDescription: "Manufacturer",
        designedMaxLength: 255
      },{
        cType: types.MODEL_CTYPE,
        onUpdate: null,
        perms: ["pr"],
        format: "string",
        initialValue: "Rev-1",
        supportEvents: false,
        supportBonjour: false,
        manfDescription: "Model",
        designedMaxLength: 255
      },{
        cType: types.SERIAL_NUMBER_CTYPE,
        onUpdate: null,
        perms: ["pr"],
        format: "string",
        initialValue: "A1S2NASF88EW",
        supportEvents: false,
        supportBonjour: false,
        manfDescription: "SN",
        designedMaxLength: 255
      },{
        cType: types.IDENTIFY_CTYPE,
        onUpdate: null,
        perms: ["pw"],
        format: "bool",
        initialValue: false,
        supportEvents: false,
        supportBonjour: false,
        manfDescription: "Identify Accessory",
        designedMaxLength: 1
      }]
    },{
      sType: types.GARAGE_DOOR_OPENER_STYPE,
      characteristics: [{
        cType: types.NAME_CTYPE,
        onUpdate: null,
        perms: ["pr"],
        format: "string",
        initialValue: "Garage Door Opener Control",
        supportEvents: false,
        supportBonjour: false,
        manfDescription: "Name of service",
        designedMaxLength: 255
      },{
        cType: types.CURRENT_DOOR_STATE_CTYPE,
        onUpdate: function(value) { console.log("Change:",value); execute("Garage Door", "Current State", value); },
        perms: ["pr","ev"],
        format: "int",
        initialValue: 0,
        supportEvents: false,
        supportBonjour: false,
        manfDescription: "BlaBla",
        designedMinValue: 0,
        designedMaxValue: 4,
        designedMinStep: 1,
        designedMaxLength: 1
      },{
        cType: types.TARGET_DOORSTATE_CTYPE,
        onUpdate: function(value) { that.onSetUnlocked(value); },
        //onUpdate: function(value) { console.log("Change:",value); execute("Garage Door", "Target State", value); },
        perms: ["pr","pw","ev"],
        format: "int",
        initialValue: 0,
        supportEvents: false,
        supportBonjour: false,
        manfDescription: "BlaBla",
        designedMinValue: 0,
        designedMaxValue: 1,
        designedMinStep: 1,
        designedMaxLength: 1
      },{
        cType: types.OBSTRUCTION_DETECTED_CTYPE,
        onUpdate: function(value) { console.log("Change:",value); execute("Garage Door", "Obstruction Detected", value); },
        perms: ["pr","ev"],
        format: "bool",
        initialValue: false,
        supportEvents: false,
        supportBonjour: false,
        manfDescription: "BlaBla",
      }]

    }]
  }
};

module.exports.initializeWithDevice = GarageDoor;
