document.addEventListener("DOMContentLoaded", () => {

  initSort();
  loadFlowStatus();

});


/* ===============================
   Global
================================ */

let flowData = [];
let sortState = {};


/* ===============================
   Loading Control
================================ */

function showLoading() {
  document.getElementById("loading").classList.remove("hidden");
}

function hideLoading() {
  document.getElementById("loading").classList.add("hidden");
}


/* ===============================
   Load
================================ */

async function loadFlowStatus() {

  showLoading();

  const FLOW_URL =
    "https://default89f38dda879047709595a7ecf63263.84.environment.api.powerplatform.com/powerautomate/automations/direct/workflows/5102ab2749dc4406ad1dbc35fc48d44b/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=Vg4TaQfR0ctAHj3fT2to0wMLJcb5gIlsZiqDOcFCbmg";

  try {

    const res = await fetch(FLOW_URL);

    if (!res.ok) throw new Error("Load failed");

    const data = await res.json();

    flowData = data;

    render(flowData);
    updateTime();

  } catch (e) {

    console.error(e);

    document.getElementById("flowList").innerHTML = `
      <tr>
        <td colspan="6" style="color:#ef4444;">
          フローデータを取得できませんでした
        </td>
      </tr>
    `;

  } finally {

    hideLoading();

  }
}


/* ===============================
   Render
================================ */

function render(data) {

  const tbody = document.getElementById("flowList");

  tbody.innerHTML = "";


  const convertMap = {
    Monday: '月',
    Tuesday: '火',
    Wednesday: '水',
    Thursday: '木',
    Friday: '金',
    Saturday: '土',
    Sunday: '日',
  };


  data.forEach(flow => {

    if (flow.state === "Stopped" || flow.state === "Suspended") {
      return;
    }

    const tr = document.createElement("tr");


    /* interval */

    let intervalLabel = "-";

    switch (flow?.recurrence?.frequency) {

      case "Week":
        intervalLabel = "曜日";
        break;

      case "Day":
        intervalLabel = "日";
        break;

      case "Month":
        intervalLabel = flow.recurrence.interval + "ヵ月";
        break;
    }


    /* week */

    let weekLabel = "-";

    const week = flow?.recurrence?.schedule?.weekDays ?? [];

    if (Array.isArray(week) && week.length) {

      weekLabel = week
        .map(d => convertMap[d] ?? d)
        .join(",");
    }


    /* time */

    const hour = flow?.recurrence?.schedule?.hours ?? "-";
    const min  = flow?.recurrence?.schedule?.minutes ?? "-";


    /* status */

    const statusClass = getStatusClass(flow.state);


    tr.innerHTML = `
      <td>${escapeHtml(flow.flowName)}</td>
      <td class="${statusClass}">${flow.state}</td>
      <td>${intervalLabel}</td>
      <td>${weekLabel}</td>
      <td>${hour}</td>
      <td>${min}</td>
    `;

    tbody.appendChild(tr);
  });

}


/* ===============================
   Status Class
================================ */

function getStatusClass(status) {

  switch (status) {

    case "Started":
      return "status-active";

    case "Stopped":
      return "status-stopped";

    default:
      return "status-unknown";
  }
}


/* ===============================
   Sort
================================ */

function initSort() {

  document
    .querySelectorAll("th[data-sort]")
    .forEach(th => {

      th.addEventListener("click", () => {

        const key = th.dataset.sort;

        const order =
          sortState[key] === "asc" ? "desc" : "asc";

        sortState = {};
        sortState[key] = order;

        sortTable(key, order);
      });

    });
}


function sortTable(key, order) {

  const sorted = [...flowData].sort((a, b) => {

    const v1 = getSortValue(a, key);
    const v2 = getSortValue(b, key);

    if (v1 < v2) return order === "asc" ? -1 : 1;
    if (v1 > v2) return order === "asc" ? 1 : -1;

    return 0;
  });

  render(sorted);
}


function getSortValue(flow, key) {

  switch (key) {

    case "name":
      return flow.flowName ?? "";

    case "status":
      return flow.state ?? "";

    case "interval":
      return flow?.recurrence?.frequency ?? "";

    case "week":
      return (
        flow?.recurrence?.schedule?.weekDays?.join(",") ?? ""
      );

    case "hour":
      return flow?.recurrence?.schedule?.hours ?? 0;

    case "min":
      return flow?.recurrence?.schedule?.minutes ?? 0;

    default:
      return "";
  }
}


/* ===============================
   Time
================================ */

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


/* ===============================
   Escape
================================ */

function escapeHtml(str) {

  if (!str) return "";

  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
