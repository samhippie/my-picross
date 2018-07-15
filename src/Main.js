import React, { Component } from 'react';
import {
	Route,
	NavLink,
	HashRouter
} from 'react-router-dom';
import Browser from './Browser';
import Editor from './Editor';
import Game from './Game';

class Main extends Component {
	render() {
		return (
			<HashRouter>
				<div>
					<h1>Howdy, this is the main page</h1>
					<p>Here is some content</p>
					<ul className="header">
						<li>
							<NavLink 
								exact
								to="/" 
								activeClassName="active-link"
							>
									Home
							</NavLink>
						</li>
						<li>
							<NavLink 
								exact
								to="/editor"
								activeClassName="active-link"
							>
								Open Editor
							</NavLink>
						</li>
					</ul>

					<div className="content">
						<Route exact path="/" component={Browser}/>
						<Route exact path="/editor" component={Editor}/>
						<Route path="/play/:id" component={Game}/>
					</div>
				</div>
			</HashRouter>
		);
	}
}

export default Main;

