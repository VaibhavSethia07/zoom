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

camerasSelect.addEventListener("input", async () => {
  await getMedia(camerasSelect.value);
  if (peerConnection) {
    const videoTrack = stream.getVideoTracks()[0];
    console.log(peerConnection.getSenders());
    const videoSender = peerConnection.getSenders().find((sender) => {
      return sender.track.kind === "video";
    });
    console.log(videoSender);
    videoSender.replaceTrack(videoTrack);
  }
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
  socket.emit("offer", offer, roomName);
});

// Chrome gets it
socket.on("offer", async (offer) => {
  peerConnection.setRemoteDescription(offer);
  const answer = await peerConnection.createAnswer();

  peerConnection.setLocalDescription(answer);
  socket.emit("answer", answer, roomName);
});

socket.on("answer", (answer) => {
  peerConnection.setRemoteDescription(answer);
});

socket.on("ice", (ice) => {
  peerConnection.addIceCandidate(ice);
});

const makeConnection = () => {
  peerConnection = new RTCPeerConnection({
    iceServers: [
      {
        urls: [
          "stun:stun.l.google.com:19302",
          "stun:stun1.l.google.com:19302",
          "stun:stun2.l.google.com:19302",
          "stun:stun3.l.google.com:19302",
          "stun:stun4.l.google.com:19302",
        ],
      },
    ],
  });
  stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream));

  peerConnection.addEventListener("icecandidate", (data) => {
    socket.emit("ice", data.candidate, roomName);
  });

  peerConnection.addEventListener("track", (data) => {
    const peerFace = document.getElementById("peerStream");
    peerFace.srcObject = data.streams[0];
  });
};
