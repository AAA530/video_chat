const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const port = process.env.PORT || 3000;

app.use(express.static(__dirname + "/public"));
let clients = 0;
const users = [];


function userJoin(id, username, room) {
	const user = { id, username, room };

	users.push(user);
	return user;
}

io.on("connection", function (socket) {
	socket.on("join-chat", ({ username, room }) => {
		socket.join(room);
		// socket.emit("output", username + "joined");

		//when user connects
		socket.broadcast.to(room).emit("output", username + "joined");
	});

	socket.on("NewClient", () => {
		//if we send room name here
		if (clients < 2) {
			if (clients == 1) {
				this.emit("CreatePeer");
			}
		} else this.emit("SessionActive");
		clients++;
	});
	socket.on("Offer", SendOffer);
	socket.on("Answer", SendAnswer);
	socket.on("disconnect", Disconnect);
});

function Disconnect() {
	if (clients > 0) {
		if (clients <= 2) this.broadcast.emit("Disconnect");
		clients--;
	}
}

function SendOffer(offer) {
	this.broadcast.emit("BackOffer", offer);
}

function SendAnswer(data) {
	this.broadcast.emit("BackAnswer", data);
}

http.listen(port, () => console.log(`Active on ${port} port`));
