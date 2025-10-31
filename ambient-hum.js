// === SIMPLE HUM GENERATOR ===
// Generiše 10 sekundi niskog tonalnog hum zvuka (≈110 Hz)

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const osc = audioCtx.createOscillator();
const gain = audioCtx.createGain();

// frekvencija hum-a
osc.frequency.value = 110; // A2 note (prijatno dubok hum)
osc.type = 'sine'; // možeš probati i 'triangle' ili 'sawtooth'

// postepeno pojačanje i smanjenje da nema trzanja
gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
gain.gain.linearRampToValueAtTime(0.04, audioCtx.currentTime + 5);
gain.gain.linearRampToValueAtTime(0.05, audioCtx.currentTime + 10);

// poveži
osc.connect(gain);
gain.connect(audioCtx.destination);

// pokreni
osc.start();
osc.stop(audioCtx.currentTime + 10);
