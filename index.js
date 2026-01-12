let selectedIdPort = "";

/* =======================
   LOAD & SEARCH DATA CSV
======================= */
Papa.parse("data.csv", {
  download: true,
  header: true,
  skipEmptyLines: true,
  complete: function (results) {
    const data = results.data;
    document.getElementById("search-btn").addEventListener("click", () => {
      const IP = ip.value;
      const SLOT = slot.value;
      const PORT = port.value;

      const filtered = data.filter(d =>
        d.IP === IP && d.SLOT === SLOT && d.PORT === PORT
      );

      renderTable(filtered);
    });
  }
});

/* =======================
   RENDER SEARCH RESULT
======================= */
function renderTable(data) {
  const tbody = document.getElementById("result-body");
  const emptyMsg = document.getElementById("empty-msg");

  tbody.innerHTML = "";
  emptyMsg.textContent = "";

  if (data.length === 0) {
    emptyMsg.textContent = "Tidak ada data yang ditemukan.";
    return;
  }

  data.forEach(item => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.IP}</td>
      <td>${item.SLOT}</td>
      <td>${item.PORT}</td>
      <td>${item.VLAN}</td>
      <td>${item.ID_PORT}</td>
      <td>${item.GPON}</td>
      <td>${item.VENDOR}</td>
    `;

    tr.addEventListener("click", () => {
      selectedIdPort = item.ID_PORT;

      document.querySelectorAll("#result tr")
        .forEach(r => r.classList.remove("selected"));
      tr.classList.add("selected");

      document.querySelectorAll(".res-id")
        .forEach(i => i.value = selectedIdPort);
    });

    tbody.appendChild(tr);
  });
}

/* =======================
   AUTO RULE GENERATOR
======================= */
function generateAutoRule() {
  if (!selectedIdPort) {
    alert("Pilih ID_PORT terlebih dahulu!");
    return;
  }

  const crmText = document.getElementById("crmText").value;
  const svlanInternet = document.getElementById("svlan-internet").value;
  const svlanVoice = document.getElementById("svlan-voice").value;

  const match = crmText.match(/Service ID is\s*([^\n]+)/i);
  if (!match) {
    alert("Service ID tidak ditemukan");
    return;
  }

  const services = match[1].split(",").map(s => {
    s = s.trim();
    return s.startsWith("1-") ? s : "1-" + s;
  });

  const tbody = document.querySelector("#dataTable tbody");
  tbody.innerHTML = "";

  services.forEach(service => {
    addAutoRow(selectedIdPort, service, "Service_Port");

    if (service.includes("_INTERNET")) {
      addAutoRow(svlanInternet, service, "S-Vlan");
    }

    if (service.includes("_VOICE")) {
      addAutoRow(svlanVoice, service, "S-Vlan");
    }
  });
}

/* =======================
   TABLE HELPERS
======================= */
function addAutoRow(resourceId, service, config) {
  const tbody = document.querySelector("#dataTable tbody");
  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td><input class="res-id auto-fill" value="${resourceId}"></td>
    <td><input class="ser-name auto-fill" value="${service}"></td>
    <td><input class="tar-id" value=""></td>
    <td>
      <select class="cfg-name">
        <option value="Service_Port" ${config==="Service_Port"?"selected":""}>Service_Port</option>
        <option value="S-Vlan" ${config==="S-Vlan"?"selected":""}>S-Vlan</option>
        <option value="Subscriber_Terminal_Port">Subscriber_Terminal_Port</option>
        <option value="Service_Trail">Service_Trail</option>
      </select>
    </td>
    <td style="text-align:center">
      <button class="btn-remove" onclick="removeRow(this)">✕</button>
    </td>
  `;
  tbody.appendChild(tr);
}

function addRow() {
  addAutoRow(selectedIdPort, "", "Service_Port");
}

function removeRow(btn) {
  const row = btn.closest("tr");
  const tbody = row.parentElement;
  if (tbody.rows.length > 1) row.remove();
}

function downloadCSV() {
  const rows = document.querySelectorAll("#dataTable tr");
  let csv = "";

  rows.forEach((row, i) => {
    const cols = row.querySelectorAll("th, td");
    let data = [];

    for (let j = 0; j < cols.length - 1; j++) {
      if (i === 0) {
        data.push(`"${cols[j].innerText}"`);
      } else {
        const el = cols[j].querySelector("input,select");
        data.push(`"${el ? el.value.replace(/"/g,'""') : ""}"
