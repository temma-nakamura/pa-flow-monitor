const DATA_URL = "./data/status.json";


document.addEventListener("DOMContentLoaded", () => {
    loadFlowStatus();
});


async function loadFlowStatus() {

    try {

        const response = await fetch(DATA_URL);

        if (!response.ok) {
            throw new Error("データ取得失敗");
        }

        const data = await response.json();

        renderTable(data);
        updateTime();

    } catch (error) {

        console.error(error);

        const tbody = document.getElementById("flowList");
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="color:red;">
                    データを取得できませんでした
                </td>
            </tr>
        `;
    }
}


/* ===== Table描画 ===== */

function renderTable(data) {

    const tbody = document.getElementById("flowList");

    tbody.innerHTML = "";

    data.forEach(flow => {

        const statusClass = getStatusClass(flow.status);

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${escapeHtml(flow.name)}</td>
            <td class="${statusClass}">
                ${flow.status}
            </td>
            <td>${flow.lastRun || "-"}</td>
            <td>${flow.runTime ? flow.runTime + "s" : "-"}</td>
            <td>${flow.result || "-"}</td>
        `;

        tbody.appendChild(tr);
    });
}


/* ===== Status判定 ===== */

function getStatusClass(status) {

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


/* ===== 更新時刻表示 ===== */

function updateTime() {

    const now = new Date();

    const text =
        now.getFullYear() + "/" +
        pad(now.getMonth() + 1) + "/" +
        pad(now.getDate()) + " " +
        pad(now.getHours()) + ":" +
        pad(now.getMinutes());

    document.getElementById("updatedAt").textContent =
        "最終更新：" + text;
}


/* ===== Utils ===== */

function pad(num) {
    return num.toString().padStart(2, "0");
}


function escapeHtml(str) {

    if (!str) return "";

    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
