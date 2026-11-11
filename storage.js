
window.KNT = window.KNT || {};

KNT.state = {
    players: [],
    rounds: [],
    currentRound: null,
    partners: [],
    partnerCards: []
};

KNT.saveGame = function() {
    try {
        const current = KNT.state.currentRound;

        if (current) {
            current.bidder =
                document.getElementById("highestBidder").value;

            current.bid =
                Number(document.getElementById("bidPoints").value);

            current.partners = KNT.getSelectedPartners();
            current.partnerCards = KNT.getPartnerCards();
            current.wild = document.getElementById("wildSuit").value;
        }

        const data = {
            ...KNT.state,
            bidder: document.getElementById("highestBidder").value,
            bid: document.getElementById("bidPoints").value,
            wild: document.getElementById("wildSuit").value
        };

        localStorage.setItem("kariNiTiri", JSON.stringify(data));

    } catch (error) {
        console.error("Save error:", error);
    }
};

KNT.loadGame = function() {
    try {
        const saved = localStorage.getItem("kariNiTiri");
        if (!saved) return;

        const data = JSON.parse(saved);

        if (!data || !Array.isArray(data.players) ||
            !Array.isArray(data.rounds)) {
            throw new Error("Invalid saved game");
        }

        KNT.state = {
            players: data.players,
            rounds: data.rounds,
            currentRound: data.currentRound || null,
            partners: data.partners || [],
            partnerCards: data.partnerCards || []
        };

        document.getElementById("bidPoints").value = data.bid || "275";
        document.getElementById("wildSuit").value =
            data.wild || "♠ Spades";

        KNT.refreshPlayers();
        KNT.renderRounds();

        if (KNT.state.currentRound) {
            document.getElementById("highestBidder").value =
                KNT.state.currentRound.bidder || "";

            KNT.restorePartnerSelections();
        }

        KNT.setResultButtons(!!KNT.state.currentRound);
        KNT.calculateTotals();

    } catch (error) {
        console.error("Restore error:", error);
        alert("Unable to restore saved game. Check browser storage.");
    }
};
