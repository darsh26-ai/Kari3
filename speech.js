
window.KNT = window.KNT || {};

KNT.speechEnabled = true;
KNT.recognition = null;
KNT.listening = false;

KNT.speak = function(message) {
    if (!KNT.speechEnabled || !("speechSynthesis" in window)) return;

    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = "en-US";
    utterance.rate = 1.05;
    utterance.pitch = 1.15;
    utterance.volume = 1;

    speechSynthesis.speak(utterance);
};

KNT.toggleSpeech = function() {
    KNT.speechEnabled = !KNT.speechEnabled;

    document.getElementById("speechToggle").textContent =
        KNT.speechEnabled ? "🔊 Speech ON" : "🔇 Speech OFF";

    if (!KNT.speechEnabled) speechSynthesis.cancel();
};

KNT.testSpeech = function() {
    KNT.speak(
        "Hello ladies and gentlemen! Welcome to Kari Ni Tiri! " +
        "Place your bets, bring your luck, and let the fun begin!"
    );
};

KNT.setVoiceStatus = function(message) {
    document.getElementById("voiceStatus").textContent = message;
};

KNT.startVoice = function() {
    const Recognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!Recognition) {
        KNT.setVoiceStatus("Speech recognition is not supported.");
        alert(
            "Voice recognition is unavailable in this browser. " +
            "Try Chrome or Edge with microphone permission enabled."
        );
        return;
    }

    if (KNT.listening) return;

    const recognition = new Recognition();

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;

    KNT.recognition = recognition;
    KNT.listening = true;

    const button = document.getElementById("voiceStart");
    button.classList.add("listening");
    button.textContent = "🔴 Listening...";

    KNT.setVoiceStatus("Listening. Speak your command!");

    recognition.onresult = function(event) {
        const result = event.results[0][0].transcript.trim();

        KNT.setVoiceStatus("Heard: " + result);

        KNT.handleVoiceCommand(result);
    };

    recognition.onerror = function(event) {
        KNT.setVoiceStatus("Voice error: " + event.error);
    };

    recognition.onend = function() {
        KNT.listening = false;
        KNT.recognition = null;

        button.classList.remove("listening");
        button.textContent = "🎙️ Press to Speak";
    };

    try {
        recognition.start();
    } catch (error) {
        KNT.listening = false;
        button.classList.remove("listening");
        button.textContent = "🎙️ Press to Speak";
        KNT.setVoiceStatus("Could not start microphone.");
    }
};

KNT.findPlayer = function(name) {
    const cleaned = name.trim().replace(/[.!?,]+$/, "");

    return KNT.state.players.find(p =>
        p.name.toLowerCase() === cleaned.toLowerCase()
    );
};

KNT.selectBidder = function(name) {
    const player = KNT.findPlayer(name);

    if (!player) {
        KNT.speak("I cannot find player " + name + ". Please add that player first.");
        return false;
    }

    document.getElementById("highestBidder").value = player.name;
    KNT.saveGame();

    KNT.speak(player.name + " is now the highest bidder!");
    return true;
};

KNT.selectPartnersByNames = function(names) {
    const selects = [...document.querySelectorAll(".partner-name")];

    selects.forEach(s => s.value = "");

    const matched = [];

    for (const name of names) {
        const player = KNT.findPlayer(name);

        if (!player) {
            KNT.speak("I cannot find player " + name);
            return false;
        }

        if (matched.includes(player.name)) continue;

        if (player.name ===
            document.getElementById("highestBidder").value) {
            KNT.speak("The bidder cannot be their own partner!");
            return false;
        }

        matched.push(player.name);
    }

    if (matched.length > selects.length) {
        KNT.speak("You can select up to four partners.");
        return false;
    }

    matched.forEach((name, i) => {
        selects[i].value = name;
    });

    KNT.saveGame();

    KNT.speak("Partners selected: " + matched.join(" and "));
    return true;
};

KNT.setBidByVoice = function(value) {
    const bid = Number(value);

    if (!Number.isInteger(bid) || bid < 275 ||
        bid > 500 || bid % 5 !== 0) {
        KNT.speak("Bid must be between 275 and 500, in steps of five.");
        return;
    }

    document.getElementById("bidPoints").value = String(bid);
    KNT.saveGame();

    KNT.speak("Bid points set to " + bid + "!");
};

KNT.setWildByVoice = function(suit) {
    const options = {
        spade: "♠ Spades",
        spades: "♠ Spades",
        heart: "♥ Hearts",
        hearts: "♥ Hearts",
        diamond: "♦ Diamonds",
        diamonds: "♦ Diamonds",
        club: "♣ Clubs",
        clubs: "♣ Clubs"
    };

    const value = options[suit.toLowerCase()];

    if (!value) {
        KNT.speak("Please say Spades, Hearts, Diamonds or Clubs.");
        return;
    }

    document.getElementById("wildSuit").value = value;
    KNT.saveGame();

    KNT.speak("Wild card changed to " + suit + "!");
};

KNT.readLeader = function() {
    const ranking = [...KNT.state.players].sort(
        (a, b) => (b.total || 0) - (a.total || 0)
    );

    if (!ranking.length) {
        KNT.speak("Nobody is leading yet. The competition is wide open!");
        return;
    }

    const leader = ranking[0];

    KNT.speak(
        "Ladies and gentlemen! The current leader is " +
        leader.name + " with " + leader.total + " points!"
    );
};

KNT.readScores = function() {
    if (!KNT.state.players.length) {
        KNT.speak("There are no players yet.");
        return;
    }

    const ranking = [...KNT.state.players].sort(
        (a, b) => (b.total || 0) - (a.total || 0)
    );

    const message = ranking.map((p, i) =>
        "Position " + (i + 1) + ": " + p.name +
        ", " + (p.total || 0) + " points."
    ).join(" ");

    KNT.speak("Here are the scores! " + message);
};

KNT.voiceHelp = function() {
    KNT.speak(
        "You can say: Add player Rahul. Bidder Rahul. Bid 350. " +
        "Partners Amit and Raj. Wild card Hearts. Add round. " +
        "Bidder won. Bidder lost. Who is the leader. Read scores. " +
        "You can also say: Stop speech."
    );
};

KNT.handleVoiceCommand = function(raw) {
    const command = raw.toLowerCase().trim();

    // Add a player.
    let match = command.match(
        /^(?:please\s+)?(?:add|create)\s+(?:a\s+)?player\s+(?:named\s+)?(.+)$/
    );

    if (match) {
        KNT.addPlayer(match[1].trim());
        return;
    }

    // Set bidder.
    match = command.match(
        /^(?:set\s+)?(?:the\s+)?bidder\s+(?:is\s+|to\s+)?(.+)$/
    );

    if (match && !/won|lost|win|lose/.test(match[1])) {
        KNT.selectBidder(match[1]);
        return;
    }

    // Set bid.
    match = command.match(
        /^(?:set\s+)?(?:the\s+)?bid(?:\s+points)?\s+(?:to\s+)?(\d+)$/
    );

    if (match) {
        KNT.setBidByVoice(match[1]);
        return;
    }

    // Set partners.
    match = command.match(
        /^(?:set\s+)?partners?\s+(?:are\s+|is\s+|to\s+)?(.+)$/
    );

    if (match) {
        const names = match[1]
            .replace(/\band\b/g, ",")
            .split(",")
            .map(s => s.trim())
            .filter(Boolean);

        KNT.selectPartnersByNames(names);
        return;
    }

    // Wild card.
    match = command.match(
        /^(?:set\s+)?wild\s+card\s+(?:to\s+)?(.+)$/
    );

    if (match) {
        KNT.setWildByVoice(match[1].replace(/[.!?]/g, ""));
        return;
    }

    // Add round.
    if (/^(add|start|create|new) (a )?round$/.test(command)) {
        KNT.addRound();
        return;
    }

    // Results always need spoken-command confirmation.
    if (/^(bidder )?(won|wins|win)$/.test(command) ||
        command === "bidder won") {
        if (!KNT.state.currentRound) {
            KNT.speak("There is no active round.");
            return;
        }

        if (confirm("Confirm: Bidder Won?")) {
            KNT.applyResult("WIN");
        }
        return;
    }

    if (/^(bidder )?(lost|loses|lose)$/.test(command) ||
        command === "bidder lost") {
        if (!KNT.state.currentRound) {
            KNT.speak("There is no active round.");
            return;
        }

        if (confirm("Confirm: Bidder Lost?")) {
            KNT.applyResult("LOSE");
        }
        return;
    }

    if (/who is the leader|current leader/.test(command)) {
        KNT.readLeader();
        return;
    }

    if (/read scores|show scores|scoreboard/.test(command)) {
        KNT.readScores();
        return;
    }

    if (/help|what can i say|commands/.test(command)) {
        KNT.voiceHelp();
        return;
    }

    if (/stop speech|be quiet|silence/.test(command)) {
        speechSynthesis.cancel();
        KNT.setVoiceStatus("Speech stopped.");
        return;
    }

    if (/music on/.test(command)) {
        KNT.startMusic();
        KNT.speak("Casino music is on!");
        return;
    }

    if (/music off/.test(command)) {
        KNT.stopMusic();
        KNT.speak("Music switched off!");
        return;
    }

    KNT.speak(
        "Sorry boss! I heard " + raw +
        ". I did not understand. Say help for commands!"
    );
};
