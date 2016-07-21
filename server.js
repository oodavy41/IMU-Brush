var express = require('express');
var app = express();
var server = require('http').createServer(app),
    io = require('socket.io')({transports: ['websocket'],}).listen(server);
var path = require("path");
var lpfx=require("lpf"),
    lpfy=require("lpf"),
    lpfz=require("lpf");

var net=require('net');


var port = process.env.PORT || 3000;
server.listen(port);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
	res.sendfile(__dirname + '/index.html');
});


var socketadmin;
var unity;
var x,y,z;

var lasttime=0;

io.on('connection', function(socket) {

    console.log("on connect");

    socket.emit("ok");

    socket.on("message", function (data) {
        io.sockets.emit('get', data);
    });

    socket.on("ad", function () {
        socketadmin = socket;
        console.log("admin connect");
    });
     socket.on("log",function (data) {
         console.log(data);
     });

    socket.on("data", function (data) {
        if(socketadmin)
            socketadmin.emit("data", data[0], data[1], data[2], data[3], data[4]);
    });
    
    socket.on("actdata",function (data) {
        data[4]=lpfx.next(data[7]);
        data[5]=lpfy.next(data[8]);
        data[6]=lpfz.next(data[9]);
        if(socketadmin)
            socketadmin.emit("actdata",data);
        var thistime=(new Date()).getTime();
        if(unity&&(thistime-lasttime)>60) {
            lasttime=thistime;
            unity.write(data[0]+'|'+data[1]+'|'+data[2]);
        }
    });
    
    socket.on("start",function () {
        if(socketadmin)
            socketadmin.emit("start");
        x=[0];
        y=[0];
        z=[0];
        lpfx.smoothing=lpfy.smoothing=lpfz.smoothing=0.5;
        lpfx.init(x);
        lpfy.init(y);
        lpfz.init(z);
        console.log("startttt");
    })
});

net.createServer(function(sock) {

    // 我们获得一个连接 - 该连接自动关联一个socket对象
    console.log('TCP-CONNECTED');

    unity=sock;

    sock.on('error',function (){});
    // 为这个socket实例添加一个"data"事件处理函数
    sock.on('data', function(data) {
        console.log('DATA ' + sock.remoteAddress + ': ' + data);
        // 回发该数据，客户端将收到来自服务端的数据
        sock.write('You said "' + data + '"');
    });

    // 为这个socket实例添加一个"close"事件处理函数
    sock.on('close', function(data) {
        console.log('CLOSED: ' +
            sock.remoteAddress + ' ' + sock.remotePort);
    });

}).listen(3001, '127.0.0.1');



