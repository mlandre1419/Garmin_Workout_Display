// ============================================================
// Garmin Workout Display
// Version de base - moteur d'entraînement
// ============================================================

// ------------------------------------------------------------
// ÉLÉMENTS HTML
// ------------------------------------------------------------

const workoutNameEl = document.getElementById("workoutName");
const stepNumberEl = document.getElementById("stepNumber");
const stepTypeEl = document.getElementById("stepType");
const speedEl = document.getElementById("speed");
const paceEl = document.getElementById("pace");
const timerEl = document.getElementById("timer");
const totalTimerEl = document.getElementById("totalTimer");
const progressBarEl = document.getElementById("progressBar");
const progressTextEl = document.getElementById("progressText");
const nextStepEl = document.getElementById("nextStep");

const fileInput = document.getElementById("fileInput");
const fitFileInput = document.getElementById("fitFileInput");

const garminImportButton = document.getElementById("garminImportButton");
const treadmillButton = document.getElementById("treadmillButton");
const startButton = document.getElementById("startButton");
const pauseButton = document.getElementById("pauseButton");
const fullscreenButton = document.getElementById("fullscreenButton");
const resetButton = document.getElementById("resetButton");


// ------------------------------------------------------------
// SÉANCE DE TEST
// ------------------------------------------------------------

const testWorkout = {
    name: "Garmin Coach - Séance de test",

    steps: [

        {
            type: "ÉCHAUFFEMENT",
            duration: 5 * 60,
            speed: 7.0
        },

        {
            type: "COURSE",
            duration: 5 * 60,
            speed: 9.0
        },

        {
            type: "RÉCUPÉRATION",
            duration: 2 * 60,
            speed: 6.5
        },

        {
            type: "COURSE",
            duration: 5 * 60,
            speed: 10.0
        },

        {
            type: "RÉCUPÉRATION",
            duration: 2 * 60,
            speed: 6.5
        },

        {
            type: "RETOUR AU CALME",
            duration: 5 * 60,
            speed: 6.0
        }

    ]
};


// ------------------------------------------------------------
// VARIABLES
// ------------------------------------------------------------

let workout = testWorkout;

let currentStep = 0;

let remainingStepTime = 0;

let totalWorkoutTime = 0;

let remainingWorkoutTime = 0;

let timerInterval = null;

let running = false;

let treadmillMode = false;


// ------------------------------------------------------------
// OUTILS
// ------------------------------------------------------------

function formatTime(seconds) {

    seconds = Math.max(0, Math.round(seconds));

    const minutes = Math.floor(seconds / 60);

    const secs = seconds % 60;

    return (
        String(minutes).padStart(2, "0") +
        ":" +
        String(secs).padStart(2, "0")
    );
}


function speedToPace(speed) {

    if (!speed || speed <= 0) {
        return "--";
    }

    const totalMinutes = 60 / speed;

    const minutes = Math.floor(totalMinutes);

    const seconds = Math.round(
        (totalMinutes - minutes) * 60
    );

    if (seconds >= 60) {
        return `${minutes + 1}:00`;
    }

    return (
        `${minutes}:` +
        `${String(seconds).padStart(2, "0")}`
    );
}


function calculateWorkoutDuration() {

    return workout.steps.reduce(
        (total, step) => total + step.duration,
        0
    );
}


// ------------------------------------------------------------
// AFFICHAGE
// ------------------------------------------------------------

function updateDisplay() {

    if (!workout || !workout.steps.length) {
        return;
    }

    const step = workout.steps[currentStep];

    const nextStep =
        workout.steps[currentStep + 1];


    workoutNameEl.textContent =
        workout.name;


    stepNumberEl.textContent =
        `Étape ${currentStep + 1} / ${workout.steps.length}`;


    stepTypeEl.textContent =
        step.type;


    if (step.speed) {

        speedEl.textContent =
            `${step.speed.toFixed(1)} km/h`;

        paceEl.textContent =
            `${speedToPace(step.speed)} min/km`;

    } else {

        speedEl.textContent =
            "-- km/h";

        paceEl.textContent =
            "-- min/km";
    }


    timerEl.textContent =
        formatTime(remainingStepTime);


    totalTimerEl.textContent =
        `Séance restante : ${formatTime(remainingWorkoutTime)}`;


    const elapsed =
        totalWorkoutTime - remainingWorkoutTime;


    const progress =
        totalWorkoutTime > 0
            ? (elapsed / totalWorkoutTime) * 100
            : 0;


    progressBarEl.style.width =
        `${Math.min(100, Math.max(0, progress))}%`;


    progressTextEl.textContent =
        `${Math.round(progress)} %`;


    if (nextStep) {

        let nextText =
            nextStep.type;


        if (nextStep.speed) {

            nextText +=
                ` — ${nextStep.speed.toFixed(1)} km/h`;
        }


        nextStepEl.textContent =
            nextText;

    } else {

        nextStepEl.textContent =
            "FIN DE LA SÉANCE";
    }
}


// ------------------------------------------------------------
// CHARGEMENT D'UNE SÉANCE
// ------------------------------------------------------------

function loadWorkout(newWorkout) {

    if (
        !newWorkout ||
        !Array.isArray(newWorkout.steps) ||
        newWorkout.steps.length === 0
    ) {

        alert(
            "Le fichier ne contient pas de séance valide."
        );

        return;
    }


    stopTimer();


    workout = newWorkout;

    currentStep = 0;


    totalWorkoutTime =
        calculateWorkoutDuration();


    remainingWorkoutTime =
        totalWorkoutTime;


    remainingStepTime =
        workout.steps[0].duration;


    updateDisplay();
}


// ------------------------------------------------------------
// DÉMARRER
// ------------------------------------------------------------

function startWorkout() {

    if (running) {
        return;
    }


    if (!workout || !workout.steps.length) {
        return;
    }


    running = true;


    timerInterval =
        setInterval(() => {

            tick();

        }, 1000);
}


// ------------------------------------------------------------
// TICK
// ------------------------------------------------------------

function tick() {

    if (!running) {
        return;
    }


    remainingStepTime--;

    remainingWorkoutTime--;


    if (remainingStepTime <= 0) {

        goToNextStep();

        return;
    }


    if (remainingWorkoutTime <= 0) {

        finishWorkout();

        return;
    }


    updateDisplay();
}


// ------------------------------------------------------------
// ÉTAPE SUIVANTE
// ------------------------------------------------------------

function goToNextStep() {

    if (
        currentStep >=
        workout.steps.length - 1
    ) {

        finishWorkout();

        return;
    }


    currentStep++;


    remainingStepTime =
        workout.steps[currentStep].duration;


    updateDisplay();

    beep();
}


// ------------------------------------------------------------
// FIN
// ------------------------------------------------------------

function finishWorkout() {

    stopTimer();


    remainingStepTime = 0;

    remainingWorkoutTime = 0;


    stepTypeEl.textContent =
        "SÉANCE TERMINÉE";


    speedEl.textContent =
        "-- km/h";


    paceEl.textContent =
        "-- min/km";


    timerEl.textContent =
        "00:00";


    nextStepEl.textContent =
        "BRAVO !";


    progressBarEl.style.width =
        "100%";


    progressTextEl.textContent =
        "100 %";


    beep();
}


// ------------------------------------------------------------
// PAUSE
// ------------------------------------------------------------

function pauseWorkout() {

    running = false;

    stopTimer();
}


function stopTimer() {

    if (timerInterval !== null) {

        clearInterval(timerInterval);

        timerInterval = null;
    }
}


// ------------------------------------------------------------
// RESET
// ------------------------------------------------------------

function resetWorkout() {

    stopTimer();

    running = false;

    currentStep = 0;

    totalWorkoutTime =
        calculateWorkoutDuration();

    remainingWorkoutTime =
        totalWorkoutTime;

    remainingStepTime =
        workout.steps[0].duration;

    updateDisplay();
}


// ------------------------------------------------------------
// MODE TAPIS
// ------------------------------------------------------------

function toggleTreadmillMode() {

    treadmillMode =
        !treadmillMode;


    if (treadmillMode) {

        treadmillButton.textContent =
            "🏃 ON";

        document.body.dataset.treadmill =
            "true";

    } else {

        treadmillButton.textContent =
            "🏃";

        delete document.body.dataset.treadmill;
    }
}


// ------------------------------------------------------------
// PLEIN ÉCRAN
// ------------------------------------------------------------

async function toggleFullscreen() {

    try {

        if (!document.fullscreenElement) {

            await document.documentElement.requestFullscreen();

        } else {

            await document.exitFullscreen();
        }

    } catch (error) {

        console.log(
            "Plein écran non disponible :",
            error
        );
    }
}


// ------------------------------------------------------------
// SON
// ------------------------------------------------------------

function beep() {

    try {

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;


        if (!AudioContext) {
            return;
        }


        const audioContext =
            new AudioContext();


        const oscillator =
            audioContext.createOscillator();


        const gain =
            audioContext.createGain();


        oscillator.frequency.value =
            880;


        oscillator.type =
            "sine";


        gain.gain.value =
            0.15;


        oscillator.connect(gain);

        gain.connect(audioContext.destination);


        oscillator.start();


        oscillator.stop(
            audioContext.currentTime + 0.2
        );

    } catch (error) {

        console.log(
            "Audio non disponible"
        );
    }
}


// ------------------------------------------------------------
// IMPORT JSON
// ------------------------------------------------------------

fileInput.addEventListener(
    "change",
    async (event) => {

        const file =
            event.target.files[0];


        if (!file) {
            return;
        }


        try {

            const text =
                await file.text();


            const data =
                JSON.parse(text);


            loadWorkout(data);

        } catch (error) {

            console.error(error);

            alert(
                "Impossible de lire le fichier JSON."
            );
        }


        fileInput.value = "";
    }
);


// ------------------------------------------------------------
// BOUTON GARMIN COACH
// ------------------------------------------------------------

garminImportButton.addEventListener(
    "click",
    () => {

        fitFileInput.click();

    }
);


// ------------------------------------------------------------
// IMPORT FIT
// ------------------------------------------------------------

fitFileInput.addEventListener(
    "change",
    async (event) => {

        const file =
            event.target.files[0];


        if (!file) {
            return;
        }


        /*
         * Pour l'instant, nous ne décodons pas encore
         * le fichier FIT.
         *
         * Cette partie sera développée ensuite.
         */

        alert(
            "Le fichier FIT a été sélectionné.\n\n" +
            "Le décodage Garmin FIT sera ajouté " +
            "dans la prochaine étape du projet."
        );


        fitFileInput.value = "";
    }
);


// ------------------------------------------------------------
// BOUTONS
// ------------------------------------------------------------

startButton.addEventListener(
    "click",
    startWorkout
);


pauseButton.addEventListener(
    "click",
    pauseWorkout
);


resetButton.addEventListener(
    "click",
    resetWorkout
);


treadmillButton.addEventListener(
    "click",
    toggleTreadmillMode
);


fullscreenButton.addEventListener(
    "click",
    toggleFullscreen
);


// ------------------------------------------------------------
// INITIALISATION
// ------------------------------------------------------------

function init() {

    totalWorkoutTime =
        calculateWorkoutDuration();


    remainingWorkoutTime =
        totalWorkoutTime;


    remainingStepTime =
        workout.steps[0].duration;


    updateDisplay();
}


init();
