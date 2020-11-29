<script>

    import { onMount } from "svelte";
    import { Guide } from "./guide";
    import { ObjectDetector } from "./objectDetector";
    import { inputVideoSize } from "./global";


    const constraints = {
        video: {
            facingMode: "environment"
        }
    };

    let video = null;
    let frameCanvas = null;
    let frameContext = null;

    let objectDetector = new ObjectDetector({
        N_CLASS: 4,
        MIN_SCORE: 0.4,
        MAX_DRAW_BOX: 20
    });
    console.log(objectDetector);

    let guide = new Guide();

    let videoInputName = "";

    onMount(async () => {
        frameContext = frameCanvas.getContext("2d");

        navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
            video.srcObject = stream;
            videoInputName = stream.getVideoTracks()[0].label;
        });

        await objectDetector.loadModel();
    });

    function draw(objects)
    {
        frameContext.clearRect(0, 0, inputVideoSize.width, inputVideoSize.height);

        frameContext.strokeStyle = "red";
        frameContext.strokeWidth = 3;
        frameContext.font = `20px "Segoe UI"`;
        
        for (let obj of objects)
        {
            frameContext.strokeRect(obj.x, obj.y, obj.width, obj.height);
            frameContext.fillText(obj.label + " (" + obj.confidence + ")", obj.x, obj.y - 10);
            // frameContext.fillText(r.relativeErrorX + " " + r.relativeErrorY + " " + r.errorArea, obj.x, r.screenTarget.y - 30);
            
            frameContext.beginPath();
            frameContext.arc(obj.centerX, obj.centerY, 20, 0, 2*Math.PI);
            frameContext.fill();
        }
    }

    let guideStatus = "Click on play";

    async function tick()
    {
        if (!isGuiding)
        {
            return;
        }

        let objects = await objectDetector.detect(video);
        // console.log(objects);
        draw(objects);

        guide.update(objects);
        guideStatus = guide.status;

        requestAnimationFrame(tick);
    }

    let isGuiding = false;

    function startTracking()
    {
        if (!isGuiding)
        {
            isGuiding = true;

            inputVideoSize.width = video.videoWidth;
            inputVideoSize.height = video.videoHeight;
            
            frameCanvas.width = video.videoWidth;
            frameCanvas.height = video.videoHeight;
            frameCanvas.style.width = video.videoWidth + "px";
            frameCanvas.style.height = video.videoHeight + "px";
            
            guide.setState(0);

            tick();
        }
        else
        {
            isGuiding = false;
        }
    }


</script>

<div id="wrapper">
    <main>
        <h1>TrainGuide proof of concept</h1>

        <section>
            <h2>Video input : {videoInputName}</h2>

            <!-- svelte-ignore a11y-media-has-caption -->
            <div id="video-container" style="height: {Math.max(200, inputVideoSize.height)}px">
                <video autoplay bind:this={video} id="input-video"></video>

                <canvas bind:this={frameCanvas} id="objects-canvas"></canvas>
            </div>

            <button on:click={startTracking}>{isGuiding ? "Stop guidance" : "Guide me"}</button>

            <p>{guideStatus}</p>
        </section>
    </main>
</div>

<style>

    #wrapper {
        background-image: url("https://cdn.unitycms.io/image/ocroped/1200,1200,1000,1000,0,0/gHSTrbFT19Y/1JBvM-VEqHw8LU5fQUAjfy.jpg");
        background-position: center;
        background-size: cover;

        padding: 1em;
        box-sizing: border-box;

        width: 100vw;
        height: 100vh;
    }

    main {
        padding: 2em;
        margin: auto;
        max-width: 1000px;
        
        background-color: #fafafa;
        border-radius: 2em;
        box-shadow: -15px -15px 15px rgba(255, 255, 255, 0.4), 15px 15px 15px rgba(0, 0, 0, 0.4);
    }

    h1 {
        text-align: center;
    }

    #video-container {
        position: relative;
    }

    #input-video, #objects-canvas {
        position: absolute;
        max-width: 100%;
        height: auto;
        top: 0;
        left: 0;
    }

    #objects-canvas {
        z-index: 10;
    }

    button {
        display: block;
        margin: 1em auto;
        width: 10em;
        border: 2px solid red;
    }

    p {
        font-size: 2em;
    }
</style>