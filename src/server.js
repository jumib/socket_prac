// back-end

import express from "express";
import SocketIO from 'socket.io';
import http from "http";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public")); // 정적 파일 제공
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening ion http://localhost:3000`)
const httpServer = http.createServer(app);

const wsServer = SocketIO(httpServer); 
wsServer.on("connection", (socket) => {
    socket.on("join_room", (roomName, done) => {
        socket.join(roomName);
        done();
        socket.to(roomName).emit("welcome");
    })
})



httpServer.listen(3000, handleListen);