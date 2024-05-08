//Constants
const kSceneModeEdit = "edit";
const kSceneModeRun = "run";
//DOM selector query for the scene mode switch
const kSelectorSceneMode = 'input[type=radio][name=selectMode]';
const kSelectorConnectingSpinner = "label[for=btnConnect] .spinner";
const kLockGMFader = false; //Should the Grand Master fader be lockable?

//Globals
var qlc = new QLCPlus(autoReconnect = true);
var scenes = [];
var faders = [];
var gmFader = null;
var currentSceneIndex = null;
var sceneUIs = [];
var sceneMode = kSceneModeEdit;
var editSceneModal = null;

//-----[ FUNCTION: init ]-------------------------------------------------------
/**
* @brief Initialize the application
*/
function init()
{
	//Default values
	scenes = [];
	faders = [];
	gmFader = null;
	currentSceneIndex = null;
	sceneUIs = [];
	sceneMode = kSceneModeEdit;
	editSceneModal = null;
	
	//Grand Master
	const gmFaderElement = document.querySelectorAll('#gm');
	gmFader = new Fader(gmFaderElement[0]);

	//Channels
	const faderElements = document.querySelectorAll('#faders > .fader');
	for (let i = 0; i < faderElements.length; i++)
	{
		var fader = new Fader(faderElements[i]);
		faders.push(fader);
	}

	$(kSelectorSceneMode).change(function() {
		setSceneMode(this.value);
	});

	$('input[type=radio][name=lock]').change(function() {
		setLock(this.value == "true");
	});

	$("#btnEditSceneSave").click(function(){
		var fields = document.querySelector("#formEditScene input");
		var attributes = {};
		$("#formEditScene input").each(function(){
			attributes[this.name] = this.value;
		});

		const index = $("#formEditScene input[name='scene']").val();
		console.log("Setting scene " + index + " attributes");
		scenes[index].setAttributes(attributes);
		editSceneModal.hide();
		persistScenes();
		updateSceneTable();
	});

	$("#formEditScene .btn-quick-duration").click(function(){
		$("#formEditScene input[name='duration']").val(this.value);
	});

	$("#btnConnect").click(function(){
		if (this.checked) connect();
		else disconnect();
	});
	
	qlc.onconnecting = function(){
		$(kSelectorConnectingSpinner).show();
	};
	qlc.onconnected = function(){
		$(kSelectorConnectingSpinner).hide();
		
		//Apply current fader states to QLC
		sendAllFaders();
	};
	qlc.ondisconnected = function(){
		$(kSelectorConnectingSpinner).hide();
	};
	
	$(kSelectorConnectingSpinner).hide();

	setSceneMode(sceneMode);

	//Saved scenes
	restoreScenes();
	
	//Auto connect
	$("#btnConnect").prop("checked", true);
	connect();
}

//-----[ FUNCTION: confirmModal ]-----------------------------------------------
/**
* @brief Display a modal to confirm (okay or cancel) an operation
* @param title A string to display as the modal's title
* @param message A string to display as the modal's body
* @param callback A function to call if the modal is confirmed (ok)
*/
function confirmModal(title, message, callback)
{
	let confirmModal = new bootstrap.Modal("#confirmModal", {
		focus: true
	});
	$("#confirmModal .modal-title").text(title);
	$("#confirmModal .modal-body p").text(message);
	$("#confirmModal .modal-okay").one('click', function(){
		callback();
		confirmModal.hide();
	});

	confirmModal.show();
}

//-----[ FUNCTION: sendAllFaders ]----------------------------------------------
function sendAllFaders()
{
	qlc.setGrandMaster(gmFader.value);
	for (let i = 0; i < faders.length; i++)
	{
		qlc.setSimpleDeskChannel(faders[i].channel, faders[i].value);
	}
}

//-----[ FUNCTION: onChannelInput ]---------------------------------------------
/**
* @brief Handle a channel fader change
*/
function onChannelInput(self)
{
	var channel = self.channel;
	var val = self.value;

	try
	{
		if (channel == 0)
		{
			qlc.setGrandMaster(val);
		}
		else
		{
			qlc.setSimpleDeskChannel(channel, val);
		}

	}
	catch(e)
	{
		//console.error(e);
	}
}

//-----[ FUNCTION: updateSceneTable ]-------------------------------------------
/**
* @brief Populate the table of scenes
*/
function updateSceneTable()
{
	var scenesTable = document.getElementById("scenes");

	scenesTable.innerHTML = "";
	sceneUIs = [];

	for (let i = 0; i < scenes.length; i++)
	{
		var row = document.createElement("tr");
		scenesTable.appendChild(row);

		var colName = document.createElement("td");
		colName.textContent = scenes[i].name;
		row.appendChild(colName);

		var colTransition = document.createElement("td");
		colTransition.textContent = scenes[i].duration;
		row.appendChild(colTransition);

		sceneUIs.push(new SceneUI(i, row));
	}

	currentSceneIndex = null;
} //function updateSceneTable

//-----[ FUNCTION: newScene ]---------------------------------------------------
/**
* @brief Create a new scene with the given name
*/
function newScene(name)
{
	var nextSceneNumber = scenes.length + 1;

	scenes.push(new Scene("Scene " + nextSceneNumber));
	//Save the current fader settings to the new scene
	saveScene(scenes.length - 1);
	updateSceneTable();

	persistScenes();
} //function newScene

//-----[ FUNCTION: arrayMove ]--------------------------------------------------
function arrayMove(arr, from, to)
{
	var element = arr[from];
	arr.splice(from, 1);
	arr.splice(to, 0, element);
}

//-----[ FUNCTION: moveSceneUp ]------------------------------------------------
function moveSceneUp(index)
{
	if (index > 0)
	{
		arrayMove(scenes, index, index - 1);
		updateSceneTable();
		persistScenes();
	}
}

//-----[ FUNCTION: moveSceneDown ]----------------------------------------------
function moveSceneDown(index)
{
	if (index < scenes.length - 1)
	{
		arrayMove(scenes, index, index + 1);
		updateSceneTable();
		persistScenes();
	}
}

//-----[ FUNCTION: removeScene ]------------------------------------------------
/**
* @brief Delete a scene
*/
function removeScene(index)
{
	scenes.splice(index, 1);
	updateSceneTable();
	persistScenes();

	console.log("Removed scene " + index);
} //function newScene

//-----[ FUNCTION: persistScenes ]----------------------------------------------
/**
* @brief Persist scenes to local storeage
*/
function persistScenes()
{
	localStorage.setItem("scenes", JSON.stringify(scenes));
} //function persistScenes

//-----[ FUNCTION: restoreScenes ]----------------------------------------------
function restoreScenes()
{
	let savedScenes = localStorage.getItem("scenes");
	if (savedScenes)
	{
		let data = JSON.parse(savedScenes);
		scenes = [];
		for (let i = 0; i < data.length; i++)
		{
			scenes.push(Scene.fromData(data[i]));
		}

		updateSceneTable();
	}
}

//-----[ FUNCTION: setLock ]----------------------------------------------------
/**
* @brief Lock/unlock the faders
* @param locked Boolean spcifying if the faders are locked (true) or 
*        unlocked (false)
*/
function setLock(locked)
{
	/*
	* Hide/show DOM elements when locked/unlocked
	* .app-locked: Shown when locked, hidden when unlocked
	* .app-unlocked: Shown when unlocked, hidden when locked
	*/
	if (locked)
	{
		$(".app-locked").css({"visibility":"visible", "display":""});
		$(".app-unlocked").css({"visibility":"hidden", "display":"none"});
	}
	else
	{
		$(".app-locked").css({"visibility":"hidden", "display":"none"});
		$(".app-unlocked").css({"visibility":"visible", "display":""});
	}
	
	setSceneMode(kSceneModeRun);
	
	if (kLockGMFader) gmFader.setLocked(locked);

	for (let i = 0; i < faders.length; i++)
	{
		faders[i].setLocked(locked);
	}
}

//-----[ FUNCTION: setSceneMode ]-----------------------------------------------
function setSceneMode(mode)
{
	$(kSelectorSceneMode).val([mode]);
	sceneMode = mode;

	console.log("Scene mode changed to " + mode);

	if (mode == kSceneModeEdit)
	{
		$(".scene-edit").css({"visibility":"visible", "display":""});
		$(".scene-run").css({"visibility":"hidden", "display":"none"});
	}
	else if (sceneMode == kSceneModeRun)
	{
		$(".scene-edit").css({"visibility":"hidden", "display":"none"});
		$(".scene-run").css({"visibility":"visible", "display":""});
	}
}

//-----[ FUNCTION: scrollToScene ]----------------------------------------------
/**
* @brief Scroll the scene table so that the given scene index is visible
*/
function scrollToScene(index)
{
	const kBuffer = 100;

	let table = $("#tableScenes");
	let tr = $(sceneUIs[index].trElement);
	let trTop = tr.position().top;

	let diff = trTop - table.height() + kBuffer;

	$("#tableScenes").scrollTop((diff > 0) ? trTop : 0);
}

//-----[ FUNCTION: selectScene ]------------------------------------------------
/**
* @brief Change to the given scene
*/
function selectScene(index, transition = "fade")
{
	console.log("Select Scene " + index);

	currentSceneIndex = index;

	if (index < sceneUIs.length)
	{
		for (let i = 0; i < sceneUIs.length; i++)
		{
			sceneUIs[i].makeInactive();
		}
		sceneUIs[index].makeActive();

		if (transition == "fade")
		{
			scenes[index].fadeTo(faders);
		}
		else
		{
			scenes[index].cutTo(faders);
		}
	}
}

//-----[ FUNCTION: nextScene ]--------------------------------------------------
/**
* @brief Change to the next scene in the list
*/
function nextScene()
{
	if (sceneUIs.length > 0) {
		if (currentSceneIndex !== null) {
			currentSceneIndex += 1;
		} else {
			currentSceneIndex = 0;
		}

		if (currentSceneIndex >= sceneUIs.length) {
			currentSceneIndex = 0;
		}

		selectScene(currentSceneIndex);
		scrollToScene(currentSceneIndex);
	}
}

//-----[ FUNCTION: prevScene ]--------------------------------------------------
/**
* @brief Change to the previous scene in the list
*/
function prevScene()
{
	if (sceneUIs.length > 0) {
		if (currentSceneIndex !== null) {
			currentSceneIndex -= 1;
		} else {
			currentSceneIndex = sceneUIs.length - 1;
		}

		if (currentSceneIndex < 0) {
			currentSceneIndex = sceneUIs.length - 1;
		}

		selectScene(currentSceneIndex);
		scrollToScene(currentSceneIndex);
	}
}

//-----[ FUNCTION: saveScene ]--------------------------------------------------
/**
* @brief Save the current fader settings to the scene at the given
*        index.
*/
function saveScene(index)
{
	if (index < scenes.length)
	{
		console.log("Saving faders to scene " + index);
		scenes[index].values = [];
		for (let i = 0; i < faders.length; i++)
		{
			scenes[index].values[i] = faders[i].value;
		}
		persistScenes();
	}
}

//-----[ FUNCTION: editScene ]--------------------------------------------------
function editScene(index)
{
	//Populate the modal
	const scene = scenes[index];
	const attributes = scene.attributes();
	for (const key in attributes)
	{
		var inputField = document.querySelector("#formEditScene input[name='" + key + "']");
		if (inputField)
		{
			inputField.value = attributes[key];
		}
	}
	document.querySelector("#formEditScene input[name='scene']").value = index;

	//Show the modal
	editSceneModal = new bootstrap.Modal("#editSceneModal", {
		focus: true
	});
	editSceneModal.show();
}

//-----[ FUNCTION: onSceneClicked ]---------------------------------------------
function onSceneClicked(index)
{
	if (sceneMode == kSceneModeEdit)
	{
		selectScene(index, "cut");
	}
	else
	{
		selectScene(index);
	}
}

//-----[ FUNCTION: resetApp ]---------------------------------------------------
/**
* @brief Reset the application deleting all saved scenes
*/
function resetApp()
{
	confirmModal("Reset", "Are you sure you want to reset the application?  This will delete all saved scenes and cannot be undone!", function(){
		localStorage.clear();
		location.reload();
	});
}

//-----[ FUNCTION: connect ]----------------------------------------------------
/**
* @brief Connect to QLC+
*/
function connect()
{
	qlc.connect('127.0.0.1:9999');
}

//-----[ FUNCTION: disconnect ]-------------------------------------------------
function disconnect()
{
	qlc.disconnect();
}

//-----[ FUNCTION: blackout ]---------------------------------------------------
function blackout()
{
	console.log("Blackout");
	gmFader.setValue(0);
}