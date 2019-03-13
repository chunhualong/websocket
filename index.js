const express = require('express');
const app = express();
const WebSocket = require('ws');
const http = require('http');
app.use(express.static('static'))

//  当前在的人数统计
let users = [];
const server = new http.createServer(app);
const wss = new WebSocket.Server({ server });

app.get('/')

wss.broadcast = function broadcast(data) { // 广播
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

// 简单题目json

let topics = [
	{
		'topic': '狮子是什么颜色',
		'anserList': [
			'黄色', '蓝色', '紫色', '粉色'
		],
		'answer': 1
	},
	{
		'topic': '1+1=？',
		'anserList': [
			'6', '2', '5', '8'
		],
		'answer': 2
	}
]


// 当前房间的属性
let Home = {};


app.get('/api/tipc', (req, res)=> {
	res.json({
		list: topics[req.query.index]
	})
})




// 判断当前用户时候在线
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

// 查找在线的房间
function findHome(obj) {
	if (JSON.stringify(obj) == '{}') {
		return true;
	}
	for (let i in obj) {
		if (i.home_numer == 1) {
			return i.name;
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

			// 如果当前没有房间就添加房间
			if (findHome(Home)) {
				Home[data.name] = {
					'home_numer': 1,
					'home_list': [...[data.name]]
				}
			} else {
				console.log(findHome(Home))
				// Home[findHome(Home)] = {
				// 	'home_numer': 2,
				// 	'home_list': [...Home[findHome(Home)].list, ...[data.name]]
				// }
			}



				// 返回房间号以及房间人数
				wss.broadcast(JSON.stringify(Home));

  		} else {
  			wss.broadcast(JSON.stringify(data));
  		}
		});
		ws.on('close', function close(code, message) {

			//用户关闭时需重新进入
			for (let i = 0; i < users.length; i++) {
				if (users[i].name == message) {
					users.splice(0,i + 1);
				}
			}
		});
})
server.listen(8082);