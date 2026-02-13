
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
          フローデータを取得できませんでした。
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

    let interval_label = '';
    let time_label = '';
    let weekly_label = '';

    if (flow.recurrence !== null) {

      switch (flow.recurrence.frequency?.value) {

          case "Week":
              interval_label = '曜日';
              break;

          case "Day":
              interval_label = '日';
              break;

          case "Month":
              interval_label = (flow.recurrence.interval + 'ヵ月');
              break;
        
          default:
              interval_label = '曜日';
              break;

      }


      if (interval_label = '曜日') {
          weekly_label = ('weekDays' in flow.recurrence.schedule) ? flow.recurrence.schedule.weekDays : [];
      }


    } else {
        interval_label = '-';
    }


    let time = ('hours' in flow.recurrence.schedule) ? flow.recurrence.schedule.hours : 0;
    let min = ('minutes' in flow.recurrence.scheduleow) ? flow.recurrence.schedule.minutes : 0;
    

    tr.innerHTML = `
      <td>${escape(flow.flowName)}</td>
      <td class="${statusClass(flow.state)}">
        ${flow.state || "-"}
      </td>
      <td>${interval_label || "-"}</td>
      <td>${weekly_label || "-"}</td>
      <td>${time || "-"}</td>
      <td>${min || "-"}</td>
    `;

    tbody.appendChild(tr);
  });
}


function statusClass(status) {

  if (!status) return "status-unknown";

  switch (status.toLowerCase()) {

    case "Stopped":
      return "status-stopped";

    case "Started":
      return "status-started";

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