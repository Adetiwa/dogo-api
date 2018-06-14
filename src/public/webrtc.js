var localVideo;
var localStream;
var remoteVideo;
var remoteStream;
var peerConnection;
var uuid;
var serverConnection = io();
var socket = io();

serverConnection.on('connect', function(data) {
      console.log('connected');
});

var peerConnectionConfig = {
  'iceServers': [
    {'urls': 'stun:stun.stunprotocol.org:3478'},
    {'urls': 'stun:stun.l.google.com:19302'},
  ]
};

function pageReady() {
  uuid = createUUID();

  localVideo = document.getElementById('localVideo');
  remoteVideo = document.getElementById('remoteVideo');
  //console.log('uuid is '+ uuid);
  // serverConnection.send({
  //                type: "uuid",
  //                data: uuid
  //            })
  //serverConnection = new WebSocket('wss://' + window.location.hostname + ':8443');
  serverConnection.on('message', function(message) {
      gotMessageFromServer(message);
  });

  var constraints = {
    video: true,
    audio: true,
  };

  if(navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia(constraints).then(getUserMediaSuccess).catch(errorHandler);
  } else {
    alert('Your browser does not support getUserMedia API');
  }
}

function getUserMediaSuccess(stream) {
  localStream = stream;
  localVideo.srcObject = stream;
}


function handleRemoveStreamEvent(event) {
  closeVideoCall();
}

function handleICEConnectionStateChangeEvent(event) {
  //new for start
  //checking for when user iniutiated call but no answer
  //completed for when all done


  switch(peerConnection.iceConnectionState) {
    case "closed":
    case "failed":
    case "disconnected":
      closeVideoCall();
      break;
  }
}

function closeVideoCall() {
  alert('Call cancelled');
  if (peerConnection) {
  if (remoteVideo.srcObject) {
    remoteVideo.srcObject.getTracks().forEach(track => track.stop());
    remoteVideo.srcObject = null;
  }

  if (localVideo.srcObject) {
    localVideo.srcObject.getTracks().forEach(track => track.stop());
    localVideo.srcObject = null;
  }

  peerConnection.close();
  peerConnection = null;
}
}

function handleICEGatheringStateChangeEvent(event) {
  // Our sample just logs information to console here,
  // but you can do whatever you need.
  console.log("Ice gathering state ", JSON.stringify(event))
}


function handleSignalingStateChangeEvent(event) {
  // Our sample just logs information to console here,
  // but you can do whatever you need.
  //stable for start
  console.log("Signaling state change event", JSON.stringify(event))
  switch(peerConnection.signalingState) {
     case "closed":
       closeVideoCall();
       break;
   }
}


function handleNegotiationNeededEvent(event) {
  // Our sample just logs information to console here,
  // but you can do whatever you need.
  console.log("Handle negotiontion event", JSON.stringify(event))
}

function start(isCaller) {
  peerConnection = new RTCPeerConnection(peerConnectionConfig);
  peerConnection.onicecandidate = gotIceCandidate;
  peerConnection.onaddstream = gotRemoteStreams;
  peerConnection.onremovestream = handleRemoveStreamEvent;
  peerConnection.oniceconnectionstatechange = handleICEConnectionStateChangeEvent;
 peerConnection.onicegatheringstatechange = handleICEGatheringStateChangeEvent;
 peerConnection.onsignalingstatechange = handleSignalingStateChangeEvent;
 peerConnection.onnegotiationneeded = handleNegotiationNeededEvent;

  //ontrack
  peerConnection.addStream(localStream);

  if(isCaller) {
    peerConnection.createOffer().then(createdDescription).catch(errorHandler);
  } else {
    //peerConnection.createAnswer().then(createdDescriptionAnwser).catch(errorHandler);
  }
}

function gotMessageFromServer(message) {
  console.log("From server ",JSON.stringify(message));
  if(!peerConnection) start(false);

  //var signal = JSON.parse(message.data);
  //console.log('signal is ',signal)
  // Ignore messages from ourself
  if(message.uuid == uuid) return;

  if(message.sdp) {
    peerConnection.setRemoteDescription(new RTCSessionDescription(message.sdp)).then(function() {
      // Only create answers in response to offers
      if(message.sdp.type == 'offer') {
        peerConnection.createAnswer().then(createdDescription).catch(errorHandler);
      }
    }).catch(errorHandler);
  } else if(message.ice) {
    peerConnection.addIceCandidate(new RTCIceCandidate(message.ice)).catch(errorHandler);
  }
}

function gotIceCandidate(event) {
  if(event.candidate != null) {
    serverConnection.send(JSON.stringify({'ice': event.candidate, type: "new-ice-candidate", 'uuid': uuid}));
    ///console.log(JSON.stringify({'ice': event.candidate, 'uuid': uuid}));
  }
}

function createdDescription(description) {
///  console.log('got description');

  peerConnection.setLocalDescription(description).then(function() {
    serverConnection.send({'sdp': peerConnection.localDescription, 'type': 'video-offer', 'uuid': uuid});
  //  console.log(JSON.stringify({'sdp': peerConnection.localDescription, 'type': 'video-offer', 'uuid': uuid}));
  }).catch(errorHandler);
}

function createdDescriptionAnwser(description) {
///  console.log('got description');

  peerConnection.setLocalDescription(description).then(function() {
    serverConnection.send({'sdp': peerConnection.localDescription, 'type': 'video-answer', 'uuid': uuid});
  //  console.log(JSON.stringify({'sdp': peerConnection.localDescription, 'type': 'video-offer', 'uuid': uuid}));
  }).catch(errorHandler);
}


function gotRemoteStreams(event) {
  console.log('got remote stream', event);
  remoteStream = event;
  remoteVideo.srcObject = event.stream;
}

function errorHandler(error) {
  console.log(error);
}

function hangUpCall() {
  closeVideoCall();
  serverConnection.send({
    name: myUsername,
    target: targetUsername,
    type: "hang-up"
  });
}

// Taken from http://stackoverflow.com/a/105074/515584
// Strictly speaking, it's not a real UUID, but it gets the job done here
function createUUID() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }

  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}
