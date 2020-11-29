export class Synth
{
    constructor()
    {
        this.audioContext = new AudioContext();

        this.panner = this.audioContext.createStereoPanner();
        this.gain = this.audioContext.createGain();
        this.masterGain = this.audioContext.createGain();

        this.panner.connect(this.gain);
        this.gain.connect(this.masterGain);
        this.masterGain.connect(this.audioContext.destination);
        this.masterGain.gain.value = 0.5;

        this.gain.gain.value = 0.5;


        this.playing = false;
    }

    start()
    {
        this.oscillator = this.audioContext.createOscillator();
        this.oscillator.connect(this.panner);
        this.oscillator.type = "sawtooth";
        this.oscillator.frequency.value = 440;

        this.beepGain = this.audioContext.createGain();
        this.beepGain.gain.value = 0.5;
        this.beepOscillator = this.audioContext.createOscillator();
        this.beepOscillator.connect(this.beepGain);
        this.beepOscillator.frequency.value = 3;
        this.beepOscillator.type = "square";
        this.beepGain.connect(this.gain.gain);
        
        this.oscillator.start();
        this.beepOscillator.start();
        this.playing = true;
    }

    stop()
    {
        this.oscillator.stop();
        this.beepOscillator.stop();

        this.playing = false;
    }

    setFrequency(f)
    {
        if (this.oscillator)
        {
            this.oscillator.frequency.value = f;
        }
    }

    setPan(p)
    {
        this.panner.pan.value = p;
    }

    setBeepingFrequency(f)
    {
        if (this.beepOscillator)
        {
            this.beepOscillator.frequency.value = f;
        }
    }

    setMasterGain(g)
    {
        this.masterGain.gain.value = g;
    }
}