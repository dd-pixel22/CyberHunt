document.getElementById('enter-btn').addEventListener('click', () => {
    document.getElementById('intro-screen').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    generateDashboardMap();
});

function generateDashboardMap() {
    const grid = document.getElementById('building-grid');
    grid.innerHTML = '';

    for (let b = 1; b <= 5; b++) {
        const bldgCard = document.createElement('div');
        bldgCard.className = 'building-card';
        bldgCard.innerHTML = `<h3>BUILDING 0${b}</h3>`;

        for (let r = 1; r <= 3; r++) {
            const roomBtn = document.createElement('div');
            roomBtn.className = 'room-btn';
            roomBtn.innerText = `Escape Room ${b}.${r}`;
            roomBtn.onclick = () => startMission(b, r);
            bldgCard.appendChild(roomBtn);
        }
        grid.appendChild(bldgCard);
    }
}

function startMission(building, room) {
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('game-ui').classList.remove('hidden');
    document.getElementById('current-mission').innerText = `MISSION: BLDG ${building} // ROOM ${room}`;
    
    // Initialize Three.js Engine
    init3DArena();
}

function triggerClue(text, digit, index) {
    gatheredDigits[index] = digit;
    document.getElementById('code-digits').innerText = gatheredDigits.join(' ');
    
    document.getElementById('clue-title').innerText = "DATA INTERCEPTED";
    document.getElementById('clue-body').innerText = text;
    document.getElementById('clue-panel').classList.remove('hidden');
}

function closeClue() {
    document.getElementById('clue-panel').classList.add('hidden');
}

/* Keypad Logic */
function openKeypad() {
    document.getElementById('keypad-panel').classList.remove('hidden');
}

function closeKeypad() {
    document.getElementById('keypad-panel').classList.add('hidden');
}

function pressKey(num) {
    const input = document.getElementById('keypad-input');
    if (input.value.length < 4) input.value += num;
}

function clearKeypad() {
    document.getElementById('keypad-input').value = '';
}

function submitKeypad() {
    const input = document.getElementById('keypad-input').value;
    if (input === passcodeTarget) {
        alert("PASSCODE VERIFIED // ESCAPE SUCCESSFUL!");
        closeKeypad();
        // Return to Dashboard & Highlight Neon Badge
        document.getElementById('game-ui').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
        document.getElementById('b1').classList.add('active'); // Example badge reward
    } else {
        alert("ACCESS DENIED // INCORRECT PASSCODE");
        clearKeypad();
    }
}
