//-----[ CLASS: Scene ]---------------------------------------------
class Scene
{
	static typeId = "basic"; 

	static toData(scene)
	{
		return {
			typeId: Scene.typeId,
			name: scene.name,
			values: scene.values,
			duration: scene.duration,
		};
	}

	static fromData(data)
	{
		let scene = new Scene(data["name"]);
		scene.values = data["values"];
		scene.duration = data["duration"];

		return scene;
	}

	constructor(faders, name)
	{
		this.faders = faders; // Reference to the faders this scene will control
		this.name = name; //User-defined name for the scene
		this.values = null; //Values to which faders are set
		this.duration = 1000; //Time (in ms) to fade to this scene
	}

	/**
	* @return The user-editable attributes of the scene as a
	*         javascript object
	*/
	attributes()
	{
		return {
			name: this.name,
			duration: this.duration
		};
	}

	/**
	* @brief Set the user-editable attributes of the scene
	*/
	setAttributes(attributes)
	{
		if (attributes.hasOwnProperty("name")) this.name = attributes["name"];
		if (attributes.hasOwnProperty("duration")) this.duration = attributes["duration"];
	}

	/**
	* @brief Fade the given set of faders to this scene
	*/
	fadeTo()
	{
		if (this.values)
		{
			for (let i = 0; i < this.faders.length; i++)
			{
				this.faders[i].fade(this.values[i], this.duration);
			}
		}
	}

	/**
	* @brief Cut (i.e., immediately no fading) the faders to the
	*        scene
	*/
	cutTo()
	{
		if (this.values)
		{
			for (let i = 0; i < this.faders.length; i++)
			{
				this.faders[i].setValue(this.values[i]);
			}
		}
	}

	exit()
	{
		//Do nothing
	}

} //class Scene
