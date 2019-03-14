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
wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
		let data = JSON.parse(message);
		  if (data.login) {  // 用户登录时随机匹配房间和人
			clistList[data.name] = Array.from(wss.clients)[Array.from(wss.clients).length - 1];
  			if(isIn(data.name, users)) {
  				users.push(data)
			}
			// 如果当前没有房间就添加房间
			let backName; // 直返当前房间的值
			if (JSON.stringify(Home) == '{}' || checkingAirHome(Home, data.name)) {
				backName = data.name;
				Home[data.name] = {
					'home_name': data.name,
					'home_numer': 1,
					'home_list': [...[data.name]]
				}
			} else {
				let name = backName = findHome(Home);
				Home[name] = {
					'home_name': name,
					'home_numer': 2,
					'home_list': [...Home[name]['home_list'], ...[data.name]]
				}
			}
			// 返回房间号以及房间人数
			wss.broadcast(JSON.stringify(Home[backName]), clistList);

  		} else {
			console.log(data.name)
			let arr;
			for (let i in Home) {
				if (Home[i].home_list.includes(data.name)) {
					arr = Home[i].home_list
				}
			}
			console.log(arr)
				//console.log(c)
				clistList[arr[0]].send(JSON.stringify(data));
				clistList[arr[1]].send(JSON.stringify(data));
			
  			//wss.broadcast(JSON.stringify(data));
  		}
		});
		ws.on('close', function close(code, message) {
			let data = JSON.parse(message)
			delete clistList[data.name]
			delete Home[data.hoemeName]; // 当一个用户离开时解散房间
			// wss.clients.forEach((cliten) => {
			// 	cliten.send(JSON.stringify({loginOut: true}))
			// })
		});
})

wss.broadcast = function broadcast(data, list, name) { // 广播
	let newData = JSON.parse(data);
	for (let i of newData.home_list) {
		list[i].send(data);
	}
};

server.listen(8082);