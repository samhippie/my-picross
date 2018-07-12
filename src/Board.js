import React, { Component } from 'react';

export const Directions = Object.freeze({
	NONE: 0,
	TOP: 1 << 0,
	BOTTOM: 1 << 1,
	LEFT: 1 << 2,
	RIGHT: 1 << 3,
});

class Square extends Component {
	render() {
		const style = {
			'backgroundColor': this.props.color,
		};
		if (this.props.thickOutline & Directions.LEFT) {
			style['borderLeftWidth'] = '2px';
		} if (this.props.thickOutline & Directions.RIGHT) {
			style['borderRightWidth'] = '2px';
		} if (this.props.thickOutline & Directions.TOP) {
			style['borderTopWidth'] = '2px';
		} if (this.props.thickOutline & Directions.BOTTOM) {
			style['borderBottomWidth'] = '2px';
		}
		return (
			<button 
				className="square" 
				onClick={this.props.onClick}
				style={style}
			/>
		);
	}
}

class CountSquare extends Component {
	renderText(color, text, key) {
		return (
			<li
				key={key}
				style={{'color': color }}>
				{text}
			</li>
		);
	}

	render() {
		return (
			<div className={this.props.isRow
								? "count-square-row"
								: "count-square-col"}>
				<ul>
				{this.props.values.filter(value => {
					return this.props.blankColor !== value.color;
				}).map((value, index) => {
					return this.renderText(value.color, value.count, index)
				})}
				</ul>
			</div>
		);
	}
}

class Board extends Component {
	constructor(props) {
		super(props);
		const width = props.width;
		const height = props.height || 15;
		//const blankColor = props.blankColor || 0;
		//const colors = props.colors || ['white', 'black'];
		const squares = props.squares || Array(width * height).fill(props.blankColor);
		//const useHcpRules = props.useHcpRules || false;
		const blockSize = props.blockSize || 5;
		this.state = {
			width: width,
			height: height,
			blockSize: blockSize,
			squares: squares,
			rowCounts: Array(height).fill(null),
			colCounts: Array(width).fill(null),
			//colors: colors,
			//currentColor: 1,
			//blankColor: blankColor,
			//useHcpRules: useHcpRules,
		}

		//init row counts
		this.state.rowCounts = Array.from({length: height}, (x,r) => {
			const row = this.state.squares.slice(r*width, (r+1) * width);
			return getRowNumbers(this.props.colors, row);
		});

		//init col counts
		this.state.colCounts = Array.from({length: width}, (x,c) => {
			const col = this.state.squares.filter((x, index) => {
				return index % width === c;
			});
			return getRowNumbers(this.props.colors, col);
		});
	}

	updateRowCount(r) {
		const width = this.state.width;
		const row = this.state.squares.slice(r*width, (r+1) * width);
		let rowCounts = this.state.rowCounts.slice();
		rowCounts[r] = getRowNumbers(this.props.colors, row);
		this.setState({
			rowCounts: rowCounts,
		});
	}
	
	updateColCount(c) {
		const width = this.state.width;
		const col = this.state.squares.filter((sq, index) => {
			return index % width === c;
		});
		let colCounts = this.state.colCounts.slice();
		colCounts[c] = getRowNumbers(this.props.colors, col);
		this.setState({
			colCounts: colCounts,
		});
	}

	handleClick(i) {
		const squares = this.state.squares.slice();
		if(squares[i] === this.props.currentColor) {
			squares[i] = 0;
		} else {
			squares[i] = this.props.currentColor;
		}
		this.setState({
			squares: squares,
		}, () => {
			if (this.props.onClick) {
				this.props.onClick(this, i);
			}
		});

	}

	renderSquare(i) {
		//we use the thick outline to divide the board into 5x5 blocks
		//the top left corner is always the corner of a block
		const r = Math.floor(i / this.state.width);
		const c = i % this.state.width;
		const blockSize = this.state.blockSize;
		let outline = Directions.NONE;
		if (r % blockSize === 0) {
			outline |= Directions.TOP;
		}
		else if (r % blockSize === blockSize-1) {
			outline |= Directions.BOTTOM;
		}
		if (c % blockSize === 0) {
			outline |= Directions.LEFT;
		}
		else if (c % blockSize === blockSize-1) {
			outline |= Directions.RIGHT;
		}
		return (
			<Square 
				key={i}
				color={this.props.colors[this.state.squares[i]]}
				onClick={() => this.handleClick(i)}
				thickOutline={outline}
			/>
		);
	}

	renderRow(r) {
		//render all the squares, and then render the row's count squares
		return (
			<div className="board-row">
				{Array.from({length: this.state.width}, (x,i) => this.renderSquare(r*this.state.width + i))}
				{this.renderCountSquare(true, r)}
			</div>
		);
	}

	renderCountSquare(isRow, i) {
		return (
			<CountSquare 
				key={(isRow? 1 : -1) * i}
				isRow={isRow}
				blankColor={this.props.colors[this.props.blankColor]}
				values={isRow 
					? this.state.rowCounts[i] 
					: this.state.colCounts[i]
				}
			/>
		);
	}

	//this can just be rendered like a row
	//the other counts need to be a part of the row
	renderColCounts() {
		return (
			<div className="board-row">
				{this.state.colCounts.map((elem, index) => {
					return this.renderCountSquare(false, index);
				})}
			</div>
		);
	}

	render() {
		return (
			<div>
				{Array.from({length: this.state.height}, (x,i) => this.renderRow(i))}
				{this.renderColCounts()}
			</div>
		);
	}
}

//returns a list of pairs, (color index, # of blocks)
//does this for all colors, including white
function getRowNumbers(colorMap, row) {
	let nums = [];
	let cur = null;
	let curCount = 0;
	row.forEach(c => {
		if (c === cur) {
			curCount += 1;
		} else {
			if (cur !== null) {
				nums.push({
					color: colorMap[cur], 
					count: curCount,
				});
			}
			cur = c;
			curCount = 1;
		}
	});
	//still have to add the last string
	nums.push({
		color: colorMap[cur],
		count: curCount,
	});
	return nums
}

export default Board;
