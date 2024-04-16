/**
* @file QLCPlus.js
* @brief The QLCPlus class
*/

//-----[ CLASS: QLCPlus ]-------------------------------------------
class QLCPlus
{
	/*
	* States:
	* - Disconnected
	* - Connecting
	* - Connected
	*
	* Events:
	* - Connect
	* - Disconnect
	* - WSOpened
	* - WSClosed
	*/
	
	constructor(autoReconnect = false)
	{
		this._websocket = null;
		this._connectRequested = false;
		this._isConnected = false;
		this._autoReconnect = autoReconnect;
		
		//Events
		this.onconnecting = null;
		this.onconnected = null;
		this.ondisconnected = null;
	}

	_request(cmd, args)
	{
		if (!this._isConnected) throw new Error("Not Connected");

		var str = cmd;

		for (let i = 0; i < args.length; ++i)
		{
			str += "|" + args[i];
		}

		this._websocket.send(str);
	}

	setSimpleDeskChannel(channel, value)
	{
		this._request("CH", [channel, value]);
	}

	setGrandMaster(value)
	{
		this._request("GM_VALUE", [value]);
	}

	connect(host)
	{
		const kRetryTimeout = 1000;
		
		console.log("QLC Connect");
		
		this._connectRequested = true;
		this._host = 'ws://' + host + '/qlcplusWS';
		this._websocket = new WebSocket(this._host);

		if (this.onconnecting) this.onconnecting();
		
		this._websocket.onopen = function(ev) {
			console.log("QLC Connected");
			this._isConnected = true;
			if (this.onconnected) this.onconnected();
		}.bind(this);

		this._websocket.onclose = function(ev) {
			console.log("QLC+ connection lost!");
			
			if (this._connectRequested && this._autoReconnect)
			{
				console.log("Retrying connection after " + kRetryTimeout + "ms");
				setTimeout(function() {
			    	connect();
			    }.bind(this), kRetryTimeout);
			}
			else
			{
				if (this.ondisconnected) this.ondisconnected();		
			}
			
			this._isConnected = false;
		}.bind(this);

		this._websocket.onerror = function(ev) {
			console.log("QLC+ connection error!");
		}.bind(this);

		this._websocket.onmessage = function(ev) {

		}.bind(this);
	}
	
	disconnect()
	{
		console.log("QLC Disconnect");
		this._connectRequested = false;
		if (this._websocket) this._websocket.close();
	}
} //class QLCPlus
