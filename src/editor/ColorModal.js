
//the color-editting modal for the editor

import React, { Component } from 'react';

class ColorModal extends Component {
	constructor(props) {
		super(props)
		this.colorInput = React.createRef();
	}

	handleClose() {
		const newColor = this.colorInput.current.value;
		this.props.onClose(newColor || this.props.color);
	}

	render() {
		if(!this.props.show) {
			return null;
		}

		return (
			<div className="modal-backdrop">
				<div className="modal">
					<p>Current color is {this.props.color}</p>
					<label htmlFor="colorText">New Color (any CSS-valid format) </label>
					<input type="text" id="colorText"
						defaultValue={this.props.color}
						ref={this.colorInput}
						onKeyDown={(e) => {
							if(e.keyCode === 13) {//carriage return
								this.handleClose();
								return false;
							}
						}}
					/>
					
					<div className="modal-footer">
						<button onClick={() => this.handleClose()}>
							Save
						</button>
					</div>
				</div>
			</div>
		);
	}
}

export default ColorModal;
