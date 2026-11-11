
window.KNT = window.KNT || {};

KNT.initialize = function() {
    // Bid point dropdown.
    const bid = document.getElementById("bidPoints");

    for (let i = 275; i <= 500; i += 5) {
        bid.add(new Option(String(i), String(i)));
    }

    // Create partner dropdowns.
    KNT.createPartnerSelectors();

    // Restore previous game.
    KNT.loadGame();

    // Player management.
    document.getElementById("addPlayer")
        .addEventListener("click", () => KNT.addPlayer());

    document.getElementById("playerName")
        .addEventListener("keydown", event => {
            if (event.key === "Enter") KNT.addPlayer();
        });

    // Round management.
    document.getElementById("addRound")
        .addEventListener("click", KNT.addRound);

    document.getElementById("bidWin")
        .addEventListener("click", () => {
            if (confirm("Confirm: Bidder Won?")) {
                KNT.applyResult("WIN");
            }
        });

    document.getElementById("bidLose")
        .addEventListener("click", () => {
            if (confirm("Confirm: Bidder Lost?")) {
                KNT.applyResult("LOSE");
            }
        });

    document.getElementById("undoRound")
        .addEventListener("click", KNT.undoRound);

    document.getElementById("resetGame")
        .addEventListener("click", KNT.resetGame);

    // Voice.
    document.getElementById("voiceStart")
        .addEventListener("click", KNT.startVoice);

    document.getElementById("testSpeech")
        .addEventListener("click", KNT.testSpeech);

    document.getElementById("speechToggle")
        .addEventListener("click", KNT.toggleSpeech);

    // Music.
    document.getElementById("musicToggle")
        .addEventListener("click", () => {
            if (KNT.musicPlaying) {
                KNT.stopMusic();
            } else {
                KNT.startMusic();
            }
        });

    document.getElementById("musicVolume")
        .addEventListener("input", event => {
            KNT.setMusicVolume(event.target.value);
        });

    // Sound effects.
    document.getElementById("soundToggle")
        .addEventListener("click", KNT.toggleSounds);

    // Automatically save form changes.
    document.addEventListener("change", () => KNT.saveGame());

    // Save pending round details.
    document.addEventListener("input", () => KNT.saveGame());

    // Set initial button state.
    KNT.setResultButtons(!!KNT.state.currentRound);

    KNT.updateStatistics();
    KNT.renderRounds();
    KNT.calculateTotals();

    KNT.setVoiceStatus(
        ("SpeechRecognition" in window ||
         "webkitSpeechRecognition" in window)
            ? "Ready! Press the microphone to speak."
            : "Voice recognition unavailable. Try Chrome or Edge."
    );

    console.log("Kari Ni Tiri Voice Edition ready!");
};

document.addEventListener("DOMContentLoaded", KNT.initialize);
