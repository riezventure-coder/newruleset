/***********************
 * GLOBAL STATE
 ***********************/
let csvData = [];

/***********************
 * LOAD CSV
 ***********************/
Papa.parse("data.csv", {
  download: true,
  header: true,
  skipEmptyLines: true,
  complete: function (results) {
    csvData = results.data;
  },
});

/***********************
 * SEARCH BUTTON
 ***********************/
document.getElementById("search-btn").addEventListener("click", searchData);

function searchData() {
  const ip = document.getElementById("ip").value.trim();
  const slot = document.getElementById("slot").value.trim();
  const port = document.getElementById("port").value.trim();

  const resultBody = document.getElementById("result-body");
  resultBody.innerHTML = "";

  const found = csvData.find(
    (r) => r.IP === ip && r.SLOT === slot && r.PORT === port
  );

  if (!found) {
    alert("Data tidak ditemukan");
    return;
  }

  // === RENDER TABEL ATAS ===
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td>${found.IP}</td>
    <td>${found.SLOT}</td>
    <td>${found.PORT}</td>
    <td>${found.VLAN}</td>
    <td>${found.ID_PORT}</td>
    <td>${found.GPON}</td>
    <td>${found.VENDOR}</td>
  `;
  resultBody.appendChild(tr);

  // === AUTO GENERATE ALTER PROV ===
  generateAlterProv(found);
}

/***********************
 * AUTO ALTER PROV
 ***********************/
function generateAlterProv(data) {
  const tbody = document.querySelector("#dataTable tbody");
  tbody.innerHTML = "";

  const idPort = data.ID_PORT;
  const serviceName = `1-PAZ3CMG_${idPort}_INTERNET`;

  // === BARIS 1: Service_Port ===
  tbody.appendChild(createRow(idPort, serviceName, "", "Service_Port"));

  // === BARIS VLAN (S-Vlan) ===
  const vlans = data.VLAN.split(",").map(v => v.trim()).filter(v => v);

  vlans.forEach(vlan => {
    tbody.appendChild(createRow(vlan, serviceName, "", "S-Vlan"));
  });
}

/***********************
 * CREATE ROW
 ***********************/
function createRow(resourceId, serviceName, targetId, configName) {
  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td><input type="text" value="${resourceId}"></td>
    <td><input type="text" value="${serviceName}"></td>
    <td><input type="text" value="${targetId}"></td>
    <td>
      <select>
        <option ${configName === "Service_Port" ? "selected" : ""}>Service_Port</option>
        <option ${configName === "S-Vlan" ? "selected" : ""}>S-Vlan</option>
        <option ${configName === "Subscriber_Terminal_Port" ? "selected" : ""}>Subscriber_Terminal_Port</option>
        <option ${configName === "Service_Trail" ? "selected" : ""}>Service_Trail</option>
      </select>
    </td>
    <td style="text-align:center">
      <button onclick="this.closest('tr').remove()">✕</button>
    </td>
  `;

  return tr;
}

/***********************
 * EXPORT CSV
 ***********************/
function downloadCSV() {
  const rows = [];
  rows.push(["RESOURCE_ID", "SERVICE_NAME", "TARGET_ID", "CONFIG_ITEM_NAME"]);

  document.querySelectorAll("#dataTable tbody tr").forEach(tr => {
    const tds = tr.querySelectorAll("td");
    rows.push([
      tds[0].querySelector("input").value,
      tds[1].querySelector("input").value,
      tds[2].querySelector("input").value,
      tds[3].querySelector("select").value,
    ]);
  });

  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "alter_prov.csv";
  a.click();
}
