onmessage = (msg) => {
	const img = msg.data.imgData;

	//generate a palette as a map from the image's pixels to a new color
	const palette = genPalette(img, msg.data.numColors+1, false);
	//use the palette to generate a puzzle
	const outData = genPuzzle(img, msg.data.size, palette);

	self.postMessage({
		isError: false,
		data: outData,
	})

	self.postMessage({
		isError: true,
		errorText: "Example Error",
	});
}

//generates a puzzle in a same(ish) format as what Board uses
//returns the outData object defined at the top
function genPuzzle(img, size, palette) {
	outData = {
		colors: [],
		width: 0,
		height: 0,
		squares: [],
	};
	//make the color list in CSS format
	outData.colors = palette.centroids.map(centroid => {
		return "rgb(" + Math.floor(centroid[0]) + "," +
						Math.floor(centroid[1]) + "," +
						Math.floor(centroid[2]) + ")";
	});
	//figure out the size of the puzzle
	const scaleFactor = Math.min(size / img.width,
								 size / img.height);
	outData.width = Math.floor(scaleFactor * img.width);
	outData.height = Math.floor(scaleFactor * img.height);
	outData.squares = Array({length: outData.width * outData.height}, () => 0);
	//reduce the colors of the image
	//putting the palette color indices in pixels
	const pixels = [];
	for(let i = 0; i < img.data.length / 4; i++) {
		const pixel = [
			img.data[4*i],   //red
			img.data[4*i+1], //green
			img.data[4*i+2], //blue
		];
		pixels.push(palette.paletteMap[pixel.toString()]);
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

//generate a palette map using k-means clustering
//specifically uses Lloyd's algorithm
function genPalette(img, num, useHcpRules) {
	//our distance function
	function dist(a, b) {
		return Math.sqrt((a[0]-b[0])**2 + (a[1]-b[1])**2 + (a[2]-b[2])**2);
	}

	//finds the centroids of each cluster
	function genCentroids(clusterMap, data) {
		//find the average R,G, and B of each cluster
		let clusterCounts = Array.from({length: num}, () => 1);
		//fill([0,0,0]) just copies the same reference, so we can't use it
		let clusterSums = Array.from({length: num}, () => [1,1,1]);
		//add up R, G, and B values in each cluster
		for(let i = 0; i < data.length; i++) {
			const pixel = data[i];
			let cluster = clusterMap[pixel.toString()];
			clusterCounts[cluster]++;
			let sum = clusterSums[cluster];
			sum[0] += pixel[0];
			sum[1] += pixel[1];
			sum[2] += pixel[2];
		}
		//find the average RGB for each cluster
		centroids = Array(num);
		for(let i = 0; i < num; i++) {
			const sum = clusterSums[i];
			const count = clusterCounts[i];
			const rAvg = sum[0] / count;
			const gAvg = sum[1] / count;
			const bAvg = sum[2] / count;
			centroids[i] = [rAvg, gAvg, bAvg];
		}
		return centroids;
	}

	//puts the data in clusters according to the given centroids
	function genClusters(centroids, data) {
		clusterMap = {};
		for(let i = 0; i < data.length; i++) {
			const pixel = data[i];
			//we already mapped this color, don't do anything else
			if(clusterMap[pixel.toString()] !== undefined) {
				continue;
			}
			//find the best cluster for the pixel by min distance to centroid
			let bestCentroid = 0;
			let bestDist = dist(centroids[0], pixel);
			for(let j = 1; j < num; j++) {
				const d = dist(centroids[j], pixel);
				if(d < bestDist) {
					bestCentroid = j;
				}
			}
			clusterMap[pixel.toString()] = bestCentroid;
		}
		return clusterMap;
	}

	//pack the pixels into triples
	const pixels = [];
	for(let i = 0; i < img.data.length / 4; i++) {
		const packed = [
			img.data[4*i],
			img.data[4*i+1],
			img.data[4*i+2],
		];
		pixels.push(packed);
	}

	let centroids = Array(num);
	//this is kinda sorta like an octree
	//first colors set the MSBs in RGB, and the LSBs later on
	//trust me, it works
	const bits = Math.ceil(Math.log2(num))
	for(let i = 0; i < num; i++) {
		let red = 0;
		let blue = 0;
		let green = 0;
		for(let b = 0; b < bits; b++) {
			red |= (i & 1) << (7-b);
			blue |= ((i >> 1) & 1) << (7-b);
			green |= ((i >> 2) & 1) << (7-b);
		}
		//& 0xFF is unnecessary, but it ensures the colors are valid
		centroids[i] = [red & 0xFF ,blue & 0xFF, green & 0xFF]
	}
	//force first centroid to be white
	if(!useHcpRules) {
		centroids[0] = [0xFF, 0xFF, 0xFF];
	}

	//used to check convergence
	let oldCentroids = [];

	//we loop until convergence or i > 100
	let paletteMap = {};
	let i = 0;
	while(true) {
		oldCentroids = centroids;
		paletteMap = genClusters(centroids, pixels);
		centroids = genCentroids(paletteMap, pixels);
		//again, force the first centroid to be white
		if(!useHcpRules) {
			centroids[0] = [0xFF, 0xFF, 0xFF];
		}
		//if the centroids have not changed, then we have converged
		let hasConverged = true;
		//iterate over each cluster's centroid
		outerCheck:
		for(let j = 0; j < centroids.length; j++) {
			//iterate over each color channel
			for(let k = 0; k < 3; k++) {
				if(centroids[j][k] != oldCentroids[j][k]) {
					hasConverged = false;
					break outerCheck;
				}
			}
		}
		if(hasConverged || i > 100) {
			break;
		}
		i++;
	}
	
	//merge similar centroids
	//similar meaning if the distance is less than the threshold
	const threshold = 10;
	for(let i = 0; i < centroids.length; i++) {
		if(centroids[i] !== null) {
			//if a later centroid is found to be too close, mark it null
			for(let j = i+1; j < centroids.length; j++) {
				if(centroids[j] !== null && 
				   dist(centroids[i], centroids[j]) < threshold) {
					centroids[j] = null;
					//remap the palette
					Object.keys(paletteMap).forEach((key) => {
						if(paletteMap[key] === j) {
							paletteMap[key] = i;
						}
					});
				}
			}
		} 
	}
	centroids = centroids.filter((x) => x !== null);

	return {
		paletteMap: paletteMap,
		centroids: centroids,
	};
}
