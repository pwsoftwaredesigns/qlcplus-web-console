//-----[ CLASS: Scene ]---------------------------------------------
class Scene
{
	static toData(scene)
	{
		return scene;
	}

	static fromData(data)
	{
		let scene = new Scene(data["name"]);
		scene.values = data["values"];
		scene.duration = data["duration"];

		return scene;
	}

	constructor(name)
	{
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
	fadeTo(faders)
	{
		if (this.values)
		{
			for (let i = 0; i < faders.length; i++)
			{
				faders[i].fade(this.values[i], this.duration);
			}
		}
	}

	/**
	* @brief Cut (i.e., immediately no fading) the faders to the
	*        scene
	*/
	cutTo(faders)
	{
		if (this.values)
		{
			for (let i = 0; i < faders.length; i++)
			{
				faders[i].setValue(this.values[i]);
			}
		}
	}

} //class Scene
