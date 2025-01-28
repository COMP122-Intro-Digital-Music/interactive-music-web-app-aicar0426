/**
* Make a sequence player interface with Tone.js and P5.js
* July 16, 2023
* New sequence interface for spring 2024 (March)
* added synth menu April 1, 2024
*/

let sequencePromise = loadSequenceData("JSON/sequences.json")

// read in the JSON file with sampler meta-data
async function loadSequenceData(file) {
  const response = await fetch(file);
  const text = await response.text(); 
  try {
    let obj = JSON.parse(text); // if JSON is valid, make an object
    // generate sequence player and GUI; set up synth menu
    createSynthMenu(makeSeqPlayer(obj));
    return obj;
  } 
  catch (error){
    let e = "error - invalid JSON file (sequences.json)<br /> copy and paste your JSON to <a href = 'https://jsonlint.com/' target='_blank'>jsonlint.com</a>";
    document.getElementById("sequences").innerHTML = e;
    console.log(e);
    return;
  }
  //console.log(JSON.stringify(data));
}

function makeSeqPlayer(obj){
  let synthSketches = [];
  let seqDiv = document.getElementById("sequences");
  let menuDiv = document.getElementById("seqSynthDiv");

  //document.getElementById("sequences").innerHTML = JSON.stringify(obj);
  if(Array.isArray(obj)){
    if(obj.length == 0){
      let p = document.createElement("p");
      p.innerHTML = "No Sequences. 'sequences.json' is empty ('[ ]')";
      let seqDiv = document.getElementById("sequences");
      seqDiv.appendChild(p);
      menuDiv.style = "display: none;" // don't show synth menu if no sequences
    } else {
      menuDiv.style = "display: flex;" // if there are sequences to load show the synth menu
    }
    for(let i = 0; i < obj.length; i++){
      console.log(obj[i].name);
      let d = document.createElement('div');
      d.className = "seqPlayer";
      d.style = "margin: auto;"
      seqDiv.appendChild(d);
//      let p = document.createElement('div'); // player container
//      d.appendChild(p); // add player to parent div
      let sketch = new p5(seqGUI, d); // invoke p5 and add it to the div
//      let sketch = new p5(seqGUI, seqDiv); // invoke p5 and add it to the div
/*      let sel = document.createElement('select'); // menu
      let option = document.createElement('option');
      option.value = 0;
      option.text = "Default Synth";
      sel.appendChild(option); // add option to menu
      let s = document.createElement('div'); //container for the menu
      s.className = "synthSel"
      s.appendChild(sel); // add the menu to the div
      d.appendChild(s); // add the div to the player parent div
*/      
      sketch.setObj(obj[i]); // hand a reference to the sequence to the sketch
      synthSketches.push(sketch); // add to the array
    } 
  }
  return synthSketches; // return an array of sequence P5 sketches

}

function createSynthMenu(sketches){
  let menu = document.getElementById("seqSynthMenu");
  menu.className = "synthMenu";
  
  if(Array.isArray(synthLibrary)){
    console.log("create synth menu for sequences");
    for(let i = 0; i < synthLibrary.length; i++){
      let o = document.createElement('option');
      o.text = synthLibrary[i].name;
      o.value = i;
      menu.add(o);
    }
    menu.addEventListener('change', (e) =>{
      if(Array.isArray(sketches)){
        for(let i = 0; i < sketches.length; i++){
          sketches[i].setSynth(synthLibrary[e.target.value].synth);
          // console.log("change synth")
          // console.log(synthLibrary[e.target.value].name);
        }
      }
    })
  }
  

}

function playSequence(seq, instrument) {
  //console.log(seq);
  if(Tone.Transport.state == "stopped") {
    console.log("start transport first");
    return; // put up an error message and quit the function
  }
  let t;
  //t = nextbeat(); //start on next downbeat
  t = nextMeasure(); // start on next measure
  const part = new Tone.Part(((time, note) => {
    // the notes given as the second element in the array
    // will be passed in as the second argument 
    instrument.triggerAttackRelease(Tone.Frequency(note.pitch).transpose(seq.octave * 12), note.dur, time);
    console.log(note.pitch);
  }), seq.sequence).start(t);
  part.loopEnd = seq.duration;

  return part;
  
}
function nextBeat(){
  let t = Tone.Transport.position;

  let times = t.split(':');
  times[2] = 0; // set to downbeat;
  times[1] = Number(times[1]) + 1; // move up to the next downbeat;
  if (times[1] > 3) {
    times[1] = 0;
    times[0] = Number(times[0]) + 1;
  }
  t = times[0] + ":" + times[1] + ":" + times[2];
  return t;
  
}

function nextMeasure (){
  let t = Tone.Transport.position;
  let times = t.split(':');
  times[2] = 0; // set to downbeat;
  times[1] = 0; // set to first beat
  times[0] = Number(times[0]) + 1; // move up to the next measure;
  t = times[0] + ":" + times[1] + ":" + times[2];    
  return t
}


/**  
  // make buttons for each sequence in the array "sequences"
  for (let i = 0; i < sequences.length; i++) {
    //play button
    let btn = document.createElement('input');
    btn.type = "button";
    btn.id = "sequence_" + (i + 1);
    btn.className = "seq_player";
    btn.value = "Play Sequence " + (i + 1);
    document.body.appendChild(btn);
    //octave up button
    let octup = document.createElement('input');
    octup.type = "button";
    octup.id = "up8_" + (i+1);
    octup.className = "octup";
    octup.value = "8ve up";
    document.body.appendChild(octup);
    //octave down button
    let octdn = document.createElement('input');
    octdn.type = "button";
    octdn.id = "dn8_" + (i+1);
    octdn.className = "octdn";
    octdn.value = "8ve down";
    document.body.appendChild(octdn);
    let linebreak = document.createElement("p");
    document.body.appendChild(linebreak);
  }
  
  var parts = new Array(sequences.length); // make a set of parts
  
  // Attach actions to buttons 
  for (let i = 0; i < sequences.length; i++) {
    document.getElementById("sequence_" + (i + 1))?.addEventListener('mousedown', () => {
      if (Tone.Transport.state = "started") {
        parts[i] = playSequence(sequences[i]);
        if (parts[i]) parts[i].loop = true;
      } else console.log("start the transport first");
    });
    document.getElementById("sequence_" + (i + 1))?.addEventListener('mouseup', () => {
      if (parts[i]) parts[i].loop = 1;
    });
    document.getElementById("sequence_" + (i + 1))?.addEventListener('mouseleave', () => {
      if (parts[i]) parts[i].loop = 1;
    });
  
    document.getElementById("up8_" + (i + 1))?.addEventListener('click', () => {
      if (sequences[i].octave < 3) sequences[i].octave++;
    });
  
    document.getElementById("dn8_" + (i + 1))?.addEventListener('click', () => {
      if (sequences[i].octave > -3) sequences[i].octave--;
    });
  
  }
*/