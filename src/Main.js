import React, { Component } from 'react';
import {
	Route,
	NavLink,
	HashRouter
} from 'react-router-dom';
import Browser from './Browser';
import Editor from './Editor';

class Main extends Component {
	render() {
		return (
			<HashRouter>
				<div>
					<h1>Howdy, this is the main page</h1>
					<p>Here is some content</p>
					<ul className="header">
						<li><NavLink to="/">Home</NavLink></li>
						<li><NavLink to="/editor">Open Editor</NavLink></li>
					</ul>

					<div className="content">
						<Route exact path="/" component={Browser}/>
						<Route exact path="/editor" component={Editor}/>
					</div>
				</div>
			</HashRouter>
		);
	}
}

export default Main;

