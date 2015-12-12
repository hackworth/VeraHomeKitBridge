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
  onSetUnlocked: function(locked) {
	if (locked) {
	console.log("Unlocking the " + this.device.name);
	} else {
	console.log("locking the " + this.device.name);
	}

		var binaryState = locked ? 1 : 0;
		var self = this;

		request.get({url: "http://" + this.veraIP + ":3480/data_request?id=lu_action&output_format=xml&DeviceNum=" + this.device.id + "&serviceId=urn:micasaverde-com:serviceId:DoorLock1&action=SetTarget&newTargetValue=" + binaryState},
			
               function(err, response, body) {
			if (!err && response.statusCode == 200) {
				if (locked) {
				console.log("The " + self.device.name + " has been locked");
				} else {
                        	console.log("The " + self.device.name + " has been unlocked")
				}
				} else {
				console.log("Error '" + err + "' locking/unlocking the " + self.device.name + ":  " + body);
				}
			}
		)
	},

    onLockStateRead: function(callback) {

        console.log("Reading status on " + this.device.name);
        
        var self = this;
        
        request.get({url: "http://" + this.veraIP + ":3480/data_request?id=variableget&output_format=xml&DeviceNum=" + this.device.id + "&serviceId=urn:micasaverde-com:serviceId:DoorLock1&Variable=Status"},
            function(err, response, body) {
                if (!err && response.statusCode == 200) {
                    var locked = parseInt(body) == 1;
                    console.log("Read: Door is currently "+ locked ? "locked." : "unlocked.");
                    callback(locked);
                } else {
                    console.log("Error '" + err + "' turning the " + self.device.name + " on/off:  " + body);
                }
            }
        )
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

    /**
     *  This method is called when the user wants to read the state of this accessory
     */

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
      sType: types.LOCK_MECHANISM_STYPE,
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
     },{
        cType: types.CURRENT_LOCK_MECHANISM_STATE_CTYPE,
        onUpdate: function(value) { that.onSetUnlocked(value); },
        onRead: function(callback) { that.onLockStateRead(callback); },
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
        cType: types.TARGET_LOCK_MECHANISM_STATE_CTYPE,
        onUpdate: function(value) { that.onSetUnlocked(value); },
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
    }]
  }
};

module.exports.initializeWithDevice = Lock;
