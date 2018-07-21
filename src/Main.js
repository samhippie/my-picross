import React, { Component } from 'react';
import {
	Route,
	NavLink,
	HashRouter
} from 'react-router-dom';
import Browser from './Browser';
import Editor from './Editor';
import Player from './Player';

class Main extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isLoggedIn: false,
			username: null,
		};
	}

	handleLogIn() {
		this.setState({
			isLoggedIn: true,
			username: "Joe Blow",
		});
	}

	handleLogOut() {
		this.setState({
			isLoggedIn: false,
		});
	}

	renderLogIn() {
		if(this.state.isLoggedIn) {
			return (
				<div className="log-in">
					<div className="in-a-row">
						<div>
							Logged in as {this.state.username}.
						</div>
						<div 
							style={{
								'cursor': 'pointer',
								'paddingLeft': '8px',
							}}
							onClick={() => this.handleLogOut()}>
							Log Out
						</div>
					</div>
				</div>
			);
		}

		return (
			<div 
				style={{'cursor': 'pointer'}}
				onClick={() => this.handleLogIn()}
				className="log-in">
				Log In
			</div>
		);
	}

	renderEditor() {
		return (
			<Editor 
				isLoggedIn={this.state.isLoggedIn}
			/>
		);
	}

	render() {
		return (
			<HashRouter>
				<div>
					<h1>Picross</h1>
					{this.renderLogIn()}
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
						<Route 
							exact path="/" 
							component={Browser}/>
						<Route 
							exact path="/editor" 
							render={() => this.renderEditor()} />
						<Route 
							path="/play/:id" 
							component={Player}/>
					</div>
				</div>
			</HashRouter>
		);
	}
}

export default Main;

