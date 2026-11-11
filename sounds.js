
window.KNT = window.KNT || {};

KNT.soundsEnabled = true;

KNT.playSound = function(type) {
    if (!KNT.soundsEnabled) return;

    const ctx = KNT.getAudioContext();
    if (!ctx) return;

    const settings = {
        button: [500, 0.08],
        round: [650, 0.20],
        win: [880, 0.65],
        lose: [180, 0.45]
    };

    const sound = settings[type] || settings.button;

    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = type === "lose" ? "sawtooth" : "sine";
    oscillator.frequency.setValueAtTime(sound[0], ctx.currentTime);

    if (type === "win") {
        oscillator.frequency.exponentialRampToValueAtTime(
            1320, ctx.currentTime + sound[1]
        );
    }

    if (type === "lose") {
        oscillator.frequency.exponentialRampToValueAtTime(
            90, ctx.currentTime + sound[1]
        );
    }

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(
        0.001, ctx.currentTime + sound[1]
    );

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(ctx.currentTime + sound[1] + 0.05);
};

KNT.toggleSounds = function() {
    KNT.soundsEnabled = !KNT.soundsEnabled;

    document.getElementById("soundToggle").textContent =
        KNT.soundsEnabled ? "🔔 Sounds ON" : "🔕 Sounds OFF";

    if (KNT.soundsEnabled) KNT.playSound("button");
};
