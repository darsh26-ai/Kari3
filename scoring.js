
window.KNT = window.KNT || {};

KNT.setResultButtons = function(enabled) {
    document.getElementById("bidWin").disabled = !enabled;
    document.getElementById("bidLose").disabled = !enabled;
};

KNT.addRound = function() {
    if (KNT.state.currentRound) {
        KNT.speak("Boss! Finish the current round first!");
        return;
    }

    if (!KNT.state.players.length) {
        KNT.speak("Please add players first!");
        return;
    }

    KNT.state.currentRound = {
        number: KNT.state.rounds.length + 1,
        bidder: "",
        bid: Number(document.getElementById("bidPoints").value),
        partners: [],
        partnerCards: [],
        result: "",
        wild: document.getElementById("wildSuit").value
    };

    document.getElementById("highestBidder").value = "";

    KNT.clearPartnerSelections();
    KNT.setResultButtons(true);
    KNT.renderRounds();
    KNT.saveGame();

    KNT.playSound("round");
    KNT.speak("New round! Let's make some money! Select your bidder and partners!");
};

KNT.prepareRound = function() {
    const current = KNT.state.currentRound;

    if (!current) {
        KNT.speak("There is no active round!");
        return false;
    }

    const bidder = document.getElementById("highestBidder").value;
    const bid = Number(document.getElementById("bidPoints").value);
    const partners = KNT.getSelectedPartners();

    if (!bidder) {
        KNT.speak("Who is the highest bidder?");
        return false;
    }

    if (partners.includes(bidder)) {
        KNT.speak("The bidder cannot also be a partner!");
        return false;
    }

    current.bidder = bidder;
    current.bid = bid;
    current.partners = partners;
    current.partnerCards = KNT.getPartnerCards();
    current.wild = document.getElementById("wildSuit").value;

    return true;
};

KNT.applyResult = function(result) {
    const current = KNT.state.currentRound;

    if (!current) {
        KNT.speak("No active round! Add a round first!");
        return;
    }

    if (!KNT.prepareRound()) return;

    const scores = {};

    KNT.state.players.forEach(player => {
        let score = 0;

        if (player.name === current.bidder) {
            score = result === "WIN" ? current.bid * 2 : -current.bid;
        } else if (current.partners.includes(player.name)) {
            score = result === "WIN" ? current.bid : 0;
        } else {
            score = result === "LOSE" ? current.bid : 0;
        }

        scores[player.name] = score;
    });

    KNT.state.rounds.push({
        ...current,
        result,
        scores
    });

    KNT.state.currentRound = null;

    KNT.setResultButtons(false);
    KNT.clearPartnerSelections();

    document.getElementById("highestBidder").value = "";

    KNT.renderRounds();
    KNT.calculateTotals();
    KNT.saveGame();

    if (result === "WIN") {
        KNT.playSound("win");
        KNT.speak(
            "Wah wah wah! Bidder " + current.bidder +
            " won! " + current.bid + " points! Jackpot!"
        );
    } else {
        KNT.playSound("lose");
        KNT.speak(
            "Oh no! Bidder " + current.bidder +
            " lost! Better luck next time!"
        );
    }
};

KNT.renderRounds = function() {
    const body = document.getElementById("scoreBody");
    body.replaceChildren();

    const rounds = [...KNT.state.rounds];

    if (KNT.state.currentRound) {
        rounds.push({
            ...KNT.state.currentRound,
            pending: true
        });
    }

    rounds.forEach(round => {
        const tr = document.createElement("tr");
        const heading = document.createElement("td");

        heading.textContent = round.pending
            ? "Game " + round.number + " (Pending)"
            : "Game " + round.number +
              (round.result === "WIN" ? " 🏆 Bidder Won" : " ❌ Bidder Lost");

        tr.appendChild(heading);

        KNT.state.players.forEach(player => {
            const td = document.createElement("td");

            if (round.pending) {
                td.textContent = "Pending";
            } else {
                const input = document.createElement("input");
                input.type = "number";
                input.readOnly = true;
                input.className = "score-input";
                input.value = round.scores?.[player.name] ?? 0;
                td.appendChild(input);
            }

            tr.appendChild(td);
        });

        body.appendChild(tr);
    });

    KNT.updateStatistics();
};

KNT.calculateTotals = function() {
    const totals = {};

    KNT.state.players.forEach(player => {
        totals[player.name] = 0;
    });

    KNT.state.rounds.forEach(round => {
        KNT.state.players.forEach(player => {
            totals[player.name] += Number(round.scores?.[player.name] || 0);
        });
    });

    KNT.state.players.forEach(player => {
        player.total = totals[player.name];

        const cell = document.getElementById("total-" + player.name);
        if (cell) cell.textContent = player.total;
    });

    const scores = Object.values(totals);
    document.getElementById("highestScore").textContent =
        scores.length ? Math.max(0, ...scores) : 0;

    const ranking = [...KNT.state.players].sort(
        (a, b) => b.total - a.total
    );

    const badge = document.querySelector(".badge");

    badge.textContent = ranking.length
        ? "🏆 " + ranking[0].name + " – " + ranking[0].total + " Points"
        : "No Scores Yet";

    const remaining = document.getElementById("remainingUnderLeader");
    remaining.replaceChildren();

    ranking.slice(1).forEach((player, index) => {
        const row = document.createElement("div");
        row.className = "rank-row";

        const rank = document.createElement("span");
        rank.textContent = index + 2;

        const name = document.createElement("span");
        name.className = "rank-name";
        name.textContent = player.name;

        const points = document.createElement("span");
        points.textContent = player.total + " pts";

        row.append(rank, name, points);
        remaining.appendChild(row);
    });

    KNT.updateStatistics();
    KNT.saveGame();
};

KNT.undoRound = function() {
    const password = prompt("Enter password to undo last round:");

    if (password === null) return;

    if (password !== "Innocent mistake") {
        alert("Incorrect password!");
        return;
    }

    if (!KNT.state.rounds.length) {
        alert("No completed rounds to undo.");
        return;
    }

    const removed = KNT.state.rounds.pop();

    KNT.renderRounds();
    KNT.calculateTotals();
    KNT.saveGame();

    KNT.speak("Game " + removed.number + " undone! No problem, boss!");
};

KNT.resetGame = function() {
    const password = prompt("Enter password to reset the game:");

    if (password === null) return;

    if (password !== "Na maza aavi") {
        alert("Incorrect password!");
        return;
    }

    if (!confirm("Start a completely new game?")) return;

    KNT.state = {
        players: [],
        rounds: [],
        currentRound: null,
        partners: [],
        partnerCards: []
    };

    document.getElementById("playerName").value = "";
    document.getElementById("bidPoints").value = "275";
    document.getElementById("wildSuit").value = "♠ Spades";

    KNT.clearPartnerSelections();
    KNT.refreshPlayers();
    KNT.renderRounds();
    KNT.calculateTotals();
    KNT.setResultButtons(false);
    KNT.saveGame();

    KNT.speak("Fresh game! Fresh luck! Let's go!");
    alert("Game reset successfully!");
};

