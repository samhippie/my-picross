import React, { Component } from 'react';
import Board from './Board.js';
import './game.css';
import SizeInput from './editor/SizeInput.js';
import ColorModal from './editor/ColorModal.js';
import ColorPicker from './editor/ColorPicker.js';
import ImportModal from './editor/ImportModal.js';

class Editor extends Component {
	constructor(props) {
		super(props);
		this.state = {
			width: 15,
			height: 15,
			squares: null,
			colors: ['white', 'black', 'blue'],
			currentColor: 1,
			blankColor: 0,
			useHcpRules: false,
			//used to re-init board
			boardKey: 1,
			//used to control color editor modal
			isColorModalOpen: false,
			colorModalColor: null,
			name: "Untitled",
			isImportModalOpen: false,
		}
	}

	handleNameChange(event) {
		this.setState({
			name: event.target.value,
		});
	}

	//after the board itself is updated, we need to update the
	//counts, as we are editting the puzzle, not solving it
	handleBoardClick(board, i) {
		board.updateRowCount(Math.floor(i/board.state.width));
		board.updateColCount(i % board.state.width);
		this.setState({
			squares: board.getSquares(),
		});
	}

	//changes the saved board size, but does  not update the current board
	handleSizeChange(width, height) {
		this.setState({
			width: width,
			height: height,
		});
	}

	//creates a new board, useful for changing board size
	handleNewBoard() {
		this.setState({
			boardKey: this.state.boardKey+1,
		});
	}

	//changes the current color for drawing
	handleColorSelect(i) {
		this.setState({
			currentColor: i,
		});
	}

	//launches the color modal with the selected color
	handleColorEdit(i) {
		const color = this.state.colors[i];
		this.setState({
			isColorModalOpen: true,
			colorModalColor: color,
		});
	}

	handleColorRemove(i) {
		const colors = this.state.colors.slice();
		colors.splice(i, 1);
		this.setState({
			colors: colors,
		});
	}

	handleColorAdd() {
		const colors = this.state.colors.slice();
		colors.push(getRandomColor());
		this.setState({
			colors: colors,
		});
	}

	//closes the color modal, saving its color selection
	closeColorModal(newColor) {
		const oldColor = this.state.colorModalColor;
		const newColors = this.state.colors.slice();
		const i = newColors.indexOf(oldColor);
		newColors[i] = newColor;
		this.setState({
			isColorModalOpen: false,
			colors: newColors,
		});
	}

	handleSave() {
		//get all the important data together
		const data = {
			version: 1,
			name: this.state.name,
			width: this.state.width,
			height: this.state.height,
			colors: this.state.colors,
			blankColor: this.state.blankColor,
			useHcpRules: this.state.useHcpRules,
			squares: this.state.squares,
		};
		//spit it out to console (for now)
		const strData = JSON.stringify(data);
		const encData = Buffer.from(strData).toString("base64");
		console.log("begin data dump");
		console.log(encData);
		console.log("end data dump");
		alert("dumped game data to console");
	}

	handleShowImport() {
		this.setState({
			isImportModalOpen: true,
		});
	}

	handleCloseImport() {
		this.setState({
			isImportModalOpen: false,
		});
	}

	handleImport(data) {
		this.setState({
			width: data.width,
			height: data.height,
			colors: data.colors,
			blankColor: 0,
			currentColor: 1,
			squares: data.squares,
			boardKey: this.state.boardKey + 1,
			isImportModalOpen: false,
		});
	}

	renderNameInput() {
		return (
			<input 
				type="text" 
				value={this.state.name}
				onChange={(e) => this.handleNameChange(e)}
			/>
		);
	}

	renderSizeInput() {
		return (
			<SizeInput 
				width={this.state.width}
				height={this.state.height}
				onSubmit={() => this.handleNewBoard()}
				onChange={(w,h) => this.handleSizeChange(w,h)}
			/>
		);
	}

	renderImportButton() {
		return (
			<button
				className="save-button"
				onClick={() => this.handleShowImport()}
			>
				Import From Image
			</button>
		);
	}

	renderSaveButton() {
		return (
			<button
				className="save-button"
				onClick={() => this.handleSave()}
			>
				Save
			</button>
		)
	}

	renderColorInput() {
		return (
			<ColorPicker
				colors={this.state.colors}
				currentColor={this.state.currentColor}
				blankColor={this.state.blankColor}
				onSelect={(i) => this.handleColorSelect(i)}
				onColorEdit={(i) => this.handleColorEdit(i)}
				onColorRemove={(i) => this.handleColorRemove(i)}
				onColorAdd={() => this.handleColorAdd()}
			/>
		);
	}

	renderColorModal() {
		return (
			<ColorModal
				show={this.state.isColorModalOpen}
				color={this.state.colorModalColor}
				onClose={(c) => this.closeColorModal(c)}
			/>
		);
	}

	renderImportModal() {
		return (
			<ImportModal
				show={this.state.isImportModalOpen}
				onClose={() => this.handleCloseImport()}
				onImport={d => this.handleImport(d)}
			/>
		);
	}

	renderBoard() {
		return(
			<Board
				key={this.state.boardKey}
				width={this.state.width}
				height={this.state.height}
				squares={this.state.squares}
				colors={this.state.colors}
				blankColor={0}
				currentColor={this.state.currentColor}
				useHcpRules={this.state.useHcpRules}
				onClick={(board, i) => this.handleBoardClick(board, i)}
			/>
		);
	}


	render() {
		return (
			<div>
				<h2>Editor</h2>
				{this.renderNameInput()}
				<div className="in-a-row">
					{this.renderSizeInput()}
					{this.renderImportButton()}
					{this.renderSaveButton()}
				</div>
				<div className="in-a-row">
					{this.renderColorInput()}
					{this.renderBoard()}
				</div>
				{this.renderColorModal()}
				{this.renderImportModal()}
			</div>
		);
	}
}

function getRandomColor() {
	//rainbow colors, because why not
	const colors = [
		'red',
		'orange',
		'yellow',
		'green',
		'blue',
		'indigo',
		'violet'
	];
	const i = Math.floor(Math.random()*colors.length)
	return colors[i];
}

export default Editor;
