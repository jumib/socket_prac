const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");

const call = document.getElementById("call");

call.hidden = true;

 let myStream;
 let muted = false;
 let cameraOff = true;
 let roomName;

 async function getCameras(){
     try{
         const devices = await navigator.mediaDevices.enumerateDevices();
         const cameras = devices.filter(device => device.kind === "videoinput")
         const currentCamera = myStream.getVideoTracks()[0];
         cameras.forEach((camera) => {
             const option = document.createElement("option");
             option.value = camera.deviceId;
             option.innerText = camera.label;
             if (currentCamera.label === camera.label){
                 option.selected = true
             }
             camerasSelect.appendChild(option);
         })
     } catch(e){
         console.log(e);
     }
}


 async function getMedia(deviceId){
     const initialConstrains = {
         audio: true, video: { facingMode: "user" }
     }
     const cameraConstrains = {
        audio: true, video: { facingMode: { exact: deviceId }}
     }
     try {
         myStream = await navigator.mediaDevices.getUserMedia(
             deviceId ? cameraConstrains : initialConstrains
         );
         console.log(myStream);
         myFace.srcObject = myStream;
         if(!deviceId){
            await getCameras();
         }
     } catch(e){
         console.log(e)
     }
 };

//  getMedia();

function handleMuteClick(){
    console.log(myStream.getAudioTracks());
    myStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled
    });
    if(!muted){
        muteBtn.innerText = "Unmute"
        muted = true;
    } else{
        muteBtn.innerText = "Mute"
        muted = false;
    }
}
function handleCameraClick(){
    console.log(myStream.getVideoTracks());
    myStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled
    });
    if(cameraOff){
        cameraBtn.innerText = "Turn Camera Off"
        cameraOff = false
    } else{
        cameraBtn.innerText = "Turn Camera On"
        cameraOff = true
    }
}
async function handleCameraChange(){ 
    // console.log(camerasSelect.value)
    await getMedia(camerasSelect.value);
}

muteBtn.addEventListener("click", handleMuteClick)
cameraBtn.addEventListener("click", handleCameraClick)
camerasSelect.addEventListener("input", handleCameraChange) // 카메라 바꾸면 stream 강제 재시작


// Welcome Form (join a room)

const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form")

function startMedia(){
    welcome.hidden = true;
    call.hidden = false;
    getMedia();
}

function handleWelcomeSubmit(e){
    e.preventDefault();
    const input = welcomeForm.querySelector("input");
    console.log(input.value)
    socket.emit("join_room", input.value, startMedia)
    roomName = input.value;
    input.value= "";
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit);


socket.on("welcome", () => {
    console.log("someone joined")
})