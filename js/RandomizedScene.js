class RandomizedScene {
	static typeId = "randomized";

    static toData(scene) {
        return {
			typeId: RandomizedScene.typeId,
			name: scene.name,
			values: scene.values,
			duration: scene.duration,
		};
    }

    static fromData(data) {
        let scene = new RandomizedScene(data["faders"], data["name"]);
        scene.values = data["values"];
        scene.duration = data["duration"];

        return scene;
    }

    constructor(faders, name) {
        this.faders = faders; // Reference to the faders this scene will control

        this.name = name; // User-defined name for the scene
        this.values = null; // Values to which faders are set
        this.duration = 100; // Time (in ms) for fading - relevant only for certain operations

        this.isRunning = false; // Indicates whether the randomizer is running
		this.remainingFaders = []; // Tracks which faders are left to be chosen
    }

    /**
     * @return The user-editable attributes of the scene as a
     *         javascript object
     */
    attributes() {
        return {
            name: this.name,
            duration: this.duration
        };
    }

    /**
     * @brief Set the user-editable attributes of the scene
     */
    setAttributes(attributes) {
        if (attributes.hasOwnProperty("name")) this.name = attributes["name"];
        if (attributes.hasOwnProperty("duration")) this.duration = attributes["duration"];
    }

    /**
     * @brief Immediately cut to a random fader's value. Ensures all valid faders are
     *        selected once before repeating.
     */
    fadeTo() {
        if (!this.values || this.faders.length === 0) {
            console.error("No faders or values have been assigned to the scene.");
            return;
        }

        this.isRunning = true;

        // Ensure we initialize the remainingFaders pool with valid faders
        this.initializePool();

        const randomizerLoop = async () => {
            while (this.isRunning) {
                // Step 1: Check if all valid faders have been used
                if (this.remainingFaders.length === 0) {
                    this.initializePool(); // Reinitialize the pool when all valid faders are used
                }

                // Step 2: Randomly choose one fader from the remaining pool
                const randomIndex = Math.floor(Math.random() * this.remainingFaders.length);
                const selectedIndex = this.remainingFaders[randomIndex];
                const selectedFader = this.faders[selectedIndex];
                const selectedValue = this.values[selectedIndex];

                // Step 3: Remove the selected fader from the pool
                this.remainingFaders.splice(randomIndex, 1);

                // Step 4: Immediately cut to the selected fader's value
                selectedFader.setValue(selectedValue);

                // Wait for the duration
                await this.delay(this.duration);

                // Step 5: Turn off the fader (set value to 0)
                selectedFader.setValue(0);

                // Optional: Add a delay between iterations
                await this.delay(100); // Small gap between cycles
            }
        };

        randomizerLoop();
    }

    /**
     * @brief Immediately set all faders to their stored values.
     */
    cutTo() {
        if (this.values) {
            for (let i = 0; i < this.faders.length; i++) {
                this.faders[i].setValue(this.values[i]);
            }
        }
    }

    /**
     * @brief Exit the randomizer process.
     */
    exit() {
        this.isRunning = false;
    }

	/**
     * @brief Initialize the pool of valid faders (those with non-zero values).
     */
    initializePool() {
        this.remainingFaders = this.faders
            .map((fader, index) => index) // Create an array with all indices
            .filter(index => this.values[index] > 0); // Keep only indices with non-zero values
    }

    /**
     * @brief Helper function for adding delay.
     * @param ms Duration to wait in milliseconds.
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}