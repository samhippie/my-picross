
//modal for uploading, asks for user information

import React, { Component } from 'react';

class UploadModal extends Component {
	constructor(props) {
		super(props);
		this.state = {
			username: "Anonymous",
			name: "Untitled Puzzle"
		};
	}

	handleSubmit() {
		this.props.onSubmit(this.state.username, this.state.name);
	}

	handleUsername(e) {
		this.setState({
			username: e.target.value,
		});
	}

	handleName(e) {
		this.setState({
			name: e.target.value,
		});
	}

	renderForm() {
		if(!this.props.isLoggedIn) {
			return "You must be logged in to upload";
		}
		
		return (
			<form>
				<label htmlFor="username-input">User Name </label>
				<input type="text" id="username-input"
					value={this.state.username}
					onChange={(e) => this.handleUsername(e)}/>
				<br/>
				<label htmlFor="name-input">Puzzle Name </label>
				<input type="text" id="name-input"
					value={this.state.name}
					onChange={(e) => this.handleName(e)}/>
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
					{this.renderForm()}
					<div style={{marginTop: '8px'}}
						className="modal-footer">
						<button 
							onClick={() => this.props.onClose()}
						>
							Close
						</button>
						<button 
							onClick={() => this.handleSubmit()}
							disabled={!this.props.isLoggedIn}
						>
							Submit
						</button>
					</div>
				</div>
			</div>
		);
	}
}

export default UploadModal;
