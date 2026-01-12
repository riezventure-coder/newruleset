/*************************************************
 * GLOBAL
 *************************************************/
let data = [];
let selectedIdPort = "";

/*************************************************
 * LOAD CSV (TANPA UPLOAD MANUAL)
 *************************************************/
Papa.parse("data.csv", {
  download: true,
  delimiter: ",",
  header: true,
  skipEmptyLines: true,
  complete: function (results) {
    data = results.data;

    document.getElementById("search-btn").addEventListener("click", searchData);
  },
});

/*************************************************
 * SEARCH DATA
 *************************************************/
function searchData() {
  const IP_ADDRESS = document.getElementById("ip").value.trim();
  const SLOT = document.getElementById("slot").value.trim();
  const PORT = document.getElementById("port").value.trim();

  const filteredData = data.filter((item) => {
    return (
      item.IP === IP_ADDRESS &&
      item.SLOT === SLOT &&
      item.PORT === PORT
    );
  });

  renderTable(filteredData);
}

/*************************************************
 * RENDER TABLE (INI JAWABAN PERTANYAAN KAMU)
 *************************************************/
function renderTable(data) {
  const tbody = document.getElementById("result-body");
  const emptyMsg = document.getElementById("empty-msg");

  tbody.innerHTML = "";
  emptyMsg.textContent = "";

  if (data.length === 0) {
    emptyMsg.textContent = "Tidak ada data yang ditemukan.";
    return;
  }

  data.forEach((item) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${item.IP}</td>
      <td>${item.SLOT}</td>
      <td>${item.PORT}</td>
      <td>${item.VLAN}</td>
      <td><b>${item.ID_PORT}</b></td>
      <td>${item.GPON}</td>
      <td>${item.VENDOR}</td>
    `;

    // 👉 LINK ID_PORT → RESOURCE_ID
    row.addEventListener("click", () => {
      selectedIdPort = item.ID_PORT;

      document.querySelectorAll(".res-id").forEach((input) => {
        input.value = selectedIdPort;
      });

      // Optional highlight
      document.querySelectorAll("#result-body tr").forEach(tr => {
        tr.style.background = "";
      });
      row.style.background = "#d1ecf1";
    });

    tbody.appendChild(row);
  });
}

/*************************************************
 * ALTER PROV TABLE
 *************************************************/
function addRow() {
  const tableBody = document.querySelector("#dataTable tbody");
  const newRow = document.createElement("tr");

  newRow.innerHTML = `
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

  tableBody.appendChild(newRow);
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
  let csvContent = "";

  rows.forEach((row, rowIndex) => {
    const cols = row.querySelectorAll("th, td");
    let rowData = [];

    for (let i = 0; i < cols.length - 1; i++) {
      let value = "";

      if (rowIndex === 0) {
        value = cols[i].innerText;
      } else {
        const input = cols[i].querySelector("input, select");
        value = input ? input.value : "";
      }

      value = value.replace(/"/g, '""');
      rowData.push(`"${value}"`);
    }

    csvContent += rowData.join(",") + "\n";
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "Alter_Service_Config_Item.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
