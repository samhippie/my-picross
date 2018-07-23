import React, { Component } from 'react';
import Board from './Board.js';
import { getRowNumbers } from './Board.js';
import './game.css'
import ColorPicker from './game/ColorPicker';
import EndModal from './game/EndModal';

class Game extends Component {
	constructor(props) {
		super(props);
		const gameData = props.gameData;
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

	componentDidMount() {
		//check too see if any rows/cols are already completed
		this.updateRowCompleted(0, this.state.height);
		this.updateColCompleted(0, this.state.width);
	}

	//checks if game is finished
	checkFinished() {
		//we only want to run this code once on finish
		if(this.state.isFinished) {
			return;
		}
		if(this.state.rowCompleted.reduce((acc, val) => acc && val, true) &&
		   this.state.colCompleted.reduce((acc, val) => acc && val, true)) {
			this.setState({
				isFinished: true,
				showEndModal: true,
			});
			this.props.onSolve();
		}
	}

	//checks the given range of rows for completeness
	//defaults to just checking 1
	updateRowCompleted(rStart, num = 1) {
		const width = this.state.width;
		const rowCompleted = this.state.rowCompleted.slice();
		for(let r = rStart; r < rStart + num; r++) {
			const row = this.state.squares.slice(r*width, (r+1) * width);
			const rowCount = getRowNumbers(this.props.blankColor, row, 
				this.state.useHcpRules);
			const target = this.state.rowCounts[r];
			const same = this.countCheck(target, rowCount);
			rowCompleted[r] = same;
		}
		this.setState({
			rowCompleted: rowCompleted,
		}, () => {
			this.checkFinished();
		});
	}

	//checks the given range of columns for completeness
	//defaults to just checking 1
	updateColCompleted(cStart, num = 1) {
		const width = this.state.width;
		const colCompleted = this.state.colCompleted.slice();
		for(let c = cStart; c < cStart + num; c++) {
			const col = this.state.squares.filter((sq, index) => {
				return index % width === c;
			});
			const colCount = getRowNumbers(this.props.blankColor, col, 
				this.state.useHcpRules);
			const target = this.state.colCounts[c];
			const same = this.countCheck(target, colCount);
			colCompleted[c] = same;
		}
		this.setState({
			colCompleted: colCompleted,
		}, () => {
			//we're already calling this in the row check
			//this.checkFinished()
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
				isFinished={this.state.isFinished}
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
