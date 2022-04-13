const socket = io();
const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");

let stream = null;
let mute = false;
let cameraOff = false;

const getCameras = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === "videoinput");
    console.log(devices);
    console.log(cameras);

    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.label = camera.label;
      option.value = camera.deviceId;
      camerasSelect.appendChild(option);
    });
  } catch (err) {
    console.log(err);
  }
};

const getMedia = async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    myFace.srcObject = stream;
    console.log(stream);
    await getCameras();
  } catch (err) {}
};

muteBtn.addEventListener("click", () => {
  const tracks = stream.getAudioTracks();
  console.log(tracks);
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
  console.log(tracks);
  if (cameraOff) {
    cameraBtn.innerText = "Turn Camera Off";
  } else {
    cameraBtn.innerText = "Turn Camera On";
  }
  tracks.forEach((track) => (track.enabled = !track.enabled));
  cameraOff = !cameraOff;
});

getMedia();
