
//modal that shows after a user completes a puzzle

import React, { Component } from 'react';

class EndModal extends Component {
	render() {
		if(!this.props.show) {
			return null;
		}

		return (
			<div className="modal-backdrop">
				<div className="modal">
					<p>You have completed "{this.props.name}"</p>
					<div className="modal-footer">
						<button onClick={() => this.props.onClose()}>
							Close
						</button>
						<button onClick={() => this.props.onHome()}>
							Home
						</button>
					</div>
				</div>
			</div>
		);
	}
}

export default EndModal;
