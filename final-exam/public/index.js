let selectedPerson = null;
let selectedDiv = null;
const API = "/api/persons";

function $(id) {
  return document.getElementById(id);
}

function setStatus(message, kind = "info") {
  const el = $("formStatus");
  el.textContent = message || "";
  el.dataset.kind = kind;
}

async function fetchJson(url, opt) {
  const res = await fetch(url, opt);

  let body = null;
  try {
    body = await res.json();
  }
  catch {}

  if (!res.ok) { // hack :D
    if (res.status == 409) throw new Error("Error: duplicate");
    throw new Error(`Fetch failed: ${res.status}`);
  }

  return body;
}

function getFormPayload() {
  return {
    first_name: $("firstName").value.trim(),
    last_name: $("lastName").value.trim(),
    email: $("email").value.trim(),
    phone: $("phone").value.trim(),
    birth_date: $("birthDate").value,
  };
}

function validatePayload(payload) {
  if (!payload.first_name) return "First name is required.";
  if (!payload.last_name) return "Last name is required.";
  if (!payload.email) return "Email is required.";
  if (!payload.phone) return "Phone is required.";
  if (!payload.birth_date) return "Birthdate is required.";
  return null;
}

function setMode(mode) {
  const title = $("customer-form-title");
  const hint = $("customer-form-hint");
  const submitBtn = $("submitBtn");
  const deleteBtn = $("deleteBtn");

  if (mode === "edit") {
    title.textContent = "Edit customer";
    hint.textContent = "Update customer information.";
    submitBtn.textContent = "Update customer";
    deleteBtn.disabled = false;
    return;
  }

  title.textContent = "Add customer";
  hint.textContent = "Click a customer to edit or delete.";
  submitBtn.textContent = "Add customer";
  deleteBtn.disabled = true;
}

function clearSelection() {
  selectedPerson = null;
  setMode("create");
  setStatus("");

  if (selectedDiv) {
    selectedDiv.classList.remove("selected");
    selectedDiv = null;
  }

  $("customerForm").reset();
}

function setSelectedPerson(person, div) {
  selectedPerson = person.id;
  setMode("edit");

  if (selectedDiv) selectedDiv.classList.remove("selected");
  selectedDiv = div;
  if (selectedDiv) selectedDiv.classList.add("selected");

  $("firstName").value = person.first_name ?? "";
  $("lastName").value = person.last_name ?? "";
  $("email").value = person.email ?? "";
  $("phone").value = person.phone ?? "";

  const birth = (person.birth_date ?? "").toString();
  $("birthDate").value = birth ? birth.slice(0, 10) : ""; // works :D
}

async function loadCustomers() {
  const container = $("customer-list");

  try {
    const data = await fetchJson(API);
    container.innerHTML = "";

    if (data.length === 0) {
      container.innerHTML = "<p>No customers found.</p>";
      return;
    }

    data.forEach(person => {
      const div = document.createElement("div");
      div.className = "customer-card";
      div.setAttribute("role", "button");
      div.tabIndex = 0;
      div.dataset.personId = String(person.id);

      div.innerHTML = `
        <strong>${person.first_name} ${person.last_name}</strong><br>
        Email: ${person.email}<br>
        Phone: ${person.phone || "-"}
      `;

      div.addEventListener("click", () => {
        console.log("Customer clicked.");
        setSelectedPerson(person, div);
        setStatus("");
      });

      container.appendChild(div);

      if (selectedPerson === person.id) {
        setSelectedPerson(person, div);
      }
    });

  } catch (err) {
    console.error(err);
    container.innerHTML = "<p style='color:red;'>Error loading data</p>";
  }
}

async function createCustomer(payload) {
  const result = await fetchJson(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (result?.ok) return result.person;
  throw new Error("Failed to create customer.");
}

async function updateCustomer(id, payload) {
  const result = await fetchJson(`${API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (result?.ok) return result.person;
  throw new Error("Failed to update customer.");
}

async function deleteCustomer(id) {
  const result = await fetchJson(`${API}/${id}`, {
    method: "DELETE",
  });

  if (result?.ok) return result.deleted;
  throw new Error("Failed to delete customer.");
}

function addListeners() {
  $("customerForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    setStatus("");

    const payload = getFormPayload();
    const validationError = validatePayload(payload);
    if (validationError) {
      setStatus(validationError, "error");
      return;
    }

    try {
      if (selectedPerson == null) {
        setStatus("Adding customer...", "info");
        await createCustomer(payload);
        clearSelection();
        setStatus("Customer added.", "success");
      } else {
        setStatus("Updating customer...", "info");
        await updateCustomer(selectedPerson, payload);
        setStatus("Customer updated.", "success");
      }

      await loadCustomers();
    } catch (err) {
      console.error(err);
      setStatus(err.message || "Failed.", "error"); // will just display the error thrown from fetchJson
    }
  });

  $("clearBtn").addEventListener("click", () => {
    clearSelection();
  });

  $("deleteBtn").addEventListener("click", async () => {
    if (selectedPerson == null) return;

    const ok = window.confirm("Delete customer?");
    if (!ok) return;

    try {
      setStatus("Deleting customer...", "info");
      await deleteCustomer(selectedPerson);
      setStatus("Customer deleted.", "success");
      clearSelection();
      await loadCustomers();
    } catch (err) {
      console.error(err);
      setStatus(err.message || "Delete failed.", "error");
    }
  });
}

setMode("create");
addListeners();
loadCustomers();