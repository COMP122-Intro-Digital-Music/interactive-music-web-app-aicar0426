/*
* P5.js functions for GUI
* Creates a user interface with a graphical representation of the Markov graph and connections between nodes
*/
const mGUI = p => {
  var tButton, s1Button, s2Button, nodes, beatButton;
  var nButtons = new Array();
  var pitchSet = null, rhythmSet = null; // needs setter
  var loop = null;
  var name = "markov chain";
  var vol = 1;
  var slider;
  var w = 400, h = 400;
  var instrument; //= synthLibrary[0].synth;
  var selectSynth;
  var selectLength;
  var noteLength = "legato";
  var div = document.getElementById("markov").parentNode;

  p.setLoop = function(obj){
    loop = obj; // reference to a Tone.loop 
    // called from markov.js after Tone.loop object is created
  }
  p.getLength = function(){
    return noteLength; // "legato", "marcato", "staccato"
    //if staccato, play all notes as 16ths
    //legato is full note value
    //marcato is shortened by 80%
  }
  
  p.getVol = function(){
    return vol; // get the current volume for this graph
  }
  p.getInst = function(){
    return instrument;
  }

  p.setVol = function(){
    // set volume
    //vol = slider.
  }
  p.setObj = function(obj){
    if(obj.hasOwnProperty("pitchSet")){
      pitchSet = obj.pitchSet;
      p.makeNodes(pitchSet, w, h);
    }
    if(obj.hasOwnProperty("rhythmSet")){
      rhythmSet = obj.rhythmSet;
    }
    if(obj.hasOwnProperty("name")){
      name = obj.name;
    }
  }
  p.setup = function() {
    console.log("hello Markov");
    p.createCanvas(w, h); // see above
    instrument = synthLibrary[0].synth; // set to default
    tButton = new Button(p, p.width / 2, p.height / 2, p.color(0, 200, 0), "start \n" + name);
    slider = new Slider(p, p.width * 3 / 4, p.height * 11/12);

    selectSynth = p.createSelect();
    selectSynth.class("synthSequenceMenu");
    selectSynth.position(10, 10);
    selectSynth.style("width: 110px")

    for(let i = 0; i < synthLibrary.length; i ++){
      selectSynth.option(synthLibrary[i].name, i);
    }
    selectSynth.changed(p.chooseSynth);

    selectLength = p.createSelect();
    selectLength.class("synthSequenceMenu");
    selectLength.style("width: 100px");
    selectLength.position(p.width * .7, 10);
    selectLength.option("legato");
    selectLength.option("marcato");
    selectLength.option("staccato");
    selectLength.changed(p.chooseLength);

  }

  p.chooseSynth = function(){
    instrument = synthLibrary[selectSynth.value()].synth;
//    console.log(instrument);
  }
  p.chooseLength = function(){
    noteLength = selectLength.selected();
//    console.log(noteLength);
  }

  p.makeNodes = function(pitchSet, w, h){
    // w and h are width and heigh of the sketch passed from markov.js after instantiating the GUI sketch
    nodes = Object.keys(pitchSet.matrix); // array of nodes
    //console.log("nodes" + nodes);
    let slice = p.TWO_PI; // distribute nodes around a circle
    if (nodes.length > 0) {
      slice = p.TWO_PI / nodes.length; // divide the circle by number of nodes
    }
    for (let i = 0; i < nodes.length; i++) {
      let x = (p.cos(slice * i) * 150) + (w / 2); // find a location
      let y = (p.sin(slice * i) * 150) + (h / 2);

      nButtons[i] = new Button(p, x, y, p.color(p.random(250), p.random(250), p.random(250)), nodes[i]);
      nButtons[i].w = 40; // node button size
      nButtons[i].pitch = nodes[i]; // assign a pitch property

    }
    
  }

  p.draw = function() {
    p.background(200);
    tButton.message = name;
    tButton.display(); // transport button

    p.drawConnections(); // arrows

    for (let i = 0; i < nButtons.length; i++) {
      nButtons[i].display(); // node buttons
    }
    slider.display();
    //let x = (p.cos(0) * 150) + (p.width / 2); // find a location
    //let y = (p.sin(0) * 150) + (p.height / 2);   
    //p.ellipse(x, y, 10)
    if(p.mouseIsPressed){
      if(p.mouseX < slider.x + 50 && p.mouseX > slider.x - 50 && p.mouseY > slider.y - 20 && p.mouseY < slider.y + 20){
        slider.move(p.mouseX - slider.x);
        vol = slider.val;
      }
    }
  }
  
// draw a transparent line between nodes with a connection
  p.drawConnections = function() {
    p.stroke(255, 0, 0, 30);
    p.strokeWeight(5);
    let obj = pitchSet.matrix;
    let keys = Object.keys(obj)
    //console.log(keys);
    for (let i = 0; i < keys.length; i++) {
      let list = obj[keys[i]];
      //console.log(list);
      //draw a line for each element in the list
      let x = nButtons[i].x;
      let y = nButtons[i].y;
      //console.log("button " + i + ": " + x + ", " + y);
      for (let j = 0; j < list.length; j++) {
        //find the index in keys of an item in list
        let connect = keys.indexOf(list[j]);
        let x2 = nButtons[connect].x;
        let y2 = nButtons[connect].y;
        p.line(x, y, x2, y2);
        //use drawArrow() from p5.org lerp() reference
        let v1 = p.createVector(x, y);
        let v2 = p.createVector(x2, y2);
        let v3 = p5.Vector.lerp(v1, v2, 0.7);
        p.drawArrow(v1, v3, p.color(255, 0, 0, 30));
    }
  }
}

  p.drawArrow = function(base, vec, myColor) {
    p.push();
    p.stroke(myColor);
    p.strokeWeight(3);
    p.fill(myColor);
    vec.x = vec.x - base.x;
    vec.y = vec.y - base.y;
    p.translate(base.x, base.y);
    p.line(0, 0, vec.x, vec.y);
    p.rotate(vec.heading());
    let arrowSize = 7; // adjust to taste
    p.translate(vec.mag() - arrowSize, 0);
    p.triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
    p.pop();
  }

  p.onButton = function(note) {
    for (let i = 0; i < nButtons.length; i++) {
      if (note == nButtons[i].pitch) {
        nButtons[i].playing = true;
      }
    }
  }

  p.offButton = function(note) {
    for (let i = 0; i < nButtons.length; i++) {
      if (note == nButtons[i].pitch) nButtons[i].playing = false;
    }
  }

  p.mousePressed = function() {
    if (p.dist(p.mouseX, p.mouseY, tButton.x, tButton.y) < tButton.w / 2 && div.style["display"] == "block") 
    {
      if (loop && loop.state == "stopped") {
        let t = Tone.Transport.position;
        let times = t.split(':');
        times[2] = 0; // set to downbeat;
        times[1] = Number(times[1]) + 1; // move up to the next downbeat;
        if (times[1] > 3) {
          times[1] = 0;
          times[0] = Number(times[0]) + 1;
        }
        t = times[0] + ":" + times[1] + ":" + times[2];
        loop.start(t); // start on next downbeat
        tButton.col = p.color(0, 255, 0);
      } 
      else if (loop && loop.state == "started") {
        loop.stop();
        tButton.col = p.color(0, 200, 0);
      }
    }
  }
};

class Button {
  constructor(_p, X, Y, col, msg) {
    this.p = _p; // P5 object reference
    this.x = X;
    this.y = Y;
    this.w = 100;
    this.col = col;
    this.message = msg;
    this.playing = false;
    this.pitch = "C0";
  }

  display() {
    this.p.strokeWeight(1);
    this.p.stroke(0);
    let c = this.col;
    if (this.playing) {
      this.p.fill(this.p.red(this.col) * 2, this.p.green(this.col) * 2, this.p.blue(this.col) * 2)
    } else this.p.fill(this.col);
    this.p.ellipse(this.x, this.y, this.w);
    this.p.textAlign(this.p.CENTER);
    this.p.fill(255);
    this.p.text(this.message, this.x, this.y)
  }
}

class Slider {
  constructor(_p, X, Y){
    this.p = _p;
    this.x = X;
    this.y = Y;
    this.val = 1; // slider value
    this.pos = 50;
  }

  display() {
    this.p.push();
    this.p.translate(this.x, this.y);
    this.p.strokeWeight(5);
    this.p.line(-50, 0, 50, 0);
    this.p.strokeWeight(1);
    this.p.fill(255);
    this.p.textAlign(this.p.CENTER);
    this.p.text("volume", 0, 15);
    this.p.fill('#4caf50'); //fader color
    this.p.rectMode(this.p.CENTER);
    //this.pos = this.p.map(this.val, 0, 1, -50, 50)
    this.p.rect(this.pos, 0, 10, 40);
    this.p.pop();
  }

  move(_pos){
    this.pos = _pos;
    this.val = this.p.map(this.pos, -50, 50, 0, 1);
  }
}

const testGUI = p =>{
  p.setup = function(){
    console.log("hello World!")
    p.createCanvas(200, 200);
    p.background(200);
    p.textAlign(p.CENTER);
    p.text("Hello World!", 100, 100);
  }
}

const testConstant = "Hello World"; // can we connect to this file?