import React, { Component } from 'react';
import { Redirect } from 'react-router';
import { firestore } from './firebase';
import './browser.css';
import dataCache from './dataCache';

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
				<div className="puzzle-rules">
					{this.props.isHcp ? '(HCP)' : '(Vanilla)'}
				</div>
				<div className="puzzle-date">
					{this.props.time}
				</div>
			</div>
		);
	}
}


const SORT_DATE_ASC = 0;
const SORT_DATE_DESC = 1;

class OrderPicker extends Component {

	handleChange(event) {
		this.props.onSetOrder(event.target.value);
	}

	render() {
		return (
			<div className="order-picker">
				Sort by 
				<select 
					value={this.props.order} 
					onChange={(e) => this.handleChange(e)}
				>
					<option value={SORT_DATE_DESC}>Newest</option>
					<option value={SORT_DATE_ASC}>Oldest</option>
				</select>
			</div>
		);
	}
}

class Browser extends Component {
	constructor(props) {
		super(props);

		this.state = {
			puzzles: [],
			sortBy: SORT_DATE_DESC,
			loadPuzzle: null,
			isLoading: false,
		};
	}

	componentDidMount() {
		const puzzleCache = dataCache.getPuzzleList();
		if(puzzleCache.length === 0) {
			//load the first set of puzzles on load
			this.handleLoadMore();
		} else {
			//load puzzles from cache
			this.setState({
				puzzles: puzzleCache,
			});
		}
	}

	componentWillUnmount() {
		dataCache.setPuzzleList(this.state.puzzles);
	}

	//returns the puzzle status for the user
	//i.e. whether it's been solved, seen, or is new
	getPuzzleStatus(pid, callback) {
		//no status if the user isn't logged in
		if(!this.props.user) {
			callback("");
			return;
		}

		//return from the cache if we can
		let cached = dataCache.getStatus(pid);
		if(cached !== null) {
			callback(cached);
			return;
		}

		const statusRef = firestore.collection('userPuzzles')
			.doc(this.props.user.uid)
			.collection('status')
			.doc(pid);

		statusRef.get().then(doc => {
			const data = doc.data();
			let result;
			if(data.solved) {
				result = "solved";
			} else if(data.seen) {
				result = "seen";
			} else {
				result = "";
			}
			dataCache.setStatus(pid, result);
			callback(result);
		});
	}

	//loads more puzzles from firebase, stores it in this.state.puzzles
	//showLoad: should we show the load to the user?
	handleLoadMore(showLoad = true) {
		const pageSize = 10;
		this.setState({
			isLoading: showLoad,
		}, () => {
			const puzzles = this.state.puzzles.slice();
			//default to loading the first page
			let query = firestore.collection('puzzles');
			switch(this.state.sortBy) {
				case SORT_DATE_ASC:
					query = query.orderBy('time');
					break;
				case SORT_DATE_DESC:
					query = query.orderBy('time', 'desc');
					break;
				default:
					//if we end up here, let firebase sort by whatever
					break;
			}
			query = query.limit(pageSize);
			//if we already have some puzzles, load the puzzles after that one
			if(this.state.puzzles.length !== 0) {
				query = query.startAfter(puzzles[puzzles.length-1].time);
			}
			query.get().then(querySnapshot => {
				querySnapshot.forEach(doc => {
					const data = doc.data();
					const puzzle = {
						pid: doc.id,
						name: data.name,
						username: data.username,
						uid: data.uid,
						time: data.time,
						isHcp: data.isHcp,
						data: data.data,
					}
					dataCache.setPuzzle(doc.id, puzzle);
					puzzles.push(puzzle);
				});
				this.setState({
					isLoading: false,
					puzzles: puzzles,
				});
			});
		});
	}

	handleSort(order) {
		//have to reload the puzzle list after changing order
		this.setState({
			sortBy: order,
			puzzles: [],
		}, () => {
			dataCache.invalidatePuzzleList();
			this.handleLoadMore();
		});
	}

	handlePuzzleClick(pid) {
		//the status of the puzzle will change, so invalidate it
		dataCache.invalidateStatus(pid);
		this.setState({
			loadPuzzle: "/play/" + pid,
		});
	}

	renderOrderPicker() {
		return (
			<OrderPicker 
				order={this.state.sortBy}
				onSetOrder={(o) => this.handleSort(o)}
			/>
		);
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
					isHcp={puzzle.isHcp}
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
				{this.renderOrderPicker()}
				{this.renderPuzzleList()}
				{this.renderLoadMoreButton()}
			</div>
		);
	}
}

function timestampToDateString(time) {
	const date = time.toDate();
	return date.toLocaleDateString();
}

export default Browser;
