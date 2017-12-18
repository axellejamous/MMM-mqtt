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

  defaults: {
    mqttServer: '172.20.10.3',
    mode: 'send',
    loadingText: 'Loading MQTT Data...',
    topic: 'coffee/snd',
    showTitle: false,
    title: 'MQTT Data',
    interval: 300000,
    postText: ''
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

    // STOP ALARM = SEND START COFFEE
    if (notification === "STOP_ALARM"){
      console.log("Sending mqtt to topic: "+topic+" on server "+self.config.mqttServer);
      Log.log("Sending mqtt to topic: "+topic+" on server "+self.config.mqttServer);

      this.sendSocketNotification("MQTT_SEND", {
        mqttServer: self.config.mqttServer,
        topic: topic,
        payload: "startCoffee"
      });
    }
  }
});
