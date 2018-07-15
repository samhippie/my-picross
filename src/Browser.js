import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class Browser extends Component {
	render() {
		return (
			<div>
				<Link to="/play/123">Play Test Game</Link>
			</div>
		);
	}
}

export default Browser;
