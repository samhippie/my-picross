import React, { Component } from 'react';
import { Redirect } from 'react-router';
import firebase from './firebase';
import './browser.css';

class PuzzleEntry extends Component {

	//renders the symbols showing if the puzzle has been seen or solved
	renderStatus() {
		let className = "";
		if(this.props.status === "seen") {
			className="fas fa-eye";
		} else if(this.props.status === "solved") {
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

		this.db = firebase.firestore();
		this.db.settings({
			timestampsInSnapshots: true,
		});
	}

	componentDidMount() {
		//load the first set of puzzles on load
		this.handleLoadMore();
	}

	//loads more puzzles from firebase, stores it in this.state.puzzles
	handleLoadMore() {
		//TODO make this load the next 25, not just the first 25
		this.setState({
			isLoading: true,
		}, () => {
			const puzzlesRef = this.db.collection('puzzles');
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
		console.log("puzzle", puzzle);
		return (
			<li
				key={puzzle.pid}
			>
				<PuzzleEntry
					name={puzzle.name}
					username={puzzle.username}
					time={timestampToDateString(puzzle.time)}
					status={"solved"}
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
			return <i className="fas fa-spinner fa-spin" i/>
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
