'use strict';
/* global Module */

/* Magic Mirror
 * Module: MMM-mqtt
 *
 * By Javier Ayala http://www.javierayala.com/
 * MIT Licensed.
 */

Module.register('MMM-mqtt', {

  //mqtt://test.mosquitto.org can be used as a test server
  //'mqtt://172.20.10.3' // PI = mqtt server for IOT
  defaults: {
    mqttServer: 'mqtt://172.20.10.10',
    mode: 'send',    
    topic: 'coffee/snder', // sub topic - for pub topics look below
    interval: 300000,				
    postText: '',
    loadingText: 'loading MQTT..',
    showTitle: false,
    title: 'MQTT Data'    
  },

  start: function() {
    Log.info('Starting module: ' + this.name);
    this.loaded = false;
    this.mqttVal = '';
    this.updateMqtt(this);
  },

  updateMqtt: function(self) {
    self.sendSocketNotification('MQTT_SERVER', { mqttServer: self.config.mqttServer, topic: self.config.topic, mode: self.config.mode });
    setTimeout(self.updateMqtt, self.config.interval, self);
  },

  getDom: function() {
    var wrapper = document.createElement('div');

    if (!this.loaded) {
      wrapper.innerHTML = this.config.loadingText;
      return wrapper;
    }

    if (this.config.showTitle) {
      var titleDiv = document.createElement('div');
      titleDiv.innerHTML = this.config.title;
      wrapper.appendChild(titleDiv);
    }

    var mqttDiv = document.createElement('div');
    mqttDiv.innerHTML = this.mqttVal.toString().concat(this.config.postText);
    wrapper.appendChild(mqttDiv);

    return wrapper;
  },

  socketNotificationReceived: function(notification, payload) {
    if (notification === 'MQTT_DATA' && payload.topic === this.config.topic) {
      //console.log("mode: ",this.config.mode);
      this.mqttVal = payload.data.toString();
      this.loaded = true;
      this.updateDom();
    }

    if (notification === 'ERROR') {
      this.sendNotification('SHOW_ALERT', payload);
    }
  },

  notificationReceived: function(notification, payload, sender) {
    var self = this;

    if (self.config.mode !== "send") {
      return;
    }

    var topic;
    if (sender) {
      Log.log(this.name + " received a module notification: " + notification + " from sender: " + sender.name + ": ", payload);
    } else {
      Log.log(this.name + " received a system notification: " + notification + ": ", payload);
    }
    topic = this.config.topic;

    // STOP ALARM OR SET COFFEE VOICE COMMAND = SEND START COFFEE
    if (notification === "STOP_ALARM" || notification === "SET_COFFEE"){
      console.log("Sending mqtt to topic: coffee/snder on server "+self.config.mqttServer);
      Log.log("Sending mqtt to topic:'coffee/snder on server "+self.config.mqttServer);

      this.sendSocketNotification("MQTT_SEND", {
        mqttServer: self.config.mqttServer,
        topic: "coffee/snder",
        payload: "ReadVlotter"
      });

      this.sendSocketNotification("MQTT_SEND", {
        mqttServer: self.config.mqttServer,
        topic: "coffee/snder",
        payload: "MakeCoffee"
      });

      this.mqttVal = "Setting coffee";
      this.loaded = true;
      this.updateDom();
    }

    // LIGHTS ON = SEND LIGHTS ON
    if (notification === "LIGHTS_ON"){
      console.log("Sending mqtt to topic: lights/snder"+" on server "+self.config.mqttServer);
      Log.log("Sending mqtt to topic: lights/snder"+" on server "+self.config.mqttServer);

      this.sendSocketNotification("MQTT_SEND", {
        mqttServer: self.config.mqttServer,
        topic: "lights/snder",
        payload: "LightsOn"
      });

      this.mqttVal = "Lights on";
      this.loaded = true;
      this.updateDom();
    }

    // START ALARM = WAKE LIGHTS ON
    if (notification === "ALARM_TRIGGERED"){
      console.log("Sending mqtt to topic: lights/snder"+" on server "+self.config.mqttServer);
      Log.log("Sending mqtt to topic: lights/snder"+" on server "+self.config.mqttServer);

      this.sendSocketNotification("MQTT_SEND", {
        mqttServer: self.config.mqttServer,
        topic: "lights/snder",
        payload: "Wake"
      });

      this.mqttVal = "Wake up!";
      this.loaded = true;
      this.updateDom();
    }

    // LIGHTS OFF COMMAND = SEND LIGHTS OFF
    if (notification === "LIGHTS_OFF"){
      console.log("Sending mqtt to topic: lights/snder"+" on server "+self.config.mqttServer);
      Log.log("Sending mqtt to topic: lights/snder"+" on server "+self.config.mqttServer);

      this.sendSocketNotification("MQTT_SEND", {
        mqttServer: self.config.mqttServer,
        topic: "lights/snder",
        payload: "LightsOff"
      });

      this.mqttVal = "Lights off";
      this.loaded = true;
      this.updateDom();
    }
  }
});
