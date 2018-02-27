load('api_config.js');
load('api_events.js');
load('api_gpio.js');
load('api_net.js');
load('api_sys.js');
load('api_timer.js');
load("api_mqtt.js");

let led = 2; // GPIO Pin for LED
let sensor_id = Cfg.get('swarmsense.sensor_id');
print(sensor_id);

let getInfo = function() {
  return JSON.stringify({
    uptime: Sys.uptime(),
    memory: Sys.free_ram()
  });
};

GPIO.set_mode(led, GPIO.MODE_OUTPUT);

// Subscribe for sensor configuration.
MQTT.sub('sensors/' + sensor_id + '/configuration', function(conn, topic, msg) {
  print('Topic:', topic, 'message:', msg);
  let config = JSON.parse(msg);
  if (config.status){
      print("LED ON");
      GPIO.write(led, 1);
  } else {
      print("LED OFF");
      GPIO.write(led, 0);
  }
}, null);

// Publish Data every second
Timer.set(10000 /* 1 sec */, Timer.REPEAT, function() {
    let data = getInfo();
    print(data);
    MQTT.pub('sensors/' + sensor_id + "/values", data);
}, null);

// Monitor network connectivity.
Event.addGroupHandler(Net.EVENT_GRP, function(ev, evdata, arg) {
  let evs = '???';
  if (ev === Net.STATUS_DISCONNECTED) {
    evs = 'DISCONNECTED';
  } else if (ev === Net.STATUS_CONNECTING) {
    evs = 'CONNECTING';
  } else if (ev === Net.STATUS_CONNECTED) {
    evs = 'CONNECTED';
  } else if (ev === Net.STATUS_GOT_IP) {
    evs = 'GOT_IP';
  }
  print('== Net event:', ev, evs);
}, null);
