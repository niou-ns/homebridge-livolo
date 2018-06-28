const { HomebridgePlatform } = require('homebridge-platform-helper');
// const { HomebridgeAccessory } = require('homebridge-platform-helper');

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
    super(log, config, homebridgeRef);
  }

  addAccessories (accessories) {
    const { config, log } = this;

    if (!config.accessories) config.accessories = []

    // Itterate through the config accessories
    config.accessories.forEach((accessory) => {
      accessories.push(new LivoloSwitch(log, accessory, config));
    })
  }
}

function LivoloSwitch(log, accessory, config)) {
    this.log = log;
    this.name = accessory.name;
    this.config = config;
    this.accessory = accessory;

    this.homebridgeService = new Service.Switch(this.name);
    this.homebridgeService.getCharacteristic(Characteristic.On)
        .on("get", this.getStatus.bind(this))
        .on("set", this.setStatus.bind(this));
}

LivoloSwitch.prototype = {


    getServices: () => {
        return [this.homebridgeService];
    },

    getStatus: () => {
      return true;
    },

    setStatus: () => {
      Livolo.open(this.config.pin, this.config.options);
      Livolo.sendButton(this.config.remoteId, this.accessory.buttonId);
      Livolo.close();
    }

    // resetSwitchWithTimeout: function () {
    //     this.log("Resetting switch to OFF");
    //     setTimeout(function () {
    //         this.homebridgeService.setCharacteristic(Characteristic.On, false);
    //     }.bind(this), 1000);
    //
    // }
}

LivoloPlatform.setHomebridge = (homebridge) => {
  homebridgeRef = homebridge
}

module.exports = LivoloPlatform
