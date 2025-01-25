const sampleGUI = p => {
  var partnum, fileName, title = "";
  var playButton, stopButton, loopButton, revButton, rmsMeter, radio, rgroup, onNextSelector;
  var object; // initialized in p.setup()

  var player, part, meter, bpm = 120;
  var ready = false, looping = false, reversed = false;

  p.setGrain = function(_g){
    player.grainSize = _g;
    object.grainSize = _g;
  }

  p.setOverlap = function(_o){
    player.overlap = _o;
    object.overlap = _o;
  }

  p.setName = function(newName){
    title = newName;
    object.name = newName;
  }

  p.getname = function(){
    return title;
  }

  p.setBPM = function(newBPM){
    bpm = newBPM;
    object.bpm = newBPM;
  }

  p.getBPM = function(){
    return bpm;
  }

  p.setLoop = function(dur){
    if(Number(dur)){
      dur = Number(dur);
    }
    // part.loopEnd = dur;
    object.loop = dur;
  }

  p.getLoop = function(){
    return part.loopEnd;
  }

  p.setFile = function(fileName){
    object.fileName = fileName;
  }

  p.getFile = function(){
    return object.fileName;
  }

  p.setType = function(fileType){
    object.fileType = fileType;
  }

  p.setPartNum = function(_i){
    partnum = _i;
  }

  p.setSample = function(_url) {
    console.log('trying to load sample ' + _url)
    // this is primarily for loading a sample file to the player
    object.url = _url; // hold on to this for later
    meter = new Tone.Meter(); // dB level meter
    // console.log(meter);
    player = new Tone.GrainPlayer(_url, function(){
      //after the player has loaded:
      console.log("Tone.GrainPlayer loaded sample " + _url);
      console.log("duration " + player.buffer.duration);
      ready = true; // set flag for player button display
      console.log(`player ${partnum} ready? ${ready}`);
      }).toDestination();
    player.fan(meter, Tone.Destination); 
    // connect output to both meter and speakers
  }

  p.loadfromJSON = function(_obj, _i) {
    p.setPartNum(_i);
    console.log(JSON.stringify(_obj));
    // load sample from url
    if(_obj.hasOwnProperty("url")){
      // console.log("loadfromJSON(): " + _obj.url);
      p.setSample(_obj.url);
    }
    if(_obj.hasOwnProperty("name")){
      p.setName(_obj.name);
    }
    if(_obj.hasOwnProperty("bpm")){
      p.setBPM(_obj.bpm);
    }
    if(_obj.hasOwnProperty("fileName")){
      p.setFile(_obj.fileName);
    }
    if(_obj.hasOwnProperty("fileType")){
      p.setType(_obj.fileType);
    }
    if(_obj.hasOwnProperty("loop")){
      p.setLoop(_obj.loop);
    }
    if(_obj.hasOwnProperty("grain")){
      p.setGrain(_obj.grain);
    }
    if(_obj.hasOwnProperty("overlap")){
      p.setOverlap(_obj.overlap);
    }
  }

  p.getObj = function(){
    return object;
  }

  p.setObj = function(_o) {
    // read from JSON object

    if(_o.hasOwnProperty("name")){
      object.name = _o.name;
    }

    if(_o.hasOwnProperty("url")){
      object.url = _o.url; // hold on to this for later
      meter = new Tone.Meter();
      player = new Tone.GrainPlayer(_o.sampleURL, function(){
        //after the player has loaded:
        console.log("Tone.GrainPlayer loaded sample " + _o.sampleURL);
        // console.log(player.buffer);
        console.log("duration " + player.buffer.duration);
            // let event = makeEvent(player);
        ready = true;
/*        part = new Tone.Part((time) => {
          console.log("Part playing");
          player.grainSize = 0.04;
          player.overlap = 0.01;
          player.start(time);
        }, [0]);
        if(object.hasOwnProperty("loop")){
          part.loopEnd = object.loop;    
        } else {  
          part.loopEnd = player.buffer.duration;
          object.loop = player.buffer.duration;
          // console.log(part.loopEnd);
        }
*/      }).toDestination();
      player.fan(meter, Tone.Destination);
      if(_o.hasOwnProperty("bpm")){
        // scale playback rate to tempo
        object.bpm = _o.bpm;
        bpm = object.bpm;
      }
    }
  }

  p.setup = function(){
    let canvas = p.createCanvas(405, 70);
    canvas.style("visibility: visible"); 
    // not sure why add sample button was loading canvas with "visibilty : hidden;"
    object = {
      "name": "Untitled", 
      "fileName" : "",
      "url" : "", 
      "bpm" : 120, 
      "loop" : "1m", // Tone.Time or "sample" to set loop to sample length
      "grainSize" : 0.04, 
      "overlap" : 0.01,
      "fileType" : ""
    }; // temp container for the sample metadata

    rmsMeter = new RMS_Meter(p, 10, p.height / 2);
    playButton = new SamplePlayButton(p, 145, (p.height/2) - 5); 
    stopButton = new SampleStopButton(p, 204, (p.height/2) - 5);
    loopButton = new SampleLoopButton(p, 262, (p.height/2) - 5);
    revButton = new SampleReverseButton(p, 320, (p.height/2) - 5);
    onNextSelector = new OnNext(p, 65, 10);
  }

  p.draw = function(){
    p.background(150, 0); // transparent

    //panel
    p.stroke("white"); 
    p.strokeWeight(2);
    p.fill(150);
    p.rect(1, 1, p.width-2, p.height -2, 5);

    // sample name
    p.fill("white");
    p.noStroke();
    p.textAlign(p.LEFT, p.TOP);
    let t = object.name;
    if (object.name.length > 16){
      t = "";
      for(let i = 0; i < 16; i++){
        t += object.name[i];
      } // truncate to 16 characters
      t += "..."; // add ellipsis
    }
    p.text((partnum + 1) + ". " + t, 10, 5, 120, 40);

    // sample bpm
    p.text(object.bpm + " bpm", 10, 20);
    // UI
    playButton.display(ready);
    stopButton.display(ready);
    loopButton.display(looping);
    revButton.display(reversed);
    if(ready){
      // only displays if sample is loaded
      rmsMeter.display(meter.getValue());
    }
    // display file name
    let fn = object.fileName;
    if (object.hasOwnProperty("fileName") && (object.fileName.length > 20)){
      fn = "";
      for(let i = 0; i < 8; i++){
        fn += object.fileName[i];
      }
      fn += "..."
      for(let i = object.fileName.length - 8; i < object.fileName.length; i++){
        fn += object.fileName[i];
      } // abbreviate file name preserving last characters and file extension
    }
    p.text("file: " + fn, 10, 55);
    p.text("type: " + object.fileType, 155, 55);
    let l = object.loop;
    if(typeof l == "number"){
      l = Number.parseFloat(l).toFixed(4); 
      // loop value might be a float number
    } 
    p.text("loop: " + l, 255, 55);

    onNextSelector.display(355, 10);
  }

  p.mousePressed = function(){
    //button presses
    let d = document.getElementById("samples");
    if(onNextSelector.click(p.mouseX, p.mouseY)){
      console.log(onNextSelector.state);
    }
    
    if(ready){
      //play button
      if(playButton.click(p.mouseX, p.mouseY) ){
        //play sample
        //set playback rate
        if(Tone.Transport.state == "stopped"){
          Tone.Transport.start();
        }
        // create a new part on mouse click
        part = new Tone.Part((time) => {
          console.log("Part playing");
          player.start(time);
        }, [0]);

        if(object.hasOwnProperty("loop")){
          part.loopEnd = object.loop;    
        } else {  
          part.loopEnd = player.buffer.duration;
          object.loop = player.buffer.duration;
          // console.log(part.loopEnd);
        }
        // player.grainSize = 0.04; // 40 msec grain
        player.grainSize = object.grainSize;
        // player.overlap = 0.01 // 10 ms grain crossfade
        player.overlap = object.overlap;
        player.playbackRate = Tone.getTransport().bpm.value / bpm;
        let pbr = Tone.getTransport().bpm.value / bpm;
         console.log("Tone.getTransport().bpm.value: " + Tone.getTransport().bpm.value)
         console.log("playback rate: " + player.playbackRate); 
        // console.log("grain size: " + player.grainSize);
        // console.log("grain overlap: " + player.overlap);
        //get next measure
        let t = Tone.getTransport().position;
        let times = t.split(':');
        if(onNextSelector.state == "m"){
          times[2] = 0; // set to first sixteenth;
          times[1] = 0; // set to first beat
          times[0] = Number(times[0]) + 1; // move up to the next measure;  
        } else {
          times[2] = 0;
          times[1] = (Number(times[1]) + 1) % 4; // 4/4 time
          if(times[1] == 0){
            times[0] = Number(times[0]) + 1; // scooch up one
          } else {
            times[0] = Number(times[0]); // leave it alone
          }
          
        }
        t = times[0] + ":" + times[1] + ":" + times[2]; 
         console.log("play sample at " + t);
//         part.stop();
        part.start(t); // part is a sequence that contains the grainplayer
      }
      // stop button
      if(stopButton.click(p.mouseX, p.mouseY)){
        player.stop();
        part.stop();
      } 
      //loop button
      if(loopButton.click(p.mouseX, p.mouseY)){
        if(looping){
          looping = false;
          part.loop = false;
        } else {
          looping = true;
          part.loop = true;
        }
        console.log("loop status: " + part.loop);
      }
      // reverse button
      if(revButton.click(p.mouseX, p.mouseY)){
        if(reversed){
          reversed = false;
          player.reverse = false;
        } else {
          reversed = true;
          player.reverse = true;
        }
      }
    }
  }
}

class SamplePlayButton {
  constructor(_p, _x, _y){
    this.p = _p;
    this.x = _x;
    this.y = _y;
    this.size = 40;
  }

  click(m_x, m_y){
    // takes location of the mouse and reports a hit
    if(this.p.dist(this.x, this.y, m_x, m_y) < this.size/2){
      return true;
    }
    else {
      return false;
    }
  }

  display(ready){
    this.p.push();
    this.p.translate(this.x, this.y);
    if(ready){
      this.p.fill("green");
    } else {
      this.p.fill("gray");
    }
    this.p.stroke("white");
    this.p.strokeWeight(3);
    this.p.ellipse(0, 0, this.size);
    this.p.fill("white");
    this.p.strokeJoin(this.p.ROUND);
    this.p.beginShape();
    this.p.vertex(this.p.cos(0) * 10, this.p.sin(0) * 10);
    this.p.vertex(this.p.cos(this.p.PI - 1) * 12, this.p.sin(this.p.PI - 1) * 12);
    this.p.vertex(this.p.cos(this.p.PI + 1) * 12, this.p.sin(this.p.PI + 1) * 12);
//    this.p.vertex(20, 0);
//    this.p.vertex(-20, 20);
    this.p.endShape(this.p.CLOSE);
//    this.p.triangle(-20, -20, 20, 0, -20, 20, 10);
    this.p.pop();
  }
}

class SampleStopButton {
  constructor(_p, _x, _y){
    this.p = _p;
    this.x = _x;
    this.y = _y;
    this.size = 40;
  }

  click(m_x, m_y){
    // takes location of the mouse and reports a hit
    if(this.p.dist(this.x, this.y, m_x, m_y) < this.size/2){
      return true;
    }
    else {
      return false;
    }
  }


  display(ready){
    this.p.push();
    this.p.translate(this.x, this.y);
    if(ready){
      this.p.fill("red");
    } else {
      this.p.fill("gray");
    }
    this.p.stroke("white");
    this.p.strokeWeight(3);
    this.p.ellipse(0, 0, this.size);
    this.p.fill("white");
    this.p.strokeJoin(this.p.ROUND);
    this.p.beginShape();
    this.p.vertex(-7, -7);
    this.p.vertex(7, -7);
    this.p.vertex(7, 7);
    this.p.vertex(-7, 7);
    this.p.endShape(this.p.CLOSE);
    this.p.pop();
  }
}


class SampleLoopButton {
  constructor(_p, _x, _y){
    this.p = _p;
    this.x = _x;
    this.y = _y;
    this.size = 40; // 40px round button
  }
  click(m_x, m_y){
    // takes location of the mouse and reports a hit
    if(this.p.dist(this.x, this.y, m_x, m_y) < this.size/2){
      return true;
    }
    else {
      return false;
    }
  }

  display(looping){
    this.p.push();
    this.p.translate(this.x, this.y);
    if(looping){
      this.p.fill("green");
    } else {
      this.p.fill("gray");
    }
    this.p.stroke("white");
    this.p.strokeWeight(3);
    this.p.ellipse(0, 0, this.size);
    this.p.noFill();
    this.p.arc(0, 0, 25, 25, 0, this.p.PI + this.p.HALF_PI);
    let ax = this.p.cos(- this.p.HALF_PI) * 25/2;
    let ay = this.p.sin(- this.p.HALF_PI) * 25/2;
    ax += 3;
    this.p.line(ax, ay, ax - 5, ay - 2);
    this.p.line(ax, ay, ax - 5, ay + 2);
    //this.p.ellipse(ax, ay, 10);
    this.p.noStroke();
    this.p.fill("white");
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.text("L", 0, 0);
    this.p.pop();
  }
}

class SampleReverseButton {
  constructor(_p, _x, _y){
    this.p = _p;
    this.x = _x;
    this.y = _y;
    this.size = 40;
  }

  click(m_x, m_y){
    // takes location of the mouse and reports a hit
    if(this.p.dist(this.x, this.y, m_x, m_y) < this.size/2){
      return true;
    }
    else {
      return false;
    }
  }

  display(reversed){
    this.p.push();
    this.p.translate(this.x, this.y);
    if(reversed){
      this.p.fill("green");
    } else {
      this.p.fill("gray");
    }
    this.p.stroke("white");
    this.p.strokeWeight(3);
    this.p.ellipse(0, 0, this.size);
    this.p.noFill();
    this.p.arc(5, 0, 20, 20, 0, this.p.PI/2)
    let ax = -10;
    let ay = 10;
    this.p.line(ax, ay, ax + 5, ay - 2);
    this.p.line(ax, ay, ax + 5, ay + 2);
    this.p.line(ax, ay, ax + 15, ay);
    this.p.noStroke();
    this.p.fill("white");
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.text("Rev", 0, 0);
    this.p.pop();
  }
}

class RMS_Meter{
  constructor(_p, _x, _y){
    this.p = _p;
    this.x = _x;
    this.y = _y;
  }

  display = function(value){
    this.p.push();
    this.p.translate(this.x, this.y);
    let rms = this.p.map(value, -96, 0, 0, 100);
    if(rms < 0){
      rms = 0;
    }
    this.p.fill("gray");
    this.p.rect(0, 0, 100, 15); // meter background
    let blocks = Math.ceil(rms / 5); // 5px meter segments
    //this.p.stroke("white");
    for(let i = 0; i < blocks; i++){
      if(i < 15){
        this.p.fill("green");
      } else if (i >= 15 && i < 18) {
       this.p.fill("yellow");
      }
      else if (i >= 18) {
        this.p.fill("red");
      }
      this.p.rect(i * 5, 0, 5, 15);
    }

    let mval = value;
    if(mval < -96){
      mval = "-∞ ";
    } else {
      mval = mval.toFixed(0); // truncate
    }
    this.p.textAlign(this.p.LEFT, this.p.CENTER);
    this.p.fill("white");
    this.p.text(mval + " dB", 0, 7);
    this.p.pop();

  }
}

class OnNext {
  constructor(_p5, _x, _y){
    this.p5 = _p5;
    this.x = _x;
    this.y = _y;
    this.state = "m"; // default
    this.size = 45
    this.clicked = false;
  }

  display(_x, _y){
    // draw a "fieldset" with label and two radio-button options
    // optioons are "m" and "b"
    // label is "on next"
    this.x = _x;
    this.y = _y;
    this.p5.push();
    this.p5.translate(this.x, this.y);
    this.p5.noFill(); 
    this.p5.stroke(255); // white border
    this.p5.rect(0, 0, this.size); // fieldset outline
    this.p5.noStroke();
    this.p5.fill(150); // match player background
    this.p5.rect(2, -2, 35); // panel behind text
    this.p5.fill(255);
    this.p5.textAlign(this.p5.LEFT, this.p5.CENTER);
    this.p5.textSize(10);
    this.p5.text("on next", 3, 0); // fieldset label
    this.p5.text("m", 20, 15); // button label (default)
    this.p5.text("b", 20, 32); // button label
    this.p5.stroke("gold"); 
    this.p5.strokeWeight(0.5); // thin gold outline
    this.p5.ellipse(10, 15, 12); // option background ("m")
    this.p5.ellipse(10, 32, 12); // b
    this.p5.noStroke(); // selected button
    this.p5.fill('maroon'); // go Ramblers
    if(this.state == "m"){
      this.p5.ellipse(10, 15, 9); // selected location
    } else if (this.state == "b"){
      this.p5.ellipse(10, 32, 9);
    }
    this.p5.pop();
  }

  click(mx, my){
    // detect a mouse click on this object
    let mt = this.y + 10; // get the box boundaries
    let mb = this.y + 25;
    let bt = this.y + 26;
    let bb = this.y + 40;

    if(mx > this.x && mx < this.x + this.size && my > mt && my < mb){
      this.state = "m"; // select option 1
      this.clicked = true;
    } else if(mx > this.x && mx < this.x + this.size && my > bt && my < bb){
      this.state = "b"; // select option 2
      this.clicked = true;
    } else {
      this.clicked = false;
    }
    return this.clicked; // report clicked state
  }
}