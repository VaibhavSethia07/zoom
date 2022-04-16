const socket = io();
const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");
const welcome = document.getElementById("welcome");
const myStream = document.getElementById("myStream");

let stream = null;
let mute = false;
let cameraOff = false;
let roomName = null;
let peerConnection = null;
myStream.hidden = true;

const startMedia = async () => {
  welcome.hidden = true;
  myStream.hidden = false;
  await getMedia();
  makeConnection();
};

const getCameras = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === "videoinput");
    const currentCamera = stream.getVideoTracks()[0];
    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.innerText = camera.label;
      option.value = camera.deviceId;
      camerasSelect.appendChild(option);

      if (currentCamera.label === camera.label) option.selected = true;
    });
  } catch (err) {
    console.log(err);
  }
};

const getMedia = async (deviceId) => {
  const initialContraint = {
    audio: true,
    video: { facingMode: "user" },
  };

  const cameraConstraint = {
    audio: true,
    video: { deviceId: deviceId },
  };
  try {
    stream = await navigator.mediaDevices.getUserMedia(
      deviceId ? cameraConstraint : initialContraint
    );
    myFace.srcObject = stream;
    console.log("My media stream ", stream);
    if (!deviceId) await getCameras();
  } catch (err) {
    console.log(err);
  }
};

muteBtn.addEventListener("click", () => {
  const tracks = stream.getAudioTracks();

  if (mute) {
    muteBtn.innerText = "Mute";
  } else {
    muteBtn.innerText = "Unmute";
  }
  tracks.forEach((track) => (track.enabled = !track.enabled));
  mute = !mute;
});

cameraBtn.addEventListener("click", () => {
  const tracks = stream.getVideoTracks();

  if (cameraOff) {
    cameraBtn.innerText = "Turn Camera Off";
  } else {
    cameraBtn.innerText = "Turn Camera On";
  }
  tracks.forEach((track) => (track.enabled = !track.enabled));
  cameraOff = !cameraOff;
});

camerasSelect.addEventListener("input", () => {
  getMedia(camerasSelect.value);
});

welcome.addEventListener("submit", async (event) => {
  event.preventDefault();
  const input = welcome.querySelector("input");
  roomName = input.value;
  await startMedia();
  socket.emit("join_room", input.value);
  input.value = "";
});

// Brave gets it
socket.on("welcome", async () => {
  console.log(`Someone joined the room ${roomName}:)`);
  const offer = await peerConnection.createOffer();
  peerConnection.setLocalDescription(offer);
  console.log("offer sent by the browser");
  socket.emit("offer", offer, roomName);
});

// Chrome gets it
socket.on("offer", async (offer) => {
  console.log("offer received by the browswer");
  peerConnection.setRemoteDescription(offer);
  const answer = await peerConnection.createAnswer();

  peerConnection.setLocalDescription(answer);
  console.log("answer sent by the browser");
  socket.emit("answer", answer, roomName);
});

socket.on("answer", (answer) => {
  console.log("answer received by the browser");
  peerConnection.setRemoteDescription(answer);
});

socket.on("ice", (ice) => {
  console.log("received the ice candidate");
  peerConnection.addIceCandidate(ice);
});

const makeConnection = () => {
  peerConnection = new RTCPeerConnection();
  stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream));

  peerConnection.addEventListener("icecandidate", (data) => {
    console.log(data);
    console.log("sent the ice candidate");
    socket.emit("ice", data.candidate, roomName);
  });

  peerConnection.addEventListener("track", (data) => {
    console.log("got a stream from my peer");
    console.log("Peer's media stream ", data.streams[0]);
    const peerFace = document.getElementById("peerStream");
    peerFace.srcObject = data.streams[0];
  });
};
