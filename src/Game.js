import React, { Component } from 'react';
import Board from './Board.js';
import { getRowNumbers } from './Board.js';
import './game.css'

//this is a bit different from the one in Editor.js
//If I have to make a third iteration, then I'm going to abstract it out
class ColorPicker extends Component {

	renderColorEntry(color, index) {
		if(!this.props.useHcpRules && index === this.props.blankColor) {
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
			</li>
		);
	}

	render() {
		const colors = this.props.colors;
		return (
			<ul className="color-picker">
				{colors.map((c,i) => this.renderColorEntry(c,i))}
			</ul>
		);
	}
}

class EndModal extends Component {
	handleClose() {
		this.props.onClose();
	}

	handleHome() {
		this.props.onHome();
	}

	render() {
		if(!this.props.show) {
			return null;
		}

		return (
			<div className="modal-backdrop">
				<div className="modal">
					<p>You have completed "{this.props.name}"</p>
					<div className="modal-footer">
						<button onClick={() => this.handleClose()}>
							Close
						</button>
						<button onClick={() => this.handleHome()}>
							Home
						</button>
					</div>
				</div>
			</div>
		);
	}
}

class Game extends Component {
	constructor(props) {
		super(props);
		const gameData = props.gameData;
		//const id = this.props.match.params.id;
		//we would fetch the game from somewhere
		//const encGameData = getTestGameData();
		//const gameData = JSON.parse(atob(encGameData));
		//stores what the user has done, not the solution
		const squares = Array(gameData.width * gameData.height).fill(gameData.blankColor);
		this.state = {
			name: gameData.name,
			width: gameData.width,
			height: gameData.height,
			colors: gameData.colors,
			blankColor: gameData.blankColor,
			currentColor: 1,
			useHcpRules: gameData.useHcpRules,
			solSquares: gameData.squares,
			squares: squares,
			rowCounts: null, // these get inited later
			colCounts: null, //
			rowCompleted: Array(gameData.height).fill(false),
			colCompleted: Array(gameData.width).fill(false),
			isFinished: false,
			showEndModal: false,
		};

		//init row/col counts
		this.state.rowCounts = Array.from({length: gameData.height}, (x,r) => {
			const row = this.state.solSquares.slice(r*gameData.width, (r+1) * gameData.width);
			return getRowNumbers(this.state.blankColor, row, 
				gameData.useHcpRules);
		});
		this.state.colCounts = Array.from({length: gameData.width}, (x,c) => {
			const col = this.state.solSquares.filter((x, index) => {
				return index % gameData.width === c;
			});
			return getRowNumbers(this.state.blankColor, col, 
				gameData.useHcpRules);
		});
	}

	//generic check for color count equality
	countCheck(a, b) {
		//remove any crossed-out blocks (or blank if non-hcp)
		const colorCheck = (i) => {
			return i !== -1 &&
				   (this.state.useHcpRules || i !== this.state.blankColor);
		}
		const aNorm = a.filter(val => colorCheck(val.colorIndex));
		const bNorm = b.filter(val => colorCheck(val.colorIndex));
		if(aNorm.length !== bNorm.length) {
			return false;
		}
		//simple check for pairwise equality
		for(let i = 0; i < aNorm.length; i++) {
			if(aNorm[i].colorIndex !== bNorm[i].colorIndex || 
				aNorm[i].count !== bNorm[i].count) {
				return false;
			}
		}
		return true;
	}

	//checks if game is finished
	checkFinished() {
		if(this.state.rowCompleted.reduce((acc, val) => acc && val, true) &&
		   this.state.colCompleted.reduce((acc, val) => acc && val, true)) {
			this.setState({
				isFinished: true,
				showEndModal: true,
			});
		}
	}

	updateRowCompleted(r) {
		const width = this.state.width;
		const row = this.state.squares.slice(r*width, (r+1) * width);
		const rowCount = getRowNumbers(this.props.blankColor, row, 
			this.props.useHcpRules);
		const target = this.state.rowCounts[r];
		const same = this.countCheck(target, rowCount);
		const rowCompleted = this.state.rowCompleted.slice();
		rowCompleted[r] = same;
		this.setState({
			rowCompleted: rowCompleted,
		}, () => {
			this.checkFinished();
		});
	}

	updateColCompleted(c) {
		const width = this.state.width;
		const col = this.state.squares.filter((sq, index) => {
			return index % width === c;
		});
		const colCount = getRowNumbers(this.props.blankColor, col, 
			this.props.useHcpRules);
		const target = this.state.colCounts[c];
		const same = this.countCheck(target, colCount);
		console.log("target", target);
		console.log("current", colCount);
		const colCompleted = this.state.colCompleted.slice();
		colCompleted[c] = same;
		this.setState({
			colCompleted: colCompleted,
		}, () => {
			this.checkFinished()
		});
	}

	handleColorSelect(i) {
		this.setState({
			currentColor: i,
		});
	}

	handleSquareClick(i, event) {
		const squares = this.state.squares.slice();
		if(event.buttons & 1) {
			squares[i] = squares[i] !== this.state.currentColor
							? this.state.currentColor
							: 0;
		} else if(event.buttons) {
			squares[i] = squares[i] !== -1
							? -1
							: 0;
		} else {
			return;//nothing to update
		}
		this.setState({	
			squares: squares,
		}, () => {
			const row = Math.floor(i / this.state.width);
			this.updateRowCompleted(row);
			const col = i % this.state.width;
			this.updateColCompleted(col);
		});
	}

	handleFinish(board) {
		console.log("finished!");
		this.setState({
			isFinished: true,
			showEndModal: true,
		});
	}

	handleEndClose() {
		this.setState({
			showEndModal: false,
		});
	}

	handleEndHome() {
		this.setState({
			showEndModal: false,
		}, () => {
			this.props.onGoHome();
		});
	}

	renderColorInput() {
		return (
			<ColorPicker
				colors={this.state.colors}
				currentColor={this.state.currentColor}
				blankColor={this.state.blankColor}
				useHcpRules={this.state.useHcpRules}
				onSelect={(i) => this.handleColorSelect(i)}
			/>
		);
	}

	renderBoard() {
		return (
			<Board
				width={this.state.width}
				height={this.state.height}
				blockSize={5}
				colors={this.state.colors}
				blankColor={this.state.blankColor}
				currentColor={this.state.currentColor}
				useHcpRules={this.state.useHcpRules}
				squares={this.state.squares}
				rowCounts={this.state.rowCounts}
				colCounts={this.state.colCounts}
				rowCompleted={this.state.rowCompleted}
				colCompleted={this.state.colCompleted}
				onSquareClick={(i,e) => this.handleSquareClick(i,e)}
			/>
		);
	}

	renderEndModal() {
		return (
			<EndModal
				show={this.state.showEndModal}
				name={this.state.name}
				onClose={() => this.handleEndClose()}
				onHome={() => this.handleEndHome()}
			/>

		);
	}

	render() {
		return (
			<div>
				<div className="in-a-row">
					{this.renderColorInput()}
					{this.renderBoard()}
				</div>
				{this.renderEndModal()}
			</div>
		);
	}
}

export default Game;
