const { HomebridgePlatform } = require('homebridge-platform-helper');

const Livolo = require('livolo');
const uuid = require('uuid');

let homebridgeRef;

module.exports = (homebridge) => {
  global.Service = homebridge.hap.Service;
  global.Characteristic = homebridge.hap.Characteristic;

  LivoloPlatform.setHomebridge(homebridge);

  homebridge.registerPlatform("homebridge-livolo", "Livolo", LivoloPlatform);
};

const LivoloPlatform = class extends HomebridgePlatform {

  constructor (log, config = {}) {

    if (config.debugMode === undefined) {
      config.debugMode = false;
    }
    if (config.pin === undefined) {
      config.pin = 11;
    }
    if (config.repeats === undefined) {
      config.repeats = 150;
    }
    if (config.remoteId === undefined) {
      config.remoteId = 7400;
    }

    Livolo.open(config.pin, { debugMode: config.debugMode, repeats: config.repeats });
    super(log, config, homebridgeRef);
  }

  addAccessories (accessories) {
    const { config, log } = this;

    if (!config.accessories) config.accessories = []
    config.accessories.forEach((accessory) => {
      accessories.push(new LivoloSwitch(log, config, accessory));
    })
  }
}


function LivoloSwitch(log, config, accessory) {
  this.log = log;
  this.name = accessory.name;
  this.config = config;
  this.accessory = accessory;
  this.buttonState = false;
  this.remoteId = accessory.remoteId ? accessory.remoteId : config.remoteId;
  this.buttonId = accessory.buttonId;
}

LivoloSwitch.prototype.getOn = function(callback) {
	callback(null, this.buttonState);
}

LivoloSwitch.prototype.setOn = function(on, callback) {
  Livolo.sendButton(this.remoteId, this.buttonId);
  this.buttonState = !this.buttonState;
	callback(null);
}

LivoloSwitch.prototype.getServices = function() {
	var homebridgeService = new Service.Switch(this.name);
	homebridgeService.getCharacteristic(Characteristic.On)
		.on('get', this.getOn.bind(this))
		.on('set', this.setOn.bind(this));
	return [homebridgeService];
}


LivoloPlatform.setHomebridge = (homebridge) => {
  homebridgeRef = homebridge
}
