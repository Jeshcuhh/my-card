const activateButton = document.querySelector(".activate-button");
const tradingCard = document.querySelector(".trading-card");
const pageNote = document.querySelector(".page-note");
const buttonLabel = document.querySelector(".button-label");
const cardFront = document.querySelector(".card-front");
const cardBack = document.querySelector(".card-back");
const flipButton = document.querySelector(".flip-button");
const flipLabel = document.querySelector(".flip-label");
const quizContent = document.querySelector(".quiz-content");
const progressDots = document.querySelectorAll(".progress-dot");
const progressLabel = document.querySelector(".progress-label");

// Each question has four choices and the index of its correct choice.
const questions = [
  {
    prompt: "In a partner, which three things matter most to you?",
    answers: [
      "Spontaneity, big gestures, mystery",
      "Consistency, emotional presence, follow-through",
      "Constant texting, shared hobbies, matching schedules",
      "Good looks, humor, ambition"
    ],
    correct: 1,
    explanation: "Showing up reliably, being emotionally there, and doing what you said you would."
  },
  {
    prompt: "You need to ask someone for what you want without blowing up the relationship. Which DBT skill do you reach for?",
    answers: ["Opposite action", "DEAR MAN", "TIPP", "Radical acceptance"],
    correct: 1,
    explanation: "Describe, Express, Assert, Reinforce; stay Mindful, Appear confident, and Negotiate."
  },
  {
    prompt: "After a conflict, what's your repair sequence?",
    answers: [
      "Apologize, change the subject, move on",
      "Explain yourself, wait for them to apologize",
      "Validate, clarify, own it, commit",
      "Give space, then act like it never happened"
    ],
    correct: 2,
    explanation: "Validate their experience, clarify what happened, own your part, and commit to doing better."
  },
  {
    prompt: "Which set of values sits at your core?",
    answers: [
      "Agency, accountability, intellectual honesty, evidence",
      "Loyalty no matter what, keeping the peace",
      "Independence above all, never needing anyone",
      "Harmony, avoiding conflict, going with the flow"
    ],
    correct: 0,
    explanation: "You own your choices and mistakes, and want the truth over the comfortable story."
  },
  {
    prompt: "How do you treat attachment theory, Gottman, and DBT?",
    answers: [
      "Fun to read about, not that useful",
      "Labels for diagnosing other people",
      "Practical tools you actually use in real relationships",
      "Something only a therapist should touch"
    ],
    correct: 2,
    explanation: "You use them hands-on in dating, friendships, and family, with a grounded, direct style."
  }
];

let isHovered = false;
let isFocused = false;
let isManuallyFlipped = false;
let currentQuestion = 0;
let score = 0;

function updateCardSide() {
  const isFlipped = isHovered || isFocused || isManuallyFlipped;
  tradingCard.classList.toggle("is-flipped", isFlipped);
  cardFront.setAttribute("aria-hidden", String(isFlipped));
  cardBack.setAttribute("aria-hidden", String(!isFlipped));
  flipButton.setAttribute("aria-pressed", String(isManuallyFlipped));
  flipLabel.textContent = isManuallyFlipped ? "Show card front" : "Flip card";
}

tradingCard.addEventListener("pointerenter", (event) => {
  isHovered = event.pointerType !== "touch";
  updateCardSide();
});

tradingCard.addEventListener("pointerleave", () => {
  isHovered = false;
  updateCardSide();
});

tradingCard.addEventListener("focusin", () => {
  isFocused = true;
  updateCardSide();
});

tradingCard.addEventListener("focusout", (event) => {
  isFocused = tradingCard.contains(event.relatedTarget);
  updateCardSide();
});

// Let touch and keyboard users flip the card without needing hover.
flipButton.addEventListener("click", () => {
  isManuallyFlipped = !isManuallyFlipped;
  updateCardSide();
  pageNote.textContent = isManuallyFlipped
    ? "Card reverse shown. Select “Show card front” to return."
    : "Card front shown. Point at the card or select “Flip card” to preview the reverse.";
});

activateButton.addEventListener("click", () => {
  const isActive = activateButton.getAttribute("aria-pressed") !== "true";
  activateButton.setAttribute("aria-pressed", String(isActive));
  tradingCard.classList.toggle("is-active", isActive);
  buttonLabel.textContent = isActive ? "Ability activated!" : "Try “Found it!”";
  pageNote.textContent = isActive
    ? "Finders Keepers is on the case. Probably."
    : "Point at the card or use “Flip card” to see the reverse.";
});

// Draw the current question and its four answer buttons.
function showQuestion(focusFirstAnswer = false) {
  const question = questions[currentQuestion];

  quizContent.innerHTML = `
    <p class="question-count">QUESTION ${currentQuestion + 1} OF ${questions.length}</p>
    <h3 class="question-prompt">${question.prompt}</h3>
    <div class="answer-list">
      ${question.answers.map((answer, index) => `
        <button class="answer-option" type="button" data-answer-index="${index}">
          <span>${String.fromCharCode(65 + index)})</span> ${answer}
        </button>
      `).join("")}
    </div>
  `;

  progressDots.forEach((dot, index) => {
    dot.classList.toggle("is-current", index === currentQuestion);
  });
  progressLabel.textContent = `Question ${currentQuestion + 1} of ${questions.length}`;

  quizContent.querySelectorAll(".answer-option").forEach((button) => {
    button.addEventListener("click", () => chooseAnswer(Number(button.dataset.answerIndex)));
  });

  if (focusFirstAnswer) quizContent.querySelector(".answer-option").focus();
}

// Mark the chosen answer, show the correct one, and explain why.
function chooseAnswer(answerIndex) {
  const question = questions[currentQuestion];
  const isCorrect = answerIndex === question.correct;

  if (isCorrect) score += 1;

  quizContent.querySelectorAll(".answer-option").forEach((button, index) => {
    button.disabled = true;
    if (index === question.correct) button.classList.add("is-correct");
    if (index === answerIndex && !isCorrect) button.classList.add("is-wrong");
  });

  progressDots[currentQuestion].classList.remove("is-current");
  progressDots[currentQuestion].classList.add(isCorrect ? "is-correct" : "is-wrong");

  const nextLabel = currentQuestion === questions.length - 1 ? "See my card type" : "Next question";
  quizContent.insertAdjacentHTML("beforeend", `
    <p class="answer-feedback">${question.explanation}</p>
    <button class="quiz-next" type="button">${nextLabel}</button>
  `);
  const nextButton = quizContent.querySelector(".quiz-next");
  nextButton.addEventListener("click", advanceQuiz);
  nextButton.focus();
}

// Move forward or show the score-based card type after the last question.
function advanceQuiz() {
  currentQuestion += 1;

  if (currentQuestion < questions.length) {
    showQuestion(true);
  } else {
    showResult();
  }
}

// Update the card colors and show the final type in large text.
function showResult() {
  let type;
  let colorClass;
  let message;

  if (score === 5) {
    type = "Steady anchor";
    colorClass = "type-blue";
    message = "You know exactly what you value and how you show up.";
  } else if (score >= 3) {
    type = "Repair builder";
    colorClass = "type-blue";
    message = "Strong foundation, a couple of things to revisit.";
  } else {
    type = "Work in progress";
    colorClass = "type-red";
    message = "Worth a retake. Your values are in there.";
  }

  tradingCard.classList.remove("type-blue", "type-red");
  tradingCard.classList.add(colorClass);
  tradingCard.querySelector(".rarity").textContent = type.toUpperCase();

  quizContent.innerHTML = `
    <div class="quiz-result ${colorClass}">
      <p class="question-count">YOUR CARD TYPE · ${score} OF ${questions.length}</p>
      <h3>${type}</h3>
      <p>${message}</p>
      <button class="play-again" type="button">Play again</button>
    </div>
  `;
  progressLabel.textContent = "Quiz complete";
  quizContent.querySelector(".play-again").addEventListener("click", restartQuiz);
  quizContent.querySelector(".play-again").focus();
}

// Reset the score, progress dots, and card type so the quiz can be replayed.
function restartQuiz() {
  currentQuestion = 0;
  score = 0;
  tradingCard.classList.remove("type-blue", "type-red");
  tradingCard.querySelector(".rarity").textContent = "DRAGON TYPE";
  progressDots.forEach((dot) => dot.classList.remove("is-correct", "is-wrong"));
  progressLabel.textContent = "Question 1 of 5";
  showQuestion(true);
}

showQuestion();
