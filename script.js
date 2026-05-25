// ===========================
// LEAD CRM — script.js
// Frontend: Save, Search, Delete
// ===========================

const API_URL = "http://localhost:3000";

// Debounce timer for search
let searchTimer = null;


// ── Save Lead ──────────────────────────────────────
async function saveLead() {
  const name    = document.getElementById("name").value.trim();
  const email   = document.getElementById("email").value.trim();
  const message = document.getElementById("message").value.trim();

  if (!name || !email || !message) {
    showAlert("Please fill in all fields before saving.", "error");
    return;
  }

  const btn = document.getElementById("saveBtn");
  btn.disabled = true;
  btn.querySelector(".btn-text").textContent = "Saving…";

  try {
    const response = await fetch(`${API_URL}/leads`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ name, email, message })
    });

    if (response.ok) {
      showAlert("✓ Lead saved successfully!", "success");
      clearForm();
      fetchLeads();
    } else {
      const err = await response.json();
      showAlert(`Error: ${err.message || "Could not save lead."}`, "error");
    }

  } catch (error) {
    showAlert("Could not connect to the server. Is the backend running?", "error");
  }

  btn.disabled = false;
  btn.querySelector(".btn-text").textContent = "Save Lead";
}


// ── Fetch / Search Leads ───────────────────────────
async function fetchLeads(searchQuery = "") {
  const container = document.getElementById("leadsList");
  const countEl   = document.getElementById("leadCount");
  container.innerHTML = `<p class="empty-msg">Loading…</p>`;

  try {
    // Append search query if provided
    const url = searchQuery
      ? `${API_URL}/leads?search=${encodeURIComponent(searchQuery)}`
      : `${API_URL}/leads`;

    const response = await fetch(url);
    const leads    = await response.json();

    // Update count label
    if (searchQuery) {
      countEl.textContent = `${leads.length} result${leads.length !== 1 ? "s" : ""} for "${searchQuery}"`;
    } else {
      countEl.textContent = leads.length > 0 ? `${leads.length} lead${leads.length !== 1 ? "s" : ""} total` : "";
    }

    if (!leads || leads.length === 0) {
      container.innerHTML = `<p class="empty-msg">${searchQuery ? "No leads match your search." : "No leads yet. Save one above!"}</p>`;
      return;
    }

    container.innerHTML = leads.map(lead => {
      const initial = lead.name ? lead.name.charAt(0).toUpperCase() : "?";
      return `
        <div class="lead-card" id="card-${lead._id}">
          <div class="lead-avatar">${initial}</div>
          <div class="lead-info">
            <div class="lead-name">${escapeHTML(lead.name)}</div>
            <div class="lead-email">${escapeHTML(lead.email)}</div>
          </div>
          <button class="delete-btn" onclick="deleteLead('${lead._id}')" title="Delete lead">🗑️</button>
          <div class="lead-message">${escapeHTML(lead.message)}</div>
        </div>
      `;
    }).join("");

  } catch (error) {
    container.innerHTML = `<p class="empty-msg" style="color:#ff4f6a;">Could not load leads. Is the backend running?</p>`;
  }
}


// ── Search Leads (with debounce) ───────────────────
function searchLeads() {
  const query     = document.getElementById("searchInput").value.trim();
  const clearBtn  = document.getElementById("clearSearch");

  // Show/hide clear button
  clearBtn.style.display = query ? "flex" : "none";

  // Debounce: wait 300ms after user stops typing
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    fetchLeads(query);
  }, 300);
}


// ── Clear Search ───────────────────────────────────
function clearSearch() {
  document.getElementById("searchInput").value = "";
  document.getElementById("clearSearch").style.display = "none";
  fetchLeads();
}


// ── Delete Lead ────────────────────────────────────
async function deleteLead(id) {
  // Confirm before deleting
  if (!confirm("Are you sure you want to delete this lead?")) return;

  try {
    const response = await fetch(`${API_URL}/leads/${id}`, {
      method: "DELETE"
    });

    if (response.ok) {
      // Animate card out then remove
      const card = document.getElementById(`card-${id}`);
      if (card) {
        card.style.transition = "opacity 0.3s, transform 0.3s";
        card.style.opacity    = "0";
        card.style.transform  = "translateX(20px)";
        setTimeout(() => {
          const query = document.getElementById("searchInput").value.trim();
          fetchLeads(query);
        }, 300);
      }
      showAlert("🗑️ Lead deleted.", "success");
    } else {
      showAlert("Could not delete lead. Try again.", "error");
    }

  } catch (error) {
    showAlert("Could not connect to the server.", "error");
  }
}


// ── Helper: Show Alert ─────────────────────────────
function showAlert(msg, type) {
  const box = document.getElementById("alertBox");
  box.textContent = msg;
  box.className   = `alert ${type}`;
  clearTimeout(box._timer);
  box._timer = setTimeout(() => { box.className = "alert hidden"; }, 4000);
}


// ── Helper: Clear Form ─────────────────────────────
function clearForm() {
  document.getElementById("name").value    = "";
  document.getElementById("email").value   = "";
  document.getElementById("message").value = "";
}


// ── Helper: Escape HTML ────────────────────────────
function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}


// ── On page load ───────────────────────────────────
window.addEventListener("DOMContentLoaded", fetchLeads);