/**
* @file QLCPlus.js
* @brief The QLCPlus class
*/

//-----[ CLASS: QLCPlus ]-------------------------------------------
class QLCPlus
{
	constructor()
	{
		this.websocket = null;
		this.isConnected = false;
		this.wshost = "http://127.0.0.1:9999";
	}

	request(cmd, args)
	{
		if (!this.isConnected) throw new Error("Not Connected");

		var str = cmd;

		for (let i = 0; i < args.length; ++i)
		{
			str += "|" + args[i];
		}

		//console.log("QLC API <- " + str);
		this.websocket.send(str);
	}

	setSimpleDeskChannel(channel, value)
	{
		this.request("CH", [channel, value]);
	}

	setGrandMaster(value)
	{
		this.request("GM_VALUE", [value]);
	}

	connect(host)
	{
		var url = 'ws://' + host + '/qlcplusWS';
		this.websocket = new WebSocket(url);
		this.wshost = "http://" + host;

		this.websocket.onopen = function(ev) {
			console.log("QLC Connected");
			this.isConnected = true;
		}.bind(this);

		this.websocket.onclose = function(ev) {
			alert("QLC+ connection lost!");
		}.bind(this);

		this.websocket.onerror = function(ev) {
			alert("QLC+ connection error!");
		}.bind(this);

		this.websocket.onmessage = function(ev) {

		}.bind(this);
	}
} //class QLCPlus
