var $$ = Dom7;

//Sens object info
var metawear = {
  deviceId: "F0:25:C2:74:09:A1",
  serviceUUID: "326a9000-85cb-9195-d9dd-464cfbbae75a",
  txCharacteristic: "326a9001-85cb-9195-d9dd-464cfbbae75a",
  rxCharacteristic: "326a9006-85cb-9195-d9dd-464cfbbae75a"
};
//Sens object info

//Grip object info
var grip = {
  deviceId: "",
  serviceUUID: "",
  txCharacteristic: "",
  rxCharacteristic: ""
};
//Grip object info

//Plates object info
var rPlate = {
  deviceId: "",
  serviceUUID: "",
  txCharacteristic: "",
  rxCharacteristic: ""
};

var lPlate = {
  deviceId: "",
  serviceUUID: "",
  txCharacteristic: "",
  rxCharacteristic: ""
};
//Plates object info

//F7 initialization
var app = new Framework7({
  root: '#app', // App root element
  name: 'KRehab', // App name
  theme: 'auto', // Automatic theme detection
  routes: routes,
});
var mainView = app.views.create('.view-main', {
  stackPages: true
});
//F7 initialization

//Sens object initialization, pairing and reading
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
    connect: function(id){
      sens.deviceId = id;

      var onConnect = function() {
        //console.log("onConnect");
        sens.enableButtonFeedback(sens.subscribeForIncomingData, sens.onError);
      };

      ble.connect(sens.deviceId, onConnect, sens.onError);
    },
    onData: function(buffer){ // data received from MetaWear
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
      $$("#sens-onData").append(
        "<br>" + message + "<br/>"
      );
      //resultDiv.scrollTop = resultDiv.scrollHeight;
    },
    writeData: function(buffer, success, failure){ // to to be sent to MetaWear
      if (!success)
      {
        success = function(){

          $$("#sens-write").append(
            "<br>Sent: " + JSON.stringify(new Uint8Array(buffer)) + "<br/>"
          );
          //resultDiv.scrollTop = resultDiv.scrollHeight;
        };
      }
      else{
        $$("#sens-success").append(
          JSON.stringify(new Uint8Array(buffer)) + "<br/>"
        );
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
    enableButtonFeedback: function(success, failure){
      var data = new Uint8Array(6);
      data[0] = 0x01; // mechanical switch
      data[1] = 0x01; // switch state ops code
      data[2] = 0x01; // enable

      sens.writeData(data.buffer, success, failure);
    },
    onMotorButton: function(event){
        var pulseWidth = pulseWidthInput.value;
        var data = new Uint8Array(6);
        data[0] = 0x07; // module
        data[1] = 0x01; // pulse ops code
        data[2] = 0x80; // Motor
        data[3] = pulseWidth & 0xFF; // Pulse Width
        data[4] = pulseWidth >> 8; // Pulse Width
        data[5] = 0x00; // Some magic bullshit

        sens.writeData(data.buffer);
    },
    onBuzzerButton: function(event){
        var pulseWidth = pulseWidthInput.value;
        var data = new Uint8Array(6);
        data[0] = 0x07; // module
        data[1] = 0x01; // pulse ops code
        data[2] = 0xF8; // Buzzer
        data[3] = pulseWidth & 0xFF; // Pulse Width
        data[4] = pulseWidth >> 8; // Pulse Width
        data[5] = 0x01; // Some magic?

        sens.writeData(data.buffer);
    },
    /*disconnect: function(event) {
        ble.disconnect(app.deviceId, app.showMainPage, app.onError);
        sens.deviceId = "";
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
    onError: function(reason){
      alert("ERROR: " + reason); // real apps should use notification.alert
    }
};
//Sens object initialization, pairing and reading

//Grip object initialization, pairing and reading

//Grip object initialization, pairing and reading

//Plates object initialization, pairing and reading

//Plates object initialization, pairing and reading

$$(document).on('deviceready', function(){
  //sens.refreshDeviceList();

  //login screen
  $$("#login-screen #login-button").on('click', function(){
    //Login Auth
    mainView.router.navigate({
      name: 'calibration',
    });
    //Login Auth
    //console.log(mainView.router.history);
  });
  //login screen

  //calibration screen
  app.on("cardOpen", function(expendableCard){
    $$("#calibration-fab").hide();
    if($$("#calibration-page").scrollTop() == 0){
      app.navbar.toggleLargeTitle("#calibration-nav");
    }
    $$("#"+expendableCard.id+"-save").on('click', function(){
      $$("#"+expendableCard.id+"-icon").remove();
      $$("#"+expendableCard.id+"-col").append('<i id='+expendableCard.id+'-icon class="calibration-icon icon f7-icons color-green">checkmark_alt_circle_fill</i>');
      $$("#"+expendableCard.id+"-save").addClass("disabled");
      $$("#"+expendableCard.id+"-reset").removeClass("disabled");
    });
    $$("#"+expendableCard.id+"-reset").on('click', function(){
      $$("#"+expendableCard.id+"-icon").remove();
      $$("#"+expendableCard.id+"-col").append('<i id='+expendableCard.id+'-icon class="calibration-icon icon f7-icons color-red">multiply_circle_fill</i>');
      $$("#"+expendableCard.id+"-reset").addClass("disabled");
      $$("#"+expendableCard.id+"-save").removeClass("disabled");
    });
  });

  app.on("cardClose", function(expendableCard){
    $$("#calibration-fab").show();
    if($$("#calibration-page").scrollTop() == 0){
      app.navbar.toggleLargeTitle("#calibration-nav");
    }
  });
  //calibration screen



  console.log("Device is ready!");
});

$$("#motor").on('click', function(){
  //sens.onMotorButton();
});
