const metroGUI = p => {
    var tempoBox, transportStart, metroStart, tempoSlider, syncSlider, tempo, beats;
    const synthA = new Tone.FMSynth().toDestination();
    const synthB = new Tone.AMSynth().toDestination();
    const drumSampler = new Tone.Sampler(
        {
          urls: {
            "A3": "drums/Kick.wav",
            "A#3": "drums/Kick.wav",
            "B3": "drums/Snare.wav",
            "C4": "drums/Claps.wav",
            "C#4": "drums/Shot1.wav",
            "D#4": "drums/Shot2.wav",
            "D4": "drums/WhiteNoise.wav",
            "E4": "drums/ReverseCymbal.wav",
            "F4": "drums/HiHat_Closed.wav",
            "F#4": "drums/HiHat_Open.wav"
          },
        }
      ).toDestination();

    //play a note every quarter-note
    const loopA = new Tone.Loop((time) => {
        drumSampler.triggerAttackRelease("A3", "4n", time);
    }, "4n"); // kick

    const loopB = new Tone.Loop((time) => {
        drumSampler.triggerAttackRelease("C4", "4n", time);
    }, "2n"); // hand clap

    
    let patterns = [
        [
            {"time": 0, "pitch" : "A3", "dur" : "8n"},
            {"time": "0:1:0", "pitch" : "A3", "dur" : "8n"},
            {"time": "0:2:0", "pitch" : "A3", "dur" : "8n"},
            {"time": "0:3:0", "pitch" : "A3", "dur" : "8n"}
        ],
        [
            {"time": 0, "pitch" : "F4", "dur" : "16n"},
            {"time": 0, "pitch" : "A3", "dur" : "4n"},
            {"time": "0:0:2", "pitch" : "F4", "dur" : "16n"},
            {"time": "0:1:0", "pitch" : "F4", "dur" : "16n"},
            {"time": "0:1:2", "pitch" : "F4", "dur" : "16n"},
            {"time": "0:2:0", "pitch" : "F4", "dur" : "16n"},
            {"time": "0:2:2", "pitch" : "F4", "dur" : "16n"},
            {"time": "0:3:0", "pitch" : "F4", "dur" : "16n"},
            {"time": "0:3:2", "pitch" : "F4", "dur" : "16n"}
        ], 
        [
            {"time": 0, "pitch" : "A3", "dur" : "8n"},
            {"time": "0:1:0", "pitch" : "A3", "dur" : "8n"},
            {"time": "0:1:0", "pitch" : "C4", "dur" : "8n"},
            {"time": "0:2:0", "pitch" : "A3", "dur" : "8n"},
            {"time": "0:3:0", "pitch" : "A3", "dur" : "8n"},
            {"time": "0:3:0", "pitch" : "C4", "dur" : "8n"}
            
        ]
    ]
    let pattern = 0; 

    var drumPart = new Tone.Part((time, val) => {
        drumSampler.triggerAttackRelease(val.pitch, val.dur, time)
    }, patterns[pattern]);
    drumPart.loop = true;

    p.setup = function(){
        p.createCanvas(380, 200);

        transportStart = p.createButton("Start Transport");
        transportStart.style("font-size : 14px; width: 120px; height:90px");
        transportStart.style("height: 40px;");
        transportStart.style("border: 3px solid rgb(128, 0, 0); border-radius: 8px");
        transportStart.style("color : rgb(128, 0, 0); background-color: #ffd700");
        transportStart.position(20, 30);
        transportStart.mousePressed(()=>{
            if(Tone.getTransport().state == "stopped" || Tone.getTransport().state == "paused"){
                Tone.getTransport().start();
                transportStart.html("Stop Transport");
                console.log("Transport " + Tone.getTransport().state)
            } else {
                Tone.getTransport().stop();  
                console.log("Transport " + Tone.getTransport().state)
                transportStart.html("Start Transport");
            }
        })

        // Metronome start/stop button
        metroStart = p.createButton("start beat");
        metroStart.style("font-size : 16px");
        metroStart.position(20, 100);  
        metroStart.style("height: 40px;");
        metroStart.style("border: 3px solid rgb(128, 0, 0); border-radius: 8px");
        metroStart.style("color : rgb(128, 0, 0); background-color: #ffd700");
        metroStart.mousePressed(()=>{
            //console.log("start metro");
            // await Tone.start();
            if(Tone.getTransport().state == "stopped"){
                Tone.getTransport().start();
                console.log("Transport " + Tone.getTransport().state)
            }
           // console.log(loopA.state);
//            if(loopA.state == "stopped"){
              if(drumPart.state == "stopped"){
//                loopA.start("+4n");
//                loopB.start("+2n");
                let t = Tone.getTransport().position;
                let times = t.split(':');
                times[2] = 0; // set to downbeat;
                times[1] = 0; // set to first beat
                times[0] = Number(times[0]) + 1; // move up to the next measure;
                t = times[0] + ":" + times[1] + ":" + times[2]; 
                drumPart.start(t);
                metroStart.html("stop beat");
            } else {
//                loopA.stop();
//                loopB.stop();
                drumPart.stop();
                metroStart.html("start beat");
            }
        });

        // Tempo indicator/input
        tempoBox = p.createInput("120", "number");
        tempoBox.position(250, 32); 
        tempoBox.style("font-size : 16px");
        tempoBox.style("color: rgb(128, 0, 0); background-color: #ffd700")
        tempoBox.style("border: 3px solid rgb(128, 0, 0); border-radius: 4px"); 
        tempoBox.size(45);
        tempoBox.changed(()=>{
            //console.log(Tone.getTransport().state)
            if(Tone.getTransport().state == "stopped"){
                Tone.getTransport().start();
                console.log("Transport " + Tone.getTransport().state)
            }
            console.log("tempo box: " + tempoBox.value());
            tempoSlider.value(tempoBox.value());
            Tone.getTransport().bpm.value = tempoBox.value();
            console.log("Tempo from tempo box: " + Tone.getTransport().bpm.value);
            tempo = Math.round(Tone.getTransport().bpm.value);
        });

        // tempo change slider (change tempo on release)
        tempoSlider = p.createSlider(40, 200, 120, 1);
        tempoSlider.position(200, 70);
        tempoSlider.size(160);
        tempoSlider.changed(()=>{
            tempoBox.value(tempoSlider.value());
            // tempoBox.changed();
            //console.log(Tone.getTransport().state)

            if(Tone.getTransport().state == "stopped"){
                Tone.getTransport().start();
                console.log("Transport " + Tone.getTransport().state)
            }
           // console.log("tempo slider: " + tempoSlider.value());
            //Tone.getTransport().bpm.rampTo(tempoSlider.value(), 0.5);
            Tone.getTransport().bpm.value = tempoSlider.value();
            console.log(Tone.getTransport().bpm.value);
            tempo = Math.round(Tone.getTransport().bpm.value);
            
        });

        syncSlider = p.createSlider(-.1, .1, 0, .01);
        syncSlider.position(200, 135);
        syncSlider.size(160);
        syncSlider.changed(()=>{
            syncSlider.value(0);
        });

        tempo = Math.round(Tone.getTransport().bpm.value);
        beats = [];
        for(let i = 0; i < patterns.length; i++){
            console.log("new beat button " + i);
            beats.push(new Beat(20 * i, 170, i+1, p));
        }

        beats[0].on = true; // turn on first beat pattern;

    }

    p.draw = function(){
        p.background(200);
        p.textAlign(p.LEFT);
        p.textSize(16);
        p.text("Metronome & Sync", 10, 17);
        p.noFill();
        p.stroke('maroon');
        p.rect(190, 27, 185, 60);
        p.noStroke();
        p.fill(0);
        p.textAlign(p.CENTER);
        p.textSize(14);
        p.text("Tempo", 220, 50);
        p.textAlign(p.LEFT);
        p.textSize(12);
        p.text("BPM", 320, 50);
        // beat sync block
        p.noFill();
        p.stroke("maroon");
        p.rect(190, 100, 185, 75);
        p.noStroke();
        p.fill(0);
        p.textAlign(p.LEFT);
        p.textSize(14);
        p.text("Beat Sync:", 200, 120);
        p.textAlign(p.CENTER);
        p.textSize(12);
        p.text(Math.round(Tone.getTransport().bpm.value) + " bpm", 284, 170);
        p.textAlign(p.LEFT);
        p.text("<- slower", 200, 170);
        p.textAlign(p.RIGHT);
        p.text("faster->", 368, 170);
//        p.text(Tone.getTransport().bpm.value, 450, 55)
        p.textSize(12);
       // p.text(Math.round(Tone.getTransport().bpm.value) + " bpm", 200, 180); 
        Tone.getTransport().bpm.value = tempo + (tempo * syncSlider.value());
        let t = Tone.getTransport().position;
        let times = t.split(':');
        p.push()
        p.translate(20, 75); // Transport counter block
        p.textAlign(p.LEFT);
        // p.text("Transport", 0, -4);
        p.fill('white');
        p.rect(0, 0, 130, 20);
        p.textAlign(p.RIGHT, p.CENTER);
        p.fill(0);
        p.text(times[0] + ":", 40, 10);
        p.text(times[1] + ":", 50, 10);
        p.textAlign(p.LEFT, p.CENTER);        
        p.text(times[2], 50, 10);
        p.pop();

        for(let i = 0; i < beats.length; i++){
            beats[i].x = 40 + (50 * i);
            beats[i].display();
        }

        if(p.frameCount % 60 == 0 && Tone.Transport.state == "started"){
            transportStart.html("Stop Transport");
        }
    }

    p.mousePressed = function(){
        for(let i = 0; i < beats.length; i++){
            if(beats[i].click(p.mouseX, p.mouseY)){
                pattern = i;
//              beats[i].on = true;
                drumPart.stop();
                metroStart.html("start beat");
                drumPart = new Tone.Part((time, val) => {
                    drumSampler.triggerAttackRelease(val.pitch, val.dur, time)
                }, patterns[pattern]);
                drumPart.loop = true;
            }
            beats[i].on = false; // turn them all off
        }
        beats[pattern].on = true;
    }
}

class Beat {
    constructor(_x, _y, _i, _p5){
        this.x = _x;
        this.y = _y;
        this.w = 40; // diameter
        this.i = _i; // number index
        this.p5 = _p5; // p5 reference
        this.on = false; // clicked or no
    }

    display(){
        this.p5.push();
        this.p5.translate(this.x, this.y);
        let bg, fg;
        if(this.on){
            bg = "gold";
            fg = "maroon";
        } else {
            bg = "maroon";
            fg = "gold";
        }
        this.p5.fill(bg)
        this.p5.stroke(fg);
        this.p5.strokeWeight(2)
        this.p5.ellipse(0, 0, this.w);
        this.p5.noStroke();
        this.p5.fill(fg);
        this.p5.textSize(16);
        this.p5.textAlign(this.p5.CENTER, this.p5.CENTER);
        this.p5.text(this.i, 0, 0)
        this.p5.pop();
    }

    click(mX, mY){
        // receives mouseX and mouseY and reports proximity
        if(this.p5.dist(this.x, this.y, mX, mY) < this.w / 2){
            return true;
        } else {
            return false;
   
        }
    }
}