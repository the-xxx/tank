var webs = require("ws");
var ws;

function connect () {
    
    function httpPost() {
        var xhr = cc.loader.getXMLHttpRequest();
        xhr.timeout = 10000;
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                var respone = xhr.responseText;
                var data=JSON.parse(respone);
                cc.log(typeof data,data.ip,data.first,'*********************')
                doConnect(data.ip,data.first);
            }
        };
        var url_temp = "http://120.24.45.64:7714";
        xhr.open("GET", url_temp, true);
        xhr.send();
    }
    httpPost();
}

function doConnect (ip, bfirst){
    if (bfirst){
        ws = new webs.server({
            host:ip,
            port:7714,
        });
        cc.log("WebSocket server init!!!");
        ws.on("connection", (wsobj)=>{
            wsobj.onopen = (e)=>{
                wsobj.send("hello");
            };
            wsobj.onmessage = (e)=>{
                console.log("message:",e.data);
                wsobj.send("message");
            };
        });
    }
    else{
        ws = new WebSocket("ws://"+ip+":7714");
        cc.log("WebSocket connect!!!");
        ws.onopen = (e)=>{
            ws.send("hello");
        };
        ws.onmessage = (e)=>{
            console.log("message:",e.data);
            ws.send("message");
        };
    }
}
module.exports = {
    connect,
}