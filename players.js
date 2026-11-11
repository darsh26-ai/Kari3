
window.KNT = window.KNT || {};

KNT.playerColors = [
    "#3498db", "#2ecc71", "#9b59b6", "#f39c12",
    "#e74c3c", "#16a085", "#d35400", "#34495e"
];

KNT.addPlayer = function(name) {
    name = (name || document.getElementById("playerName").value).trim();

    if (!name) {
        KNT.speak("Please tell me the player name.");
        return false;
    }

    if (KNT.state.players.some(p =>
        p.name.toLowerCase() === name.toLowerCase()
    )) {
        KNT.speak(name + " is already in the game!");
        return false;
    }

    KNT.state.players.push({
        name,
        color: KNT.playerColors[
            KNT.state.players.length % KNT.playerColors.length
        ],
        total: 0
    });

    document.getElementById("playerName").value = "";

    KNT.refreshPlayers();
    KNT.renderRounds();
    KNT.calculateTotals();
    KNT.saveGame();

    KNT.playSound("button");
    KNT.speak("Welcome " + name + "! Another player joins the madness!");
    return true;
};

KNT.editPlayer = function(oldName) {
    const answer = prompt("New name for " + oldName + ":");

    if (answer === null) return;

    const name = answer.trim();

    if (!name) {
        alert("Name cannot be empty.");
        return;
    }

    if (KNT.state.players.some(p =>
        p.name.toLowerCase() === name.toLowerCase() &&
        p.name !== oldName
    )) {
        alert("That player already exists.");
        return;
    }

    KNT.state.players.forEach(p => {
        if (p.name === oldName) p.name = name;
    });

    KNT.state.rounds.forEach(round => {
        if (Object.prototype.hasOwnProperty.call(round.scores, oldName)) {
            round.scores[name] = round.scores[oldName];
            delete round.scores[oldName];
        }

        round.partners = (round.partners || []).map(
            p => p === oldName ? name : p
        );

        if (round.bidder === oldName) round.bidder = name;
    });

    if (KNT.state.currentRound) {
        if (KNT.state.currentRound.bidder === oldName) {
            KNT.state.currentRound.bidder = name;
        }

        KNT.state.currentRound.partners =
            (KNT.state.currentRound.partners || []).map(
                p => p === oldName ? name : p
            );
    }

    KNT.state.partners =
        KNT.state.partners.map(p => p === oldName ? name : p);

    KNT.refreshPlayers();
    KNT.renderRounds();
    KNT.calculateTotals();
    KNT.saveGame();

    KNT.speak("Player name changed to " + name);
};

KNT.removePlayer = function(name) {
    if (!confirm("Remove " + name + " from the game?")) return;

    KNT.state.players = KNT.state.players.filter(p => p.name !== name);

    KNT.state.rounds.forEach(round => {
        delete round.scores[name];
        round.partners = (round.partners || []).filter(p => p !== name);
        if (round.bidder === name) round.bidder = "";
    });

    if (KNT.state.currentRound) {
        if (KNT.state.currentRound.bidder === name) {
            KNT.state.currentRound.bidder = "";
        }

        KNT.state.currentRound.partners =
            (KNT.state.currentRound.partners || []).filter(p => p !== name);
    }

    KNT.state.partners =
        KNT.state.partners.filter(p => p !== name);

    KNT.refreshPlayers();
    KNT.renderRounds();
    KNT.calculateTotals();
    KNT.saveGame();
};

KNT.refreshPlayers = function() {
    const header = document.getElementById("headerRow");
    const totals = document.getElementById("totalRow");
    const bidder = document.getElementById("highestBidder");

    header.replaceChildren();
    totals.replaceChildren();

    const roundHeading = document.createElement("th");
    roundHeading.textContent = "Round";
    header.appendChild(roundHeading);

    const totalHeading = document.createElement("td");
    totalHeading.textContent = "Total";
    totals.appendChild(totalHeading);

    const selectedBidder = KNT.state.currentRound?.bidder ||
        bidder.value;

    bidder.replaceChildren(new Option("Select Player", ""));

    KNT.state.players.forEach(player => {
        const th = document.createElement("th");
        th.style.background = player.color;
        th.style.color = "white";
        th.appendChild(document.createTextNode(player.name));

        const edit = document.createElement("button");
        edit.className = "edit-btn";
        edit.textContent = "✎ Edit";
        edit.addEventListener("click", () => KNT.editPlayer(player.name));

        const remove = document.createElement("button");
        remove.className = "remove-btn";
        remove.textContent = "✖ Remove";
        remove.addEventListener("click", () => KNT.removePlayer(player.name));

        th.append(edit, remove);
        header.appendChild(th);

        const td = document.createElement("td");
        td.id = "total-" + player.name;
        td.textContent = player.total || 0;
        totals.appendChild(td);

        bidder.add(new Option(player.name, player.name));
    });

    bidder.value = selectedBidder || "";

    KNT.refreshPartnerDropdowns();
    KNT.updateStatistics();
};

KNT.updateStatistics = function() {
    document.getElementById("playerCount").textContent =
        KNT.state.players.length;

    document.getElementById("roundCount").textContent =
        KNT.state.rounds.length;
};

KNT.createPartnerSelectors = function() {
    const cards = document.getElementById("partnerCardsContainer");
    const names = document.getElementById("partnerNamesContainer");

    cards.replaceChildren();
    names.replaceChildren();

    const suits = [
        ["♠", "Spades"], ["♥", "Hearts"],
        ["♦", "Diamonds"], ["♣", "Clubs"]
    ];

    const ranks = ["A", "K", "Q", "J", "3"];

    for (let i = 0; i < 4; i++) {
        const row = document.createElement("div");
        row.className = "partner-card-row";

        const position = document.createElement("select");
        position.className = "card-position";

        position.add(new Option("Position", ""));
        position.add(new Option("First", "First"));
        position.add(new Option("Second", "Second"));

        const suit = document.createElement("select");
        suit.className = "partner-suit";
        suit.add(new Option("Suit", ""));

        suits.forEach(([symbol, name]) => {
            suit.add(new Option(symbol + " " + name, symbol));
        });

        const rank = document.createElement("select");
        rank.className = "partner-rank";
        rank.add(new Option("Card", ""));

        ranks.forEach(r => rank.add(new Option(r, r)));

        [position, suit, rank].forEach(control => {
            control.addEventListener("change", KNT.saveGame);
        });

        suit.addEventListener("change", () => {
            suit.style.color =
                suit.value === "♥" || suit.value === "♦" ? "red" : "black";
        });

        row.append(position, suit, rank);
        cards.appendChild(row);
    }

    for (let i = 1; i <= 4; i++) {
        const select = document.createElement("select");
        select.className = "partner-name";
        select.add(new Option("Partner " + i, ""));

        select.addEventListener("change", () => {
            const selected = KNT.getSelectedPartners();

            if (new Set(selected).size !== selected.length) {
                alert("A player cannot be selected twice.");
                select.value = "";
            }

            KNT.saveGame();
        });

        names.appendChild(select);
    }

    KNT.refreshPartnerDropdowns();
};

KNT.refreshPartnerDropdowns = function() {
    document.querySelectorAll(".partner-name").forEach(select => {
        const previous = select.value;

        select.replaceChildren(new Option("Select Partner", ""));

        KNT.state.players.forEach(p => {
            select.add(new Option(p.name, p.name));
        });

        select.value = previous;
    });
};

KNT.getSelectedPartners = function() {
    return [...document.querySelectorAll(".partner-name")]
        .map(s => s.value)
        .filter(Boolean);
};

KNT.getPartnerCards = function() {
    return [...document.querySelectorAll(".partner-card-row")].map(row => {
        const position = row.querySelector(".card-position").value;
        const suit = row.querySelector(".partner-suit").value;
        const rank = row.querySelector(".partner-rank").value;

        return { position, suit, rank };
    });
};

KNT.clearPartnerSelections = function() {
    document.querySelectorAll(
        ".partner-name, .partner-suit, .partner-rank, .card-position"
    ).forEach(select => {
        select.value = "";
        select.style.color = "#222";
    });

    KNT.state.partners = [];
    KNT.state.partnerCards = [];
};

KNT.restorePartnerSelections = function() {
    const current = KNT.state.currentRound;

    if (!current) return;

    document.querySelectorAll(".partner-name").forEach((select, i) => {
        select.value = current.partners?.[i] || "";
    });

    document.querySelectorAll(".partner-card-row").forEach((row, i) => {
        const card = current.partnerCards?.[i] || {};

        row.querySelector(".card-position").value = card.position || "";
        row.querySelector(".partner-suit").value = card.suit || "";
        row.querySelector(".partner-rank").value = card.rank || "";
    });
};
