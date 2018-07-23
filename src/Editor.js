import React, { Component } from 'react';
import { Redirect } from 'react-router';
import Board from './Board.js';
import { getRowNumbers } from './Board.js';
import './game.css';
import SizeInput from './editor/SizeInput';
import ColorModal from './editor/ColorModal';
import ColorPicker from './editor/ColorPicker';
import ImportModal from './editor/ImportModal';
import UploadModal from './editor/UploadModal';
import CompleteUploadModal from './editor/CompleteUploadModal.js';
import firebase, { firestore } from './firebase';

class Editor extends Component {
	constructor(props) {
		super(props);
		const width = 15;
		const height = 15;
		this.state = {
			width: width,
			height: height,
			squares: Array(width*height).fill(0),
			colors: ['white', 'black'],
			currentColor: 1,
			blankColor: 0,
			useHcpRules: false,
			isColorModalOpen: false,
			colorModalColor: null,
			name: "Untitled",
			isImportModalOpen: false,
			colorGen: colorGenerator(),
			isUploadModalOpen: false,
			isCompleteUploadModalOpen: false,
			uploadedPid: null,
			goHome: false,
		}
	}


	genFullRowCounts() {
		return Array.from({length: this.state.height}, (x,r) => {
			const row = this.state.squares.slice(r*this.state.width, 
												 (r+1) * this.state.width);
			return getRowNumbers(this.state.blankColor, row, 
				this.state.useHcpRules);
		});
	}

	genFullColCounts() {
		return Array.from({length: this.state.width}, (x,c) => {
			const col = this.state.squares.filter((x, index) => {
				return index % this.state.width === c;
			});
			return getRowNumbers(this.state.blankColor, col, 
				this.state.useHcpRules);
		});
	}

	handleNameChange(event) {
		this.setState({
			name: event.target.value,
		});
	}

	handleSquareClick(i, event) {
		//left click, toggle square
		const squares = this.state.squares.slice();
		if(event.buttons & 1) {
			squares[i] = squares[i] !== this.state.currentColor
						 ? this.state.currentColor
						 : this.state.blankColor;
			this.setState({
				squares: squares,
			});
		}
	}

	//changes the board size, adding/deleting rows/cols as appropriate
	handleSizeChange(width, height) {
		const oldWidth = this.state.width;
		const oldHeight = this.state.height;

		let squares = this.state.squares.slice();
		//use oldWidth here because we haven't changed width yet
		if(oldHeight < height) {
			//height increased, add some blank rows
			squares = squares.concat(Array(oldWidth * (height - oldHeight))
										.fill(this.state.blankColor));
		} else if(oldHeight > height) {
			//height decreased, remove some rows
			squares.splice(oldWidth * height, oldWidth * (oldHeight - height));
		}
		//use height here because we have already changed height
		if(oldWidth < width) {
			//width increased, insert some blank squares at the end of each row
			for(let r = height-1; r >= 0; r--) { 
				//reverse order to preserve indices on insert
				for(let j = oldWidth; j < width; j++) {
					squares.splice((r+1) * oldWidth, 0, this.state.blankColor);
				}
			}
		} else if(oldWidth > width) {
			//width decreased, delete some squares at the end of each row
			for(let r = height-1; r >= 0; r--) { 
				//reverse order to preserve indicies on delete
				squares.splice(r*oldWidth + width, oldWidth - width);
			}
		}
		this.setState({
			width: width,
			height: height,
			squares: squares,
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

	//removes the color from the puzzle
	//deletes any instances of the color in squares
	handleColorRemove(colorIndex) {
		const colors = this.state.colors.slice();
		colors.splice(colorIndex, 1);
		const squares = this.state.squares.slice();
		for(let i = 0; i < squares.length; i++) {
			if(squares[i] === colorIndex) {
				squares[i] = this.state.blankColor;
			}
		}
		this.setState({
			colors: colors,
			squares: squares,
		});
	}

	handleColorAdd() {
		const colors = this.state.colors.slice();
		colors.push(this.state.colorGen.next().value);
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

	handleShowUpload() {
		this.setState({
			isUploadModalOpen: true,
		});
	}

	handleCloseUpload() {
		this.setState({
			isUploadModalOpen: false,
		});
	}

	handleUpload(username, name) {
		this.setState({
			isUploadModalOpen: false,
		}, () => {
			//get all the important data together
			const data = {
				version: 1,
				name: name,
				width: this.state.width,
				height: this.state.height,
				colors: this.state.colors,
				blankColor: this.state.blankColor,
				useHcpRules: this.state.useHcpRules,
				squares: this.state.squares,
			};
			const strData = JSON.stringify(data);
			const encData = Buffer.from(strData).toString("base64");

			//get the metadata together
			const puzzleData = {
				data: encData,
				isHcp: this.state.useHcpRules,
				name: name,
				time: firebase.firestore.Timestamp.now(),
				uid: this.props.user.uid,
				username: username,
			}

			//upload it to firebase
			firestore.collection('puzzles').add(puzzleData)
				.then(docRef => {
				this.setState({
					isCompleteUploadModalOpen: true,
					uploadedPid: docRef.id,
				});
			});
		});
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
			isImportModalOpen: false,
		});
	}

	handleSetHcp(event) {
		this.setState({
			useHcpRules: event.target.checked,
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

	renderUploadButton() {
		return (
			<button
				className="save-button"
				onClick={() => this.handleShowUpload()}
			>
				Upload
			</button>
		)
	}

	renderColorInput() {
		return (
			<ColorPicker
				colors={this.state.colors}
				currentColor={this.state.currentColor}
				blankColor={this.state.blankColor}
				useHcpRules={this.state.useHcpRules}
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

	renderUploadModal() {
		return (
			<UploadModal
				show={this.state.isUploadModalOpen}
				isLoggedIn={this.props.user !== null}
				onClose={() => this.handleCloseUpload()}
				onSubmit={(u,n) => this.handleUpload(u, n)}
			/>
		);
	}

	renderCompleteUploadModal() {
		return (
			<CompleteUploadModal
				show={this.state.isCompleteUploadModalOpen}
				pid={this.state.uploadedPid}
				onClose={() =>
					this.setState({isCompleteUploadModalOpen: false})}
				onHome={() =>
					this.setState({goHome: true})}
			/>
		);
	}

	renderHcpToggle() {
		return (
			<form>
				<label htmlFor="hcp-check">Use HCP rules </label>
				<input 
					id="hcp-check"
					type="checkbox"
					checked={this.state.useHcpRules}
					onChange={(e) => this.handleSetHcp(e)}
				/>
			</form>
		);
	}

	renderBoard() {
		return(
			<Board
				key={this.state.boardKey}
				width={this.state.width}
				height={this.state.height}
				squares={this.state.squares}
				blockSize={5}
				colors={this.state.colors}
				blankColor={0}
				currentColor={this.state.currentColor}
				useHcpRules={this.state.useHcpRules}
				rowCounts={this.genFullRowCounts()}
				colCounts={this.genFullColCounts()}
				onSquareClick={(i,e) => this.handleSquareClick(i,e)}
			/>
		);
	}


	render() {
		if(this.state.goHome) {
			return <Redirect to="/"/>
		}

		return (
			<div>
				<div className="in-a-row">
					{this.renderUploadButton()}
				</div>
				<div className="in-a-row">
					{this.renderSizeInput()}
					{this.renderImportButton()}
				</div>
				<div className="in-a-row">
					<div>
						{this.renderHcpToggle()}
						{this.renderColorInput()}
					</div>
					{this.renderBoard()}
				</div>
				{this.renderColorModal()}
				{this.renderImportModal()}
				{this.renderUploadModal()}
				{this.renderCompleteUploadModal()}
			</div>
		);
	}
}

//yields some colors to be added
function* colorGenerator() {
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
	let i = 0;
	while(true) {
		yield colors[(i++) % colors.length];
	}
}

export default Editor;
