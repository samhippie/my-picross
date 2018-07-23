import React, { Component } from 'react';

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

export default ColorPicker;
