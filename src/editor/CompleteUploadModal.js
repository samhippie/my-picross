
//tells the user that their puzzle has been uploaded

import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class CompleteUploadModal extends Component {
	render() {
		if(!this.props.show) {
			return null;
		}

		return (
			<div className="modal-backdrop">
				<div className="modal">
					Your puzzle has been uploaded.<br/>
					<Link to={"/play/" + this.props.pid}>
						Click here to play.
					</Link>
					<br/>
					<div style={{marginTop: '8px'}}
						className="modal-footer">
						<button 
							onClick={() => this.props.onClose()}
						>
							Close
						</button>
						<button
							onClick={() => this.props.onHome()}
						>
							Go Home
						</button>
					</div>
				</div>
			</div>
		);
	}
}

export default CompleteUploadModal;
