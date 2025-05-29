// Scene Factory for Reconstruction
class SceneFactory {
    static registry = {};

    /**
     * Register a scene class with its type ID.
     * @param {string} typeId - The unique identifier for the scene type.
     * @param {class} sceneClass - The class constructor.
     */
    static register(typeId, sceneClass) {
        this.registry[typeId] = sceneClass;
    }

    /**
     * Deserialize a scene from JSON, reconstructing the appropriate class.
     * @param {object} data - JSON object containing scene data.
     * @param {Array} faders - The faders to be associated with the reconstructed scene.
     * @return {object} - Reconstructed scene instance.
     */
    static fromData(data, faders) {
        const typeId = data.typeId;
        const sceneClass = this.registry[typeId];

        if (!sceneClass) {
            throw new Error(`Unrecognized scene typeId: ${typeId}`);
        }

        return sceneClass.fromData(data, faders); // Pass faders during reconstruction
    }

    /**
     * Serialize a scene to JSON.
     * @param {object} scene - The scene instance to serialize.
     * @return {object} - Serialized JSON object with typeId included.
     */
    static toData(scene) {
        const typeId = scene.constructor.typeId;
        return scene.constructor.toData(scene);
    }

    /**
     * Create a scene based on type ID
     * @param {string} type - Scene type ID
     * @param {Object[]} faders - Reference to faders
     * @param {string|null} name - Optional name for the scene
     * @returns {Object} New scene instance
     */
    static create(type, faders, name = null) {
        const sceneClass = this.registry[type];
        if (!sceneClass) {
            throw new Error(`Unknown scene type: ${type}`);
        }

        // Instantiate and return a new scene object
        return new sceneClass(faders, name);
    }
}