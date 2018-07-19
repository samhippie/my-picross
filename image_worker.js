onmessage = (msg) => {
	const img = msg.data.imgData;

	//generate a palette as a map from the image's pixels to a new color
	const colors = genPalette(img, msg.data.numColors+1, false);
	//use the palette to generate a puzzle
	const outData = genPuzzle(img, msg.data.size, colors);

	self.postMessage({
		isError: false,
		data: outData,
	})
}


//converts r,g,b values to a 24-bit int
function rgbToInt(r,g,b) {
	return ((r & 0xFF) << 16) |
		   ((g & 0xFF) << 8) |
		   (b & 0xFF);
}

//converts a 24-bit color int to a hex string
function intToHexString(rgb) {
	//kinda wish javascript had printf string formatting
	let hex = rgb.toString(16);
	while(hex.length < 6) {
		hex = '0' + hex;
	}
	return '#' + hex
}

//finds the R,G,B-space euclidean distance between 24-bit color ints
function dist(a,b) {
	const red = (x) => (x >> 16) & 0xFF;
	const green = (x) => (x >> 8) & 0xFF;
	const blue = (x) => x & 0xFF;
	return Math.sqrt(
		(red(a)-red(b))**2 + 
		(green(a)-green(b))**2 +
		(blue(a)-blue(b))**2);
}

//generates a puzzle in a same(ish) format as what Board uses
//returns the outData object defined at the top
//function genPuzzle(img, size, palette) {
function genPuzzle(img, size, colors) {
	outData = {
		colors: [],
		width: 0,
		height: 0,
		squares: [],
	};
	//make the color list in hex format
	outData.colors = colors.map(intToHexString);
	//figure out the size of the puzzle
	const scaleFactor = Math.min(size / img.width,
								 size / img.height);
	outData.width = Math.floor(scaleFactor * img.width);
	outData.height = Math.floor(scaleFactor * img.height);
	outData.squares = Array({length: outData.width * outData.height}, () => 0);
	//reduce the colors of the image
	//find the nearest color to the given pixel
	function nearestColor(pixel) {
		let bestIndex = 0;
		let bestDist = dist(colors[0], pixel);
		colors.forEach((color,index) => {
			const d = dist(color, pixel);
			if(d < bestDist) {
				bestIndex = index;
				bestDist = d;
			}
		});
		return bestIndex;
	}
	//putting the palette color indices in pixels
	const pixels = [];
	for(let i = 0; i < img.data.length / 4; i++) {
		const pixel = rgbToInt(
			img.data[4*i],   //red
			img.data[4*i+1], //green
			img.data[4*i+2], //blue
		);
		pixels.push(nearestColor(pixel));
	}
	//get the color of each square by sampling the original image
	//init sampleCount so we can count the number of colors in each square
	const sampleCount = Array.from({length: outData.width*outData.height}, 
								   () => {
		return Array.from({length: outData.colors.length}, () => 0);
	});
	//getting samples from the image
	for(let x = 0; x < img.width; x++) {
		for(let y = 0; y < img.height; y++) {
			const outX = Math.min(outData.width-1, 
								  Math.max(0, 
										   Math.floor(x * scaleFactor)));
			const outY = Math.min(outData.height-1, 
								  Math.max(0, 
										   Math.floor(y * scaleFactor)));
			//count the instances of a color in each sample
			const sample = sampleCount[outY * outData.width + outX];
			const colorIndex = pixels[y * img.width + x];
			sample[colorIndex]++;
		}
	}
	//using those samples to fill the squares
	for(let x = 0; x < outData.width; x++) {
		for(let y = 0; y < outData.height; y++) {
			const sample = sampleCount[y * outData.width + x];
			//find the most common color in the sample
			let best = 0;
			let bestCount = sample[0];
			for(let i = 0; i < sample.length; i++) {
				if(sample[i] > bestCount) {
					best = i;
					bestCount = sample[i];
				}
			}
			outData.squares[y * outData.width + x] = best;
		}
	}
	return outData;
}

//generate a palette map using an octree
//picks the highest level that has # nodes with non-zero size > num
//then picks 1 representative from each of the num best nodes
//if not useHcpRules, adds white
//also merges colors that are too similar
function genPalette(img, num, useHcpRules) {
	//initializes a blank octree of the given depth
	function createOctree(n) {
		if(n === 0) {
			return {
				isLeaf: true,
				colorCounts: {},
				size: 0,
			};
		} else {
			return {
				isLeaf: false,
				size: 0,
				children: Array.from({length: 8}, () => createOctree(n-1)),
			};
		}
	}
	
	//places a color in the given octree
	function placeColor(octree, r, g, b, n = 0) {
		//use the nth most significant bit
		octree.size++;
		if(octree.isLeaf) {
			const color = rgbToInt(r,g,b);
			if(octree.colorCounts[color] === undefined) {
				octree.colorCounts[color] = 1;
			} else {
				octree.colorCounts[color]++;
			}
		} else {
			const pos =
				((r >> (7-n)) & 1) << 2 |
				((g >> (7-n)) & 1) << 1 |
				((b >> (7-n)) & 1)
			const next = octree.children[pos];
			placeColor(next, r, g, b, n+1);
		}
	}

	//removes empty children
	//the child slots are set to null rather than being removed
	//I don't think this is useful
	function purgeEmpty(octree) {
		if(!octree.isLeaf) {
			for(let i = 0; i < 8; i++) {
				if(octree.children[i].size === 0) {
					octree.children[i] = null;
				} else {
					purgeEmpty(octree.children[i]);
				}
			}
		}
	}

	//finds the number of unique colors on each level
	//root is level 0
	function levelCount(octree, level) {
		if(octree.isLeaf) {
			return Object.keys(octree.colorCounts).length;
		} else if (level == 0) {
			return octree.children.reduce((acc, child) => {
				return acc + (child.size > 0 ? 1 : 0);
			}, 0);
		} else {
			return octree.children.reduce((acc, child) => {
				return acc + levelCount(child, level-1);
			}, 0);
		}
	}

	//picks the most popular representative colors from the level
	function pickBestColors(octree, num) {
		//get the nodes (may or may not be leaves)
		//always returns a flat array of octree nodes
		function getLevel(octree, level) {
			if(level === 0) {
				return [octree];
			} else if(!octree.isLeaf) {
				return octree.children
					.map(child => getLevel(child, level-1))
					.reduce((acc, child) => acc.concat(child), [])
					.filter(child => child.size > 0)
			} else {
				return [];
			}
		}

		//picks 1 color from the octree
		function pickColor(octree) {
			if(octree.isLeaf) {
				//picks most popular color
				const colors = Object.keys(octree.colorCounts);
				if(colors.length === 0) {
					return 0x0;//black is a nice default
				}
				let best = colors[0];
				let bestCount = octree.colorCounts[best];
				colors.forEach(color => {
					const count = octree.colorCounts[color];
					if(count > bestCount) {
						best = color;
						bestCount = count;
					}
				});
				//Object.keys() converts the keys to strings
				return parseInt(best, 10);
			} else {
				//picks most popular child, calls pickColor on it
				let best = octree.children[0];
				octree.children.forEach(child => {
					if(child.size > best.size) {
						best = child;
					}
				});
				return pickColor(best);
			}
		}

		//picking out which level to use
		let bestLevel = 0;
		for(let i = 0; i < octreeHeight; i++) {
			if(levelCount(octree, i) >= num) {
				bestLevel = i;
				break;
			}
		}

		//+1 because levelCount() counts the children of a level
		//and getLevel() counts the level itself
		const colors = getLevel(octree, bestLevel+1)
			//sort the nodes (DESC) and pick the num best
			.sort((a,b) => b.size - a.size)
			.slice(0, num)
			.map(pickColor);

		return colors;
	}


	const octreeHeight = 2;
	const octree = createOctree(octreeHeight);

	//putting all the colors in the octree
	for(let i = 0; i < img.data.length / 4; i++) {
		placeColor(octree, img.data[4*i], 
						   img.data[4*i+1],
						   img.data[4*i+2]);
	}

	//num-1 if we'll be adding white later
	let bestColors = pickBestColors(octree, useHcpRules ? num : num-1);
	
	if(!useHcpRules) {
		//make white the first color
		bestColors = [0xFFFFFF].concat(bestColors);
	}
	
	//merge colors that are too similar
	const threshold = 10;
	for(let i = 0; i < bestColors.length; i++) {
		if(bestColors[i] === null) {
			continue;
		}
		for(let j = i+1; j < bestColors.length; j++) {
			if(dist(bestColors[j], bestColors[i]) < threshold) {
				bestColors[j] = null;
			}
		}
	}
	bestColors = bestColors.filter(c => c !== null);

	return bestColors;
}
