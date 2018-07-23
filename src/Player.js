
//loads the game data, then displays the game (see Game.js)

import React, { Component } from 'react';
import { Redirect } from 'react-router';
import Game from './Game.js';
import { firestore } from './firebase';

class Player extends Component {
	constructor(props) {
		super(props);
		this.state = {
			goHome: false,
			isSaving: false, // used to prevent navigation while we're doing something
			game: {
				loaded: false,
				pid: this.props.match.params.id,
				data: null,
			}
		}
	}

	componentDidMount() {
		//load the given game
		const puzzleRef = firestore.collection('puzzles')
			.doc(this.state.game.pid);
		puzzleRef.get().then( doc => {
			const data = doc.data();
			this.setState({
				game: {
					loaded: true,
					data: JSON.parse(atob(data.data)),
					pid: this.state.game.pid,
					isSaving: true,
				}
			}, () => {
				if(this.props.user) {
					const statusRef = firestore.collection('userPuzzles')
						.doc(this.props.user.uid)
						.collection('status')
						.doc(this.state.game.pid);
					statusRef.set({seen: true}, {merge: true}).then(() => {
						this.setState({
							isSaving: false,
						});
					});
				}
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

		//these nested callbacks are basically
		//isSaving = true
		//update backend
		//isSaving = false
		this.setState({
			isSaving: true,
		}, () => {
			//set that the puzzle has been solved
			const statusRef = firestore.collection('userPuzzles')
				.doc(this.props.user.uid)
				.collection('status')
				.doc(this.state.game.pid);
			statusRef.set({solved: true}, {merge: true}).then(() => {
				this.setState({
					isSaving: false,
				});
			});
		});
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

const testGames = [

"eyJ2ZXJzaW9uIjoxLCJuYW1lIjoiTXkgTmV3IEhDUCBUZXN0Iiwid2lkdGgiOjUsImhlaWdodCI6NSwiY29sb3JzIjpbIndoaXRlIiwiYmxhY2siLCJyZWQiXSwiYmxhbmtDb2xvciI6MCwidXNlSGNwUnVsZXMiOnRydWUsInNxdWFyZXMiOlsxLDEsMSwxLDEsMSwyLDEsMSwyLDEsMiwyLDIsMiwxLDIsMSwyLDEsMSwyLDEsMiwxXX0=",
	
"eyJ2ZXJzaW9uIjoxLCJuYW1lIjoiVGVzdCBQdXp6bGUiLCJ3aWR0aCI6IjEwIiwiaGVpZ2h0IjoiMTAiLCJjb2xvcnMiOlsid2hpdGUiLCJibGFjayIsImJsdWUiXSwiYmxhbmtDb2xvciI6MCwidXNlSGNwUnVsZXMiOmZhbHNlLCJzcXVhcmVzIjpbMSwxLDEsMCwyLDIsMiwwLDAsMSwxLDAsMCwwLDIsMCwyLDAsMCwxLDEsMSwxLDAsMiwyLDIsMCwwLDEsMCwwLDEsMCwyLDAsMiwwLDAsMSwxLDEsMSwwLDIsMCwyLDAsMCwxLDEsMCwwLDAsMSwwLDAsMCwwLDEsMSwxLDAsMSwxLDAsMCwwLDAsMSwxLDAsMSwwLDEsMiwyLDIsMiwyLDEsMCwwLDAsMSwyLDIsMiwyLDIsMSwwLDAsMCwxLDIsMiwyLDIsMl19",

"eyJ2ZXJzaW9uIjoxLCJuYW1lIjoiVW50aXRsZWQiLCJ3aWR0aCI6MTUsImhlaWdodCI6MTUsImNvbG9ycyI6WyIjZmZmZmZmIiwiI2NiMGIzYyIsIiMwMDk3ZWEiLCIjZjRjMzgwIiwiIzEzMGMxYyJdLCJibGFua0NvbG9yIjowLCJ1c2VIY3BSdWxlcyI6dHJ1ZSwic3F1YXJlcyI6WzIsMiwyLDIsMiwyLDIsMiwyLDIsMiwyLDIsMiwyLDIsMiwyLDIsMiwyLDIsMiwyLDIsMiwyLDIsMiwyLDIsMiwyLDIsMiwxLDEsMSwxLDEsMSwyLDIsMiwyLDIsMiwyLDIsMSwxLDEsMSwxLDEsMSwxLDIsMCwwLDIsMiwyLDEsMSwxLDEsMSwxLDEsMSwxLDEsMCwwLDIsMiwxLDEsMSwxLDEsMSwxLDEsMSwxLDEsMSwwLDIsMiwxLDEsMSwxLDEsMCwwLDQsNCwxLDEsMSwxLDIsNCwwLDEsMywzLDMsMCwwLDQsNCwxLDEsMSwxLDIsNCwzLDMsMywzLDMsMywzLDMsMywzLDEsMSwxLDIsMSwzLDMsMywzLDMsMywzLDMsMywzLDEsMSwxLDEsMSwxLDEsMywzLDMsMywzLDMsMSwxLDEsMSwxLDEsMSwxLDEsMSwzLDMsMywxLDMsMSwzLDEsMSwxLDEsMSwxLDEsMSwxLDEsMSwxLDMsNCwzLDEsMywxLDEsMSwxLDEsMSwxLDEsMSwxLDMsMSwzLDEsMywxLDEsMSwxLDEsMSwxLDEsMSwxLDEsMSwxLDEsMSwxXX0=",

]

function getTestGameData(i) {
	return testGames[i];
}

export default Player;
