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
		let value = null;
		if(this.props.isCrossedOut) {
			style.backgroundColor = 'white';
			value = 'X';
		}
		//just show the color if it's finished
		if(this.props.isFinished) {
			value = null;
			style.outline = '0';
			style.border = '0';
		} else {
			if (this.props.thickOutline & Directions.LEFT) {
				style['borderLeftWidth'] = '2px';
			} if (this.props.thickOutline & Directions.RIGHT) {
				style['borderRightWidth'] = '2px';
			} if (this.props.thickOutline & Directions.TOP) {
				style['borderTopWidth'] = '2px';
			} if (this.props.thickOutline & Directions.BOTTOM) {
				style['borderBottomWidth'] = '2px';
			}
		}
		return (
			<button 
				className="square" 
				onMouseDown={e => this.props.onClick(e)}
				onMouseOver={e => this.props.onClick(e)}
				onContextMenu={e => e.preventDefault()}
				style={style}
			>
				{value}
			</button>
		);
	}
}

class CountSquare extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isHovered: false,
		};
	}

	handleMouseOver() {
		this.setState({
			isHovered: true,
		});
	}

	handleMouseLeave() {
		this.setState({
			isHovered: false,
		});
	}

	renderText(colorIndex, text, key, isSpecial) {
		const style = {};
		if(this.state.isHovered) {
			style.color = 'white';
			style.backgroundColor = this.props.colors[colorIndex];
		} else {
			style.color = this.props.colors[colorIndex];
		}
		if(isSpecial) {
			style.fontStyle = 'oblique';
			text = text + "*"
		} else {
			style.fontWeight = 'bold';
		}
		return (
			<li
				key={key}
				style={style}
				onMouseOver={() => this.handleMouseOver()}
				onMouseLeave={() => this.handleMouseLeave()}
			>
				{text}
			</li>
		);
	}

	//render a check when a row is complete
	renderComplete(key) {
		if(!this.props.isComplete) {
			return null;
		}

		return (
			<li key={key}>
				<i className="fas fa-check"/>
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
						return this.props.blankColor !== value.colorIndex;
					}).map((value, index) => {
						return this.renderText(value.colorIndex, Math.abs(value.count), index, value.count < 0)
					})}
					{this.renderComplete(this.props.values.length)}
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
		const squares = props.squares || Array(width * height).fill(props.blankColor);
		const blockSize = props.blockSize || 5;
		const solSquares = props.solSquares;
		this.state = {
			width: width,
			height: height,
			blockSize: blockSize,
			squares: squares,
			rowCounts: Array(height).fill(null),
			colCounts: Array(width).fill(null),
			rowCompleted: Array(height).fill(false),
			colCompleted: Array(width).fill(false),
			isFinished: false,
		}

		//if there is a given solution, use that for making the row counts
		//else, just use the blank squares
		let countSrc = solSquares
						? solSquares
						: squares;

		//init row counts
		this.state.rowCounts = Array.from({length: height}, (x,r) => {
			const row = countSrc.slice(r*width, (r+1) * width);
			return getRowNumbers(this.props.blankColor, row, false);
		});
		this.state.hcpRowCounts = Array.from({length: height}, (x,r) => {
			const row = countSrc.slice(r*width, (r+1) * width);
			return getRowNumbers(this.props.blankColor, row, true);
		});

		//init col counts
		this.state.colCounts = Array.from({length: width}, (x,c) => {
			const col = countSrc.filter((x, index) => {
				return index % width === c;
			});
			return getRowNumbers(this.props.blankColor, col, 
				false);
		});
		this.state.hcpColCounts = Array.from({length: width}, (x,c) => {
			const col = countSrc.filter((x, index) => {
				return index % width === c;
			});
			return getRowNumbers(this.props.blankColor, col, 
				true);
		});

	}

	updateRowCount(r) {
		const width = this.state.width;
		const row = this.state.squares.slice(r*width, (r+1) * width);
		let rowCounts = this.state.rowCounts.slice();
		rowCounts[r] = getRowNumbers(this.props.blankColor, row, false);
		this.setState({
			rowCounts: rowCounts,
		});
		let hcpRowCounts = this.state.hcpRowCounts.slice();
		hcpRowCounts[r] = getRowNumbers(this.props.blankColor, row, true);
		this.setState({
			hcpRowCounts: hcpRowCounts,
		});

	}
	
	updateColCount(c) {
		const width = this.state.width;
		const col = this.state.squares.filter((sq, index) => {
			return index % width === c;
		});
		let colCounts = this.state.colCounts.slice();
		colCounts[c] = getRowNumbers(this.props.blankColor, col, false);
		this.setState({
			colCounts: colCounts,
		});

		let hcpColCounts = this.state.hcpColCounts.slice();
		hcpColCounts[c] = getRowNumbers(this.props.blankColor, col, true);
		this.setState({
			hcpColCounts: hcpColCounts,
		});
	}

	//generic check for color count equality
	countCheck(a, b) {
		//remove any blank or crossed-out blocks
		const aNorm = a.filter(v => v.colorIndex !== this.props.blankColor && v.colorIndex !== -1);
		const bNorm = b.filter(v => v.colorIndex !== this.props.blankColor && v.colorIndex !== -1);
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

	//checks if game is finished, calls callback if it exists
	checkFinished() {
		if(this.state.rowCompleted.reduce((acc, val) => acc && val, true) &&
		   this.state.colCompleted.reduce((acc, val) => acc && val, true)) {
			this.setState({
				isFinished: true,
			}, () => {
				if(this.props.onFinish) {
					this.props.onFinish(this);
				}
			});
	   }
	}

	//updates rowCompleted if the given row is completed
	checkRowCompleted(r) {
		const width = this.state.width;
		const row = this.state.squares.slice(r*width, (r+1) * width);
		const rowCount = getRowNumbers(this.props.blankColor, row, 
			this.props.useHcpRules);
		const target = this.props.useHcpRules 
							? this.state.hcpRowCounts[r]
							: this.state.rowCounts[r];
		const same = this.countCheck(target, rowCount);
		const rowCompleted = this.state.rowCompleted.slice();
		rowCompleted[r] = same;
		this.setState({
			rowCompleted: rowCompleted,
		}, () => {this.checkFinished()});
	}

	//updates colCompleted if the given column is completed
	checkColCompleted(c) {
		const width = this.state.width;
		const col = this.state.squares.filter((sq, index) => {
			return index % width === c;
		});
		const colCount = getRowNumbers(this.props.blankColor, col, 
			this.props.useHcpRules);
		const target = this.props.useHcpRules 
							? this.state.hcpColCounts[c]
							: this.state.colCounts[c];
		const same = this.countCheck(target, colCount);
		const colCompleted = this.state.colCompleted.slice();
		colCompleted[c] = same;
		this.setState({
			colCompleted: colCompleted,
		}, () => {this.checkFinished()});
	}
	
	getSquares() {
		return this.state.squares;
	}

	handleClick(i, event) {
		//don't let the user do anything if they've finished the puzzle
		if(this.state.isFinished) {
			return;
		}
		const squares = this.state.squares.slice();
		//on left click, color the square in
		//on right click, cross it out
		if(event.buttons & 1) {
			if(squares[i] === this.props.currentColor) {
				squares[i] = 0;
			} else {
				squares[i] = this.props.currentColor;
			}
		} else if(event.buttons & 2 && this.props.enableRightClick) {
			if(squares[i] === -1) {
				squares[i] = 0;
			} else {
				squares[i] = -1;
			}
		} else {
			return;//nothing to do
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
				onClick={(e) => this.handleClick(i,e)}
				thickOutline={outline}
				isCrossedOut={this.state.squares[i] === -1}
				isFinished={this.state.isFinished}
			/>
		);
	}

	renderRow(r) {
		//render all the squares, and then render the row's count squares
		return (
			<div key= {r} className="board-row">
				{Array.from({length: this.state.width}, (x,i) => this.renderSquare(r*this.state.width + i))}
				{this.renderCountSquare(true, r)}
			</div>
		);
	}

	renderCountSquare(isRow, i) {
		const value = isRow
						? (this.props.useHcpRules 
							? this.state.hcpRowCounts[i]
							: this.state.rowCounts[i])
						: (this.props.useHcpRules
							? this.state.hcpColCounts[i]
							: this.state.colCounts[i]);
		const isComplete = isRow
							? this.state.rowCompleted[i]
							: this.state.colCompleted[i];
		return (
			<CountSquare 
				key={(isRow? 1 : -1) * i}
				isRow={isRow}
				blankColor={this.props.blankColor}
				colors={this.props.colors}
				values={value}
				isComplete={isComplete}
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
			<div className="board">
				{Array.from({length: this.state.height}, (x,i) => this.renderRow(i))}
				{this.renderColCounts()}
			</div>
		);
	}
}

//returns a list of pairs, (color index, # of blocks)
//does this for all colors, including white
function getRowNumbers(blankColor, row, useHcpRules) {
	if(!useHcpRules) {
		//count the number of clusters of pixels of the same color
		let nums = [];
		let cur = null;
		let curCount = 0;
		row.forEach(c => {
			if (c === cur) {
				curCount += 1;
			} else {
				if (cur !== null && cur !== blankColor) {
					nums.push({
						colorIndex: cur, 
						count: curCount,
					});
				}
				cur = c;
				curCount = 1;
			}
		});
		//still have to add the last string
		if(cur !== null && cur !== blankColor) {
			nums.push({
				colorIndex: cur,
				count: curCount,
			});
		}
		return nums
	} else {
		//count the number of each color
		//if the colors are all in a row, then make the count negative
		//(hacky, but I don't care)
		
		//simply count up all of each color
		//negative because we assume each color is in a single cluster
		const counts = {};
		const isCluster = {};
		row.forEach(color => {
			if(!counts[color]) {
				counts[color] = 1;
				isCluster[color] = true;
			} else {
				counts[color]++;
			}
		});
		//now if a cluster of a color is shorter than what's in count, it's
		//not a single cluster and should not be negative
		let cur = null;
		let curCount = 0;
		row.forEach(c => {
			if (c === cur) {
				curCount += 1;
			} else {
				if (cur !== null && counts[cur] > curCount) {
					isCluster[cur] = false;
				}
				cur = c;
				curCount = 1;
			}
		});
		if(cur !== null && counts[cur] > curCount) {
			isCluster[cur] = false;
		}
		//use counts to make a value list
		const colors = Object.keys(counts).sort();
		const nums = [];
		colors.forEach(color => {
			if(counts[color] !== 0) {
				nums.push({
					colorIndex: color,
					count: counts[color] * (isCluster[color] ? -1 : 1),
				});
			}
		});
		return nums;
	}
}

export default Board;
