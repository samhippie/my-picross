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

	renderSquare(i) {
		//we use the thick outline to divide the board into 5x5 blocks
		//the top left corner is always the corner of a block
		const r = Math.floor(i / this.props.width);
		const c = i % this.props.width;
		const blockSize = this.props.blockSize;
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
				color={this.props.colors[this.props.squares[i]]}
				onClick={(e) => this.props.onSquareClick(i,e)}
				thickOutline={outline}
				isCrossedOut={this.props.squares[i] === -1}
				isFinished={this.props.isFinished}
			/>
		);
	}

	renderRow(r) {
		//render all the squares, and then render the row's count squares
		return (
			<div key= {r} className="board-row">
				{Array.from({length: this.props.width}, (x,i) => this.renderSquare(r*this.props.width + i))}
				{this.renderCountSquare(true, r)}
			</div>
		);
	}

	renderCountSquare(isRow, i) {
		const value = isRow
						? this.props.rowCounts[i]
						: this.props.colCounts[i];
		//rowCompleted (/col) might be undefined
		const isComplete = isRow
							? (this.props.rowCompleted
								? this.props.rowCompleted[i]
								: false)
							: (this.props.colCompleted
								? this.props.colCompleted[i]
								: false);
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
				{this.props.colCounts.map((elem, index) => {
					return this.renderCountSquare(false, index);
				})}
			</div>
		);
	}

	render() {
		return (
			<div className="board">
				{Array.from({length: this.props.height}, (x,i) => this.renderRow(i))}
				{this.renderColCounts()}
			</div>
		);
	}
}

//returns a list of pairs, (color index, # of blocks)
//does this for all colors, including white
export function getRowNumbers(blankColor, row, useHcpRules) {
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
