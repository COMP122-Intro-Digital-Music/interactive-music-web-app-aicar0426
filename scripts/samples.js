/** 
* Make a sample player interface with Tone.js and P5.js
* January 31, 2024
*/
var samplePlayers = []; // store sample players globally
var sampleParts = [];

let promise = loadSamplerData("JSON/samples.json");
// read in the JSON file with sampler meta-data
async function loadSamplerData(file) {
  /** read a JSON file (from a url) that contains an array of objects; 
   * each object refers to a sound file with a url;
   * fetch each sample file referenced in the JSON;
   * extract the file name and type;
   * create/load sampler GUI objects from this info
   * Tone.GranSampler has yet another async load to do
   * */
  const response = await fetch(file); // find the JSON file
      console.log("json file fetch OK?: " + response.ok);
      if(!response.ok) {
        let e = "Error: file not found"
        // document.getElementById("sampler").innerHTML = e;
        console.log(e);
        return;
      }
      const text = await response.text(); 
      try {
        let obj = JSON.parse(text); // if JSON is valid, make an object
        // loadSamples(obj); // load samples into the player
        if(Array.isArray(obj) && obj.length == 0){
          // empty array
          console.log("samples.json is an empty array");
          let noSample = document.createElement('p');
          noSample.innerHTML = "No samples loaded. <br> Check your file 'JSON/samples.json' <br> and see the instructions below"
          let samplerDiv = document.getElementById("sampler");
          samplerDiv.appendChild(noSample);
        }
        for(let i = 0; Array.isArray(obj) && i < obj.length; i++){
          console.log("process sample object " + i);
          if(obj[i].hasOwnProperty("file")){
              // console.log("object has property 'file'");
              let newObj = obj[i];
              newObj.url = obj[i].file;
              // console.log("url " + newObj.url);
              let response = await fetch(newObj.url);
              let data = await response.blob(); 
              newObj.fileName = newObj.url.split('/').pop(); // Extract filename from URL
              // console.log("sample file " + fileName + " type " + data.type);
              newObj.fileType = data.type;
              let sDiv = document.createElement("div");
              sDiv.id = "sample" + i;
              sDiv.className = "sample";
              let sketch = new p5(sampleGUI, sDiv);
              sketch.loadfromJSON(newObj, i);
              let samplerDiv = document.getElementById("sampler");
              samplerDiv.appendChild(sDiv);
              // samplers[i].loadfromJSON(newObj);
              // initEditor(newObj, i);
            }
          }
        return obj;
      } 
      catch (error){
        let e = "error - invalid JSON file (samples.json)<br /> copy and paste your JSON to <a href = 'https://jsonlint.com/' target='_blank'>jsonlint.com</a>";
        // document.getElementById("sampler").innerHTML = e;
        console.log(e);
        return;
      }
      //console.log(JSON.stringify(data));
    }
    
  
/** 
  loadSample() takes the object read in from "samples.json" and creates an array of sample controls (play, reverse, etc)
*/
function loadSamples(obj){
    let samplerDiv = document.getElementById("sampler");
  if(Array.isArray(obj)){
    //console.log("obj.samples is an array");
    for(let i = 0; i < obj.length; i ++){
        let sDiv = document.createElement("div");
        sDiv.id = "sample" + i;
        sDiv.className = "sample";
        let sketch = new p5(sampleGUI, sDiv);
        sketch.loadfromJSON(obj[i], i);
        samplerDiv.appendChild(sDiv);

    }
  }
}
