import React, { Component } from 'react';
import Board from './Board.js';
import './game.css';

class SizeInput extends Component {
	constructor(props) {
		super(props);
		this.state = {
			width: props.width || 15,
			height: props.height || 15,
		}
	}

	handleWidthChange(event) {
		const width = event.target.value;
		this.setState({
			width: width,
		}, () => {
			if(this.props.onChange) {
				this.props.onChange(this.state.width, this.state.height);
			}
		});
	}

	handleHeightChange(event) {
		const height = event.target.value;
		this.setState({
			height: height,
		}, () => {
			if(this.props.onChange) {
				this.props.onChange(this.state.width, this.state.height);
			}
		});
	}

	render() {
		return (
			<form className="size-input" onSubmit={() => this.props.onSubmit()}>
				<label htmlFor="widthInput">Width </label>
				<input 
					id="widthInput" 
					type="number"
					style={{width: '5em'}}
					step="1" min="1" max="100"
					value={this.state.width}
					onChange={(e) => this.handleWidthChange(e)}
				/>
				<label htmlFor="heightInput">Height </label>
				<input 
					id="heightInput" 
					type="number" 
					style={{width: '5em'}}
					step="1" min="1" max="100"
					value={this.state.height}
					onChange={(e) => this.handleHeightChange(e)}
				/>
				<input type="submit" value="New Board" />
			</form>
		);
	}
}

class ColorModal extends Component {
	constructor(props) {
		super(props)
		this.colorInput = React.createRef();
	}

	handleClose() {
		const newColor = this.colorInput.current.value;
		this.props.onClose(newColor || this.props.color);
	}

	render() {
		if(!this.props.show) {
			return null;
		}

		return (
			<div className="color-modal-backdrop">
				<div className="color-modal">
					<p>Current color is {this.props.color}</p>
					<label htmlFor="colorText">New Color (any CSS-valid format) </label>
					<input type="text" id="colorText"
						defaultValue={this.props.color}
						ref={this.colorInput}
						onKeyDown={(e) => {
							if(e.keyCode === 13) {//carriage return
								this.handleClose();
								return false;
							}
						}}
					/>
					
					<div className="modal-footer">
						<button onClick={() => this.handleClose()}>
							Save
						</button>
					</div>
				</div>
			</div>
		);
	}
}

class ColorPicker extends Component {

	handleEdit(i) {
		this.props.onColorEdit(i);
	}

	handleRemove(i) {
		this.props.onColorRemove(i);
	}

	handleAdd(i) {
		this.props.onColorAdd();
	}

	renderColorEntry(color, index) {
		if(index === this.props.blankColor) {
			return null;
		}
		const buttonStyle = {backgroundColor: color};
		if(index === this.props.currentColor) {
			buttonStyle.outline = '2px solid #F99034';
		}
		return (
			<li key={color + "|" + index}>
				<button 
					className="color-button"
					style={buttonStyle}
					onClick={() => this.props.onSelect(index)}
				/>
				<button 
					className="color-edit-button"
					onClick={() => this.handleEdit(index)}
				>
					<i className="fas fa-pen"/>
				</button>
				<button
					className="color-edit-button"
					onClick={() => this.handleRemove(index)}
				>
					<i className="fas fa-times"/>
				</button>
			</li>
		);
	}

	renderAddButton() {
		return <button
					className="color-add-button"
					onClick={() => this.handleAdd()}
				>
					<i className="fas fa-plus"/>
				</button>
	}

	render() {
		const colors = this.props.colors;
		return (
			<ul className="color-picker">
				{colors/*.filter((c,i) => i !== blankColor)*/
					.map((c,i) => this.renderColorEntry(c,i))}
				{this.renderAddButton()}
			</ul>
		);
	}
}

class Editor extends Component {
	constructor(props) {
		super(props);
		this.state = {
			width: 15,
			height: 15,
			colors: ['white', 'black', 'blue'],
			currentColor: 1,
			blankColor: 0,
			useHcpRules: false,
			//used to re-init board
			boardKey: 1,
			//used to control color editor modal
			isColorModalOpen: false,
			colorModalColor: null,
		}
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

	renderSizeInput() {
		return (
			<SizeInput 
				width={this.state.width}
				height={this.state.height}
				onChange={(w,h) => this.handleSizeChange(w,h)}
				onSubmit={() => this.handleNewBoard()}
			/>
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

	renderBoard() {
		return(
			<Board
				key={this.state.boardKey}
				width={this.state.width}
				height={this.state.height}
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
				<div className="in-a-row">
					{this.renderSizeInput()}
					{this.renderSaveButton()}
				</div>
				<div className="in-a-row">
					{this.renderColorInput()}
					{this.renderBoard()}
				</div>
				<ColorModal
					show={this.state.isColorModalOpen}
					color={this.state.colorModalColor}
					onClose={(c) => this.closeColorModal(c)}
				/>
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
