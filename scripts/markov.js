/** 
* Make a markov chain player interface with Tone.js and P5.js
* July 5, 2023
*/
let markovPromise = loadMarkovData("JSON/markov.json")

// read in the JSON file with sampler meta-data
async function loadMarkovData(file) {
  const response = await fetch(file);
  const text = await response.text();
  try {
    let obj = JSON.parse(text); // if JSON is valid, make an object
    makeGraph(obj); // generate Markov player and GUI
    return obj;
  }
  catch (error) {
    let e = "error - invalid JSON file (markov.json)<br /> copy and paste your JSON to <a href = 'https://jsonlint.com/' target='_blank'>jsonlint.com</a>";
    let mdiv = document.getElementById("markov");
    mdiv.innerHTML = e;
    //let testP5 = new p5(testGUI, mdiv);
    console.log(e);
    return;
  }
  //console.log(JSON.stringify(data));
}

/** Generate a Markov graph from the JSON object
*/
function makeGraph(obj) {
  console.log("make graph!");
  if (Array.isArray(obj)) {
    if(obj.length == 0){
      let p = document.createElement("p");
      p.innerHTML = "No Markov Players. 'markov.json' is empty ('[ ]')";
      let markovDiv = document.getElementById("markov");
      markovDiv.appendChild(p);
    }

    for (let i = 0; i < obj.length; i++) {
      console.log("markov object " + obj[i].name);
      let mDiv = document.getElementById("markov");
      let d = document.createElement('div');
      d.style = "margin: auto;"
      d.className = "seqPlayer";
      mDiv.appendChild(d); 
      let sketch = new p5(mGUI, d); // invoke p5
      // console.log ("sketch width: " + sketch.width);

      sketch.setObj(obj[i]); // pass an object to a sketch
      // console.log("markov GUI width: " + sketch.width)
      let pitchSet = {};
      let rhythmSet = {};
      let staccato = false;
      if (obj[i].hasOwnProperty("pitchSet") && obj[i].hasOwnProperty("rhythmSet")) {
        pitchSet = obj[i].pitchSet;
        rhythmSet = obj[i].rhythmSet;

        if (obj[i].rhythmSet.hasOwnProperty("staccato")){
          staccato = obj[i].rhythmSet.staccato; // true or false
//          console.log("markov staccato: " + staccato);
        }
      }
      const loop = new Tone.Loop(time => {
        //in this loop, the markov() function will choose the next pitch  and rhythmic value based on the matrix defined in your pitchSet and rhythmSet objects
        let r = markov(rhythmSet); // get the next duration value
        let p = markov(pitchSet); // get the next pitch value
        
        let dur = r;
//        if (staccato == "true") {
//          dur = "16n";
//        }
        switch(sketch.getLength()){
          case "legato":
            dur = r;
            break;
          case "staccato":
            dur = "16n";
            break;
          case "marcato":
            dur = Tone.Time(r).toSeconds() * .7;
            break;
          default:
            dur = r;
        }
        let v = sketch.getVol();
        let instr = sketch.getInst();
        instr.triggerAttackRelease(p, dur, time, v);
        //Tone.Transport.schedule
        loop.interval = r; // set the interval to a new value
        sketch.onButton(p);
        sketch.onButton(r);
        let offTime = "+" + (0.9 * Tone.Time(r).toSeconds());
        Tone.Transport.schedule((time) => { sketch.offButton(p); sketch.offButton(r); }, offTime);

      }, rhythmSet.state);
      loop.state = "stopped";
      sketch.setLoop(loop); //hand reference to the loop to P5 sketch    
    }
  }
}

/** move this funciton to the GUI */
//the markov() function chooses a new value from the ".graph" object based on the current value of the ".next" property of a given graph object
function markov(obj) {
  //console.log(obj.state); // show the next value in the console
  let values = Object.keys(obj.matrix); // get a list of possible values in the matrix
  let i = values.indexOf(obj.state); // find the position current state in the matrix list

  let possibilities = obj.matrix[values[i]]; // get all the possible next values for a given state as an array

  obj.state = possibilities[Math.floor(Math.random() * possibilities.length)];
  // choose a value at random from the list & assign it as the next ".state"

  return obj.state; // return the value chosen
}
