// // Function to generate randomized blanks for a given word
// const generateRandomizedBlanks = (word) => {
//   // Split the word into characters
//   const characters = word.split("");

//   // Track if at least one letter has been replaced with a blank
//   let blankAdded = false;

//   // Iterate through each character
//   for (let i = 0; i < characters.length; i++) {
//     // Check if the character is not whitespace
//     if (characters[i].trim() !== "") {
//       // Generate a random number between 0 and 1
//       const random = Math.random();
//       // Replace the character with a blank with a probability of 0.5
//       if (random < 0.35) {
//         characters[i] = "_";
//         blankAdded = true; // Mark that a blank has been added
//       }
//     }

//     if (i === characters.length - 1 && !blankAdded) {
//       // If no blanks have been added, add a blank at the end
//       characters[characters.length / 2] = "_";
//     }
//   }

//   // Join the characters back into a string
//   return characters.join("");
// };

// export { generateRandomizedBlanks }; // Exporting the function

// Function to generate randomized blanks for a given word
const generateRandomizedBlanks = (word, wordWithBlanks, initial) => {
  // Split the word into characters
  const characters = initial ? word.split("") : wordWithBlanks.split("");
  let newBlankAdded = false;

  //if initial word
  if (initial)
    for (let i = 0; i < characters.length; i++) {
      // Check if the character is not whitespace
      if (characters[i].trim() !== "") {
        characters[i] = "_";
      }
    }
  else {
    while (!newBlankAdded) {
      const random = Math.trunc(Math.random() * (word.length - 0) + 0);

      // console.log("RANDOMMMMMMMMM", random);

      if (characters[random].trim() !== "" && characters[random] == "_") {
        characters[random] = word[random];
        newBlankAdded = true; // Mark that a blank has been added
      }
    }
  }

  // Join the characters back into a string
  return characters.join("");
};

export { generateRandomizedBlanks }; // Exporting the function
