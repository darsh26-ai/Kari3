/* =========================================================
   KARI NI TIRI
   GAME APPLICATION
========================================================= */


/* =========================================================
   STORAGE
========================================================= */

const STORAGE_KEY = "kariNiTiriGame";


/* =========================================================
   GAME STATE
========================================================= */

let game = {

    players: [],

    rounds: [],

    currentBidderId: null,

    // Multiple partners are now supported
    currentPartnerIds: [],

    currentBid: 275,

    currentBidResult: null,

    soundEnabled: true

};


/* =========================================================
   AUDIO
   Uses Web Audio API.
   No external MP3 files are required.
========================================================= */

let audioContext = null;


function getAudioContext() {

    if (!audioContext) {

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;

        if (AudioContext) {

            audioContext =
                new AudioContext();
        }
    }

    return audioContext;
}


function playTone(
    frequency = 440,
    duration = 0.08,
    type = "sine",
    volume = 0.05
) {

    if (!game.soundEnabled) {
        return;
    }

    const context =
        getAudioContext();

    if (!context) {
        return;
    }

    if (context.state === "suspended") {
        context.resume();
    }

    const oscillator =
        context.createOscillator();

    const gain =
        context.createGain();

    oscillator.type = type;

    oscillator.frequency.value =
        frequency;

    gain.gain.setValueAtTime(
        0.0001,
        context.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
        volume,
        context.currentTime + 0.01
    );

    gain.gain.exponentialRampToValueAtTime(
        0.0001,
        context.currentTime + duration
    );

    oscillator.connect(gain);

    gain.connect(context.destination);

    oscillator.start();

    oscillator.stop(
        context.currentTime + duration + 0.02
    );
}


function playClickSound() {

    playTone(
        520,
        0.07,
        "sine",
        0.035
    );
}


function playAddSound() {

    playTone(
        620,
        0.08,
        "sine",
        0.04
    );

    setTimeout(() => {

        playTone(
            820,
            0.1,
            "sine",
            0.035
        );

    }, 70);
}


function playBidSound() {

    playTone(
        420,
        0.08,
        "triangle",
        0.04
    );

    setTimeout(() => {

        playTone(
            650,
            0.12,
            "triangle",
            0.04
        );

    }, 80);
}


function playSaveSound() {

    playTone(
        520,
        0.08,
        "sine",
        0.035
    );

    setTimeout(() => {

        playTone(
            700,
            0.08,
            "sine",
            0.035
        );

    }, 70);

    setTimeout(() => {

        playTone(
            900,
            0.13,
            "sine",
            0.035
        );

    }, 140);
}


function playResetSound() {

    playTone(
        500,
        0.1,
        "sawtooth",
        0.025
    );

    setTimeout(() => {

        playTone(
            300,
            0.15,
            "sawtooth",
            0.025
        );

    }, 100);
}


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadGame();

        setupEvents();

        renderPlayers();

        renderBidders();

        renderPartners();

        updateBidDisplay();

        updateRoundInformation();

        updateBidResultUI();

        updateSaveRoundButton();

        renderScoreInputs();

        renderScoreboard();

        updateSteps();

        updateSoundButton();

    }
);


/* =========================================================
   LOAD / SAVE
========================================================= */

function loadGame() {

    try {

        const saved =
            localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return;
        }

        const parsed =
            JSON.parse(saved);

        if (!parsed || typeof parsed !== "object") {
            return;
        }

        game = {

    players:
        Array.isArray(parsed.players)
            ? parsed.players
            : [],

    rounds:
        Array.isArray(parsed.rounds)
            ? parsed.rounds
            : [],

    currentBidderId:
        parsed.currentBidderId || null,

    currentPartnerIds:
    Array.isArray(parsed.currentPartnerIds)
        ? parsed.currentPartnerIds
        : (
            parsed.currentPartnerId
                ? [parsed.currentPartnerId]
                : []
        ),

    currentBid:
        Number(parsed.currentBid) || 275,

    currentBidResult:
        parsed.currentBidResult || null,

    soundEnabled:
        parsed.soundEnabled !== false

};

    } catch (error) {

        console.error(
            "Could not load saved game:",
            error
        );
    }
}


function saveGame() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(game)
        );

    } catch (error) {

        console.error(
            "Could not save game:",
            error
        );
    }
}


/* =========================================================
   EVENT SETUP
========================================================= */

function setupEvents() {

    const addPlayerButton =
        document.getElementById(
            "addPlayerButton"
        );

    const playerInput =
        document.getElementById(
            "playerNameInput"
        );

    const goToBidding =
        document.getElementById(
            "goToBiddingButton"
        );

    const backPlayers =
        document.getElementById(
            "backToPlayersButton"
        );

    const startScoring =
        document.getElementById(
            "startScoringButton"
        );

    const backBidding =
        document.getElementById(
            "backToBiddingButton"
        );

    const saveRound =
        document.getElementById(
            "saveRoundButton"
        );

   const bidWinButton =
       document.getElementById(
           "bidWinButton"
       );
   
   const bidLossButton =
       document.getElementById(
           "bidLossButton"
       );
   
   
   bidWinButton.addEventListener(
       "click",
       () => {
   
           setBidResult("win");
   
       }
   );
   
   
   bidLossButton.addEventListener(
       "click",
       () => {
   
           setBidResult("loss");
   
       }
   );   
    const resetButton =
        document.getElementById(
            "resetGameButton"
        );

    const cancelReset =
        document.getElementById(
            "cancelReset"
        );

    const confirmReset =
        document.getElementById(
            "confirmReset"
        );

    const soundToggle =
        document.getElementById(
            "soundToggle"
        );

    const bidSlider =
        document.getElementById(
            "bidSlider"
        );

    const decreaseBid =
        document.getElementById(
            "decreaseBid"
        );

    const increaseBid =
        document.getElementById(
            "increaseBid"
        );


    /* Add player */

    addPlayerButton.addEventListener(
        "click",
        addPlayer
    );


    playerInput.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {

                event.preventDefault();

                addPlayer();
            }
        }
    );


    /* Navigation */

    goToBidding.addEventListener(
        "click",
        () => {

            playClickSound();

            showSection("bidding");

        }
    );


    backPlayers.addEventListener(
        "click",
        () => {

            playClickSound();

            showSection("players");

        }
    );


    startScoring.addEventListener(
        "click",
        startScoringRound
    );


    backBidding.addEventListener(
        "click",
        () => {

            playClickSound();

            showSection("bidding");

        }
    );


    saveRound.addEventListener(
        "click",
        saveRoundScores
    );


    /* Bidding slider */

    bidSlider.addEventListener(
        "input",
        event => {

            setBid(
                Number(event.target.value),
                false
            );

        }
    );


    decreaseBid.addEventListener(
        "click",
        () => {

            setBid(
                game.currentBid - 5,
                true
            );

        }
    );


    increaseBid.addEventListener(
        "click",
        () => {

            setBid(
                game.currentBid + 5,
                true
            );

        }
    );


    /* Quick bids */

    document
        .querySelectorAll(".quick-bid")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    setBid(
                        Number(
                            button.dataset.bid
                        ),
                        true
                    );

                }
            );

        });


    /* Reset */

    resetButton.addEventListener(
        "click",
        () => {

            playClickSound();

            openResetModal();

        }
    );


    cancelReset.addEventListener(
        "click",
        closeResetModal
    );


    confirmReset.addEventListener(
        "click",
        resetGame
    );


    /* Sound */

    soundToggle.addEventListener(
        "click",
        toggleSound
    );


    /* Close modal by clicking background */

    document
        .getElementById("resetModal")
        .addEventListener(
            "click",
            event => {

                if (
                    event.target.id ===
                    "resetModal"
                ) {

                    closeResetModal();

                }

            }
        );


    /* Escape closes modal */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                closeResetModal();

            }

        }
    );
}


/* =========================================================
   PLAYERS
========================================================= */

function addPlayer() {

    const input =
        document.getElementById(
            "playerNameInput"
        );

    const name =
        input.value.trim();


    if (!name) {

        showMessage(
            "playerMessage",
            "Please enter a player name.",
            "error"
        );

        input.focus();

        return;
    }


    if (name.length < 2) {

        showMessage(
            "playerMessage",
            "Player name must be at least 2 characters.",
            "error"
        );

        input.focus();

        return;
    }


    const exists =
        game.players.some(
            player =>
                player.name.toLowerCase() ===
                name.toLowerCase()
        );


    if (exists) {

        showMessage(
            "playerMessage",
            "That player has already been added.",
            "error"
        );

        input.focus();

        return;
    }


    if (game.players.length >= 8) {

        showMessage(
            "playerMessage",
            "You can add up to 8 players.",
            "error"
        );

        return;
    }


    const player = {

        id:
            Date.now().toString() +
            Math.random()
                .toString(36)
                .substring(2, 8),

        name: name

    };


    game.players.push(player);

    saveGame();

    input.value = "";

    playAddSound();

    renderPlayers();

    renderBidders();

    renderScoreInputs();

    updateSteps();

    showToast(
        `${name} added to the game.`,
        "✓"
    );

    input.focus();
}


function removePlayer(playerId) {

    if (game.rounds.length > 0) {

        showToast(
            "Players cannot be removed after scoring has started.",
            "!"
        );

        return;
    }


    const player =
        game.players.find(
            p => p.id === playerId
        );


    game.players =
        game.players.filter(
            p => p.id !== playerId
        );


    if (
        game.currentBidderId ===
        playerId
    ) {

        game.currentBidderId =
            null;

    }


    saveGame();

    playClickSound();

    renderPlayers();

    renderBidders();

    renderScoreInputs();

    updateSteps();

    if (player) {

        showToast(
            `${player.name} removed.`,
            "✓"
        );

    }
}


function renderPlayers() {

    const container =
        document.getElementById(
            "playersList"
        );

    const empty =
        document.getElementById(
            "playersEmpty"
        );

    const count =
        document.getElementById(
            "playerCount"
        );

    const continueButton =
        document.getElementById(
            "goToBiddingButton"
        );


    count.textContent =
        game.players.length;


    container.innerHTML = "";


    if (game.players.length === 0) {

        empty.style.display =
            "block";

    } else {

        empty.style.display =
            "none";
    }


    game.players.forEach(
        (player, index) => {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "player-card";


            const avatar =
                document.createElement(
                    "div"
                );

            avatar.className =
                "player-avatar";

            avatar.textContent =
                getInitials(player.name);


            const info =
                document.createElement(
                    "div"
                );

            info.className =
                "player-info";


            const name =
                document.createElement(
                    "strong"
                );

            name.textContent =
                player.name;


            const number =
                document.createElement(
                    "small"
                );

            number.textContent =
                `Player ${index + 1}`;


            info.appendChild(name);

            info.appendChild(number);


            const remove =
                document.createElement(
                    "button"
                );

            remove.className =
                "remove-player";

            remove.type =
                "button";

            remove.title =
                "Remove player";

            remove.textContent =
                "×";


            remove.addEventListener(
                "click",
                () => {

                    removePlayer(
                        player.id
                    );

                }
            );


            card.appendChild(avatar);

            card.appendChild(info);

            card.appendChild(remove);

            container.appendChild(card);

        }
    );


    continueButton.disabled =
        game.players.length < 2;


    if (game.players.length >= 8) {

        document
            .getElementById(
                "playerNameInput"
            )
            .disabled = true;

        document
            .getElementById(
                "addPlayerButton"
            )
            .disabled = true;

    } else {

        document
            .getElementById(
                "playerNameInput"
            )
            .disabled = false;

        document
            .getElementById(
                "addPlayerButton"
            )
            .disabled = false;
    }
}


/* =========================================================
   BIDDING
========================================================= */

function renderBidders() {

    const container =
        document.getElementById(
            "bidderSelection"
        );


    container.innerHTML = "";


    game.players.forEach(
        player => {

            const button =
                document.createElement(
                    "button"
                );

            button.type =
                "button";

            button.className =
                "bidder-option";


            if (
                game.currentBidderId ===
                player.id
            ) {

                button.classList.add(
                    "selected"
                );

            }


            const avatar =
                document.createElement(
                    "span"
                );

            avatar.className =
                "bidder-avatar";

            avatar.textContent =
                getInitials(player.name);


            const name =
                document.createElement(
                    "strong"
                );

            name.textContent =
                player.name;


            const check =
                document.createElement(
                    "span"
                );

            check.className =
                "selected-check";

            check.textContent =
                "✓";


            button.appendChild(avatar);

            button.appendChild(name);

            button.appendChild(check);


            button.addEventListener(
                "click",
                () => {

                    selectBidder(
                        player.id
                    );

                }
            );


            container.appendChild(
                button
            );

        }
    );


    updateBidSummary();
}


function selectBidder(playerId) {

    game.currentBidderId =
        playerId;


    /*
     * A bidder cannot be a partner.
     */
    game.currentPartnerIds =
        game.currentPartnerIds.filter(
            id => id !== playerId
        );


    saveGame();

    playBidSound();

    renderBidders();

    renderPartners();

    updateBidSummary();

    updateRoundInformation();

    updateStartScoringButton();

    updateSaveRoundButton();
}


function setBid(
    value,
    playSound = true
) {

    value =
        Math.max(
            275,
            Math.min(
                500,
                value
            )
        );


    value =
        Math.round(
            value / 5
        ) * 5;


    game.currentBid =
        value;


    const slider =
        document.getElementById(
            "bidSlider"
        );

    slider.value =
        value;


    updateBidDisplay();

    updateBidSummary();

    updateQuickBidButtons();

    saveGame();


    if (playSound) {
        playBidSound();
    }


    updateStartScoringButton();
}


function updateBidDisplay() {

    document
        .getElementById(
            "selectedBid"
        )
        .textContent =
        game.currentBid;


    document
        .getElementById(
            "bidSlider"
        )
        .value =
        game.currentBid;
}


function updateQuickBidButtons() {

    document
        .querySelectorAll(".quick-bid")
        .forEach(button => {

            const amount =
                Number(
                    button.dataset.bid
                );

            button.classList.toggle(
                "active",
                amount ===
                    game.currentBid
            );

        });
}


function updateBidSummary() {

    const bidder =
        game.players.find(
            player =>
                player.id ===
                game.currentBidderId
        );


    document
        .getElementById(
            "summaryBidder"
        )
        .textContent =
        bidder
            ? bidder.name
            : "Not selected";


    document
        .getElementById(
            "summaryBid"
        )
        .textContent =
        game.currentBid;
}


function updateStartScoringButton() {

    const button =
        document.getElementById(
            "startScoringButton"
        );


    button.disabled =
        !game.currentBidderId ||
        game.players.length < 1;
}


/* =========================================================
   START SCORING
========================================================= */

function startScoringRound() {

    if (!game.currentBidderId) {

        showToast(
            "Please select the bidder first.",
            "!"
        );

        return;
    }


    const bidder =
        game.players.find(
            player =>
                player.id ===
                game.currentBidderId
        );


    if (!bidder) {
        return;
    }


    document
        .getElementById(
            "currentRoundNumber"
        )
        .textContent =
        game.rounds.length + 1;


    document
        .getElementById(
            "biddingRoundNumber"
        )
        .textContent =
        game.rounds.length + 1;


    /*
     * The partner and WIN/LOSS selections
     * are carried from the bidding screen
     * into the scoring screen.
     */

    updateRoundInformation();

    renderPartners();

    updateBidResultUI();

    renderScoreInputs();

    updateSaveRoundButton();

    playClickSound();

    showSection("scoring");
}


/* =========================================================
   SCORE INPUTS
========================================================= */

function renderScoreInputs() {

    const container =
        document.getElementById(
            "scoreInputs"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    game.players.forEach(
        player => {

            const row =
                document.createElement(
                    "div"
                );

            row.className =
                "score-input-row";


            const avatar =
                document.createElement(
                    "div"
                );

            avatar.className =
                "score-player-avatar";

            avatar.textContent =
                getInitials(
                    player.name
                );


            const name =
                document.createElement(
                    "div"
                );

            name.className =
                "score-player-name";


            const strong =
                document.createElement(
                    "strong"
                );

            strong.textContent =
                player.name;


            name.appendChild(
                strong
            );


            const input =
                document.createElement(
                    "input"
                );

            input.type =
                "number";

            input.className =
                "score-input";

            input.placeholder =
                "0";

            input.min =
                "-99999";

            input.max =
                "99999";

            input.step =
                "1";

            input.dataset.playerId =
                player.id;

             /*
             * Automatically calculate score
             * when WIN/LOSS exists.
             */
            if (game.currentBidResult) {
            
                const automaticScores =
                    calculateAutomaticScores();
            
                input.value =
                    automaticScores[player.id] ?? 0;
            
                input.disabled =
                    true;
            }
           
            input.setAttribute(
                "aria-label",
                `Score for ${player.name}`
            );


            input.addEventListener(
                "input",
                () => {

                    clearMessage(
                        "scoreMessage"
                    );

                }
            );


            row.appendChild(
                avatar
            );

            row.appendChild(
                name
            );

            row.appendChild(
                input
            );


            container.appendChild(
                row
            );

        }
    );
}

/* =========================================================
   AUTOMATIC SCORE CALCULATION
========================================================= */

function calculateAutomaticScores() {

    const scores = {};


    /*
     * Start every player at zero.
     */
    game.players.forEach(player => {

        scores[player.id] = 0;

    });


    const bidderId =
        game.currentBidderId;

    const partnerIds =
        game.currentPartnerIds;

    const bid =
        Number(game.currentBid);

    const result =
        game.currentBidResult;


    /*
     * We cannot calculate until all
     * required information exists.
     */
    if (
        !bidderId ||
        !bid ||
        !result
    ) {

        return scores;

    }


    /* =====================================================
       WIN
       =====================================================

       Bidder  = +2 × bid
       Partner = +bid
       Others  = 0
    ===================================================== */

    if (result === "win") {

        scores[bidderId] =
            bid * 2;


        partnerIds.forEach(
            partnerId => {

                /*
                 * Safety check:
                 * bidder can never receive
                 * partner points.
                 */
                if (
                    partnerId !==
                    bidderId
                ) {

                    scores[partnerId] =
                        bid;

                }

            }
        );

    }


    /* =====================================================
       LOSS
       =====================================================

       Bidder       = -bid
       Partners     = 0
       Non-partners = +bid
    ===================================================== */

    else if (result === "loss") {

        scores[bidderId] =
            -bid;


        game.players.forEach(
            player => {

                const isBidder =
                    player.id ===
                    bidderId;

                const isPartner =
                    partnerIds.includes(
                        player.id
                    );


                if (
                    !isBidder &&
                    !isPartner
                ) {

                    scores[player.id] =
                        bid;

                }

            }
        );

    }


    return scores;
}

/* =========================================================
   DISPLAY AUTOMATIC SCORES
========================================================= */

function displayAutomaticScores() {

    const scores =
        calculateAutomaticScores();


    document
        .querySelectorAll(
            ".score-input"
        )
        .forEach(input => {

            const playerId =
                input.dataset.playerId;


            input.value =
                scores[playerId] ?? 0;


            /*
             * Automatically calculated scores
             * are locked.
             */
            input.disabled = true;

            input.classList.remove(
                "editing"
            );

        });


    /*
     * Show the score section.
     */
    const scoreSection =
        document.getElementById(
            "scoringSection"
        );


    if (scoreSection) {

        scoreSection.classList.add(
            "scores-calculated"
        );

    }


    updateSaveRoundButton();
}

/* =========================================================
   SAVE ROUND
========================================================= */

function saveRoundScores() {

    if (game.players.length < 2) {

        showScoreError(
            "At least 2 players are required."
        );

        return;
    }


    if (!game.currentBidderId) {

        showScoreError(
            "Please select a bidder."
        );

        showSection("bidding");

        return;
    }


    if (!game.currentBidResult) {

        showScoreError(
            "Please select WIN or LOSS."
        );

        return;
    }


    /*
     * Read the values from the score boxes.
     *
     * These will normally be the automatically
     * calculated scores.
     *
     * If the user used Edit Score, these may
     * contain manually corrected values.
     */
    const inputs =
        document.querySelectorAll(
            ".score-input"
        );


    const scores = {};

    let hasInvalid =
        false;


    inputs.forEach(input => {

        const value =
            input.value.trim();


        if (value === "") {

            hasInvalid = true;

            input.style.borderColor =
                "var(--red)";

            return;

        }


        const number =
            Number(value);


        if (
            !Number.isFinite(number)
        ) {

            hasInvalid = true;

            input.style.borderColor =
                "var(--red)";

            return;

        }


        input.style.borderColor =
            "";


        scores[
            input.dataset.playerId
        ] = number;

    });


    if (hasInvalid) {

        showScoreError(
            "Please make sure every player has a valid score."
        );

        return;
    }


    /*
     * Save the complete round.
     */
    const round = {

        roundNumber:
            game.rounds.length + 1,

        bidderId:
            game.currentBidderId,

        partnerIds:
            [
                ...game.currentPartnerIds
            ],

        bid:
            Number(game.currentBid),

        result:
            game.currentBidResult,

        scores:
            scores,

        timestamp:
            new Date().toISOString()

    };


    /*
     * Add round to history.
     */
    game.rounds.push(
        round
    );


    saveGame();

    playSaveSound();


    /*
     * Show updated scoreboard.
     */
    renderScoreboard();


    showToast(
        `Round ${round.roundNumber} saved successfully!`,
        "✓"
    );


    /*
     * Start fresh round.
     */
    game.currentBidderId =
        null;

    game.currentPartnerIds =
        [];

    game.currentBid =
        275;

    game.currentBidResult =
        null;


    saveGame();


    updateBidDisplay();

    updateBidSummary();

    renderBidders();

    renderPartners();

    updateQuickBidButtons();

    updateStartScoringButton();

    updateSaveRoundButton();

    updateRoundInformation();

    updateBidResultUI();

    renderScoreInputs();


    document
        .getElementById(
            "biddingRoundNumber"
        )
        .textContent =
        game.rounds.length + 1;


    document
        .getElementById(
            "currentRoundNumber"
        )
        .textContent =
        game.rounds.length + 1;


    setTimeout(
        () => {

            showSection(
                "bidding"
            );

        },
        350
    );
}

function updateSaveRoundButton() {

    const button =
        document.getElementById(
            "saveRoundButton"
        );


    if (!button) {
        return;
    }


    function updateSaveRoundButton() {

       const button =
           document.getElementById(
               "saveRoundButton"
           );
   
   
       if (!button) {
           return;
       }
   
   
       button.disabled =
           !game.currentBidderId ||
           !game.currentBidResult;
   }
}

/* =========================================================
   EDIT SCORE
========================================================= */

function enableScoreEditing() {

    document
        .querySelectorAll(
            ".score-input"
        )
        .forEach(input => {

            input.disabled = false;

            input.classList.add(
                "editing"
            );

        });


    showToast(
        "✏️ Scores unlocked. You can edit them now.",
        "✏️"
    );
}

const editScoreButton =
    document.getElementById(
        "editScoreButton"
    );

if (editScoreButton) {

    editScoreButton.addEventListener(
        "click",
        enableScoreEditing
    );

}

/* =========================================================
   SCOREBOARD
========================================================= */

function renderScoreboard() {

    const header =
        document.getElementById(
            "scoreTableHeader"
        );

    const body =
        document.getElementById(
            "scoreTableBody"
        );

    const empty =
        document.getElementById(
            "scoreboardEmpty"
        );

    const totalRounds =
        document.getElementById(
            "totalRounds"
        );


    if (
        !header ||
        !body
    ) {

        return;
    }


    header.innerHTML = "";

    body.innerHTML = "";


    const roundHeader =
        document.createElement(
            "th"
        );

    roundHeader.textContent =
        "Round";


    header.appendChild(
        roundHeader
    );


    game.players.forEach(
        player => {

            const th =
                document.createElement(
                    "th"
                );

            th.textContent =
                player.name;

            header.appendChild(th);

        }
    );


    totalRounds.textContent =
        game.rounds.length;


    if (game.rounds.length === 0) {

        empty.style.display =
            "block";

        return;

    }


    empty.style.display =
        "none";


    /* Round rows */

    game.rounds.forEach(
        round => {

            const tr =
                document.createElement(
                    "tr"
                );


            const roundCell =
                document.createElement(
                    "td"
                );

            roundCell.className =
                "round-cell";

            roundCell.textContent =
                `Round ${round.roundNumber}`;


            tr.appendChild(
                roundCell
            );


            game.players.forEach(
                player => {

                    const td =
                        document.createElement(
                            "td"
                        );

                    td.className =
                        "score-cell";


                    const score =
                        round.scores[
                            player.id
                        ];


                    td.textContent =
                        formatScore(
                            score
                        );


                    tr.appendChild(
                        td
                    );

                }
            );


            body.appendChild(tr);

        }
    );


    /* Total row */

    const totalRow =
        document.createElement(
            "tr"
        );


    totalRow.className =
        "total-row";


    const totalLabel =
        document.createElement(
            "td"
        );

    totalLabel.textContent =
        "TOTAL";


    totalRow.appendChild(
        totalLabel
    );


    game.players.forEach(
        player => {

            const td =
                document.createElement(
                    "td"
                );


            const total =
                calculatePlayerTotal(
                    player.id
                );


            td.textContent =
                formatScore(total);


            totalRow.appendChild(
                td
            );

        }
    );


    body.appendChild(
        totalRow
    );
}


function calculatePlayerTotal(
    playerId
) {

    return game.rounds.reduce(
        (total, round) => {

            const score =
                Number(
                    round.scores[
                        playerId
                    ]
                );


            return total +
                (
                    Number.isFinite(score)
                        ? score
                        : 0
                );

        },
        0
    );
}


function formatScore(score) {

    score =
        Number(score) || 0;


    return score > 0
        ? `+${score}`
        : String(score);
}


/* =========================================================
   NAVIGATION
========================================================= */

function showSection(section) {

    const sections = {

        players:
            document.getElementById(
                "playersSection"
            ),

        bidding:
            document.getElementById(
                "biddingSection"
            ),

        scoring:
            document.getElementById(
                "scoringSection"
            )

    };


    Object.values(sections)
        .forEach(
            element => {

                element.classList.remove(
                    "active-section"
                );

            }
        );


    if (sections[section]) {

        sections[section]
            .classList.add(
                "active-section"
            );

    }


    updateSteps();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


function getCurrentSection() {

    if (
        document
            .getElementById(
                "playersSection"
            )
            .classList.contains(
                "active-section"
            )
    ) {

        return "players";

    }


    if (
        document
            .getElementById(
                "biddingSection"
            )
            .classList.contains(
                "active-section"
            )
    ) {

        return "bidding";

    }


    return "scoring";
}


function updateSteps() {

    const current =
        getCurrentSection();


    const order = [
        "players",
        "bidding",
        "scoring"
    ];


    const currentIndex =
        order.indexOf(current);


    document
        .querySelectorAll(
            ".step"
        )
        .forEach(
            step => {

                const stepName =
                    step.dataset.step;

                const index =
                    order.indexOf(
                        stepName
                    );


                step.classList.remove(
                    "active",
                    "completed"
                );


                if (
                    index ===
                    currentIndex
                ) {

                    step.classList.add(
                        "active"
                    );

                } else if (
                    index <
                    currentIndex
                ) {

                    step.classList.add(
                        "completed"
                    );

                }

            }
        );
}


/* =========================================================
   RESET
========================================================= */

function openResetModal() {

    document
        .getElementById(
            "resetModal"
        )
        .classList.add(
            "show"
        );
}


function closeResetModal() {

    document
        .getElementById(
            "resetModal"
        )
        .classList.remove(
            "show"
        );
}


function resetGame() {

      game = {
   
       players: [],
   
       rounds: [],
   
       currentBidderId: null,
   
       currentPartnerIds: [],
   
       currentBid: 275,
   
       currentBidResult: null,
   
       soundEnabled:
           game.soundEnabled
   
   };

    };


    localStorage.removeItem(
        STORAGE_KEY
    );


    saveGame();


    closeResetModal();

    playResetSound();


    renderPlayers();

    renderBidders();

    renderScoreInputs();

    renderScoreboard();

    updateBidDisplay();

    updateBidSummary();

    updateQuickBidButtons();

    updateStartScoringButton();

    updateSteps();


    document
        .getElementById(
            "biddingRoundNumber"
        )
        .textContent = "1";


    document
        .getElementById(
            "currentRoundNumber"
        )
        .textContent = "1";


    document
        .getElementById(
            "currentBidder"
        )
        .textContent = "-";


    document
        .getElementById(
            "currentBid"
        )
        .textContent = "-";


    clearMessage(
        "playerMessage"
    );


    clearMessage(
        "scoreMessage"
    );


    showSection(
        "players"
    );


    showToast(
        "Game has been completely reset.",
        "✓"
    );
}


/* =========================================================
   SOUND
========================================================= */

function toggleSound() {

    game.soundEnabled =
        !game.soundEnabled;


    saveGame();

    updateSoundButton();


    if (game.soundEnabled) {

        playClickSound();

        showToast(
            "Sound enabled.",
            "🔊"
        );

    } else {

        showToast(
            "Sound muted.",
            "🔇"
        );

    }
}


function updateSoundButton() {

    const button =
        document.getElementById(
            "soundToggle"
        );


    if (!button) {
        return;
    }


    button.textContent =
        game.soundEnabled
            ? "🔊"
            : "🔇";


    button.title =
        game.soundEnabled
            ? "Mute sound"
            : "Enable sound";
}


/* =========================================================
   MESSAGES / TOASTS
========================================================= */

function showMessage(
    elementId,
    message,
    type = ""
) {

    const element =
        document.getElementById(
            elementId
        );


    if (!element) {
        return;
    }


    element.textContent =
        message;


    element.className =
        `message ${type}`;


    clearTimeout(
        element._messageTimer
    );


    element._messageTimer =
        setTimeout(
            () => {

                element.textContent =
                    "";

                element.className =
                    "message";

            },
            4000
        );
}


function clearMessage(
    elementId
) {

    const element =
        document.getElementById(
            elementId
        );


    if (!element) {
        return;
    }


    element.textContent =
        "";

    element.className =
        "message";
}


function showScoreError(
    message
) {

    showMessage(
        "scoreMessage",
        message,
        "error"
    );


    playTone(
        250,
        0.15,
        "square",
        0.025
    );
}


let toastTimer = null;


function showToast(
    message,
    icon = "✓"
) {

    const toast =
        document.getElementById(
            "toast"
        );

    const toastMessage =
        document.getElementById(
            "toastMessage"
        );

    const toastIcon =
        document.getElementById(
            "toastIcon"
        );


    toastMessage.textContent =
        message;

    toastIcon.textContent =
        icon;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            3000
        );
}


/* =========================================================
   HELPERS
========================================================= */

function getInitials(name) {

    const parts =
        name
            .trim()
            .split(/\s+/)
            .filter(Boolean);


    if (parts.length === 1) {

        return parts[0]
            .substring(0, 2)
            .toUpperCase();

    }


    return (
        parts[0][0] +
        parts[parts.length - 1][0]
    ).toUpperCase();
}

/* =========================================================
   PARTNER SELECTION
========================================================= */

function renderPartners() {

    const container =
        document.getElementById(
            "partnerSelection"
        );

    if (!container) {
        return;
    }

    container.innerHTML = "";


    game.players.forEach(player => {

        const isBidder =
            player.id ===
            game.currentBidderId;

        const isSelectedPartner =
            game.currentPartnerIds.includes(
                player.id
            );


        const button =
            document.createElement("button");

        button.type = "button";

        button.className =
            "partner-card";


        /*
         * Highlight every selected partner.
         */
        if (isSelectedPartner) {

            button.classList.add(
                "selected"
            );

        }


        /*
         * Bidder cannot be selected as partner.
         */
        if (isBidder) {

            button.classList.add(
                "disabled"
            );

            button.disabled = true;

        }


        const avatar =
            document.createElement("span");

        avatar.className =
            "partner-avatar";

        avatar.textContent =
            getInitials(player.name);


        const name =
            document.createElement("span");

        name.className =
            "partner-name";

        name.textContent =
            isBidder
                ? `${player.name} (Bidder)`
                : player.name;


        const check =
            document.createElement("span");

        check.className =
            "partner-check";

        check.textContent =
            "✓";


        button.appendChild(avatar);

        button.appendChild(name);

        button.appendChild(check);


        if (!isBidder) {

            button.addEventListener(
                "click",
                () => {

                    selectPartner(
                        player.id
                    );

                }
            );

        }


        container.appendChild(button);

    });


    updatePartnerInfo();
}


function selectPartner(playerId) {

    /*
     * Bidder cannot be a partner.
     */
    if (
        playerId ===
        game.currentBidderId
    ) {
        return;
    }


    /*
     * If already selected,
     * remove the player.
     */
    if (
        game.currentPartnerIds.includes(
            playerId
        )
    ) {

        game.currentPartnerIds =
            game.currentPartnerIds.filter(
                id => id !== playerId
            );

        playClickSound();

        showToast(
            "Partner removed.",
            "−"
        );

    }

    /*
     * Otherwise add the player.
     */
    else {

        game.currentPartnerIds.push(
            playerId
        );

        playAddSound();

        showToast(
            "Partner selected.",
            "🤝"
        );

    }


    saveGame();

    renderPartners();

    updateRoundInformation();

    updateBidResultUI();

    updateSaveRoundButton();
}


function updatePartnerInfo() {

    const element =
        document.getElementById(
            "currentPartner"
        );

    if (!element) {
        return;
    }


    const partners =
        game.players.filter(
            player =>
                game.currentPartnerIds.includes(
                    player.id
                )
        );


    if (partners.length === 0) {

        element.textContent =
            "None";

        return;

    }


    element.textContent =
        partners
            .map(player => player.name)
            .join(" + ");
}

/* =========================================================
   BID RESULT
========================================================= */

function setBidResult(result) {

    if (
        result !== "win" &&
        result !== "loss"
    ) {

        return;
    }


    /*
     * Bidder is required.
     */
    if (!game.currentBidderId) {

        showToast(
            "Please select a bidder first.",
            "!"
        );

        return;
    }


    /*
     * Bid is required.
     */
    if (!game.currentBid) {

        showToast(
            "Please select a bid first.",
            "!"
        );

        return;
    }


    /*
     * Save WIN / LOSS.
     */
    game.currentBidResult =
        result;


    /*
     * Save current state.
     */
    saveGame();


    /*
     * Update WIN / LOSS buttons.
     */
    updateBidResultUI();


    /*
     * Update round information.
     */
    updateRoundInformation();


    /*
     * Play appropriate sound.
     */
    if (result === "win") {

        playSaveSound();

    } else {

        playTone(
            300,
            0.15,
            "triangle",
            0.035
        );

    }


    /*
     * THIS IS THE IMPORTANT PART:
     *
     * Automatically calculate and
     * display the scores.
     */
    displayAutomaticScores();


    if (result === "win") {

        showToast(
            "🏆 WIN — scores calculated automatically.",
            "✓"
        );

    } else {

        showToast(
            "❌ LOSS — scores calculated automatically.",
            "✓"
        );

    }
}


function updateBidResultUI() {

    const winButton =
        document.getElementById(
            "bidWinButton"
        );

    const lossButton =
        document.getElementById(
            "bidLossButton"
        );

    const resultText =
        document.getElementById(
            "currentBidResult"
        );


    if (!winButton || !lossButton) {
        return;
    }


    winButton.classList.toggle(
        "selected",
        game.currentBidResult === "win"
    );


    lossButton.classList.toggle(
        "selected",
        game.currentBidResult === "loss"
    );


    if (!resultText) {
        return;
    }


    resultText.classList.remove(
        "result-pending",
        "result-win",
        "result-loss"
    );


    if (
        game.currentBidResult ===
        "win"
    ) {

        resultText.textContent =
            "WIN";

        resultText.classList.add(
            "result-win"
        );

    } else if (
        game.currentBidResult ===
        "loss"
    ) {

        resultText.textContent =
            "LOSS";

        resultText.classList.add(
            "result-loss"
        );

    } else {

        resultText.textContent =
            "Not selected";

        resultText.classList.add(
            "result-pending"
        );
    }
}

/* =========================================================
   ROUND INFORMATION
========================================================= */

function updateRoundInformation() {

    const bidder =
        game.players.find(
            player =>
                player.id ===
                game.currentBidderId
        );


    const partners =
        game.players.filter(
            player =>
                game.currentPartnerIds.includes(
                    player.id
                )
        );


    const bidderElement =
        document.getElementById(
            "currentBidder"
        );


    const partnerElement =
        document.getElementById(
            "currentPartner"
        );


    const bidElement =
        document.getElementById(
            "currentBid"
        );


    if (bidderElement) {

        bidderElement.textContent =
            bidder
                ? bidder.name
                : "-";

    }


    if (partnerElement) {

        partnerElement.textContent =
            partners.length > 0
                ? partners
                    .map(player => player.name)
                    .join(" + ")
                : "None";

    }


    if (bidElement) {

        bidElement.textContent =
            game.currentBid;

    }


    updateBidResultUI();
}
