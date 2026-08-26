const books = [
  { title: "Tomorrow, and Tomorrow, and Tomorrow", author: "Gabrielle Zevin", cover: "cover-one", coverTitle: "Tomorrow,\nand Tomorrow,\nand Tomorrow", score: "98%", stars: "★★★★★" },
  { title: "The Night Circus", author: "Erin Morgenstern", cover: "cover-two", coverTitle: "The\nNight\nCircus", score: "95%", stars: "★★★★★" },
  { title: "Sea of Tranquility", author: "Emily St. John Mandel", cover: "cover-three", coverTitle: "Sea of\nTranquility", score: "91%", stars: "★★★★★" },
  { title: "Piranesi", author: "Susanna Clarke", cover: "cover-four", coverTitle: "Piranesi", score: "88%", stars: "★★★★★" }
];
const recommendations = document.querySelector("#recommendations");
const form = document.querySelector("#match-form");
const card = document.querySelector(".matcher-card");
const error = document.querySelector("#form-error");
function renderBooks() {
  recommendations.innerHTML = books.map((book, index) => `<article class="book"><div class="book-cover ${book.cover}"><span class="rank">0${index + 1}</span><span class="cover-author">${book.author}</span><strong class="cover-title">${book.coverTitle.replace(/\n/g, "<br>")}</strong></div><h3>${book.title}</h3><p>${book.author}</p><div class="book-bottom"><span class="stars">${book.stars}</span><span class="match-score">${book.score} match</span></div></article>`).join("");
}
renderBooks();
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const inputs = [...form.querySelectorAll("input")];
  if (!inputs.every((input) => /^\d+$/.test(input.value.trim()))) {
    error.textContent = "Please enter numeric Goodreads profile IDs.";
    error.style.height = "auto";
    return;
  }
  error.textContent = "";
  error.style.height = "0";
  card.classList.add("form-loading");
  const button = form.querySelector("button");
  button.disabled = true;
  setTimeout(() => {
    card.classList.remove("form-loading");
    button.disabled = false;
    document.querySelector("#results").scrollIntoView({ behavior: "smooth", block: "start" });
  }, 850);
});
