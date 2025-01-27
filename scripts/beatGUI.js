const beatPartGUI = p => {
  var beatSynth = drumSampler;//new Tone.Synth().toDestination();
  var obj;
  var beatButton, muteButton; // buttons
  var part; //Tone.js Part reference
  var loop; // Tone.js Loop reference
  var cells = []; // array of cell objects
  var cellCount = 0; // keep count of active cell
  var mute = false; // mute the pattern
  var margin = 50; // left padding
  var pitch = "C3"; // default pitch
  var div = document.getElementById("beatParts");
  var sect3 = document.getElementById("part3-contents");

  p.setObj = function(_obj) {
  //  console.log("setting object for beat part " + JSON.stringify(_obj));
    obj = _obj;
    if (obj.hasOwnProperty("pitch"))
      pitch = obj.pitch; //otherwise default "C3"
    let w = 15; // width of cell
    let plays = false;
    if (obj.hasOwnProperty("pattern")) {
      //p.text(obj.pattern, 100, p.height/2);
      for (let i = 0; i < obj.pattern.length; i++) {
        if (obj.pattern[i] == '1') {
          plays = true;
        } else plays = false;
        if (obj.pattern.length > 16) {
          w = 240 / obj.pattern.length;
        } else w = 15;
        cells.push(new Cell(p, 40 + i * w, 13, w));
        cells[i].w = w; // adjust as necessary
        cells[i].plays = plays;
        // console.log(cells[i].x);
      }
    }
    console.log("beat part " + obj.name + "( " + obj.pattern.length + ")")
    loop = new Tone.Loop((time) => {
      // triggered every sixteenth note.
      //console.log(time);
      p.playBeat(time);
    }, "16n")
    loop.stop();
    return loop; // return loop reference to beats.makeBeats()
  };

  p.getLoop = function(){
    return loop;
  }

  p.setup = function() {
    let cnv = p.createCanvas(330, 40);
    cnv.style("visibility: visible;");
    // console.log("creating canvas for beat part");
  }

  p.setSynth = function(_synth) {
    beatSynth = _synth;
  }

  p.draw = function() {
    p.background(200);
    p.fill(0);
    p.textAlign(p.LEFT, p.TOP);
    p.textSize(10);
    p.text(obj.name + " (" + obj.pattern.length + ")", 5, 2);
    for (let i = 0; i < cells.length; i++) {
      cells[i].display(); // draw all the cells
    }
  }

  p.loopStart = function() {
//    if (loop.state == 'started') {
//      loop.stop();
//      cellCount = 0; // reset counter
//    } else {
console.log("loopStart() in beatPartGUI 76");
      cellCount = 0;
      let t = Tone.Transport.position;
      let times = t.split(':');
      times[2] = 0; // set to downbeat;
      times[1] = 0; // set to first beat
      times[0] = Number(times[0]) + 1; // move up to the next measure;
      t = times[0] + ":" + times[1] + ":" + times[2];
      console.log("starting loop");
      loop.start(t); // time in beats or seconds
//    }
  }

  p.loopStop = function() {
    loop.stop();
    cellCount = 0; // reset counter
  }

  p.playBeat = function(time) {
    cells[cellCount].on = true; // light it up!
    if (cells[cellCount].plays && !mute) {
      beatSynth.triggerAttackRelease(pitch, "16n", time);
      //play synth
    }

    //turn off adjacent cells
    if (cellCount == 0) {
      cells[cells.length - 1].on = false;
    } else cells[cellCount - 1].on = false;
    cellCount++;
    cellCount = cellCount % cells.length; //0%4==0, 4%4==0, 3%4==3
  }

  p.mousePressed = function() {
    if (p.mouseY < p.height && p.mouseY > 0 && div.style["display"] == "block" && sect3.style["display"] == "block") {
      console.log ("beatpart mouse pressed " + div.id);
      if (loop.state == 'started') {
        loop.stop();
        cellCount = 0; // reset counter
      }
      else {
        let t = Tone.Transport.position;
        let times = t.split(':');
        times[2] = 0; // set to downbeat;
        times[1] = 0; // set to first beat
        times[0] = Number(times[0]) + 1; // move up to the next measure;
        t = times[0] + ":" + times[1] + ":" + times[2];
        loop.start(t); // time in beats or seconds
      }
    }
  }
}

const beatsGUI = p => {
  let menu, plusButton, playButton;
  let objs = [];
  let loops = []; // get loop sketches from each part and add to array
  var div = document.getElementById("part3-contents"); // parent

  p.setLoops = function(arr){
    loops = arr;
    console.log("loops array for big button: ");
    for(let i = 0; i < loops.length; i++){
      console.log(loops[i]);
      console.log(loops[i].getLoop().state);
      loops[i].loopStop(); // make sure loops are stopped
    }
  }
  
  p.setup = function() {
    p.createCanvas(350, 60);
    plusButton = new PlusButton(p, p.width * 11 / 12, p.height / 2);
    playButton = new BeatPlayButton(p, p.width / 2, p.height / 2);
    console.log("Beat Div: " + div.id + " (display: " + div.style["display"] + ")"); 
  }

  p.draw = function() {
    p.background(200);
    p.text("Beats", 20, p.height / 2);
    plusButton.display();
    playButton.display();
    for(let i = 0; i < loops.length; i++){
      state = loops[i].getLoop().state;
      if (state == "started")
        playButton.playing = true;
    }
  }

  p.nextMeasure = function(){
    let t = Tone.Transport.position;
    let times = t.split(':');
    times[2] = 0; // set to downbeat;
    times[1] = 0; // set to first beat
    times[0] = Number(times[0]) + 1; // move up to the next measure;
    t = times[0] + ":" + times[1] + ":" + times[2];    
    return t;
  }

  p.mousePressed = function() {
    // collapse beat parts
    let partsDiv = document.getElementById("beatParts");
    if (plusButton.click(p.mouseX, p.mouseY)) {
      if (partsDiv.style.display === "none") {
        partsDiv.style.display = "block";
        //plusButton.r = p.PI / 4 // handle this in .click()
      } 
      else {
        partsDiv.style.display = "none";
        //plusButton.r = 0;
      }
    }

    if (playButton.click(p.mouseX, p.mouseY) && div.style["display"] == "block") {
      console.log ("playbutton");
      if(Tone.Transport.state == "stopped"){
        Tone.Transport.start();
      }
      if (!playButton.playing) {
        // stop the beat
        // playButton.playing = false;
        for(let i = 0; i < loops.length; i++){
          loops[i].loopStop();
        }
      } 
      else {
        //start beat on next measure
        // playButton.playing = true;

        for(let i = 0; i < loops.length; i++){
          loops[i].loopStart(); // P5 sketch for each loop handles timing and loop start/stop
//          console.log("starting beat" + i + " at " + t);
          // console.log("loop progress: " + loops[i].progress)
        }
      }
    }
  }
}


class BeatPlayButton {
  constructor(_p, _x, _y){
    this.p = _p; // P5 object reference
    this.x = _x;
    this.y = _y;
    this.w = 50;
    this.col = this.p.color("#4caf50");
    this.playing = false;
  }

  click(_x, _y){
    let d = this.p.dist(this.x, this.y, _x, _y);
    if(d < this.w/2){
      // console.log("beat button clicked");
      this.playing = !this.playing;
      return true;
    } else {
      return false;
    }

  }

  display(){
    this.p.push();
    this.p.translate(this.x, this.y);
    this.p.scale(.8);
    this.p.fill("#fde4a9");
    this.p.stroke("#5d0024");
    this.p.strokeWeight(4);
    if(this.playing){
      this.p.rectMode(this.p.CENTER);
      this.p.rect(-this.w/4, 0, this.w/4, 40);     
      this.p.rect(this.w/4, 0, this.w/4, 40);    
      this.col = this.p.color("#4caff0");
    } else {

      this.p.ellipse(0, 0, this.w);
      //this.p.triangle(this.w/2, 0, -this.w/2, -this.w/2, -this.w/2, this.w/2);
      this.p.stroke(0, 150, 0);
      this.p.strokeJoin(this.p.ROUND);
      this.p.fill(this.col);
      this.p.beginShape();
      this.p.vertex((this.w/2 * 0.7), 0);
      let x = this.p.cos(this.p.PI - 1) * (this.w/2 * 0.75);
      let y = this.p.sin(this.p.PI - 1) * (this.w/2 * 0.75);
      this.p.vertex(x, y);
      x = this.p.cos(this.p.PI + 1) * this.w/2 * 0.75;
      y = this.p.sin(this.p.PI + 1) * this.w/2 * 0.75;
      this.p.vertex(x, y);
      this.p.endShape(this.p.CLOSE);
      this.p.textAlign(this.p.CENTER, this.p.CENTER);
      this.p.noStroke();
      this.p.fill(0, 150, 0);
      this.p.text("P", -2, 1);
      this.col = this.p.color("#4caf50");
    }
    this.p.pop();
  }
}

class PlusButton {
  constructor(_p, _x, _y) {
    this.p = _p; // p5 instance
    this.x = _x;
    this.y = _y;
    this.r = this.p.PI/4; // rotation
    this.d = 30; // diameter
  }

  display() {
    //looks like a big plus sign
    //rotates into an X when clicked
    this.p.push();
    this.p.translate(this.x, this.y);
    this.p.rotate(this.r);
    this.p.strokeWeight(5);
    this.p.line(-this.d / 2, 0, this.d / 2, 0);
    this.p.line(0, -this.d / 2, 0, this.d / 2);
    this.p.pop();
  }
  click(_x, _y) {
    let d = this.p.dist(this.x, this.y, _x, _y);
    // console.log("(" + this.x + ", " + this.y + ") (" + _x + ", " + _y + ")");
    if(d < this.d/2){
      // rotate the button
      if (this.r > 0) {
        this.r = 0;
      } else {
        this.r = this.p.PI / 4;
      }
      return true; // if clicked
    } else {
      return false
    }
  }
}

class Cell {
  /** 
  individual cell in a beat pattern interface
  */
  constructor(_p, _x, _y, _w) {
    this.p = _p; // p5 instance
    this.x = _x;
    this.y = _y;
    this.w = _w; // width (default)
    this.h = 20; // height
    this.plays = false; // cell plays a note (default false)
    this.on = false; // is this cell the focus on this 16th note?
  }

  display() {
    if (this.on) {
      if (this.plays)
        this.p.fill(this.p.color("#4caf50")); // active player, green
      else
        this.p.fill(150) // non-player, active (gray)
    } else { // not on
      if (this.plays)
        this.p.fill(this.p.color("#ba64e8")); // non-active player, purple
      else
        this.p.fill(255); //non-player, not active (white)
    }
    this.p.push();
    this.p.translate(this.x, this.y);
    this.p.rect(0, 0, this.w, this.h, 2);
    this.p.fill(0);
    //this.p.text(Math.trunc(this.w), 0, 0);
    this.p.pop();

  }

}

