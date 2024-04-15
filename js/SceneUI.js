//-----[ CLASS: SceneUI ]-------------------------------------------
class SceneUI
{
	constructor(scene, trElement)
	{
		this.scene = scene;
		this.trElement = trElement;
		this.trElement.onclick = this.onClicked.bind(this);

		let tdElement = $("<td class='scene-edit'></td>");
		let btnGroupElement = $("<div class='btn-group'></div>");

		let btnSave = $("<button type='button' class='btn btn-primary'><i class='bi-floppy'></i></button>");
		btnSave.click(function(e){
			e.stopPropagation();

			confirmModal(
			"Save Scene",
			"Are you sure you want to save the current fader values to this scene?",
			function(){
				saveScene(this.scene);
			}.bind(this)
			);


		}.bind(this));
		btnGroupElement.append(btnSave);

		let btnEdit = $("<button type='button' class='btn btn-primary'><i class='bi-pencil'></i></button>");
		btnEdit.click(function(e){
			e.stopPropagation();
			editScene(this.scene);
		}.bind(this));
		btnGroupElement.append(btnEdit);

		let btnRemove = $("<button type='button' class='btn btn-danger'><i class='bi-trash'></i></button>");
		btnRemove.click(function(e){
			e.stopPropagation();

			confirmModal(
			"Delete Scene",
			"Are you sure you want to delete this scene?",
			function(){
				removeScene(this.scene);
			}.bind(this)
			);
		}.bind(this));
		btnGroupElement.append(btnRemove);
		tdElement.append(btnGroupElement);

		let btnGroupMoveElement = $("<div class='btn-group ms-2'></div>");

		let btnMoveUp = $("<button type='button' class='btn btn-secondary'><i class='bi-arrow-up'></i></button>");
		btnMoveUp.click(function(e){
			e.stopPropagation();
			moveSceneUp(this.scene);
		}.bind(this));
		btnGroupMoveElement.append(btnMoveUp);

		let btnMoveDown = $("<button type='button' class='btn btn-secondary'><i class='bi-arrow-down'></i></button>");
		btnMoveDown.click(function(e){
			e.stopPropagation();
			moveSceneDown(this.scene);
		}.bind(this));
		btnGroupMoveElement.append(btnMoveDown);

		tdElement.append(btnGroupMoveElement);

		this.trElement.appendChild(tdElement[0]);
	}

	makeActive()
	{
		this.trElement.classList.add("scene-active");
	}

	makeInactive()
	{
		this.trElement.classList.remove("scene-active");
	}

	onClicked()
	{
		onSceneClicked(this.scene);
	}
}
