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
myStream.hidden = true;

const startMedia = () => {
  welcome.hidden = true;
  myStream.hidden = false;
  getMedia();
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
    video: { deviceId: { exact: deviceId } },
  };
  try {
    stream = await navigator.mediaDevices.getUserMedia(
      deviceId ? cameraConstraint : initialContraint
    );
    myFace.srcObject = stream;
    console.log(stream);
    if (!deviceId) await getCameras();
  } catch (err) {}
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

welcome.addEventListener("submit", (event) => {
  event.preventDefault();
  const input = welcome.querySelector("input");
  roomName = input.value;
  socket.emit("join_room", input.value, startMedia);
  input.value = "";
});

socket.on("welcome", () => {
  console.log(`Someone joined the room ${roomName}:)`);
});
