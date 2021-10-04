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
 let myPeerConnection;

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

// 여기가 양쪽 브라우저에서 모두 실행시키는 부분
async function initCall(){
    welcome.hidden = true;
    call.hidden = false;
    await getMedia();
    makeConnection();
}

async function handleWelcomeSubmit(e){
    e.preventDefault();
    const input = welcomeForm.querySelector("input");
    console.log(input.value)
    await initCall(); // 웹소켓의 속도가 미디어를 가져오고 연결하는 속도보다 빨라서
    socket.emit("join_room", input.value)
    roomName = input.value;
    input.value= "";
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit);


socket.on("welcome", async() => {
    //사파리가 참가하면 크롬에서 실행되는 코드.
    // 여기서는 즉 크롬이 A, offer를 만드는 , 이 행위를 시작하는 주체.
    // 이건 오직 크롬에서만 동작한다는거 기억해 !!!!!
    const offer = await myPeerConnection.createOffer();
    // console.log(offer)
    myPeerConnection.setLocalDescription(offer);
    console.log("sent the offer")
    socket.emit("offer", offer, roomName);
    // console.log("someone joined")
})

    // peer B인 사파리에서 동작
    // offer주고받을땐 서버필요, 받은 후엔 직접적으로 대화가능
socket.on("offer", async (offer) => {
    // console.log(offer);
    myPeerConnection.setRemoteDescription(offer); //받은 오퍼 설정
    const answer = await myPeerConnection.createAnswer();
    console.log(answer);
    myPeerConnection.setLocalDescription(answer);
    socket.emit("answer", answer, roomName); // 사파리에서 크롬으로 보낼 답이 있을때 answer로 응답
});

    // 그 answer로 크롬도 remoteDescription을 가지게 되었다.
    // 즉 이제 두 브라우저 모두 localDescription과 remoteDescription을 가짐.
socket.on("answer", async (answer ) => {
    // console.log(offer);
    myPeerConnection.setRemoteDescription(answer); //받은 answer 설정
});

socket.on("ice", async (ice ) => {
    myPeerConnection.addIceCandidate(ice); 
});

// RTC Code

function makeConnection(){
    myPeerConnection = new RTCPeerConnection();
    myPeerConnection.addEventListener("icecandidate", handleIce);
    myPeerConnection.addEventListener("addstream", handleAddStream);
    console.log(myStream.getTracks()) // 비디오/오디오 스트림 트랙을 피어투피어에 넣음
    myStream
        .getTracks()
        .forEach(track => myPeerConnection.addTrack(track, myStream)); // 두 브라우저를 따로 구성만 함. 아직 연결 x


 }

 function handleIce(data){
    socket.emit("ice", data.candidate, roomName);
     console.log("got ice candidate");
    //  console.log(data)
 } 

 function handleAddStream(data){
    const peerFace = document.getElementById("peerFace");
    console.log("got AddStream");
     console.log("Peer",data.stream)
     console.log("My", myStream)
    peerFace.srcObject = data.stream; 
 }