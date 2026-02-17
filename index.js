document.addEventListener("DOMContentLoaded", () => {
  loadFlowStatus();
});


/* ===============================
   設定
================================ */

const FLOW_URL =
  'https://default89f38dda879047709595a7ecf63263.84.environment.api.powerplatform.com/powerautomate/automations/direct/workflows/5102ab2749dc4406ad1dbc35fc48d44b/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=Vg4TaQfR0ctAHj3fT2to0wMLJcb5gIlsZiqDOcFCbmg';


let flowData = [];
let currentSort = {
  key: null,
  asc: true
};


/* ===============================
   ロード
================================ */

async function loadFlowStatus() {

  showLoading(true);

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

    showLoading(false);

  }
}


/* ===============================
   JSON配列変換（今回の対応部分）
================================ */

function parseJsonArray(str) {

  try {

    return JSON.parse(str);

  } catch {

    return [];

  }
}


/* ===============================
   描画
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

    const tr = document.createElement("tr");


    /* ===== 実行間隔 ===== */

    let interval_label = flow.interval || '-';

    switch (interval_label) {

      case "Week":
        interval_label = "曜日";
        break;

      case "Day":
        interval_label = "日";
        break;

      case "Month":
        interval_label = "月";
        break;

      default:
        interval_label = "-";
        break;
    }


    /* ===== 曜日（JSON文字列対応） ===== */

    const weeklyArr = parseJsonArray(flow.weekly);

    const result_label = weeklyArr
      .map(d => convertMap[d] ?? d)
      .join(',');


    /* ===== 時刻（JSON文字列対応） ===== */

    const hourArr = parseJsonArray(flow.hour);
    const minArr  = parseJsonArray(flow.min);

    const hour = hourArr[0] ?? '-';
    const min  = minArr[0] ?? '-';


    /* ===== ステータス ===== */

    const flow_status_label = statusClass(flow.state);


    tr.innerHTML = `
      <td>${escape(flow.flowName)}</td>

      <td class="${flow_status_label}">
        ${flow.state || "-"}
      </td>

      <td>${interval_label}</td>

      <td>${result_label || "-"}</td>

      <td>${hour}</td>

      <td>${min}</td>
    `;

    tbody.appendChild(tr);

  });
}


/* ===============================
   ステータスCSS
================================ */

function statusClass(status) {

  if (!status) return "status-unknown";

  switch (status) {

    case "Started":
      return "status-active";

    case "Stopped":
      return "status-error";

    case "Suspended":
      return "status-standby";

    default:
      return "status-unknown";
  }
}


/* ===============================
   ソート
================================ */

function sortBy(key) {

  if (currentSort.key === key) {

    currentSort.asc = !currentSort.asc;

  } else {

    currentSort.key = key;
    currentSort.asc = true;

  }


  flowData.sort((a, b) => {

    let v1 = a[key] ?? '';
    let v2 = b[key] ?? '';


    if (typeof v1 === 'string') v1 = v1.toLowerCase();
    if (typeof v2 === 'string') v2 = v2.toLowerCase();


    if (v1 < v2) return currentSort.asc ? -1 : 1;
    if (v1 > v2) return currentSort.asc ? 1 : -1;

    return 0;

  });


  render(flowData);
}


/* ===============================
   ローディング
================================ */

function showLoading(show) {

  let loader = document.getElementById("loading");

  if (!loader) {

    loader = document.createElement("div");

    loader.id = "loading";

    loader.innerHTML = `
      <div class="spinner"></div>
      <div>Loading...</div>
    `;

    loader.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(15,17,23,0.9);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      color: white;
      font-size: 14px;
    `;

    document.body.appendChild(loader);
  }

  loader.style.display = show ? "flex" : "none";
}


/* ===============================
   更新時刻
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


/* ===============================
   Utils
================================ */

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
