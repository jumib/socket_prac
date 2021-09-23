// back-end

import express from "express";
import WebSocket from "ws";
import http from "http";

const app = express();

//뷰엔진을 퍼그로 설정
app.set("view engine", "pug");
// /views디렉토리로 뷰 설정
app.set("views", __dirname + "/views");
// 퍼블릭 파일이 프론트엔드에서 구동되는 코드다. 헷갈리지 말기
// 아래 코드가 퍼블릭폴더를 유저에게 공개하는 의미
// public으로 들어오면 이 페이지를 보여줄거다.
// app.use() 기본 경로가 일치하면 미들웨어 기능이 실행된다.
// app.get(), app.post()등과 달리 요청 URL을 지정하지 않아도 app.use()를 사용할 수 있으며 
// 해당 경우에는 URL에 상관없이 매번 실행된다.
app.use("/public", express.static(__dirname + "/public")); // 정적 파일 제공
// express는 render 후 view를 보여주는 역할만 할거다.
// 나머지는 소켓으로 실시간으로 보여주기만 함
// 우리홈페이지로 이동시 사용될 템플릿 렌더해주는거
app.get("/", (_, res) => res.render("home"));
//어딜가도 home으로 리다이렉트
app.get("/*", (_, res) => res.redirect("/"));

// ====================================================================================
// ws서버 따로 안만들고 같은 express에 합친다. 아래에 function추가! express는 ws지원안함
// 둘다 3000포트에 있길 원해서 아래처럼 만든거임
const handleListen = () => console.log(`Listening ion http://localhost:3000`)
// app.listen(3000, handleListen);

//application으로부터 서버 만들기
const server = http.createServer(app);
// http위에 wss만들었다.
const wss = new WebSocket.Server({ server });
//받는 socket은 연결된 사람. 정보 등 
// 여기서 socket은 연결된 브라우저를 말하고
// app.js에서는 서버로의 연결을 뜻한다.
function handleConnection(socket){
    console.log(socket)
} 

// 누가 연결했는지 알아보기위해서 fake database를 만든다.
// 누군가 우리 connection에 연결하면 그 소켓을 모두 여기에 넣는다.
// 그럼 받은 메세지를 다른 모든 소켓에 전달해줄 수 있다.!!!
const sockets = [];


// connection은 연결 + 연결된 사람의 정보를 제공 (socket으로), 연결 후 handleConnection 이벤트 실행
// wss.on("connection", handleConnection)
// 더 직관적임
// wss는 서버 전체를 위한 것
wss.on("connection", (socket) => {
    sockets.push(socket); // firefox에 연결되면 firefox를 brave는 brave를 sockets(F-DB)에 넣어준다. 즉 2개가 들어감
    socket["nickname"] = "Anon"; // 익명 대비
    console.log("Conneted to Browser :)")
    socket.on("close", () => console.log("Disconneted to Browser :("))
    // socket은 위에서 받은 event listener 즉, 특정socket인 거 기억
    socket.on("message", (msg) => {
        // TODO: buffer to string check ! 
        let msgs = msg.toString();
        let message = JSON.parse(msgs)
        console.log(message)
        // 각각 보냄, 연결된 모든 소켓에 전달가능
        switch (message.type) {
            case "new_message":
                // 나 포함 모두에게 보낸다? 
                sockets.forEach((aSocket) => aSocket.send(`${socket.nickname}: ${message.payload}`));
            case "nickname":
                socket["nickname"] = message.payload;
        }
        // socket.seclnd(msg);

    });
})



// app.listen(3000, handleListen);
server.listen(3000, handleListen);