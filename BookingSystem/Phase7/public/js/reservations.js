import { initAuthUI, requireAuthOrBlockPage, logout } from "./auth-ui.js";
initAuthUI();
if (!requireAuthOrBlockPage()) {

  throw new Error("Authentication required");
}

window.logout = logout;

// todo: add role authorization
// todo: fix boilerplate xd

const form = document.getElementById("reservationForm");
const formMessage = document.getElementById("formMessage");
const reservationListEl = document.getElementById("reservationList");
const actions = document.getElementById("reservationActions");
const resourceSelect = document.getElementById("resourceId");
const reservationIdInput = document.getElementById("reservationId");
const userIdInput = document.getElementById("userId");
const startTimeInput = document.getElementById("startTime");
const endTimeInput = document.getElementById("endTime");
const noteInput = document.getElementById("note");
const statusInput = document.getElementById("status");

let formMode = "create";
let reservationsCache = [];
let resourcesCache = [];
let createButton = null;
let updateButton = null;
let deleteButton = null;
let clearButton = null;
let selectedReservationId = null;
let fieldsValid = {
  resourceId: false,
  userId: false,
  startTime: false,
  endTime: false,
  note: true,
};

const BUTTON_BASE_CLASSES =
  "w-full rounded-2xl px-6 py-3 text-sm font-semibold transition-all duration-200 ease-out";
const BUTTON_ENABLED_CLASSES =
  "bg-brand-primary text-white hover:bg-brand-dark/80 shadow-soft";

function setButtonEnabled(btn, enabled) {
  if (!btn) return;

  btn.disabled = !enabled;

  // Keep disabled look in ONE place (here)
  btn.classList.toggle("cursor-not-allowed", !enabled);
  btn.classList.toggle("opacity-50", !enabled);

  // Optional: remove hover feel when disabled (recommended UX)
  if (!enabled) {
    btn.classList.remove("hover:bg-brand-dark/80");
  } else {
    // Only re-add if this button is supposed to have it
    // (for Create we know it is)
    if (btn.value === "create" || btn.textContent === "Create") {
      btn.classList.add("hover:bg-brand-dark/80");
    }
  }
}

function setInputVisualState(input, state) {
  // Reset to neutral base state (remove only our own validation-related classes)
  input.classList.remove(
    "border-green-500",
    "bg-green-100",
    "focus:ring-green-500/30",
    "border-red-500",
    "bg-red-100",
    "focus:ring-red-500/30",
    "focus:border-brand-blue",
    "focus:ring-brand-blue/30"
  );

  // Ensure base focus style is present when neutral
  // (If we are valid/invalid, we override ring color but keep ring behavior)
  input.classList.add("focus:ring-2");

  if (state === "valid") {
    input.classList.add("border-green-500", "bg-green-100", "focus:ring-green-500/30");
  } else if (state === "invalid") {
    input.classList.add("border-red-500", "bg-red-100", "focus:ring-red-500/30");
  }
}

function showFormMessage(type, message) {
  formMessage.className = "mt-6 rounded-2xl border px-4 py-3 text-sm whitespace-pre-line";
  formMessage.classList.remove("hidden");

  if (type === "success") {
    formMessage.classList.add("border-emerald-200", "bg-emerald-50", "text-emerald-900");
  } else if (type === "info") {
    formMessage.classList.add("border-amber-200", "bg-amber-50", "text-amber-900");
  } else {
    formMessage.classList.add("border-rose-200", "bg-rose-50", "text-rose-900");
  }

  formMessage.textContent = message;
  formMessage.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function clearFormMessage() {
  if (!formMessage) return;
  formMessage.textContent = "";
  formMessage.classList.add("hidden");
}

function addButton({ label, type = "button", value, classes = "" }) {
  const btn = document.createElement("button");
  btn.type = type;
  btn.textContent = label;
  btn.name = "action";
  if (value) btn.value = value;

  btn.className = `${BUTTON_BASE_CLASSES} ${classes}`.trim();

  actions.appendChild(btn);
  return btn;
}

function renderActionButtons() {
  actions.innerHTML = "";

  if (formMode === "create") {
    createButton = addButton({ label: "Create", type: "submit", value: "create", classes: BUTTON_ENABLED_CLASSES, });
    clearButton = addButton({ label: "Clear", type: "button", classes: BUTTON_ENABLED_CLASSES, });
    setButtonEnabled(createButton, false);
    clearButton.addEventListener("click", () => {
      clearForm();
      clearFormMessage();
    });
    return;
  }

  updateButton = addButton({ label: "Update", type: "submit", value: "update", classes: BUTTON_ENABLED_CLASSES, });
  deleteButton = addButton({ label: "Delete", type: "submit", value: "delete", classes: BUTTON_ENABLED_CLASSES, });
  setButtonEnabled(updateButton, false);
  setButtonEnabled(deleteButton, true);
}

function formatDateTimeLocal(value) {
  if (!value) return "";

  // thanks chatgeepeetee

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const pad = (part) => String(part).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

async function readResponseBody(response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      return { ok: false, error: "Invalid JSON response" };
    }
  }

  const text = await response.text().catch(() => "");
  try {
    return JSON.parse(text);
  } catch {
    return { ok: false, error: "Non-JSON response", raw: text };
  }
}

function buildValidationMessage(errors) {
  if (!Array.isArray(errors) || errors.length === 0) {
    return "Validation failed. Please check your input fields.";
  }

  const lines = errors.map((e) => `• ${e.field || "field"}: ${e.msg || "Invalid value"}`);
  return `Your request was blocked by server-side validation:\n\n${lines.join("\n")}`;
}

function getPayloadFromForm() {
  return {
    reservationId: reservationIdInput.value,
    resourceId: Number(resourceSelect.value),
    userId: Number(userIdInput.value),
    startTime: startTimeInput.value ? new Date(startTimeInput.value).toISOString() : "",
    endTime: endTimeInput.value ? new Date(endTimeInput.value).toISOString() : "",
    note: noteInput.value.trim(),
    status: statusInput.value,
  };
}

function validateResourceField() {
  const value = Number(resourceSelect.value);
  const hasValue = resourceSelect.value !== "";
  const valid = hasValue && !Number.isNaN(value) && value > 0;
  fieldsValid.resourceId = valid;
  setInputVisualState(resourceSelect, hasValue ? (valid ? "valid" : "invalid") : "neutral");
}

function validateUserIdField() {
  const raw = userIdInput.value.trim();
  const value = Number(raw);
  const valid = raw !== "" && Number.isInteger(value) && value > 0;
  fieldsValid.userId = valid;
  setInputVisualState(userIdInput, raw ? (valid ? "valid" : "invalid") : "neutral");
}

function isLocalDateTimeValid(value) {
  return value && !Number.isNaN(new Date(value).getTime());
}

function validateStartField() {
  const raw = startTimeInput.value;
  const valid = isLocalDateTimeValid(raw);
  fieldsValid.startTime = valid;
  setInputVisualState(startTimeInput, raw ? (valid ? "valid" : "invalid") : "neutral");
}

function validateEndField() {
  const raw = endTimeInput.value;
  const valid =
    isLocalDateTimeValid(raw) &&
    isLocalDateTimeValid(startTimeInput.value) &&
    new Date(raw).getTime() > new Date(startTimeInput.value).getTime();

  fieldsValid.endTime = valid;
  setInputVisualState(endTimeInput, raw ? (valid ? "valid" : "invalid") : "neutral");
}

function validateNoteField() {
  const raw = noteInput.value;
  const trimmed = raw.trim();
  const valid = trimmed.length >= 5 && trimmed.length <= 50;
  fieldsValid.note = valid;
  setInputVisualState(noteInput, raw ? (valid ? "valid" : "invalid") : "neutral");
}

function refreshPrimaryButtonState() {
  const valid =
    fieldsValid.resourceId &&
    fieldsValid.userId &&
    fieldsValid.startTime &&
    fieldsValid.endTime &&
    fieldsValid.note;

  if (formMode === "create") {
    setButtonEnabled(createButton, valid);
    return;
  }

  setButtonEnabled(updateButton, valid);
  setButtonEnabled(deleteButton, true);
}

function validateAllFields() {
  validateResourceField();
  validateUserIdField();
  validateStartField();
  validateEndField();
  validateNoteField();
  refreshPrimaryButtonState();
}

function attachValidationListeners() {
  //resourceSelect.addEventListener("input", () => {
  resourceSelect.addEventListener("change", () => {
    validateResourceField();
    refreshPrimaryButtonState();
  });

  userIdInput.addEventListener("input", () => {
    validateUserIdField();
    refreshPrimaryButtonState();
  });

  startTimeInput.addEventListener("input", () => {
    validateStartField();
    validateEndField();
    refreshPrimaryButtonState();
  });

  endTimeInput.addEventListener("input", () => {
    validateEndField();
    refreshPrimaryButtonState();
  });

  noteInput.addEventListener("input", () => {
    validateNoteField();
    refreshPrimaryButtonState();
  });
}

function clearForm() {
  selectedReservationId = null;
  formMode = "create";
  reservationIdInput.value = "";
  resourceSelect.value = "";
  startTimeInput.value = "";
  endTimeInput.value = "";
  noteInput.value = "";
  statusInput.value = "active";
  highlightSelectedReservation(null);
  renderActionButtons();
  validateAllFields();
}

function selectReservation(reservation) {
  selectedReservationId = Number(reservation.id);
  formMode = "edit";
  reservationIdInput.value = String(reservation.id);
  resourceSelect.value = String(reservation.resource_id);
  userIdInput.value = String(reservation.user_id);
  startTimeInput.value = formatDateTimeLocal(reservation.start_time);
  endTimeInput.value = formatDateTimeLocal(reservation.end_time);
  noteInput.value = reservation.note ?? "";
  statusInput.value = reservation.status ?? "active";
  renderActionButtons();

  validateAllFields();
  highlightSelectedReservation(reservation.id);
}

function highlightSelectedReservation(id) {
  reservationListEl.querySelectorAll("[data-reservation-id]").forEach((item) => {
    const isSelected = Number(item.dataset.reservationId) === Number(id);
    item.classList.toggle("ring-2", isSelected);
    item.classList.toggle("ring-brand-blue/40", isSelected);
    item.classList.toggle("bg-brand-blue/5", isSelected);
  });
}

function renderResourceOptions(resources) {
  const currentValue = resourceSelect.value;
  const options = ['<option value="">Select a resource</option>'];

  resources.forEach((resource) => {
    options.push(
      `<option value="${resource.id}">${resource.name}</option>`
    );
  });

  resourceSelect.innerHTML = options.join("");
  if (currentValue) {
    resourceSelect.value = currentValue;
  }
}

function renderReservationList(reservations) {
  reservationListEl.innerHTML = reservations
    .map((r) => {
      return `
        <button
          type="button"
          data-reservation-id="${r.id}"
          class="w-full text-left rounded-2xl border border-black/10 bg-white px-4 py-3 transition hover:bg-black/5"
          title="Select reservation"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="font-semibold truncate">${r.resource_name ?? `Resource #${r.resource_id}`}</div>
              <div class="mt-1 text-xs text-black/60 truncate">User ${r.user_id}</div>
              <div class="mt-1 text-xs text-black/50">${formatDateTimeLocal(r.start_time)} - ${formatDateTimeLocal(r.end_time)}</div>
            </div>
          </div>
        </button>
      `;
    })
    .join("");

  reservationListEl.querySelectorAll("[data-reservation-id]").forEach((button) => {
    button.addEventListener("click", () => {
      clearFormMessage();
      const reservation = reservationsCache.find(
        (item) => Number(item.id) === Number(button.dataset.reservationId)
      );
      if (!reservation) return;
      selectReservation(reservation);
    });
  });
}

async function loadResources() {
  const res = await fetch("/api/resources");
  const body = await readResponseBody(res);

  if (!res.ok) {
    throw new Error(body.error || "Failed to load resources");
  }

  resourcesCache = Array.isArray(body.data) ? body.data : [];
  renderResourceOptions(resourcesCache);
}

async function loadReservations() {
  const response = await fetch("/api/reservations");
  const body = await readResponseBody(response);

  if (!response.ok) {
    throw new Error(body.error || "Failed to load reservations");
  }

  reservationsCache = Array.isArray(body.data) ? body.data : [];
  renderReservationList(reservationsCache);

  if (selectedReservationId) {
    const selected = reservationsCache.find(
      (item) => Number(item.id) === Number(selectedReservationId)
    );
    if (selected) {
      selectReservation(selected);
    }
  }
}

async function onSubmit(actionValue) {
  const payload = getPayloadFromForm();

  let method = "POST";
  let url = "/api/reservations";
  let body = null;

  if (actionValue === "update") {
    if (!payload.reservationId) {
      showFormMessage("error", "Update failed: missing reservation ID. Select a reservation first.");
      return;
    }
    method = "PUT";
    url = `/api/reservations/${payload.reservationId}`;
    body = JSON.stringify(payload);
  } else if (actionValue === "delete") {
    if (!payload.reservationId) {
      showFormMessage("error", "Delete failed: missing reservation ID. Select a reservation first.");
      return;
    }
    method = "DELETE";
    url = `/api/reservations/${payload.reservationId}`;
  } else {
    body = JSON.stringify(payload);
  }

  const response = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body,
  });

  const responseBody =
    response.status === 204 ? null : await readResponseBody(response);

  if (!response.ok) {
    if (response.status === 400) {
      showFormMessage("error", buildValidationMessage(responseBody?.errors));
      return;
    }

    const reason = responseBody?.error || "Request failed";
    showFormMessage("error", `Server returned an error (${response.status}).\n\nReason: ${reason}`);
    return;
  }

  if (actionValue === "create") {
    showFormMessage("success", "Reservation created successfully.");
  } else if (actionValue === "update") {
    showFormMessage("success", "Reservation updated successfully.");
  } else {
    showFormMessage("success", "Reservation deleted successfully.");
  }

  clearForm();
  await loadReservations();
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearFormMessage();

  const actionValue = event.submitter?.value || "create";

  try {
    await onSubmit(actionValue);
  } catch (error) {
    console.error("Reservation request failed:", error);
    showFormMessage(
      "error",
      "Network error: Could not reach the server. Check your environment and try again."
    );
  }
});

renderActionButtons();
attachValidationListeners();
validateAllFields();

try {
  await Promise.all([loadResources(), loadReservations()]);
} catch (error) {
  console.error(error);
  showFormMessage(
    "error",
    "Check your environment and try again."
  );
}
