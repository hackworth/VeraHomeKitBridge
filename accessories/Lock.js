var types = require("../lib/HAP-NodeJS/accessories/types.js");
var request = require("request");


function Lock(veraIP, device) {
	this.device = device;
	this.veraIP = veraIP;
	this.name = device.name;
}

Lock.prototype = {

	/**
	 *  This method is called when the lock is locked or unlocked
	 */
	onSetUnlocked: function(unlocked) {


		if (unlocked) {
			console.log("Unlocking the " + this.device.name);
		} else {
			console.log("Locking the " + this.device.name);
		}

		var binaryState = unlocked ? 0 : 1;
		var self = this;
		request.get({url: "http://" + this.veraIP + ":3480/data_request?id=lu_action&output_format=xml&DeviceNum=" + this.device.id + "&serviceId=urn:micasaverde-com:serviceId:DoorLock1&action=SetTarget&newTargetValue=" + binaryState},
			function(err, response, body) {
				if (!err && response.statusCode == 200) {
					if (unlocked) {
						console.log("The " + self.device.name + " has been unlocked");
					} else {
						console.log("The " + self.device.name + " has been locked");
					}
				} else {
					console.log("Error '" + err + "' locking/unlocking the " + self.device.name + ":  " + body);
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
        initialValue: "Lock",
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
      sType: types.LOCK_MANAGEMENT_STYPE,
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
        onUpdate: function(value) { that.onSetUnlocked(value); },
        perms: ["pw","pr","ev"],
        format: "bool",
        initialValue: false,
        supportEvents: false,
        supportBonjour: false,
        manfDescription: "Lock or unlock",
        designedMaxLength: 1
      },{
    	cType: types.LOCK_MANAGEMENT_CONTROL_POINT_CTYPE,
    	onUpdate: function(value) { console.log("Change:",value);  },
    	perms: ["pw"],
		format: "data",
		initialValue: 0,
		supportEvents: false,
		supportBonjour: false,
		manfDescription: "BlaBla",
		designedMaxLength: 255
    },{
    	cType: types.VERSION_CTYPE,
    	onUpdate: function(value) { console.log("Change:",value); },
    	perms: ["pr"],
		format: "string",
		initialValue: "1.0",
		supportEvents: false,
		supportBonjour: false,
		manfDescription: "BlaBla",
		designedMaxLength: 255
    }]
    }];
  }
};

module.exports.initializeWithDevice = Lock;
