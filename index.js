let flowData = [];
let sortState = { key: null, asc: true };

/* ================= 初期処理 ================= */

window.addEventListener('load', () => {
  loadFlowStatus();
  initSort();
});

/* ================= ローディング ================= */

function showLoading() {
  document.getElementById('loading').style.display = 'flex';
}

function hideLoading() {
  document.getElementById('loading').style.display = 'none';
}

/* ================= 曜日変換 ================= */

const dayMap = {
  Monday: '月',
  Tuesday: '火',
  Wednesday: '水',
  Thursday: '木',
  Friday: '金',
  Saturday: '土',
  Sunday: '日'
};

function convertWeek(days = []) {
  return days.map(d => dayMap[d] ?? d).join(',');
}

/* ================= Status変換 ================= */

function convertStatus(raw) {

  switch (raw) {

    case 'Started':
      return { text: '稼働中', class: 'status-active' };

    case 'Stopped':
      return { text: '停止中', class: 'status-error' };

    case 'Disabled':
      return { text: '待機', class: 'status-standby' };

    default:
      return { text: '不明', class: 'status-unknown' };
  }
}

/* ================= データ取得 ================= */

async function loadFlowStatus() {

  showLoading();

  try {

    // ===== 本番はAPIに置き換え =====
    await new Promise(r => setTimeout(r, 800));

    flowData = [
      {
        name: 'Daily Report',
        status: 'Started',
        interval: 'Day',
        weekdays: ['Monday','Tuesday','Wednesday','Thursday','Friday'],
        hour: 9,
        min: 0
      },
      {
        name: 'Backup',
        status: 'Stopped',
        interval: 'Week',
        weekdays: ['Sunday'],
        hour: 2,
        min: 30
      }
    ];

    renderTable();
    updateTime();

  } finally {

    hideLoading();
  }
}

/* ================= 表描画 ================= */

function renderTable() {

  const tbody = document.getElementById('flowList');
  tbody.innerHTML = '';

  flowData.forEach(d => {

    const status = convertStatus(d.status);

    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${d.name}</td>

      <td class="${status.class}">
        ${status.text}
      </td>

      <td>${d.interval}</td>

      <td>${convertWeek(d.weekdays)}</td>

      <td>${d.hour}</td>

      <td>${d.min}</td>
    `;

    tbody.appendChild(tr);
  });
}

/* ================= 更新時間 ================= */

function updateTime() {

  document.getElementById('updatedAt')
    .textContent =
    new Date().toLocaleString();
}

/* ================= ソート ================= */

function initSort() {

  document
    .querySelectorAll('th[data-key]')
    .forEach(th => {

      th.addEventListener('click', () => {

        const key = th.dataset.key;

        sortTable(key);
      });
    });
}

function sortTable(key) {

  if (sortState.key === key) {
    sortState.asc = !sortState.asc;
  } else {
    sortState.key = key;
    sortState.asc = true;
  }

  flowData.sort((a,b)=>{

    let v1 = a[key];
    let v2 = b[key];

    if (Array.isArray(v1)) v1 = v1.join();
    if (Array.isArray(v2)) v2 = v2.join();

    if (v1 > v2) return sortState.asc ? 1 : -1;
    if (v1 < v2) return sortState.asc ? -1 : 1;

    return 0;
  });

  renderTable();
}
