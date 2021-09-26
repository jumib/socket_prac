// front-end

// ---------------  socketIO 사용 ----------------

const socket = io(); // 자동으로 돌고있는 서버를 찾을거야 , 연결된 모든 소켓 자동 추적

const welcome = document.getElementById("welcome")
const room = document.getElementById("room")
const form = welcome.querySelector("form");

room.hidden = true;

let roomName;

function addMessage(message){
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);
}

function backendDone(msg){
    console.log("backend says :", msg)
}

function handleMessageSubmit(e){
    e.preventDefault();
    const input = room.querySelector("input");
    const val = input.value;
    socket.emit("new_message", input.value, roomName, () => {
        addMessage(`You: ${val}`);
    });
    input.value = "";
}

function showRoom(){
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName}`;
    const form = room.querySelector("form");
    form.addEventListener("submit", handleMessageSubmit);
}

function handleRoomSubmit(e){
    e.preventDefault();
    const input = form.querySelector("input");
    socket.emit("enter_room", input.value, showRoom);
    roomName = input.value;
    // socket.emit("enter_room", input.value, backendDone); //전과 달리 특정 이벤트 가능, obj도 에밋가능 ! 꼭 메세지가 아니어도 됨
    input.value = ""
}

form.addEventListener("submit", handleRoomSubmit);


socket.on("welcome", () => {
    addMessage("someone joined !")
});

socket.on("bye", () => {
    addMessage("someone left ㅠㅠ")
});

socket.on("new_message", addMessage);





// ---------------  websocket 사용 ----------------

// const messageForm = document.querySelector("#message");
// const nickForm = document.querySelector("#nick");
// const messageList = document.querySelector("ul");
// // ${window.location.host}사용했기때문에 폰에서도 접속가능
// // 보내려는 서버가 js가 아닐수도 있기때문에 js obj로 보내면 안된다.
// const socket = new WebSocket(`ws://${window.location.host}`);

// // 타입 구분을 위해서 JSON형태의 메세지를 STRING으로 바꿔준다.
// function makeMessage(type, payload){
//     const msg = {type, payload};
//     return JSON.stringify(msg);
// }

// //socket 자체 기능
// socket.addEventListener("open", () => {
//     console.log("Conneted to Server :)")
// })

// socket.addEventListener("message", (message) => {
//     const li = document.createElement("li"); 
//     li.innerText = message.data; // li안에 메세지 데이터 넣어줌
//     messageList.append(li);
//     // console.log("New Message : ", message.data)
// })

// socket.addEventListener("close", () => {
//     console.log("Disconneted to Server :(")
// })

// function handleSubmit(event){
//     event.preventDefault();
//     // input을 가져온다.
//     const input = messageForm.querySelector("input");
//     // console.log(input.value);
//     // socket.send(input.value)
//     socket.send(makeMessage("new_message", input.value));
//     input.value = "";
// } 

// function handleNickSubmit(event){
//     event.preventDefault();
//     const input = nickForm.querySelector("input");
//     // socket.send({
//     //     type: "nickname",
// 	//     payload: input.value,
//     // }) 
//     socket.send(makeMessage( "nickname", input.value));
//     input.value = "";
// }

// messageForm.addEventListener("submit", handleSubmit);
// nickForm.addEventListener("submit", handleNickSubmit);



// // #1. 프론트에서는 addEventListener의 message를 사용해주었고
// // socket.addEventListener("message", (message) => {
// //     const li = document.createElement("li"); 
// //     li.innerText = message.data;
// //     messageList.append(li);
// // })

// // #2. 백에서는 socket.on의 message를 사용해주었고
// // socket.on("message", (message) => {
// //     sockets.forEach((aSocket) => aSocket.send(message));
// //     socket.send(message);

// // });