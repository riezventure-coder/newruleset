/*************************************************
 * GLOBAL
 *************************************************/
let data = [];
let selectedIdPort = "";

/*************************************************
 * LOAD CSV (GITHUB PAGES FRIENDLY)
 *************************************************/
Papa.parse("./data.csv", {
  download: true,
  header: true,
  skipEmptyLines: true,
  complete: function (results) {
    console.log("CSV LOADED:", results.data.length);
    data = results.data;

    const btn = document.getElementById("search-btn");
    if (btn) {
      btn.addEventListener("click", searchData);
    }
  },
  error: function (err) {
    console.error("CSV LOAD ERROR:", err);
  }
});

/*************************************************
 * SEARCH
 *************************************************/
function searchData() {
  const IP = document.getElementById("ip").value.trim();
  const SLOT = document.getElementById("slot").value.trim();
  const PORT = document.getElementById("port").value.trim();

  if (!IP || !SLOT || !PORT) {
    alert("IP, SLOT, dan PORT wajib diisi");
    return;
  }

  const result = data.filter(d =>
    d.IP === IP &&
    d.SLOT === SLOT &&
    d.PORT === PORT
  );

  renderTable(result);
}

/*************************************************
 * RENDER TABLE (INI YANG KAMU CARI)
 *************************************************/
function renderTable(rows) {
  const tbody = document.getElementById("result-body");
  const emptyMsg = document.getElementById("empty-msg");

  tbody.innerHTML = "";
  emptyMsg.textContent = "";

  if (!rows || rows.length === 0) {
    emptyMsg.textContent = "Tidak ada data yang ditemukan.";
    return;
  }

  rows.forEach(item => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${item.IP}</td>
      <td>${item.SLOT}</td>
      <td>${item.PORT}</td>
      <td>${item.VLAN}</td>
      <td><b>${item.ID_PORT}</b></td>
      <td>${item.GPON}</td>
      <td>${item.VENDOR}</td>
    `;

    // 👉 LINK ID_PORT → RESOURCE_ID
    tr.addEventListener("click", () => {
      selectedIdPort = item.ID_PORT;

      document.querySelectorAll(".res-id").forEach(i => {
        i.value = selectedIdPort;
      });

      document.querySelectorAll("#result-body tr").forEach(r => {
        r.style.background = "";
      });
      tr.style.background = "#cce5ff";
    });

    tbody.appendChild(tr);
  });
}

/*************************************************
 * ALTER PROV TABLE
 *************************************************/
function addRow() {
  const tbody = document.querySelector("#dataTable tbody");
  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td><input type="text" class="res-id" value="${selectedIdPort}" placeholder="RESOURCE_ID"></td>
    <td><input type="text" class="ser-name" placeholder="SERVICE_NAME"></td>
    <td><input type="text" class="tar-id" placeholder="TARGET_ID (kosong)"></td>
    <td>
      <select class="cfg-name">
        <option value="Service_Port">Service_Port</option>
        <option value="S-Vlan">S-Vlan</option>
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

function removeRow(btn) {
  const tbody = document.querySelector("#dataTable tbody");
  if (tbody.rows.length > 1) {
    btn.closest("tr").remove();
  } else {
    alert("Minimal harus ada 1 baris");
  }
}

/*************************************************
 * EXPORT CSV
 *************************************************/
function downloadCSV() {
  const rows = document.querySelectorAll("#dataTable tr");
  let csv = "";

  rows.forEach((row, idx) => {
    const cols = row.querySelectorAll("th, td");
    let line = [];

    for (let i = 0; i < cols.length - 1; i++) {
      let val = "";

      if (idx === 0) {
        val = cols[i].innerText;
      } else {
        const el = cols[i].querySelector("input, select");
        val = el ? el.value : "";
      }

      val = val.replace(/"/g, '""');
      line.push(`"${val}"`);
    }

    csv += line.join(",") + "\n";
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = "Alter_Service_Config_Item.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
