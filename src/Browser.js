import React, { Component } from 'react';
import { Redirect } from 'react-router';
import { firestore } from './firebase';
import './browser.css';

class PuzzleEntry extends Component {
	constructor(props) {
		super(props);
		this.state = {
			status: null,
		};
	}

	componentDidMount() {
		//load the status of this puzzle on load
		this.props.getStatus((status) => {
			this.setState({
				status: status,
			});
		});
	}

	//renders the symbols showing if the puzzle has been seen or solved
	renderStatus() {
		let className = "";
		if(this.state.status === "seen") {
			className="fas fa-eye";
		} else if(this.state.status === "solved") {
			className="fas fa-check";
		}

		return(
			<i className={className}/>
		);
	}

	render() {
		return (
			<div 
				className="puzzle-entry"
				onClick={() => this.props.onClick()}
			>
				<div className="puzzle-status">
					{this.renderStatus()}
				</div>
				<div className="puzzle-text">
					{this.props.name} by {this.props.username}
				</div>
				<div className="puzzle-date">
					{timestampToDateString(this.props.time)}
				</div>
			</div>
		);
	}
}

class Browser extends Component {
	constructor(props) {
		super(props);

		this.state = {
			puzzles: [],
			category: 0,
			loadPuzzle: null,
			isLoading: true,
		};
	}

	componentDidMount() {
		//load the first set of puzzles on load
		this.handleLoadMore();
	}

	//returns the puzzle status for the user
	//i.e. whether it's been solved, seen, or is new
	getPuzzleStatus(pid, callback) {
		//no status if the user isn't logged in
		if(!this.props.user) {
			callback("");
		}

		const statusRef = firestore.collection('userPuzzles')
			.doc(this.props.user.uid)
			.collection('status')
			.doc(pid);

		statusRef.get().then(doc => {
			const data = doc.data();
			if(data.solved) {
				callback("solved");
			} else if(data.seen) {
				callback("seen");
			} else {
				callback("");
			}
		});
	}

	//loads more puzzles from firebase, stores it in this.state.puzzles
	handleLoadMore() {
		//TODO make this load the next 25, not just the first 25
		this.setState({
			isLoading: true,
		}, () => {
			const puzzlesRef = firestore.collection('puzzles');
			const puzzles = this.state.puzzles.slice();
			puzzlesRef.orderBy('time').limit(25).get().then(querySnapshot => {
				querySnapshot.forEach(doc => {
					const data = doc.data();
					const puzzle = {
						pid: doc.id,
						name: data.name,
						username: data.username,
						uid: data.uid,
						time: data.time,
					}
					puzzles.push(puzzle);
				});
				this.setState({
					isLoading: false,
					puzzles: puzzles,
				});
			});
		});
	}

	handlePuzzleClick(pid) {
		this.setState({
			loadPuzzle: "/play/" + pid,
		});
	}

	renderPuzzleEntry(puzzle) {
		return (
			<li
				key={puzzle.pid}
			>
				<PuzzleEntry
					name={puzzle.name}
					username={puzzle.username}
					time={timestampToDateString(puzzle.time)}
					getStatus={(c) => this.getPuzzleStatus(puzzle.pid, c)}
					onClick={() => this.handlePuzzleClick(puzzle.pid)}
				/>
			</li>
		);
	}

	renderPuzzleList() {
		if(this.state.puzzles.length === 0 && !this.state.isLoading) {
			return (
				<div>
					No puzzles found
				</div>
			);
		}

		if(this.state.puzzles.length === 0 && this.state.isLoading) {
			return (
				<div>
					Loading puzzles...
				</div>
			);
		}

		return (
			<ul className="puzzle-list">
				{this.state.puzzles.map((p) => this.renderPuzzleEntry(p))}
			</ul>
		);
	}

	renderLoadMoreButton() {
		if(this.state.isLoading) {
			return <i className="fas fa-spinner fa-spin" />
		}

		return (
			<button
				onClick={() => this.handleLoadMore()}
			>
				Load more puzzles
			</button>
		);
	}

	render() {
		if(this.state.loadPuzzle) {
			return <Redirect push to={this.state.loadPuzzle} />
		}

		return (
			<div>
				{this.renderPuzzleList()}
				{this.renderLoadMoreButton()}
			</div>
		);
	}
}

function timestampToDateString(time) {
	return "YYYY-MM-DD"
}

export default Browser;
