
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

	loadTestGame(i) {
		//load test game
		const encGameData = getTestGameData(i);
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
						onClick={() => this.loadTestGame(0)}
					>
						Play test game 0
					</button>
					<button
						onClick={() => this.loadTestGame(1)}
					>
						Play test game 1
					</button>
					<button
						onClick={() => this.loadTestGame(2)}
					>
						Play test game 2
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

const testGames = [
	"eyJ2ZXJzaW9uIjoxLCJuYW1lIjoiTXkgSENQIFRlc3QgR2FtZSIsIndpZHRoIjoiNSIsImhlaWdodCI6IjUiLCJjb2xvcnMiOlsid2hpdGUiLCJibGFjayIsInZpb2xldCJdLCJibGFua0NvbG9yIjowLCJ1c2VIY3BSdWxlcyI6dHJ1ZSwic3F1YXJlcyI6WzIsMiwyLDIsMiwwLDIsMiwyLDAsMCwyLDIsMiwwLDAsMiwyLDIsMCwyLDAsMCwwLDIsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwXX0=",
	
"eyJ2ZXJzaW9uIjoxLCJuYW1lIjoiVGVzdCBQdXp6bGUiLCJ3aWR0aCI6IjEwIiwiaGVpZ2h0IjoiMTAiLCJjb2xvcnMiOlsid2hpdGUiLCJibGFjayIsImJsdWUiXSwiYmxhbmtDb2xvciI6MCwidXNlSGNwUnVsZXMiOmZhbHNlLCJzcXVhcmVzIjpbMSwxLDEsMCwyLDIsMiwwLDAsMSwxLDAsMCwwLDIsMCwyLDAsMCwxLDEsMSwxLDAsMiwyLDIsMCwwLDEsMCwwLDEsMCwyLDAsMiwwLDAsMSwxLDEsMSwwLDIsMCwyLDAsMCwxLDEsMCwwLDAsMSwwLDAsMCwwLDEsMSwxLDAsMSwxLDAsMCwwLDAsMSwxLDAsMSwwLDEsMiwyLDIsMiwyLDEsMCwwLDAsMSwyLDIsMiwyLDIsMSwwLDAsMCwxLDIsMiwyLDIsMl19",

"eyJ2ZXJzaW9uIjoxLCJuYW1lIjoiVW50aXRsZWQiLCJ3aWR0aCI6MTUsImhlaWdodCI6MTUsImNvbG9ycyI6WyIjZmZmZmZmIiwiI2NiMGIzYyIsIiMwMDk3ZWEiLCIjZjRjMzgwIiwiIzEzMGMxYyJdLCJibGFua0NvbG9yIjowLCJ1c2VIY3BSdWxlcyI6dHJ1ZSwic3F1YXJlcyI6WzIsMiwyLDIsMiwyLDIsMiwyLDIsMiwyLDIsMiwyLDIsMiwyLDIsMiwyLDIsMiwyLDIsMiwyLDIsMiwyLDIsMiwyLDIsMiwxLDEsMSwxLDEsMSwyLDIsMiwyLDIsMiwyLDIsMSwxLDEsMSwxLDEsMSwxLDIsMCwwLDIsMiwyLDEsMSwxLDEsMSwxLDEsMSwxLDEsMCwwLDIsMiwxLDEsMSwxLDEsMSwxLDEsMSwxLDEsMSwwLDIsMiwxLDEsMSwxLDEsMCwwLDQsNCwxLDEsMSwxLDIsNCwwLDEsMywzLDMsMCwwLDQsNCwxLDEsMSwxLDIsNCwzLDMsMywzLDMsMywzLDMsMywzLDEsMSwxLDIsMSwzLDMsMywzLDMsMywzLDMsMywzLDEsMSwxLDEsMSwxLDEsMywzLDMsMywzLDMsMSwxLDEsMSwxLDEsMSwxLDEsMSwzLDMsMywxLDMsMSwzLDEsMSwxLDEsMSwxLDEsMSwxLDEsMSwxLDMsNCwzLDEsMywxLDEsMSwxLDEsMSwxLDEsMSwxLDMsMSwzLDEsMywxLDEsMSwxLDEsMSwxLDEsMSwxLDEsMSwxLDEsMSwxXX0=",

]

function getTestGameData(i) {
	return testGames[i];
}

export default Player;
