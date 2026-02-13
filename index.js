
document.addEventListener("DOMContentLoaded", () => {
  loadFlowStatus();
});


async function loadFlowStatus() {

  const FLOW_URL = 'https://default89f38dda879047709595a7ecf63263.84.environment.api.powerplatform.com/powerautomate/automations/direct/workflows/5102ab2749dc4406ad1dbc35fc48d44b/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=Vg4TaQfR0ctAHj3fT2to0wMLJcb5gIlsZiqDOcFCbmg';

  try {

    const res = await fetch(FLOW_URL);

    if (!res.ok) throw new Error("Load failed");

    const data = await res.json();

    render(data);
    updateTime();

  } catch (e) {

    console.error(e);

    document.getElementById("flowList").innerHTML = `
      <tr>
        <td colspan="5" style="color:#ef4444;">
          Failed to load data
        </td>
      </tr>
    `;
  }
}


function render(data) {

  const tbody = document.getElementById("flowList");

  tbody.innerHTML = "";

  data.forEach(flow => {

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${escape(flow.name)}</td>
      <td class="${statusClass(flow.status)}">
        ${flow.status || "-"}
      </td>
      <td>${flow.lastRun || "-"}</td>
      <td>${flow.runTime ? flow.runTime + "s" : "-"}</td>
      <td>${flow.result || "-"}</td>
    `;

    tbody.appendChild(tr);
  });
}


function statusClass(status) {

  if (!status) return "status-unknown";

  switch (status.toLowerCase()) {

    case "active":
      return "status-active";

    case "standby":
      return "status-standby";

    case "error":
    case "failed":
      return "status-error";

    default:
      return "status-unknown";
  }
}


function updateTime() {

  const d = new Date();

  const t =
    d.getFullYear() + "/" +
    pad(d.getMonth() + 1) + "/" +
    pad(d.getDate()) + " " +
    pad(d.getHours()) + ":" +
    pad(d.getMinutes());

  document.getElementById("updatedAt").textContent =
    "Updated: " + t;
}


function pad(n) {
  return n.toString().padStart(2, "0");
}


function escape(str) {

  if (!str) return "";

  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}