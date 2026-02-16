document.addEventListener("DOMContentLoaded", () => {

  loadFlowStatus();
  initSort();

});


/* ===============================
   Global
================================ */

let flowData = [];
let sortState = {};

const FLOW_URL =
"https://default89f38dda879047709595a7ecf63263.84.environment.api.powerplatform.com/powerautomate/automations/direct/workflows/5102ab2749dc4406ad1dbc35fc48d44b/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=Vg4TaQfR0ctAHj3fT2to0wMLJcb5gIlsZiqDOcFCbmg";


/* ===============================
   Load
================================ */

async function loadFlowStatus() {

  showLoading();

  try {

    const res = await fetch(FLOW_URL);

    if (!res.ok) throw new Error();

    const data = await res.json();

    flowData = data;

    render(flowData);

    updateTime();

  } catch {

    document.getElementById("flowList").innerHTML = `
      <tr>
        <td colspan="6"
            style="color:#ef4444;text-align:center;">
          取得失敗
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

function render(list) {

  const tbody = document.getElementById("flowList");

  tbody.innerHTML = "";

  list.forEach(flow => {

    if (
      flow.state === "Stopped" ||
      flow.state === "Suspended"
    ) return;


    let interval = "-";
    let week = "-";


    if (flow.recurrence) {

      switch (flow.recurrence.frequency) {

        case "Week":
          interval = "週";
          break;

        case "Day":
          interval = "日";
          break;

        case "Month":
          interval = flow.recurrence.interval + "ヶ月";
          break;
      }


      const days =
        flow?.recurrence?.schedule?.weekDays ?? [];

      const map = {
        Monday: "月",
        Tuesday: "火",
        Wednesday: "水",
        Thursday: "木",
        Friday: "金",
        Saturday: "土",
        Sunday: "日",
      };

      if (Array.isArray(days)) {

        week = days
          .map(d => map[d] ?? d)
          .join(",");

      }
    }


    const hour =
      flow?.recurrence?.schedule?.hours ?? "-";

    const min =
      flow?.recurrence?.schedule?.minutes ?? "-";


    const status = getStatus(flow.state);


    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${escapeHtml(flow.flowName)}</td>

      <td class="${status.class}">
        ${status.label}
      </td>

      <td>${interval}</td>
      <td>${week}</td>
      <td>${hour}</td>
      <td>${min}</td>
    `;

    tbody.appendChild(tr);

  });

}


/* ===============================
   Status
================================ */

function getStatus(state) {

  switch (state) {

    case "Started":
      return {
        class: "status-active",
        label: "稼働中"
      };

    case "Stopped":
      return {
        class: "status-error",
        label: "停止"
      };

    case "Suspended":
      return {
        class: "status-standby",
        label: "一時停止"
      };

    default:
      return {
        class: "status-unknown",
        label: state ?? "-"
      };
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
          sortState[key] === "asc"
            ? "desc"
            : "asc";

        sortState = {};
        sortState[key] = order;

        doSort(key, order);

      });

    });

}


function doSort(key, order) {

  const sorted = [...flowData];

  sorted.sort((a, b) => {

    let v1 = getValue(a, key);
    let v2 = getValue(b, key);

    if (v1 < v2) return order === "asc" ? -1 : 1;
    if (v1 > v2) return order === "asc" ? 1 : -1;

    return 0;
  });

  render(sorted);

}


function getValue(flow, key) {

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
   Loading
================================ */

function showLoading() {

  document
    .getElementById("loading")
    .classList
    .add("active");

}


function hideLoading() {

  document
    .getElementById("loading")
    .classList
    .remove("active");

}


/* ===============================
   Utility
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


function escapeHtml(str) {

  if (!str) return "";

  return str
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;");

}
