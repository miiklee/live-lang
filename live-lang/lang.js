
var audioCtx;
var osc = [];
var timings = [];
var liveCodeState = [];
const playButton = document.querySelector('button');
var globalGain;

function initAudio(lines) {

    //add for loop to create all the oscillators
    let i = 0;
    while (  i  <  lines ){
        let o = audioCtx.createOscillator();
        let t = audioCtx.createGain();
        t.gain.value = 0;
        o.connect(t).connect(globalGain);
        o.start();

        osc[i] = o;
        timings[i] = t;
    }
    
    scheduleAudio()
}

function scheduleAudio() {
    let timeElapsedSecs = 0;
    liveCodeState.forEach(noteData => {
        timings.gain.setTargetAtTime(1, audioCtx.currentTime + timeElapsedSecs, 0.01)
        osc.frequency.setTargetAtTime(noteData["pitch"], audioCtx.currentTime + timeElapsedSecs, 0.01)
        timeElapsedSecs += noteData["length"]/10.0;
        timings.gain.setTargetAtTime(0, audioCtx.currentTime + timeElapsedSecs, 0.01)
        timeElapsedSecs += 0.2; //rest between notes
    });

    setTimeout(scheduleAudio, timeElapsedSecs * 1000);
}

function parseCode(code) {
    //how could we allow for a repeat operation 
    //(e.g. "3@340 2[1@220 2@330]"" plays as "3@340 1@220 2@330 1@220 2@330")
    //how could we allow for two lines that play at the same time?
    //what if we want variables?
    //how does this parsing technique limit us?
    let notes;
    let phrase = code.split("//")
    for (let p in phrase){
        notes.push(phrase[p].split(" ").map(note => {
            noteData = note.split("@");
            return   {"length" : eval(noteData[0]), //the 'eval' function allows us to write js code in our live coding language
                    "pitch" : eval(noteData[1])};
                    //what other things should be controlled? osc type? synthesis technique?
        }))
    }

    
    //notice this will fail if the input is not correct
    //how could you handle this? allow some flexibility in the grammar? fail gracefully?
    //ideally (probably), the music does not stop
    return notes;
}

function genAudio(data) {
    liveCodeState = data;
    initAudio(data.length);
}

function reevaluate() {
    var code = document.getElementById('code').value;
    var data = parseCode(code);
    genAudio(data);
}

playButton.addEventListener('click', function () {

    if (!audioCtx) {
        audioCtx = new AudioContext();
        globalGain = audioCtx.createGain();
        globalGain.connect(audioCtx.destination);
        
    }

    reevaluate();


});
