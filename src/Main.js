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
					<h1>Picross</h1>
					<ul className="header">
						<li>
							<NavLink 
								exact
								to="/" 
								activeClassName="active-link"
							>
									Browse
							</NavLink>
						</li>
						<li>
							<NavLink 
								exact
								to="/editor"
								activeClassName="active-link"
							>
								Create New
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

