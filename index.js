const express = require('express');
const app = express();
const WebSocket = require('ws');
const http = require('http');
app.use(express.static('static'))
let users = [];
const server = new http.createServer(app);
const wss = new WebSocket.Server({ server });

app.get('/')

wss.broadcast = function broadcast(data) { // 广播
  wss.clients.forEach(function each(client) {
  	console.log('aa      '+client)
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};


function  isIn(index, data) {
	if (data.length == 0) {
		return true;
	}
	for (let i of data) {
		if (i.name == index) {
			return false;
		} else {
			return true;
		}
	}
}

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
  		let data = JSON.parse(message);
  		if (data.login) {
  			if(isIn(data.name, users)) {
  				users.push(data)
  			}
  			data.length = users.length;
  			wss.broadcast(JSON.stringify(data));
  		} else {
  			wss.broadcast(JSON.stringify(data));
  		}
  		/*if (data.is) {
  			users.push(message);
  			data.length = users.length;
	  		wss.broadcast(JSON.stringify(data));
  		} else {
			data.length = users.length;
	  		wss.broadcast(JSON.stringify(data));
  		}*/
  	});
})
server.listen(8082);