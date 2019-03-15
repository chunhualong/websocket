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




// 简单题目json

let topics = [
	{
		'topic': '狮子是什么颜色',
		'anserList': [
			'黄色', '蓝色', '紫色', '粉色'
		],
		'answer': 1,
		'time': 60
	},
	{
		'topic': '1+1=？',
		'anserList': [
			'6', '2', '5', '8'
		],
		'answer': 2,
		'time': 60
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
	for (let i in obj) {
		if (obj[i].home_numer == 1) {
			return i;
		}
	}
}


// 检查时候有空房间
function checkingAirHome(obj, name) {
	let arr = [];
	for (let i in obj) {
		if (i == name || obj[i].home_numer == 1) {
			arr.push(name)
		}
	}
	if (arr.includes(name)) {
		return false;
	} else {
		return true;
	}
}


let clistList = {} // 声明所哟用户的cliten(但广播)
wss.on('connection', function connection(ws, s, c , d) {
	let name = s.url.replace('/', '');
	console.log(name, Array.from(wss.clients).length)
	clistList[name] = Array.from(wss.clients)[Array.from(wss.clients).length - 1];
	let backName;
	if (JSON.stringify(Home) == '{}' || checkingAirHome(Home, name)) {
		backName = name;
		Home[name] = {
			'home_name': name,
			'home_numer': 1,
			'home_list': [...[name]]
		}
	} else {
		let Hname = backName = findHome(Home);
		console.log('backName ', Hname)
		Home[Hname] = {
			'home_name': Hname,
			'home_numer': 2,
			'home_list': [...Home[Hname]['home_list'], ...[name]]
		}
	}
	wss.broadcast(JSON.stringify(Home[backName]), clistList);
  ws.on('message', function incoming(message) {
			let data = JSON.parse(message);
			let arr;
			for (let i in Home) {
				if (Home[i].home_list.includes(data.name)) {
					arr = Home[i].home_list
				}
			}
			for (let f of arr) {4
				clistList[f].send(JSON.stringify(data));
			}
		});
		ws.on('close', function close(code, message) {
			let data = JSON.parse(message)
			delete clistList[data.name]
			delete Home[data['home_Name']];
			console.log(clistList, Home);
			 // 当一个用户离开时解散房间
			// wss.clients.forEach((cliten) => {
			// 	cliten.send(JSON.stringify({loginOut: true}))
			// })
		});
})

wss.broadcast = function (data, list, name) { // 广播
	let newData = JSON.parse(data);
	for (let i of newData.home_list) {
		if (list[i].readyState === WebSocket.OPEN) {
			list[i].send(data);
		  }
	}
};

server.listen(8082);