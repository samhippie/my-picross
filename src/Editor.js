import React, { Component } from 'react';
import Board from './Board.js';
import './editor.css';

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
					step="1" min="1" max="100"
					value={this.state.width}
					onChange={(e) => this.handleWidthChange(e)}
				/>
				<label htmlFor="heightInput">Height </label>
				<input 
					id="heightInput" 
					type="number" 
					step="1" min="1" max="100"
					value={this.state.height}
					onChange={(e) => this.handleHeightChange(e)}
				/>
				<input type="submit" value="New Board" />
			</form>
		);
	}
}

class Editor extends Component {
	constructor(props) {
		super(props);
		this.state = {
			width: 15,
			height: 15,
			boardKey: 1,
		}
	}

	handleBoardClick(board, i) {
		board.updateRowCount(Math.floor(i/board.state.width));
		board.updateColCount(i % board.state.width);
	}

	handleSizeChange(width, height) {
		this.setState({
			width: width,
			height: height,
		});
	}

	handleNewBoard() {
		this.setState({
			boardKey: this.state.boardKey+1,
		});
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

	renderColorInput() {
		//TODO
		return (
			<p>I am color input</p>
		);
	}

	renderBoard() {
		return(
			<Board
				key={this.state.boardKey}
				width={this.state.width}
				height={this.state.height}
				colors={['white', 'black']}
				blankColor={0}
				currentColor={1}
				useHcpRules={false}
				onClick={(board, i) => this.handleBoardClick(board, i)}
			/>
		);
	}

	render() {
		return (
			<div>
				<h2>Editor</h2>
				<p>Welcome to the editor</p>
				{this.renderSizeInput()}
				<div
					style={{
						'display': 'flex',
						'flex-direction': 'row'
					}}
				>
					{this.renderColorInput()}
					{this.renderBoard()}
				</div>
			</div>
		);
	}
}

export default Editor;
