const gallery = document.getElementById("gallery");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const askAiBtn = document.getElementById("askAiBtn");
const aiInput = document.getElementById("aiInput");
const aiStatus = document.getElementById("aiStatus");
const aiResponse = document.getElementById("aiResponse");

function renderGallery(items) {
  gallery.innerHTML = "";

  if (!items.length) {
    gallery.innerHTML = "<p>No drawings found.</p>";
    return;
  }

  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "card";

    card.innerHTML = `
      <img src="${item.imageUrl}" alt="${item.title}">
      <div class="card-content">
        <h3 class="card-title">${item.title}</h3>
        <div class="card-meta">${item.year}</div>
        <p>${item.description || ""}</p>
        <div class="tags">
          ${item.tags.map(tag => `<span class="tag">${tag}</span>`).join("")}
        </div>
      </div>
    `;

    gallery.appendChild(card);
  });
}

function filterImages() {
  const q = searchInput.value.trim().toLowerCase();

  if (!q) {
    renderGallery(archiveImages);
    return;
  }

  const filtered = archiveImages.filter((item) => {
    const haystack = [
      item.title,
      item.year,
      item.description,
      ...(item.tags || [])
    ].join(" ").toLowerCase();

    return haystack.includes(q);
  });

  renderGallery(filtered);
}

searchBtn.addEventListener("click", filterImages);
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") filterImages();
});

askAiBtn.addEventListener("click", async () => {
  const question = aiInput.value.trim();

  if (!question) return;

  aiStatus.textContent = "Thinking...";
  aiResponse.textContent = "";

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        question,
        archiveImages
      })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Something went wrong.");
    }

    aiResponse.textContent = data.answer || "No response returned.";
    aiStatus.textContent = "Done";
  } catch (err) {
    aiStatus.textContent = "Error";
    aiResponse.textContent = err.message;
  }
});

renderGallery(archiveImages);