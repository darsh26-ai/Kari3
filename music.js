
window.KNT = window.KNT || {};

KNT.audioContext = null;
KNT.musicTimer = null;
KNT.musicPlaying = false;
KNT.musicVolume = 0.25;
KNT.musicStep = 0;

KNT.getAudioContext = function() {
    if (!KNT.audioContext) {
        const AudioContext =
            window.AudioContext || window.webkitAudioContext;

        if (!AudioContext) return null;

        KNT.audioContext = new AudioContext();
    }

    if (KNT.audioContext.state === "suspended") {
        KNT.audioContext.resume();
    }

    return KNT.audioContext;
};

KNT.playCasinoNote = function(frequency, duration, volume) {
    const ctx = KNT.getAudioContext();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = "triangle";
    oscillator.frequency.value = frequency;

    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(
        volume * KNT.musicVolume,
        ctx.currentTime + 0.04
    );
    gain.gain.exponentialRampToValueAtTime(
        0.0001,
        ctx.currentTime + duration
    );

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(ctx.currentTime + duration + 0.05);
};

KNT.startMusic = function() {
    if (KNT.musicPlaying) return;

    if (!KNT.getAudioContext()) {
        alert("Audio is not supported in this browser.");
        return;
    }

    KNT.musicPlaying = true;
    document.getElementById("musicToggle").textContent = "⏸ Music OFF";

    const melody = [
        523.25,659.25,783.99,659.25,
        587.33,698.46,880,698.46,
        523.25,659.25,783.99,1046.5,
        880,783.99,659.25,587.33
    ];

    KNT.musicTimer = setInterval(() => {
        if (!KNT.musicPlaying) return;

        const note = melody[KNT.musicStep % melody.length];

        KNT.playCasinoNote(note, 0.3, 0.22);

        if (KNT.musicStep % 4 === 0) {
            KNT.playCasinoNote(note / 2, 0.45, 0.10);
        }

        KNT.musicStep++;
    }, 350);
};

KNT.stopMusic = function() {
    KNT.musicPlaying = false;

    if (KNT.musicTimer) {
        clearInterval(KNT.musicTimer);
        KNT.musicTimer = null;
    }

    document.getElementById("musicToggle").textContent = "▶ Music ON";
};

KNT.setMusicVolume = function(value) {
    KNT.musicVolume = Number(value) / 100;
};
