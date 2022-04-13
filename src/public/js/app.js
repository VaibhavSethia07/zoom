const socket = io();
const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");

let stream = null;
let mute = false;
let cameraOff = false;

const getMedia = async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    myFace.srcObject = stream;
  } catch (err) {}
};

muteBtn.addEventListener("click", () => {
  if (mute) {
    muteBtn.innerText = "Mute";
  } else {
    muteBtn.innerText = "Unmute";
  }
  mute = !mute;
});

cameraBtn.addEventListener("click", () => {
  if (cameraOff) {
    cameraBtn.innerText = "Turn Camera Off";
  } else {
    cameraBtn.innerText = "Turn Camera On";
  }
  cameraOff = !cameraOff;
});

getMedia();
