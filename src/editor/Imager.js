
//the builder for the image importer
//it gets the information together and handle communicating with a web worker

//I'm not sure if a factory pattern is good here or if I'm
//just too used to java
export class Builder {

	constructor() {
		this.file = null;
		this.size = 15;
		this.numColors = 3;
		this.onError = () => {};
		this.onSuccess = () => {};
	}

	setFile(file) {
		this.file = file;
		return this;
	}

	setSize(size) {
		this.size = parseInt(size, 10);
		return this;
	}

	setNumColors(numColors) {
		this.numColors = parseInt(numColors, 10);
		return this;
	}

	//onError will be called if there is an error
	//it will be passed a string with the error message
	setOnError(onError) {
		this.onError = onError;
		return this;
	}

	//onSuccess will be called after the object is built
	//it will be passed the object
	setOnSuccess(onSuccess) {
		this.onSuccess = onSuccess;
		return this;
	}


	//calls onSucccess, passing an object with squares and the color map
	async build() {
		//basic input validation
		if(this.size < 1 || this.numColors < 1) {
			this.onError("Invalid Parameters");
			return;
		}
		if(!this.file) {
			this.onError("No file set");
			return
		}
		if(!this.file.type.startsWith('image/')) {
			this.onError("Invalid image file");
			return;
		}

		//need to get the pixel data on the main thread because
		//OffscreenCanvas is too experimental to use
		const reader = new FileReader();
		reader.onload = (event) => {
			//load up the image
			const blob = event.target.result;
			const img = new Image();
			img.onload = () => {
				//put it in a canvas
				
				//TODO consider shrinking the image a bit here
				//maybe to the geometric mean of the given size and the image
				
				const canvas = document.createElement('canvas');

				//calculate the scaling
				/*
				const scaleFactor = Math.min(this.size / img.width, 
											 this.size / img.height);
											 */
				
				canvas.width = img.width;
				canvas.height = img.height;
				const context = canvas.getContext('2d');
				//geometric mean between image size and puzzle size
				//if we scaled down to the puzzle size, we'd lose a lot
				//of color information
				//if we don't scale, processing the image is slow
				//const interWidth = Math.sqrt(scaleFactor) * img.width;
				//const interHeight = Math.sqrt(scaleFactor) * img.height;
				//context.drawImage(img, 0, 0, interWidth, interHeight);
				context.drawImage(img, 0, 0);
				//pull out the image data from the canvas
				const imgData = context.getImageData(0, 0, img.width, img.height);

				const data = {
					size: this.size,
					numColors: this.numColors,
					imgData: imgData,
				};

				const imageWorker = new Worker('./image_worker.js');
				imageWorker.onmessage = (msg) => {
					if(msg.data.isError) {
						this.onError(msg.data.errorText);
					} else {
						this.onSuccess(msg.data.data);
					}
				}
				imageWorker.postMessage(data);
			}
			img.src = blob;
		}

		reader.readAsDataURL(this.file);
	}
}


