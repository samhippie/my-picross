
//the modal for showing the sign-in options

import React, { Component } from 'react';

class SignInModal extends Component {

	render() {
		if(!this.props.show) {
			return null;
		}

		return (
			<div className="modal-backdrop">
				<div className="modal">
					<div id="firebaseui-auth-container"/>
					<div className="modal-footer">
						<button onClick={() => this.props.onClose()}>
							Cancel
						</button>
					</div>
				</div>
			</div>
		);
	}
}

export default SignInModal;
