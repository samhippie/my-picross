
//the color selection UI in the editor

import React, { Component } from 'react';

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

export default ColorPicker;
