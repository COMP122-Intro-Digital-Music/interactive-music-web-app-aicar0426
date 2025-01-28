var beatLoops = [];
let beatPromise = loadBeatData("JSON/beats.json");


// read in the JSON file with sampler meta-data
async function loadBeatData(file) {
  const response = await fetch(file);
  const text = await response.text(); 
  try {
    let obj = JSON.parse(text); // if JSON is valid, make an object
    makeBeats(obj); // generate Markov player and GUI
    return obj;
  } 
  catch (error){
    let e = "error - invalid JSON file (beats.json)<br /> copy and paste your JSON to <a href = 'https://jsonlint.com/' target='_blank'>jsonlint.com</a>";
    document.getElementById("beats").innerHTML = e;
    console.log(e);
    return;
  }
  //console.log(JSON.stringify(data));
}

function makeBeats(obj){
  //master control section
  let beatsDiv = document.getElementById("beats");
  let bSketch = new p5(beatsGUI, beatsDiv);
  let beatSketches = [];

  //individual parts
  if(Array.isArray(obj)){
    if(obj.length == 0){
      let p = document.createElement("p");
      p.innerHTML = "No beats. 'beats.json' is empty ('[ ]')";
      let beatPartDiv = document.getElementById("beatParts");
      beatPartDiv.appendChild(p);
    }
    for(let i = 0; i < obj.length; i++){
      console.log(obj[i].name);
      let beatPartDiv = document.getElementById("beatParts");
      let b = document.createElement("div");
      b.className = "beatPart";
      let pSketch = new p5(beatPartGUI, b); // invoke p5 and add it to the div
      beatPartDiv.appendChild(b);
      let loop = pSketch.setObj(obj[i]); // hand a reference to the sequence to the sketch, get a Tone.loop in return
      //console.log(loop);
      beatLoops.push(loop); // add loop to global array
      loop.stop();
      beatSketches.push(pSketch); // add the loop sketch to the beats array
//      console.log(beatSketches);
    } 
  }

  bSketch.setLoops(beatSketches); // hand the array of beats to the big button

}
