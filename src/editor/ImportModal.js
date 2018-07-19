
//the image-importing modal for the editor

import React, { Component } from 'react';
import * as Imager from './Imager';

class ImportModal extends Component {
	constructor(props) {
		super(props);
		const builder = new Imager.Builder()
				.setOnError(s => this.handleError(s))
				.setOnSuccess(d => this.handleSuccess(d));
		this.state = {
			builder: builder,
			isError: false,
			errorText: "No errors",
			isLoading: false,
		};
	}

	handleFileInput(event) {
		this.setState({
			builder: this.state.builder.setFile(event.target.files[0]),
		});
	}

	handleSizeInput(event) {
		this.setState({
			builder: this.state.builder.setSize(event.target.value),
		});
	}

	handleNumColorsInput(event) {
		this.setState({
			builder: this.state.builder.setNumColors(event.target.value),
		});
	}

	handleSubmit() {
		this.setState({
			isLoading: true,
			isError: false,
		});
		this.state.builder.build();
	}

	handleError(msg) {
		this.setState({
			isError: true,
			errorText: msg,
			isLoading: false,
		});
	}

	handleSuccess(data) {
		this.setState({
			isLoading: false,
		});
		this.props.onImport(data);
	}

	renderLoading() {
		if(!this.state.isLoading) {
			return null;
		}

		return (
			<i className="fas fa-spinner fa-spin"/>
		);
	}

	renderErrorText() {
		if(!this.state.isError) {
			return null
		}

		return (
			<div className='error-text'>
				{this.state.errorText}
			</div>
		);
	}

	renderInputForm() {
		const style = {width: '5em'}
		return (
			<form>
				<label htmlFor="size-input">Size </label>
				<input
					id="size-input" type="number"
					min="1" max="100" step="1"
					style={style}
					value={this.state.builder.size}
					onChange={e => this.handleSizeInput(e)}
				/>
				<br/>
				<label htmlFor="numColors-input">Number of colors </label>
				<input
					id="numColors-input" type="number"
					min="1" max="20" step="1"
					style={style}
					value={this.state.builder.numColors}
					onChange={e => this.handleNumColorsInput(e)}
				/>
				<br/>
				<label htmlFor="file-input">Image </label>
				<input 
					id="file-input" type="file"
					onChange={e => this.handleFileInput(e)}
				/>
				<br/>

				{this.renderLoading()}
				{this.renderErrorText()}
			</form>
		);
	}

	render() {
		if(!this.props.show) {
			return null;
		}

		return (
			<div className="modal-backdrop">
				<div className="modal">
					{this.renderInputForm()}
					<div className="modal-footer">
						<br/>
						<button onClick={() => this.props.onClose()}>
							Close
						</button>
						<button onClick={() => this.handleSubmit()}>
							Submit
						</button>
					</div>
				</div>
			</div>
		);
	}
}

export default ImportModal;
