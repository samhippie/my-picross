
//main single-page UI of app
//handles navigation and firebase authentication

import React, { Component } from 'react';
import {
	Route,
	NavLink,
	HashRouter
} from 'react-router-dom';
import Browser from './Browser';
import Editor from './Editor';
import Player from './Player';
import SignInModal from './SignInModal';
import firebase, { firebaseui } from './firebase.js';

class Main extends Component {
	constructor(props) {
		super(props);
		this.state = {
			user: null,
			isShowingAuthModal: false,
			isLoadingAuthUi: false,
		};
		this.signInUi = new firebaseui.auth.AuthUI(firebase.auth());
	}

	componentDidMount() {
		firebase.auth().onAuthStateChanged((user) => {
			if(user) {
				this.setState({
					user: user,
				});
			} else {
				this.setState({
					user: null,
				});
			}
		});
	}

	//handler for actually being signed in via firebase
	handleSignIn(authResult, redirectUrl) {
		this.setState({
			isShowingAuthModal: false,
		});
		return true;
	}

	//handler for the user clicking "log in"
	handleLogIn() {
		//show the loader
		this.setState({
			isShowingAuthModal: true,
			isLoadingAuthUi: true,
		}, () => {
			//set up to log in with google
			const uiConfig = {
				callbacks: {
					signInSuccessWithAuthResult: (ar,ru) => 
						{this.handleSignIn(ar,ru)},
					uiShown: () => {this.setState({
						isLoadingAuthUi: false,
					})},
				},
				signInFlow: 'popup',
				signInOptions: [
					{
						provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
						authMethod: 'https://accounts.google.com',
					},
				],
				//TODO
				//tosUrl: 'https://example.com',
				//privacyPolicyUrl: 'https://example.com',
			}
			this.signInUi.start('#firebaseui-auth-container', uiConfig);
		});
	}

	//the modal has request to be closed without signing in
	handleSignInClose() {
		this.signInUi.reset();
		this.setState({
			isShowingAuthModal: false,
		});
	}

	//handler for "Log Out" being clicked
	handleLogOut() {
		firebase.auth().signOut();
	}

	renderLogIn() {
		if(this.state.user) {
			return (
				<div className="log-in">
					<div className="in-a-row">
						<div className="log-in-text">
							{this.state.user.displayName}
						</div>
						<button onClick={() => this.handleLogOut()}>
							Log Out
						</button>
					</div>
				</div>
			);
		}

		return (
			<button 
				onClick={() => this.handleLogIn()}
				className="log-in">
				Log In
			</button>
		);
	}

	renderEditor() {
		return (
			<Editor 
				user={this.state.user}
			/>
		);
	}

	renderPlayer(match) {
		return (
			<Player
				match={match}
				user={this.state.user}
			/>
		);
	}

	renderBrowser() {
		return (
			<Browser
				user={this.state.user}
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
							render={() => this.renderBrowser()}/>
						<Route 
							exact path="/editor" 
							render={() => this.renderEditor()} />
						<Route 
							path="/play/:id" 
							render={({match}) => this.renderPlayer(match)}/>
					</div>
					<SignInModal
						show={this.state.isShowingAuthModal}
						onClose={() => this.handleSignInClose()}
					/>
				</div>
			</HashRouter>
		);
	}
}

export default Main;

