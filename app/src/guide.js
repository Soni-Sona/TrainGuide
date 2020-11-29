import { inputVideoSize } from "./global";
import { Synth } from "./synth";

export class Guide
{
    constructor()
    {
        this.state = -1;

        this.status = "Click on play";

        this.targetDoorCenterX = inputVideoSize.width / 2;
        this.targetDoorCenterY = inputVideoSize.height / 2;
        this.targetDoorHeight = inputVideoSize.height * 0.9;

        this.targetHandleCenterX = inputVideoSize.width / 2;
        this.targetHandleCenterY = inputVideoSize.height / 2;
        this.targetHandleArea = inputVideoSize.width * inputVideoSize.height * 0.4;

        this.DOOR_LABEL = 1; // person
        this.HANDLE_LABEL = 77; // cell phone

        this.currentDoor = null;
        this.currentHandle = null;

        this.synth = new Synth();
        this.speechSynthesis = window.speechSynthesis;
        this.speechSynthesis.addEventListener("voiceschanged", () => {
            // get google english voice
            const voices = this.speechSynthesis.getVoices();
            this.voice = voices[0];
            for (let voice of voices)
            {
                if (voice.lang == "en-US")
                {
                    this.voice = voice;
                }
            }
        });
    }

    speak(str)
    {
        let utterance = new SpeechSynthesisUtterance(str);
        utterance.voice = this.voice;
        speechSynthesis.speak(utterance);
    }

    setState(state)
    {
        console.log("Setting state " + state)
        if (state == this.state)
        {
            return;
        }

        this.speechSynthesis.pause();
        this.speechSynthesis.cancel();

        this.state = state;

        switch (state)
        {
            case 0:
                this.status = "Looking for door";
                this.speak("Please look around to find a door");
            break;

            case 1:
                this.status = "Door found !";
                this.speak("I found a door ! I'll guide you with the beeps");
            break;

            case 2:
                this.status = "Handle found !";
                this.speak("I found the handle ! Now I'll guide you to it");
            break;
        }
    }

    update(objects)
    {
        if (this.speechSynthesis.speaking)
        {
            this.synth.setMasterGain(0.1);
        }
        else
        {
            this.synth.setMasterGain(0.8);
        }

        this.currentDoor = this.lookForDoor(objects);

        if (this.state == 0) // Looking for door
        {
            if (this.currentDoor)
            {
                this.setState(1);
                this.synth.start();
            }
        }
        else if (this.state == 1) // Going towards door until handle found
        {
            this.currentHandle = this.lookForHandle(objects);
            if (this.currentHandle)
            {
                this.setState(2);
            }
            else if (this.currentDoor)
            {
                this.guideTowardsDoor();
            }
            else
            {
                this.setState(0);
                this.synth.stop();
            }
        }
        else if (this.state == 2) // Going towards handle
        {
            this.currentHandle = this.lookForHandle(objects);
            if (this.currentHandle)
            {
                this.guideTowardsHandle();
            }
            else
            {
                this.setState(1);
            }
        }
    }

    lookForDoor(objects)
    {
        return this.lookForObject(objects, this.DOOR_LABEL)
    }

    lookForHandle(objects)
    {
        return this.lookForObject(objects, this.HANDLE_LABEL);
    }

    lookForObject(objects, label)
    {
        let doors = objects.filter((obj) => obj.label == label);

        if (doors.length <= 0)
        {
            return null;
        }
        
        let maxConfidenceDoor = doors[0];
        let maxConfidence = maxConfidenceDoor.confidence;

        for (let d of doors)
        {
            if (d.confidence > maxConfidence)
            {
                maxConfidence = d.confidence;
                maxConfidenceDoor = d;
            }
        }

        return maxConfidenceDoor;
    }

    guideTowardsDoor()
    {
        let requestedMoveX = this.targetDoorCenterX - this.currentDoor.centerX;
        let requestedMoveY = this.targetDoorCenterY - this.currentDoor.centerY;

        let distanceEstimation = this.currentDoor.height / this.targetDoorHeight;
        this.synth.setBeepingFrequency(distanceEstimation * 5);

        let normalizedMoveY = requestedMoveY / (inputVideoSize.height / 2); // [-1 ; 1]
        let freq = 440 + Math.round(normalizedMoveY) * 220;
        this.synth.setFrequency(freq);

        let pan = requestedMoveX / inputVideoSize.width * -1;
        this.synth.setPan(Math.pow(Math.abs(pan), 0.2) * Math.sign(pan));

        this.status = `
            Door center at (${this.currentDoor.centerX.toFixed(3)};${this.currentDoor.centerY.toFixed(3)})
            Move requested (${requestedMoveX.toFixed(3)};${requestedMoveY.toFixed(3)})
            Door height (${this.currentDoor.height.toFixed(3)})
            Door distance target (${distanceEstimation.toFixed(3)})
        `;
    }

    guideTowardsHandle()
    {
        let requestedMoveX = this.targetHandleCenterX - this.currentHandle.centerX;
        let requestedMoveY = this.targetHandleCenterY - this.currentHandle.centerY;

        let distanceEstimation = this.currentHandle.area / this.targetHandleArea;
        this.synth.setBeepingFrequency(distanceEstimation * 5);

        let normalizedMoveY = requestedMoveY / (inputVideoSize.height / 2); // [-1 ; 1]
        let freq = 440 + Math.round(normalizedMoveY) * 220;
        this.synth.setFrequency(freq);

        let pan = requestedMoveX / inputVideoSize.width * -1;
        this.synth.setPan(Math.pow(Math.abs(pan), 0.2) * Math.sign(pan));

        this.status = `
            Handle center at (${this.currentHandle.centerX.toFixed(3)};${this.currentHandle.centerY.toFixed(3)})
            Move requested (${requestedMoveX.toFixed(3)};${requestedMoveY.toFixed(3)})
            Handle area (${this.currentHandle.height.toFixed(3)})
            Handle distance target (${distanceEstimation.toFixed(3)})
        `;
    }
}