const recommendations = document.querySelector("#recommendations");
const form = document.querySelector("#match-form");
const card = document.querySelector(".matcher-card");
const error = document.querySelector("#form-error");
const escapeHtml = (value) => String(value || "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));
function extractProfileId(value) {
  const input = value.trim();
  const plainId = input.match(/^\d+$/);
  if (plainId) return plainId[0];

  const profileUrl = input.match(/^https?:\/\/(?:www\.)?goodreads\.com\/user\/show\/(\d+)(?:[-/?#]|$)/i);
  if (profileUrl) return profileUrl[1];

  const extendedId = input.match(/^(\d+)-.+$/);
  return extendedId ? extendedId[1] : "";
}
function renderBooks(books) {
  document.querySelector("#result-count").textContent = String(books.length).padStart(2, "0");
  recommendations.innerHTML = books.length ? books.map((book, index) => `<article class="book"><a class="book-cover" href="${escapeHtml(book.link)}" target="_blank" rel="noopener"><span class="rank">${String(index + 1).padStart(2, "0")}</span>${book.cover ? `<img src="${escapeHtml(book.cover)}" alt="" />` : ""}</a><h3><a href="${escapeHtml(book.link)}" target="_blank" rel="noopener">${escapeHtml(book.title)}</a></h3><p>${escapeHtml(book.author)}</p><div class="book-bottom"><span class="stars">★★★★★</span><span class="match-score">5 star match</span></div></article>`).join("") : "<p>No matching books found yet.</p>";
}
renderBooks([]);
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const inputs = [...form.querySelectorAll("input")];
  const profileIds = inputs.map((input) => extractProfileId(input.value));
  if (profileIds.some((profileId) => !profileId)) {
    error.textContent = "Please enter a Goodreads profile ID, URL, or extended profile name.";
    error.style.height = "auto";
    return;
  }
  error.textContent = "";
  error.style.height = "0";
  card.classList.add("form-loading");
  const button = form.querySelector("button");
  button.disabled = true;
  Promise.all([
    fetch(`/api/lists?userId=${profileIds[0]}&shelf=read`).then((response) => response.ok ? response.json() : Promise.reject(new Error("read list"))),
    fetch(`/api/lists?userId=${profileIds[1]}&shelf=to-read`).then((response) => response.ok ? response.json() : Promise.reject(new Error("wishlist")))
  ]).then(([reads, wishlist]) => {
    const wanted = new Map(wishlist.items.map((book) => [book.title.toLowerCase(), book]));
    const matches = reads.items.filter((book) => book.rating === 5 && wanted.has(book.title.toLowerCase()))
      .map((book) => ({ ...wanted.get(book.title.toLowerCase()), author: wanted.get(book.title.toLowerCase()).author || book.author }))
      .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
    renderBooks(matches);
    document.querySelector("#results").scrollIntoView({ behavior: "smooth", block: "start" });
  }).catch(() => {
    error.textContent = "We couldn't retrieve those Goodreads lists. Check the IDs and try again.";
    error.style.height = "auto";
  }).finally(() => {
    card.classList.remove("form-loading");
    button.disabled = false;
  });
});
