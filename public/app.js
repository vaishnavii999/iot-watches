const state = {
  users: [],
  watches: [],
  updates: [],
  filters: { ageMin: 0, ageMax: 100, hrMin: 30, hrMax: 180 }
};

// ---------- Navigation ----------
document.querySelectorAll(".nav-item").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach(b => b.classList.remove("is-active"));
    document.querySelectorAll(".view").forEach(v => v.classList.remove("is-active"));
    btn.classList.add("is-active");
    document.getElementById(`view-${btn.dataset.view}`).classList.add("is-active");
  });
});

// ---------- Fetch helpers ----------
async function fetchOrganisation() {
  const res = await fetch("/api/organisation");
  if (!res.ok) throw new Error("Failed to load organisation");
  return res.json();
}

async function patchUser(id, body) {
  return fetch(`/api/users/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  }).then(r => r.json());
}

async function patchWatch(id, body) {
  return fetch(`/api/watches/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  }).then(r => r.json());
}

// ---------- Dual range slider wiring ----------
function wireDualRange({ minEl, maxEl, fillEl, minOut, maxOut, onChange, suffix = "" }) {
  const bounds = { lo: Number(minEl.min), hi: Number(minEl.max) };

  function render() {
    let lo = Number(minEl.value);
    let hi = Number(maxEl.value);
    if (lo > hi) { [lo, hi] = [hi, lo]; }
    minOut.textContent = lo;
    maxOut.textContent = hi + suffix;

    const pctLo = ((lo - bounds.lo) / (bounds.hi - bounds.lo)) * 100;
    const pctHi = ((hi - bounds.lo) / (bounds.hi - bounds.lo)) * 100;
    fillEl.style.left = pctLo + "%";
    fillEl.style.right = (100 - pctHi) + "%";

    onChange(lo, hi);
  }

  minEl.addEventListener("input", () => {
    if (Number(minEl.value) > Number(maxEl.value)) minEl.value = maxEl.value;
    render();
  });
  maxEl.addEventListener("input", () => {
    if (Number(maxEl.value) < Number(minEl.value)) maxEl.value = minEl.value;
    render();
  });

  render();
  return render;
}

// ---------- Render: Users table ----------
function renderUsers() {
  const body = document.getElementById("users-body");
  const empty = document.getElementById("users-empty");
  const { ageMin, ageMax, hrMin, hrMax } = state.filters;

  const filtered = state.users.filter(u =>
    u.age >= ageMin && u.age <= ageMax &&
    u["heart-rate"] >= hrMin && u["heart-rate"] <= hrMax
  );

  body.innerHTML = "";
  empty.hidden = filtered.length > 0;

  filtered.forEach(u => {
    const row = document.createElement("div");
    row.className = "table-row";
    row.innerHTML = `
      <span>${u["user-name"]}</span>
      <span class="mono">${u.age}</span>
      <span class="mono">${u["heart-rate"]} bpm</span>
      <span class="mono muted">${u["blood-pressure"] || "—"}</span>
      <span class="mono muted">#${u["watch-id"]}</span>
      <span class="badge ${u["update-installation"] ? "badge--on" : "badge--off"}">
        ${u["update-installation"] ? "Installed" : "Pending"}
      </span>
    `;
    body.appendChild(row);
  });
}

// ---------- Render: Watch cards ----------
function renderWatches() {
  const grid = document.getElementById("watch-grid");
  grid.innerHTML = "";

  state.watches.forEach(w => {
    const owner = state.users.find(u => u["user-id"] === w["user-id"]);
    const card = document.createElement("div");
    card.className = "watch-card";
    card.innerHTML = `
      <div class="watch-card-head">
        <span class="watch-model">${w["model-name"]}</span>
        <span class="watch-id">#${w["watch-id"]}</span>
      </div>
      <div class="watch-owner">${owner ? owner["user-name"] : "Unassigned"}</div>
      <div class="config-row">
        <input type="range" min="0" max="100" value="${w.configuration}" class="config-slider" data-watch="${w["watch-id"]}">
        <span class="config-value">${w.configuration}</span>
      </div>
      <div class="watch-save">
        <button data-watch="${w["watch-id"]}" disabled>Save configuration</button>
        <span class="save-state"></span>
      </div>
    `;
    grid.appendChild(card);
  });

  grid.querySelectorAll(".config-slider").forEach(slider => {
    const card = slider.closest(".watch-card");
    const valueEl = card.querySelector(".config-value");
    const saveBtn = card.querySelector(".watch-save button");
    const stateEl = card.querySelector(".save-state");

    slider.addEventListener("input", () => {
      valueEl.textContent = slider.value;
      saveBtn.disabled = false;
      stateEl.textContent = "";
    });

    saveBtn.addEventListener("click", async () => {
      saveBtn.disabled = true;
      stateEl.textContent = "saving…";
      const id = Number(slider.dataset.watch);
      const updated = await patchWatch(id, { configuration: Number(slider.value) });
      const w = state.watches.find(x => x["watch-id"] === id);
      if (w) w.configuration = updated.configuration;
      stateEl.textContent = "saved";
      setTimeout(() => (stateEl.textContent = ""), 1500);
    });
  });
}

// ---------- Render: Updates table ----------
function renderUpdates() {
  const body = document.getElementById("updates-body");
  body.innerHTML = "";

  state.updates.forEach(u => {
    const row = document.createElement("div");
    row.className = "table-row";
    row.innerHTML = `
      <span class="mono">#${u["update-id"]}</span>
      <span class="mono">${u["version-number"]}</span>
      <span class="mono muted">#${u["watch-id"]}</span>
      <span class="badge ${u["installation-status"] ? "badge--on" : "badge--off"}">
        ${u["installation-status"] ? "Installed" : "Pending"}
      </span>
    `;
    body.appendChild(row);
  });
}

// ---------- Boot ----------
async function init() {
  const dot = document.getElementById("conn-dot");
  const label = document.getElementById("conn-label");

  try {
    const org = await fetchOrganisation();
    document.getElementById("org-name").textContent = org["organisation-name"];
    document.getElementById("org-id").textContent = `org #${org["organisation-id"]}`;

    state.users = org.users;
    state.watches = org.watches;
    state.updates = org["software-updates"];

    dot.classList.add("is-live");
    label.textContent = "live";

    renderUsers();
    renderWatches();
    renderUpdates();
  } catch (e) {
    label.textContent = "offline — is the server running?";
  }

  wireDualRange({
    minEl: document.getElementById("age-min"),
    maxEl: document.getElementById("age-max"),
    fillEl: document.getElementById("age-fill"),
    minOut: document.getElementById("age-min-out"),
    maxOut: document.getElementById("age-max-out"),
    onChange: (lo, hi) => {
      state.filters.ageMin = lo;
      state.filters.ageMax = hi;
      renderUsers();
    }
  });

  wireDualRange({
    minEl: document.getElementById("hr-min"),
    maxEl: document.getElementById("hr-max"),
    fillEl: document.getElementById("hr-fill"),
    minOut: document.getElementById("hr-min-out"),
    maxOut: document.getElementById("hr-max-out"),
    suffix: " bpm",
    onChange: (lo, hi) => {
      state.filters.hrMin = lo;
      state.filters.hrMax = hi;
      renderUsers();
    }
  });

  document.getElementById("reset-filters").addEventListener("click", () => {
    document.getElementById("age-min").value = 0;
    document.getElementById("age-max").value = 100;
    document.getElementById("hr-min").value = 30;
    document.getElementById("hr-max").value = 180;
    document.getElementById("age-min").dispatchEvent(new Event("input"));
    document.getElementById("hr-min").dispatchEvent(new Event("input"));
  });
}

init();
