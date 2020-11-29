import { inputVideoSize } from "./global";

export class ObjectDetectorDetection
{
    constructor(label, confidence, xmin, xmax, ymin, ymax)
    {
        this.label = label;
        this.confidence = confidence;

        this.x = xmin * inputVideoSize.width;
        this.xMax = xmax * inputVideoSize.width;
        this.y = ymin * inputVideoSize.height;
        this.yMax = ymax * inputVideoSize.height;

        this.width = this.xMax - this.x;
        this.height = this.yMax - this.y;

        this.centerX = this.x + this.width / 2;
        this.centerY = this.y + this.height / 2;

        this.area = this.width * this.height;
    }
}

export class ObjectDetector
{
    constructor(options)
    {
        this.model = null;

        this.options = options || {
            N_CLASS: 4,
            MIN_SCORE: 0.2,
            MAX_DRAW_BOX: 20
        };
    }

    async loadModel()
    {
        this.model = await tf.loadGraphModel("./web_model/model.json");

        console.log("[Object detector] model loaded");
    }

    async detect(img)
    {
        tf.engine().startScope();

        let tensorImg = tf.browser.fromPixels(img).resizeNearestNeighbor([320,320]).expandDims();
        
        // console.time("prediction")
        let prediction = await this.model.executeAsync(tensorImg);
        // console.timeEnd("prediction")

        let indexBoxes   = this.model.outputNodes.indexOf("Identity_1:0");
		let indexClasses = this.model.outputNodes.indexOf("Identity_2:0");
		let indexScores  = this.model.outputNodes.indexOf("Identity_4:0");
		// let indexCount   = this.model.outputNodes.indexOf("Identity_5:0");
		
		let boxesPromise   = prediction[indexBoxes].array().then(n=>n[0]);
		let classesPromise = prediction[indexClasses].array().then(n=>n[0]);
		let scoresPromise  = prediction[indexScores].array().then(n=>n[0]);
        // let count   = prediction[indexCount].data().then(n=>n[0]);
        
        let [boxes, classes, scores] = await Promise.all([boxesPromise, classesPromise, scoresPromise]);

        let boundingBoxes = [];
        for (let i = 0, j = 0; j < boxes.length; j++) // Here, we choose which boxes are kept
        {
            let c = classes[j];
            if (c == 0 || c > this.options.N_CLASSES)
                continue;
            
            let s = scores[j];
            if (s < this.options.MIN_SCORE)
                break;

            let b = boxes[j];
            boundingBoxes.push(new ObjectDetectorDetection(c, s, b[1], b[3], b[0], b[2]));
            
            if (++i >= this.options.MAX_DRAW_BOX)
                break;
        }

        tf.engine().endScope();

        return boundingBoxes;
    }
}