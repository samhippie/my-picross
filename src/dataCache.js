
class DataCache {
	constructor() {
		//list of puzzles in browser
		this.puzzleListCache = [];
		//pid -> puzzle data, mainly used by player
		this.puzzleCache = {};
		//pid -> user's puzzle status
		this.statusCache = {};
	}

	invalidatePuzzle(pid) {
		this.puzzleCache[pid] = undefined;
	}

	invalidatePuzzleList() {
		this.puzzleListCache = [];
	}

	invalidateStatus(pid) {
		this.statusCache[pid] = undefined;
	}

	//returns the puzzle if it's in the cache
	//null otherwise
	getPuzzle(pid) {
		const puzzle = this.puzzleCache[pid];
		if(puzzle === undefined) {
			return null;
		} else {
			return puzzle;
		}
	}

	//adds the puzzle to the cache
	setPuzzle(pid, puzzle) {
		this.puzzleCache[pid] = puzzle;
	}

	//returns status of puzzle if it's in the cache
	//null otherwise
	getStatus(pid) {
		const status = this.statusCache[pid];
		if(status === undefined) {
			return null;
		} else {
			return status;
		}
	}

	//adds the status to the cache
	setStatus(pid, status) {
		this.statusCache[pid] = status;
	}

	//returns cached puzzle list
	getPuzzleList() {
		return this.puzzleListCache;
	}

	//saves the puzzle list
	setPuzzleList(list) {
		this.puzzleListCache = list;
	}
}

const dataCache = new DataCache();

export default dataCache;
