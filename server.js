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

//get current user
function getUser(id) {
	return users.find((user) => user.id === id);
}

function userLeave(id) {
	console.log([users])
	const index = users.findIndex((user) => user.id === id);
	if (index !== -1) {
		return users.splice(index, 1)[0];
	}
}

function getUserRoom(room) {
	return users.filter((user) => user.room === room);
}

io.on("connection", function (socket) {
	socket.on("join-chat", ({ username, room }) => {
		socket.join(room);
		const user = userJoin(socket.id, username, room);
		// socket.emit("output", username + "joined");

		//when user connects
		socket.broadcast.to(room).emit("output", username + "joined");

		socket.on("NewClient", () => {
			const user = getUser(socket.id);
			let clients = Object.keys(getUserRoom(user.room)).length;
			console.log(clients);
			Object.keys(getUserRoom("test")).length;

			//if we send room name here
			if (clients < 3) {
				this.emit("CreatePeer");
			} else this.emit("SessionActive");
		});
		socket.on("Offer", SendOffer);
		socket.on("Answer", SendAnswer);
		socket.on("disconnect", Disconnect);
	});
});

function Disconnect() {
	userLeave(this.id);
	this.broadcast.to(room).emit("Disconnect");
}

function SendOffer(offer) {
	const user = getUser(this.id);
	room = user.room;
	this.broadcast.to(room).emit("BackOffer", offer);
}

function SendAnswer(data) {
	const user = getUser(this.id);
	room = user.room;
	this.broadcast.to(room).emit("BackAnswer", data);
}

http.listen(port, () => console.log(`Active on ${port} port`));
