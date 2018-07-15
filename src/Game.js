import React, { Component } from 'react';
import { Redirect } from 'react-router';
import Board from './Board.js';
import './game.css'

//this is a bit different from the one in Editor.js
//If I have to make a third iteration, then I'm going to abstract it out
class ColorPicker extends Component {

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
		//const id = this.props.match.params.id;
		//we would fetch the game from somewhere
		const encGameData = getTestGameData();
		const gameData = JSON.parse(atob(encGameData));
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
			isFinished: false,
			showEndModal: false,
		};
	}

	handleColorSelect(i) {
		this.setState({
			currentColor: i,
		});
	}

	checkCounts(board, i) {
		const row = Math.floor(i / this.state.width);
		const col = i % this.state.width;
		board.checkRowCompleted(row)
		board.checkColCompleted(col)
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
			goHome: true,
		});
	}

	renderColorInput() {
		return (
			<ColorPicker
				colors={this.state.colors}
				currentColor={this.state.currentColor}
				blankColor={this.state.blankColor}
				onSelect={(i) => this.handleColorSelect(i)}
			/>
		);
	}

	renderBoard() {
		return (
			<Board
				width={this.state.width}
				height={this.state.height}
				colors={this.state.colors}
				blankColor={this.state.blankColor}
				currentColor={this.state.currentColor}
				useHcpRules={this.state.useHcpRules}
				squares={this.state.squares}
				solSquares={this.state.solSquares}
				enableRightClick={true}
				onClick={(b,i) => this.checkCounts(b,i)}
				onFinish={b => this.handleFinish(b)}
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
		if(this.state.goHome) {
			return <Redirect to="/"/>
		}
		return (
			<div>
				<h2>"{this.state.name}"</h2>
				<div className="in-a-row">
					{this.renderColorInput()}
					{this.renderBoard()}
				</div>
				{this.renderEndModal()}
			</div>
		);
	}
}

function getTestGameData() {
	return "eyJ2ZXJzaW9uIjoxLCJuYW1lIjoiVGVzdCBQdXp6bGUiLCJ3aWR0aCI6IjEwIiwiaGVpZ2h0IjoiMTAiLCJjb2xvcnMiOlsid2hpdGUiLCJibGFjayIsImJsdWUiXSwiYmxhbmtDb2xvciI6MCwidXNlSGNwUnVsZXMiOmZhbHNlLCJzcXVhcmVzIjpbMSwxLDEsMCwyLDIsMiwwLDAsMSwxLDAsMCwwLDIsMCwyLDAsMCwxLDEsMSwxLDAsMiwyLDIsMCwwLDEsMCwwLDEsMCwyLDAsMiwwLDAsMSwxLDEsMSwwLDIsMCwyLDAsMCwxLDEsMCwwLDAsMSwwLDAsMCwwLDEsMSwxLDAsMSwxLDAsMCwwLDAsMSwxLDAsMSwwLDEsMiwyLDIsMiwyLDEsMCwwLDAsMSwyLDIsMiwyLDIsMSwwLDAsMCwxLDIsMiwyLDIsMl19"
}

export default Game;
