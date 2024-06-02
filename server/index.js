import { generateRandomizedBlanks } from "./WordGenerator.js";
import WordDatabase from "./WordDatabase.js";
import { server as webSocketServer } from "websocket";
import { createServer } from "http";
const websSocketServerPort = 8000;
const server = createServer();
const connections = {};
const generateId = () => "id" + Math.random().toString(16).slice(2);
let currentWordIndex = Math.floor(Math.random() * WordDatabase.length);
let currentWord = "";
let countdown = -1;
let roundTimer = 0;
let roundInterval;
let newRoundInterval;

server.listen(websSocketServerPort);
console.log("Server is listening on port", websSocketServerPort);

const wsServer = new webSocketServer({
  httpServer: server,
});

let roundStatus = "in progress"; // Initial game state
let roundWinner = "";

let musicState = {
  isPlaying: true,
  currentTime: 0,
  timestamp: Date.now(),
};

// Mutex lock for intervals
let intervalLock = false;

// Function to broadcast music state to all clients
const broadcastMusicState = () => {
  for (let key in connections) {
    connections[key].sendUTF(
      JSON.stringify({ type: "musicState", musicState })
    );
  }
};

// Periodically update the current time and broadcast it to all clients
setInterval(() => {
  if (musicState.isPlaying) {
    const now = Date.now();
    const elapsed = (now - musicState.timestamp) / 1000;
    musicState.currentTime += elapsed;
    musicState.timestamp = now;
    broadcastMusicState();
  }
}, 5000); // Broadcast every 5 seconds

// Function to broadcast the current word and its randomized blanks to all clients
const broadcastCurrentWord = () => {
  if (currentWord === "") {
    currentWord = WordDatabase[currentWordIndex].word;
    currentWord = generateRandomizedBlanks(
      WordDatabase[currentWordIndex].word,
      currentWord,
      true
    );

    roundInterval && clearInterval(roundInterval);
    newRoundInterval && clearInterval(newRoundInterval);
    roundTimer = 0;

    roundInterval = setInterval(() => {
      if (roundTimer >= WordDatabase[currentWordIndex].word.length * 5) {
        roundStatus = "no winner";
        revealWord();
        updateRoundStatus(roundStatus);
        startNewRound();
      } else if (roundTimer % 5 === 0 && roundTimer !== 0) {
        broadcastCurrentWord(currentWord);
      }
      roundTimer += 1;
    }, 1000);
  } else {
    currentWord = generateRandomizedBlanks(
      WordDatabase[currentWordIndex].word,
      currentWord,
      false
    );
  }

  for (let key in connections) {
    connections[key].sendUTF(
      JSON.stringify({
        type: "currentWord",
        word: currentWord,
        clue: WordDatabase[currentWordIndex].clue,
      })
    );
  }
};

// Function to check the answer and broadcast the result to all clients
const checkAnswer = (answer, userName) => {
  if (
    answer.toLowerCase() === WordDatabase[currentWordIndex].word.toLowerCase()
  ) {
    roundStatus = "correct";
    roundWinner = userName;
    updateRoundStatus(roundStatus, roundWinner);
    revealWord();
    startNewRound();
  }
};

// Function to broadcast the round status to all clients
const updateRoundStatus = (rs, w) => {
  for (let key in connections) {
    connections[key].sendUTF(
      JSON.stringify({
        type: "updateRoundStatus",
        roundStatus: rs,
        roundWinner: w,
      })
    );
  }
};

// Function to start a new round
const startNewRound = () => {
  if (intervalLock) return; // Ensure only one round start
  intervalLock = true;

  console.log("Starting new round...");
  currentWordIndex = Math.floor(Math.random() * WordDatabase.length); //figure out how not to duplicate!!!!!!
  roundInterval && clearInterval(roundInterval);
  newRoundInterval && clearInterval(newRoundInterval);
  currentWord = ""; //NEW "BLANKS ALGO" CODE
  countdown = 6;

  newRoundInterval = setInterval(() => {
    console.log("Countdown is", countdown);
    countdown -= 1;
    if (countdown === 0) {
      console.log("Countdown is 0");
      countdown = -1;
      clearInterval(newRoundInterval);
      currentWordIndex = Math.floor(Math.random() * WordDatabase.length); //figure out how not to duplicate!!!!!!
      roundStatus = "in progress";
      roundWinner = "";

      for (let key in connections) {
        connections[key].sendUTF(
          JSON.stringify({
            type: "countdown",
            countdown,
          })
        );
      }

      updateRoundStatus(roundStatus, roundWinner);
      broadcastCurrentWord();
      intervalLock = false; // Release lock after starting new round
    } else {
      //broadcast the countdown while > 0 to all clients
      for (let key in connections) {
        connections[key].sendUTF(
          JSON.stringify({
            type: "countdown",
            countdown,
          })
        );
      }
    }
  }, 1000);
};

const revealWord = () => {
  roundInterval && clearInterval(roundInterval);
  for (let key in connections) {
    connections[key].sendUTF(
      JSON.stringify({
        type: "currentWord",
        word: WordDatabase[currentWordIndex].word,
        clue: WordDatabase[currentWordIndex].clue,
      })
    );
  }
};

wsServer.on("request", function (request) {
  const id = generateId();
  const connection = request.accept(null, request.origin);
  connections[id] = connection;

  const confirmationTimeout = setInterval(() => {
    connection.sendUTF(JSON.stringify({ type: "connectionConfirmation" }));
  }, 1000); // Timeout duration in milliseconds (adjust as needed)

  connection.on("message", function (message) {
    console.log("message: " + message.utf8Data);

    const data = JSON.parse(message.utf8Data);

    if (data.type === "connectionAcknowledgement") {
      // Cancel the confirmation timeout
      clearTimeout(confirmationTimeout);

      // Once the client acknowledges, broadcast the current word
      broadcastCurrentWord();
    } else if (data.type === "check") {
      checkAnswer(data.message, data.user);
    } else if (data.type === "message") {
      // Broadcast the chat message to all clients
      for (let key in connections) {
        connections[key].sendUTF(message.utf8Data);
      }
    }
  });

  connection.on("close", function (reasonCode, description) {
    console.log(
      new Date() + " Peer " + connection.remoteAddress + " disconnected."
    );
    delete connections[id];
  });
});
