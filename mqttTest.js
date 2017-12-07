/* Magic Mirror
 * Module: MMM-PyArduinoControl
 *
 * By Axelle Jamous
 * Based on https://github.com/paviro/MMM-Facial-Recognition
 */
var mqtt = require('mqtt')
//var broker = "172.20.10.5"
//var client  = mqtt.connect(broker)
	//	Variables
	var snd_topic = "coffee/rcver";
	var rcv_topic = "coffee/snder";
	var setup_topic = "setup";
	//client  = mqtt.connect([{ host: 'mqtts://localhost', port: 1883}]);
	var client = mqtt.connect('mqtt://test.mosquitto.org');	
	
	console.log('Program running');
	//process.stdout.write("hello ");

	/**
     * MQTT Section
     * @description sets up mqtt connector, listener and publisher 
     */
	client.on('connect', function () {
		console.log('Connected.');

		client.subscribe(setup_topic)
		client.publish(setup_topic, 'Hello from MagicMirror side')
	});
	
	client.subscribe(rcv_topic);
	
	client.on('message', function (topic, message) {
		// message is Buffer
		if(topic == rcv_topic) console.log("from " + rcv_topic + ": " + message.toString())
		if(topic == setup_topic) console.log("from " + setup_topic + ": " + message.toString())		
	});