
//loads the game data, then displays the game (see Game.js)

import React, { Component } from 'react';
import { Redirect } from 'react-router';
import Game from './Game.js';

class Player extends Component {
	constructor(props) {
		super(props);
		this.state = {
			goHome: false,
			game: {
				loaded: false,
				id: this.props.match.params.id,
				data: null,
			}
		}
	}

	loadTestGame() {
		//load test game
		const encGameData = getTestGameData(1);
		this.setState({
			game: {
				data: JSON.parse(atob(encGameData)),
				loaded: true,
			}
		});
	}

	handleGoHome() {
		this.setState({
			goHome: true,
		});
	}

	render() {
		if(this.state.goHome) {
			return <Redirect to="/"/>
		}

		if(!this.state.game.loaded) {
			return (
				<div>
					<p>Loading Game</p>
					<button
						onClick={() => this.loadTestGame()}
					>
						Play test game
					</button>
				</div>
			);
		}
		return (
			<div>
				<h2>{this.state.game.data.name}</h2>
				<Game
					gameData={this.state.game.data}
					onGoHome={() => this.handleGoHome()}
				/>
			</div>
		);
	}
}

function getTestGameData(i) {
	if(i === 0) {
		return "eyJ2ZXJzaW9uIjoxLCJuYW1lIjoiVGVzdCBQdXp6bGUiLCJ3aWR0aCI6IjEwIiwiaGVpZ2h0IjoiMTAiLCJjb2xvcnMiOlsid2hpdGUiLCJibGFjayIsImJsdWUiXSwiYmxhbmtDb2xvciI6MCwidXNlSGNwUnVsZXMiOmZhbHNlLCJzcXVhcmVzIjpbMSwxLDEsMCwyLDIsMiwwLDAsMSwxLDAsMCwwLDIsMCwyLDAsMCwxLDEsMSwxLDAsMiwyLDIsMCwwLDEsMCwwLDEsMCwyLDAsMiwwLDAsMSwxLDEsMSwwLDIsMCwyLDAsMCwxLDEsMCwwLDAsMSwwLDAsMCwwLDEsMSwxLDAsMSwxLDAsMCwwLDAsMSwxLDAsMSwwLDEsMiwyLDIsMiwyLDEsMCwwLDAsMSwyLDIsMiwyLDIsMSwwLDAsMCwxLDIsMiwyLDIsMl19";
	} else {
		return "eyJ2ZXJzaW9uIjoxLCJuYW1lIjoiTXkgSENQIFRlc3QgR2FtZSIsIndpZHRoIjoiNSIsImhlaWdodCI6IjUiLCJjb2xvcnMiOlsid2hpdGUiLCJibGFjayIsInZpb2xldCJdLCJibGFua0NvbG9yIjowLCJ1c2VIY3BSdWxlcyI6dHJ1ZSwic3F1YXJlcyI6WzIsMiwyLDIsMiwwLDIsMiwyLDAsMCwyLDIsMiwwLDAsMiwyLDIsMCwyLDAsMCwwLDIsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwXX0="
	}
}

export default Player;
