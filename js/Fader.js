/**
* @file Fader.js
* @brief The Fader class
*/

class Fader {
	constructor(faderElement) {
		var valueElement = document.createElement("div");
		valueElement.setAttribute("class", "value");

		var bodyElement = document.createElement("div");
		bodyElement.setAttribute("class", "body");

		var boundElement = document.createElement("div");
		boundElement.setAttribute("class", "bound");
		bodyElement.appendChild(boundElement);

		var handleElement = document.createElement("div");
		handleElement.setAttribute("class", "handle");
		boundElement.appendChild(handleElement);

		var peekElement = document.createElement("button");
		peekElement.setAttribute("class", "peek btn");

		peekElement.addEventListener('mousedown', this.handlePeekDown.bind(this));
		peekElement.addEventListener('touchstart', this.handlePeekDown.bind(this));
		peekElement.addEventListener('mouseup', this.handlePeekUp.bind(this));
		peekElement.addEventListener('touchend', this.handlePeekUp.bind(this));

		var labelElement = document.createElement("div");
		labelElement.setAttribute("class", "label");

		this.faderElement = faderElement;

		this.faderElement.appendChild(valueElement);
		this.faderElement.appendChild(bodyElement);
		this.faderElement.appendChild(peekElement);
		this.faderElement.appendChild(labelElement);

		this.faderBody = boundElement;
		this.handle = handleElement;
		this.valueText = valueElement;

		//this.faderBody = faderElement.querySelector('.body');
		//this.handle = faderElement.querySelector('.handle');
		//this.valueText = faderElement.querySelector('.value');

		this.startY = null;
		this.faderHeight = null;
		this.handleheight = null;

		this.max = parseInt(faderElement.getAttribute("max") || 100);

		this.value = parseInt(faderElement.getAttribute("value") || 0);
		labelElement.textContent = faderElement.getAttribute("label") || "";
		this.channel = faderElement.getAttribute("channel");
		this.onValueChanged = window[faderElement.getAttribute("onValueChanged")];

		this.onMouseDown = this.handleMouseDown.bind(this);
		this.onMouseMove = this.handleMouseMove.bind(this);
		this.onMouseUp = this.handleMouseUp.bind(this);

		this.handle.addEventListener('mousedown', this.onMouseDown);
		this.handle.addEventListener('touchstart', this.onMouseDown);

		//Apply initial value
		this.faderHeight = this.faderBody.offsetHeight;
		this.handleHeight = this.handle.offsetHeight;
		var percent = this.valueToPercent(this.value);
		this.setHandlePositionPercent(percent);
		this.setValueTextPercent(percent);
	}

	handlePeekDown(e) {
		this.oldValue = this.value;
		var percent = this.valueToPercent(this.max);
		this.setValuePercent(percent);
	}

	handlePeekUp(e) {
		var percent = this.valueToPercent(this.oldValue);
		this.setValuePercent(percent);
	}

	handleMouseDown(e) {
		e.preventDefault();

		if (e.type == "mousedown")
		{
			this.startY = e.clientY;
		}
		else if (e.type == "touchstart")
		{
			const { touches, changedTouches } = e.originalEvent ?? e;
			const touch = touches[0] ?? changedTouches[0];
			this.startY = touch.pageY;
		}

		this.faderHeight = this.faderBody.offsetHeight;
		this.handleHeight = this.handle.offsetHeight;

		document.addEventListener('mousemove', this.onMouseMove);
		document.addEventListener('mouseup', this.onMouseUp);

		document.addEventListener('touchmove', this.onMouseMove);
		document.addEventListener('touchend', this.onMouseUp);
	}

	handleMouseMove(e) {
		var y = this.startY;
		if (e.type == "mousemove")
		{
			this.startY = e.clientY;
		}
		else if (e.type == "touchmove")
		{
			const { touches, changedTouches } = e.originalEvent ?? e;
			const touch = touches[0] ?? changedTouches[0];
			this.startY = touch.pageY;
		}

		var percent = 1 - ((y - this.faderBody.getBoundingClientRect().y) / this.faderHeight);
		if (percent < 0) percent = 0;
		else if (percent > 1) percent = 1;

		this.setValuePercent(percent);
	}

	handleMouseUp() {
		this.startY = null;

		document.removeEventListener('mousemove', this.onMouseMove);
		document.removeEventListener('mouseup', this.onMouseUp);

		document.removeEventListener('touchmove', this.onMouseMove);
		document.removeEventListener('touchend', this.onMouseUp);
	}

	setHandlePositionPercent(percent)
	{
		this.handle.style.top = "calc(" + Math.round((1 - percent) * 100) + "%"; //- " + this.handleHeight + "px)";
	}

	percentToValue(percent)
	{
		return Math.round(percent * this.max);
	}

	valueToPercent(val)
	{
		return val / this.max;
	}

	setValueTextPercent(percent)
	{
		this.valueText.textContent = Math.round(percent * 100) + "%"; // Update the value text
	}

	setValuePercent(percent)
	{
		this.setHandlePositionPercent(percent);
		this.setValueTextPercent(percent);

		this.value = this.percentToValue(percent);

		if (this.onValueChanged)
		{
			this.onValueChanged(this);
		}
	}

	setValue(val)
	{
		var percent = this.valueToPercent(val || 0);
		this.setValuePercent(percent);
		this.setHandlePositionPercent(percent);
	}
	
	/**
	* @brief Fade from the current value to a new value over the given time
	* @param to The value to which to fade
	* @duration The time over which to fade
	*/
	fade(to, duration)
	{
		console.log("Fader::fade(" + to + "," + duration + ")");
		this.faderFader = new FaderFader(this, to, duration);
		this.faderFader.start();
	}
} //class Fader

class FaderFader
{
	constructor(fader, to, duration)
	{
		this.fader = fader;
		this.to = to;
		this.duration = duration;
		this.onComplete = null;
		this.onStopped = null;
		
		this.tickHandler = this.onTick.bind(this);
	}
	
	start()
	{
		var valueDiff = this.to - this.fader.value; //How far do we need to fade?
		if (valueDiff != 0) //Do we need to move?
		{
			var msPerStep = Math.ceil(this.duration / Math.abs(valueDiff)); //How many ms per step?
			
			console.log("valueDiff=" + valueDiff + ", msPerStep=" + msPerStep);
			
			this.direction = (valueDiff > 0);
			this.timer = window.setInterval(this.tickHandler, msPerStep);
		}
		else
		{
			if (this.onComplete) this.onComplete().bind(this);
		}
	}
	
	stop()
	{
		window.clearInterval(this.timer); //Stop the timer
		if (this.onStopped) this.onStopped().bind(this);
	}
	
	onTick()
	{
		this.fader.setValue(this.direction ? this.fader.value + 1 : this.fader.value - 1);
		if (this.fader.value == this.to)
		{
			if (this.onComplete) this.onComplete().bind(this);
			this.stop();
		}
	}
} //class FaderFader
