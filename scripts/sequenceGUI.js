const seqGUI = p => {
  var obj;
  var playButton, playTimer, upOctave, downOctave; // buttons
  var part; //Tone.js Part reference

  p.setObj = function(_obj){
    obj = _obj;
  }
  
  p.setup = function(){
    p.createCanvas(400, 60);
    playButton = new PlayButton(p, p.width/2, p.height/2);
    playTimer = new PlayTimer(p, p.width/2, p.height/2);
    upOctave = new OctaveButton(p, p.width * 9/12, p.height/2, "up");
    downOctave = new OctaveButton(p, p.width * 11/12, p.height/2, "down");
  }

  p.draw = function(){
    p.background(200);
    //p.rect(10, 5, 380, 40);
    if(obj.hasOwnProperty("name")){
      p.textAlign(p.LEFT, p.TOP);
      p.textSize(18);
      p.text(obj.name, 10, 10);
    }
    playTimer.display();
    playTimer.isFinished();
    playButton.display();
    upOctave.display();
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(30);
    p.text(obj.octave, p.width * 10/12, p.height/2);
    downOctave.display();
  }

  p.upOctave = function(){
    if(obj.hasOwnProperty("octave")){
      if(obj.octave < 3)
        obj.octave ++;
    }
  }

  p.downOctave = function(){
    if(obj.hasOwnProperty("octave")){
      if(obj.octave > -3)
        obj.octave --;
    }
  }

  p.mousePressed = function(){
    if(p.dist(p.mouseX, p.mouseY, playButton.x, playButton.y) < playButton.w/2){
      if(obj.hasOwnProperty("sequence")){
        //console.log("play" + obj.sequence);
        part = playSequence(obj);
        Tone.Transport.schedule((time) => {
	       // invoked on next beat
          playTimer.start(part.loopEnd); // loopEnd is the duration of the sequence
        }, "+4n");

      }
    }

    if(p.dist(p.mouseX, p.mouseY, upOctave.x, upOctave.y) < upOctave.w/2){
      p.upOctave();
    }
    if(p.dist(p.mouseX, p.mouseY, downOctave.x, downOctave.y) < downOctave.w/2){
      p.downOctave();
    }
  }
}

class PlayButton {
  constructor(_p, _x, _y){
    this.p = _p; // P5 object reference
    this.x = _x;
    this.y = _y;
    this.w = 40;
    this.col = this.p.color("#4caf50");
    this.playing = false;
  }

  display(){
    this.p.push();
    this.p.translate(this.x, this.y);
    this.p.fill(this.col);
    this.p.stroke(255);
    if(this.playing){
      this.p.rectMode(this.p.CENTER);
      this.p.rect(-this.w/4, 0, this.w/4, 40);     
      this.p.rect(this.w/4, 0, this.w/4, 40);    
    } else
      this.p.triangle(this.w/2, 0, -this.w/2, -this.w/2, -this.w/2, this.w/2);
    this.p.pop();
  }
}

class PlayTimer {
  constructor(_p, _x, _y){
    this.p = _p;
    this.x = _x;
    this.y = _y;
    this.d = 48;
    this.col = this.p.color(190);
    this.playing = false;
    this.time = 0;
    this.elapsedTime = 0;
    this.startTime = 0;
  }

  start(time){
    this.time = time * 1000; // set the timer (convert seconds to msec)
    this.startTime = this.p.millis(); // get current clock time
    this.playing = true;
  }

  isFinished(){
    this.elapsedTime = this.p.millis() - this.startTime; //time now v time started
    if(this.elapsedTime > this.time){
      this.playing = false; // time's up!
      this.elapsedTime = 0; // reset to 0;
      this.startTime = 0;
      this.time = 0;
    }
    else this.playing = true;
  }

  display(){
    this.p.push();
    this.p.translate(this.x, this.y);
    this.p.fill(this.col);
//    this.p.text(this.elapsedTime, 0, 0)
    let progress = this.elapsedTime / this.time * this.p.TWO_PI;
    this.p.stroke(100);
    this.p.ellipse(0, 0, this.d * 1.02);
    this.p.stroke(255);
    this.p.fill(120);
    this.p.arc(0, 0, this.d, this.d, 0, progress, this.p.PIE);
    this.p.pop();
  }
}

class OctaveButton {
  constructor(_p, _x, _y, _dir){
    this.p = _p;
    this.x = _x;
    this.y = _y;
    this.dir = _dir;
    this.w = 35;
    this.bgcol = this.p.color(190);
    this.acol = this.p.color(120);
    
  }

  display(){
    this.p.push();
    this.p.translate(this.x, this.y);
    switch(this.dir){
      case "up" : 
        this.p.rotate(0);
        break;
      case "down" :
        this.p.rotate(this.p.PI);
        break;
      default :
        this.p.rotate(0);
    }
    this.p.fill(this.bgcol);
    this.p.rectMode(this.p.CENTER);
    this.p.strokeWeight(5);
    this.p.rect(0, 0, this.w, this.w, this.w/4);
    this.p.fill(this.acol);
    this.p.strokeWeight(1);
    this.p.triangle(0, -this.w/4, -this.w/4, this.w/4, this.w/4, this.w/4);
    this.p.pop();
  }
}