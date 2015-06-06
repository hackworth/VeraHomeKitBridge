var types = require("../lib/HAP-NodeJS/accessories/types.js");
var request = require("request");


function Scene(veraIP, device, offScene) {
	this.device = device;
	this.veraIP = veraIP;
	this.name = device.name.replace(" - On", "");
  this.offScene = offScene || 0
}

Scene.prototype = {

	onSetPowerState: function(powerOn) {

		if (powerOn) {
			console.log("Turning on the " + this.name + " scene");
		} else {
			console.log("Turning off the " + this.name + " scene");
		}

		var binaryState = powerOn ? 1 : 0;
		var self = this;
    sceneID = this.device.id;
    if (this.offScene) {
      if (!binaryState) {
        sceneID = this.offScene.id;
      }
    }
		request.get({url: "http://" + this.veraIP + ":3480/data_request?id=action&serviceId=urn:micasaverde-com:serviceId:HomeAutomationGateway1&action=RunScene&SceneNum=" + sceneID},
			function(err, response, body) {
				if (!err && response.statusCode == 200) {
					if (powerOn) {
						console.log("The " + self.name + " scene has been turned on");
					} else {
						console.log("The " + self.name + " scene has been turned off");
					}
				} else {
					console.log("Error '" + err + "' turning the " + this.name + " on/off:  " + body);
				}
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
        initialValue: this.name,
        supportEvents: false,
        supportBonjour: false,
        manfDescription: "Name of the accessory",
        designedMaxLength: 255
      },{
        cType: types.MANUFACTURER_CTYPE,
        onUpdate: null,
        perms: ["pr"],
        format: "string",
        initialValue: "Z-Wave",
        supportEvents: false,
        supportBonjour: false,
        manfDescription: "Manufacturer",
        designedMaxLength: 255
      },{
        cType: types.MODEL_CTYPE,
        onUpdate: null,
        perms: ["pr"],
        format: "string",
        initialValue: "Scene",
        supportEvents: false,
        supportBonjour: false,
        manfDescription: "Model",
        designedMaxLength: 255
      },{
        cType: types.SERIAL_NUMBER_CTYPE,
        onUpdate: null,
        perms: ["pr"],
        format: "string",
        initialValue: "" + this.device.id,
        supportEvents: false,
        supportBonjour: false,
        manfDescription: "SN",
        designedMaxLength: 255
      },{
        cType: types.IDENTIFY_CTYPE,
        onUpdate: function(value) { that.onIdentify(value); },
        perms: ["pw"],
        format: "bool",
        initialValue: false,
        supportEvents: false,
        supportBonjour: false,
        manfDescription: "Identify Accessory",
        designedMaxLength: 1
      }]
    },{
      sType: types.SWITCH_STYPE,
      characteristics: [{
        cType: types.NAME_CTYPE,
        onUpdate: null,
        perms: ["pr"],
        format: "string",
        initialValue: this.name,
        supportEvents: false,
        supportBonjour: false,
        manfDescription: "Name of service",
        designedMaxLength: 255
      },
      {
        cType: types.POWER_STATE_CTYPE,
        onUpdate: function(value) { that.onSetPowerState(value); },
        perms: ["pw","pr","ev"],
        format: "bool",
        initialValue: false,
        supportEvents: false,
        supportBonjour: false,
        manfDescription: "Change the power state",
        designedMaxLength: 1
      }]
    }];
  }
};

module.exports.initializeWithDevice = Scene;
