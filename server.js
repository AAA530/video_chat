const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const http = require("http").Server(app);
const io = require("socket.io")(http);
const port = process.env.PORT || 4000;

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
let clients = 0;
const users_video = [];

function userJoin(id, username, room) {
	const user = { id, username, room };

	users_video.push(user);
	return user;
}

//get current user
function getUser(id) {
	return users_video.find((user) => user.id === id);
}

function userLeave(id) {
	console.log([users_video]);
	const index = users_video.findIndex((user) => user.id === id);
	if (index !== -1) {
		return users_video.splice(index, 1)[0];
	}
}

function getUserRoom(room) {
	return users_video.filter((user) => user.room === room);
}

io.on("connection", function (socket) {
	socket.on("join-video-chat", ({ username, room }) => {
		socket.join(room);
		const user = userJoin(socket.id, username, room);
		// socket.emit("output", username + "joined");

		//when user connects
		socket.broadcast.to(room).emit("output_video", username + "joined");

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
	try {
		userLeave(this.id);
		this.broadcast.to(room).emit("Disconnect");
	} catch (err) {
		console.log(err);
	}
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

app.get("/", (req, res) => {
	res.render("home.ejs");
});

app.post("/video", (req, res) => {
	console.log(req.body.username);
	res.render("video.ejs", {
		username: req.body.username,
		room: req.body.room,
	});
});

http.listen(port, () => console.log(`Active on ${port} port`));
