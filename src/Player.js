
//loads the game data, then displays the game (see Game.js)

import React, { Component } from 'react';
import { Redirect } from 'react-router';
import Game from './Game.js';
import { firestore } from './firebase';
import dataCache from './dataCache';

class Player extends Component {
	constructor(props) {
		super(props);
		this.state = {
			goHome: false,
			isSaving: false,
			game: {
				loaded: false,
				pid: this.props.match.params.id,
				data: null,
			}
		}
	}

	componentDidMount() {
		//load from cache if we can
		const cached = dataCache.getPuzzle(this.state.game.pid);
		if(cached !== null) {
			this.setState({
				game: {
					loaded: true,
					data: JSON.parse(atob(cached.data)),
					pid: this.state.game.pid,
				},
			}, () => {
				if(this.props.user) {
					this.markPuzzleStatus({seen: true});
				}
			});
		} else {
			//load the given game from firebase
			const puzzleRef = firestore.collection('puzzles')
				.doc(this.state.game.pid);
			puzzleRef.get().then( doc => {
				const data = doc.data();
				this.setState({
					game: {
						loaded: true,
						data: JSON.parse(atob(data.data)),
						pid: this.state.game.pid,
					}
				}, () => {
					if(this.props.user) {
						this.markPuzzleStatus({seen: true});
					}
				});
			});
		}
	}

	markPuzzleStatus(status) {
		this.setState({
			isSaving: true,
		}, () => {
			const statusRef = firestore.collection('userPuzzles')
				.doc(this.props.user.uid)
				.collection('status')
				.doc(this.state.game.pid);
			statusRef.set(status, {merge: true}).then(() => {
				this.setState({
					isSaving: false,
				});
			});
		});
	}

	handleGoHome() {
		this.setState({
			goHome: true,
		});
	}

	handleSolve() {
		//if the user isn't logged in, don't track anything
		if(!this.props.user) {
			return;
		}
		this.markPuzzleStatus({solved: true});
	}

	render() {
		if(this.state.goHome && !this.state.isSaving) {
			return <Redirect to="/"/>
		}

		if(!this.state.game.loaded) {
			return (
				<div>
					<p>Loading Game</p>
				</div>
			);
		}
		return (
			<div>
				<h2>{this.state.game.data.name}</h2>
				<p>					
					{this.state.game.data.useHcpRules
						? "HCP rules"
						: "Vanilla picross rules"}
				</p>
				<Game
					gameData={this.state.game.data}
					onGoHome={() => this.handleGoHome()}
					onSolve={() => this.handleSolve()}
				/>
			</div>
		);
	}
}

export default Player;
