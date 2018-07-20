
//the size-input and board-refresh UI for the editor

import React, { Component } from 'react';

class SizeInput extends Component {
	handleWidthChange(event) {
		const width = parseInt(event.target.value, 10);
		this.props.onChange(width, this.props.height);
	}

	handleHeightChange(event) {
		const height = parseInt(event.target.value, 10);
		this.props.onChange(this.props.width, height);
	}

	render() {
		return (
			<form className="size-input">
				<label htmlFor="widthInput">Width </label>
				<input 
					id="widthInput" 
					type="number"
					style={{width: '5em'}}
					step="1" min="1" max="100"
					value={this.props.width}
					onChange={(e) => this.handleWidthChange(e)}
				/>
				<label htmlFor="heightInput">Height </label>
				<input 
					id="heightInput" 
					type="number" 
					style={{width: '5em'}}
					step="1" min="1" max="100"
					value={this.props.height}
					onChange={(e) => this.handleHeightChange(e)}
				/>
			</form>
		);
	}
}

export default SizeInput;
