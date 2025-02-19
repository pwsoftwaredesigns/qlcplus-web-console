/**
* @file Fader.js
* @brief The Fader class
*/

class Fader {
	constructor(faderElement)
	{
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

		this.peekElement = document.createElement("button");
		this.peekElement.setAttribute("class", "peek btn");
		this.peekElement.innerHTML = "<i class='bi-eye'></i>";
		
		this.upElement = document.createElement("button");
		this.upElement.setAttribute("class", "up btn");
		this.upElement.innerHTML = "<i class='bi-arrow-up'></i>";
		
		this.downElement = document.createElement("button");
		this.downElement.setAttribute("class", "down btn");
		this.downElement.innerHTML = "<i class='bi-arrow-down'></i>";

		var labelElement = document.createElement("div");
		labelElement.setAttribute("class", "label");
			
		const kDivisions = 4;
		for (let i = 1; i < kDivisions; i++)
		{
			let lineElement = document.createElement("div");
			lineElement.setAttribute("class", "line bg-secondary");
			lineElement.style.top = "calc(" + (i / kDivisions) * 100 + "% - (var(--handle-height) / 2))";
			boundElement.appendChild(lineElement);
		}

		this.faderElement = faderElement;

		this.faderElement.appendChild(valueElement);
		this.faderElement.appendChild(bodyElement);
		this.faderElement.appendChild(this.upElement);
		this.faderElement.appendChild(this.downElement);
		this.faderElement.appendChild(this.peekElement);
		this.faderElement.appendChild(labelElement);

		this.faderBody = boundElement;
		this.handle = handleElement;
		this.valueText = valueElement;

		this.offsetY = null;
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
		this.onPeekDown = this.handlePeekDown.bind(this);
		this.onPeekUp = this.handlePeekUp.bind(this);
		this.onUpClicked = this.handleUpClicked.bind(this);
		this.onDownClicked = this.handleDownClicked.bind(this);

		//Apply initial value
		this.faderHeight = this.faderBody.offsetHeight;
		this.handleHeight = this.handle.offsetHeight;
		var percent = this.valueToPercent(this.value);
		this.setHandlePositionPercent(percent);
		this.setValueTextPercent(percent);
		
		this.unlock();
	}

	/**
	* @brief The "Peek" button was pressed
	*/
	handlePeekDown(e)
	{
		this.oldValue = this.value;
		let percent = this.valueToPercent(this.max);
		this.setValuePercent(percent);
		
		document.addEventListener('mouseup', this.onPeekUp);
		document.addEventListener('touchend', this.onPeekUp);
	}

	/**
	* @brief The "Peek" button was released
	*/
	handlePeekUp(e)
	{
		let percent = this.valueToPercent(this.oldValue);
		this.setValuePercent(percent);
		
		document.removeEventListener('mouseup', this.onPeekUp);
		document.removeEventListener('touchend', this.onPeekUp);
	}
	
	/**
	* @brief The "Up" button was clicked
	*/
	handleUpClicked(e)
	{
		this.setValuePercent(1);
	}
	
	/**
	* @brief The "Down" button was clicked
	*/
	handleDownClicked(e)
	{
		this.setValuePercent(0);
	}

	/**
	* @brief The fader was pressed
	*/
	handleMouseDown(e)
	{
		e.preventDefault();

		let startY = 0;
		if (e.type == "mousedown")
		{
			startY = e.clientY;
		}
		else if (e.type == "touchstart")
		{
			const { touches, changedTouches } = e.originalEvent ?? e;
			const touch = touches[0] ?? changedTouches[0];
			startY = touch.pageY;
		}

		this.faderHeight = this.faderBody.offsetHeight;
		this.handleHeight = this.handle.offsetHeight;
		//Calculate the click/touch offset from the top of the handle
		this.offsetY = startY - this.handle.getBoundingClientRect().y;

		document.addEventListener('mousemove', this.onMouseMove);
		document.addEventListener('mouseup', this.onMouseUp);

		document.addEventListener('touchmove', this.onMouseMove);
		document.addEventListener('touchend', this.onMouseUp);
	}

	/**
	* @brief The fader was dragged
	*/
	handleMouseMove(e) {
		let y = 0;
		if (e.type == "mousemove")
		{
			y = e.clientY;
		}
		else if (e.type == "touchmove")
		{
			const { touches, changedTouches } = e.originalEvent ?? e;
			const touch = touches[0] ?? changedTouches[0];
			y = touch.pageY;
		}

		/*
		* The fader's percentage is calculated as the difference between the
		* mouse/touch's current Y position and the Y start position of the
		* fader's body. It also includes an offset clauclate at the start of the
		* click/touch so that the handle moves from where the user clicked/
		* touched it.
		*/
		let percent = 1 - ((y - this.faderBody.getBoundingClientRect().y - this.offsetY) / this.faderHeight);
		if (percent < 0) percent = 0;
		else if (percent > 1) percent = 1;

		this.setValuePercent(percent);
	}

	/**
	* @brief The fader was released
	*/
	handleMouseUp() {
		this.offsetY = null;

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
		if (val < 0) return 0;
		else if (val > this.maximum) return 1;
		else return val / this.max;
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
		let percent = this.valueToPercent(val || 0);
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
		if (this.faderFader) this.faderFader.stop();
		this.faderFader = null;
		
		this.faderFader = new FaderFader(this, to, duration);
		this.faderFader.start();
	}
	
	/**
	* @brief Lock the fader so that it cannot be moved by the user
	*
	* The fader is "locked" by disabling the user input events.
	*/
	lock()
	{
		this.handle.removeEventListener('mousedown', this.onMouseDown);
		this.handle.removeEventListener('touchstart', this.onMouseDown);
		this.peekElement.removeEventListener('mousedown', this.onPeekDown);
		this.peekElement.removeEventListener('touchstart', this.onPeekDown);
		this.upElement.removeEventListener('click', this.onUpClicked);
		this.downElement.removeEventListener('click', this.onDownClicked);
		
		//Hide
		this.peekElement.style.display = "none";
		this.upElement.style.display = "none";
		this.downElement.style.display = "none";
	}
	
	/**
	*  @brief Unlcok the fader so that it can be moved by the user
	*/
	unlock()
	{
		this.handle.addEventListener('mousedown', this.onMouseDown);
		this.handle.addEventListener('touchstart', this.onMouseDown);
		this.peekElement.addEventListener('mousedown', this.onPeekDown);
		this.peekElement.addEventListener('touchstart', this.onPeekDown);
		this.upElement.addEventListener('click', this.onUpClicked);
		this.downElement.addEventListener('click', this.onDownClicked);
		
		//Show
		this.peekElement.style.display = "";
		this.upElement.style.display = "";
		this.downElement.style.display = "";
	}
	
	setLocked(locked)
	{
		if (locked) this.lock();
		else this.unlock();
	}
	
} //class Fader

/**
* @brief Class which performs a "fade" over time for a Fader instance
*/
class FaderFader
{
	constructor(fader, to, duration)
	{
		this.fader = fader;
		this.to = to;
		this.duration = duration;
		this.onComplete = null;
		this.onStopped = null;
		
		this.kTickRate = 10;
		this.change = 1;
		this.diff = 0;
		
		this.tickHandler = this.onTick.bind(this);
	}
	
	start()
	{
		this.stop(); //To handle restart conditions
		
		this.diff = this.to - this.fader.value; //How far do we need to fade?
		const diffAbs = Math.abs(this.diff);
		
		const ticks = this.duration / this.kTickRate; //The number of ticks
		this.change = (this.diff > 0) ? Math.ceil(this.diff / ticks) : Math.floor(this.diff / ticks); //Change in value per tick
		
		if (diffAbs != 0) //Do we need to move?
		{
			this.countdown = this.duration;
			this.timer = window.setInterval(this.tickHandler, this.kTickRate);
		}
		else
		{
			if (this.onComplete) this.onComplete().bind(this);
		}
	}
	
	stop()
	{
		window.clearInterval(this.timer); //Stop the timer
		if (this.timer)
		{
			if (this.onStopped) this.onStopped().bind(this);
		}
		this.timer = null;
	}
	
	onTick()
	{
		var newValue = this.fader.value + this.change;
		if (this.diff > 0)
		{
			if (newValue > this.to) newValue = this.to;
		}
		else
		{
			if (newValue < this.to) newValue = this.to;
		}
		
		this.fader.setValue(newValue);
		
		if (this.fader.value == this.to)
		{
			if (this.onComplete) this.onComplete().bind(this);
			this.stop();
		}
	}
} //class FaderFader
