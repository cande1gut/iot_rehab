var $$ = Dom7;

var metawear = {
  deviceId: "F0:25:C2:74:09:A1",
  serviceUUID: "326a9000-85cb-9195-d9dd-464cfbbae75a",
  txCharacteristic: "326a9001-85cb-9195-d9dd-464cfbbae75a",
  rxCharacteristic: "326a9006-85cb-9195-d9dd-464cfbbae75a"
};



var app = new Framework7({
  root: '#app', // App root element
  name: 'KRehab', // App name
  theme: 'auto', // Automatic theme detection
  // App root data
  data: function () {
    return {
      user: {
        firstName: 'John',
        lastName: 'Doe',
      },
      // Demo products for Catalog section
      products: [
        {
          id: '1',
          title: 'Apple iPhone 8',
          description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nisi tempora similique reiciendis, error nesciunt vero, blanditiis pariatur dolor, minima sed sapiente rerum, dolorem corrupti hic modi praesentium unde saepe perspiciatis.'
        },
        {
          id: '2',
          title: 'Apple iPhone 8 Plus',
          description: 'Velit odit autem modi saepe ratione totam minus, aperiam, labore quia provident temporibus quasi est ut aliquid blanditiis beatae suscipit odio vel! Nostrum porro sunt sint eveniet maiores, dolorem itaque!'
        },
        {
          id: '3',
          title: 'Apple iPhone X',
          description: 'Expedita sequi perferendis quod illum pariatur aliquam, alias laboriosam! Vero blanditiis placeat, mollitia necessitatibus reprehenderit. Labore dolores amet quos, accusamus earum asperiores officiis assumenda optio architecto quia neque, quae eum.'
        },
      ]
    };
  },
  routes: routes,
});

var sens = {
    /*bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        refreshButton.addEventListener('touchstart', this.refreshDeviceList, false);
        motorButton.addEventListener('click', this.onMotorButton, false);
        buzzerButton.addEventListener('click', this.onBuzzerButton, false);
        disconnectButton.addEventListener('touchstart', this.disconnect, false);
        deviceList.addEventListener('touchstart', this.connect, false); // assume not scrolling
    },
    onDeviceReady: function() {
        app.refreshDeviceList();
    },*/
    refreshDeviceList: function(){
      if (cordova.platformId === 'android') { // Android filtering is broken
        ble.scan([], 5, sens.androidDiscover, sens.onError);
      }
      else
      {
        ble.scan([metawear.serviceUUID], 5, sens.onDiscoverDevice, sens.onError);
      }
    },
    androidDiscover: function(){
      ble.scan([metawear.serviceUUID], 5, sens.onDiscoverDevice, sens.onError);
      //ble.connect(metawear.deviceId, sens.onConnect, sens.onError);
    },
    onDiscoverDevice: function(device){
      if(device.id == metawear.deviceId)
      {
        //console.log("found");
        sens.connect(device.id);
      }
    },
    connect: function(id) {
      sens.deviceId = id;

      var onConnect = function() {
        //console.log("onConnect");
        sens.enableButtonFeedback(sens.subscribeForIncomingData, sens.onError);
      };

      ble.connect(sens.deviceId, onConnect, sens.onError);
    },
    onData: function(buffer) { // data received from MetaWear
      var data = new Uint8Array(buffer);
      var message = "";

      if (data[0] === 1 && data[1] === 1) { // module = 1, opscode = 1
          if (data[2] === 1) { // button state
              message = "Button pressed";
          } else {
              message = "Button released";
          }
      }

      $$("#sens-data").append(message);
      //console.log(message);

      //resultDiv.innerHTML = resultDiv.innerHTML + message + "<br/>";
      //resultDiv.scrollTop = resultDiv.scrollHeight;
    },
    writeData: function(buffer, success, failure) { // to to be sent to MetaWear
      if (!success)
      {
        success = function() {
          console.log("success");
          //resultDiv.innerHTML = resultDiv.innerHTML + "Sent: " + JSON.stringify(new Uint8Array(buffer)) + "<br/>";
          //resultDiv.scrollTop = resultDiv.scrollHeight;
        };
      }

      if(!failure)
      {
        failure = sens.onError;
      }

      ble.writeWithoutResponse(sens.deviceId, metawear.serviceUUID, metawear.txCharacteristic, buffer, success, failure);
    },
    subscribeForIncomingData: function(){
      ble.startNotification(sens.deviceId, metawear.serviceUUID, metawear.rxCharacteristic, sens.onData, sens.onError);
    },
    enableButtonFeedback: function(success, failure) {
        var data = new Uint8Array(6);
        data[0] = 0x01; // mechanical switch
        data[1] = 0x01; // switch state ops code
        data[2] = 0x01; // enable

        sens.writeData(data.buffer, success, failure);
    },
    /*onMotorButton: function(event) {
        var pulseWidth = pulseWidthInput.value;
        var data = new Uint8Array(6);
        data[0] = 0x07; // module
        data[1] = 0x01; // pulse ops code
        data[2] = 0x80; // Motor
        data[3] = pulseWidth & 0xFF; // Pulse Width
        data[4] = pulseWidth >> 8; // Pulse Width
        data[5] = 0x00; // Some magic bullshit

        app.writeData(data.buffer);
    },
    onBuzzerButton: function(event) {
        var pulseWidth = pulseWidthInput.value;
        var data = new Uint8Array(6);
        data[0] = 0x07; // module
        data[1] = 0x01; // pulse ops code
        data[2] = 0xF8; // Buzzer
        data[3] = pulseWidth & 0xFF; // Pulse Width
        data[4] = pulseWidth >> 8; // Pulse Width
        data[5] = 0x01; // Some magic?

        app.writeData(data.buffer);
    },
    disconnect: function(event) {
        ble.disconnect(app.deviceId, app.showMainPage, app.onError);
        app.deviceId = "";
    },
    showMainPage: function() {
        mainPage.hidden = false;
        detailPage.hidden = true;
    },
    showDetailPage: function() {
        mainPage.hidden = true;
        detailPage.hidden = false;
        resultDiv.innerHTML = "<i>Press the button on the MetaWear</i><br/>";
    },*/
    onError: function(reason) {
      alert("ERROR: " + reason); // real apps should use notification.alert
    }
};

$$(document).on('deviceready', function() {
  sens.refreshDeviceList();
  console.log("Device is ready!");
});

// Login Screen Demo
$$('#my-login-screen .login-button').on('click', function () {

});
