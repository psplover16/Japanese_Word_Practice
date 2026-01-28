// ====== App.js ======
const STORAGE_KEY = "JPPRACTICE_UNKNOWN_COUNTS";
// ====== Data ======
// 以 row/col 方式描述 50音表（含 wi / we），空格用 null
const GRID = [
  {
    rowLabel: { jp: "あ段", rp: "a" }, cells: [
      { rp: "a", h: "あ", k: "ア" }, { rp: "i", h: "い", k: "イ" }, { rp: "u", h: "う", k: "ウ" }, { rp: "e", h: "え", k: "エ" }, { rp: "o", h: "お", k: "オ" },
    ]
  },
  {
    rowLabel: { jp: "か行", rp: "k" }, cells: [
      { rp: "ka", h: "か", k: "カ" }, { rp: "ki", h: "き", k: "キ" }, { rp: "ku", h: "く", k: "ク" }, { rp: "ke", h: "け", k: "ケ" }, { rp: "ko", h: "こ", k: "コ" },
    ]
  },
  {
    rowLabel: { jp: "さ行", rp: "s" }, cells: [
      { rp: "sa", h: "さ", k: "サ" }, { rp: "shi", h: "し", k: "シ" }, { rp: "su", h: "す", k: "ス" }, { rp: "se", h: "せ", k: "セ" }, { rp: "so", h: "そ", k: "ソ" },
    ]
  },
  {
    rowLabel: { jp: "た行", rp: "t" }, cells: [
      { rp: "ta", h: "た", k: "タ" }, { rp: "chi", h: "ち", k: "チ" }, { rp: "tsu", h: "つ", k: "ツ" }, { rp: "te", h: "て", k: "テ" }, { rp: "to", h: "と", k: "ト" },
    ]
  },
  {
    rowLabel: { jp: "な行", rp: "n" }, cells: [
      { rp: "na", h: "な", k: "ナ" }, { rp: "ni", h: "に", k: "ニ" }, { rp: "nu", h: "ぬ", k: "ヌ" }, { rp: "ne", h: "ね", k: "ネ" }, { rp: "no", h: "の", k: "ノ" },
    ]
  },
  {
    rowLabel: { jp: "は行", rp: "h" }, cells: [
      { rp: "ha", h: "は", k: "ハ" }, { rp: "hi", h: "ひ", k: "ヒ" }, { rp: "fu", h: "ふ", k: "フ" }, { rp: "he", h: "へ", k: "ヘ" }, { rp: "ho", h: "ほ", k: "ホ" },
    ]
  },
  {
    rowLabel: { jp: "ま行", rp: "m" }, cells: [
      { rp: "ma", h: "ま", k: "マ" }, { rp: "mi", h: "み", k: "ミ" }, { rp: "mu", h: "む", k: "ム" }, { rp: "me", h: "め", k: "メ" }, { rp: "mo", h: "も", k: "モ" },
    ]
  },
  {
    rowLabel: { jp: "や行", rp: "y" }, cells: [
      { rp: "ya", h: "や", k: "ヤ" }, null, { rp: "yu", h: "ゆ", k: "ユ" }, null, { rp: "yo", h: "よ", k: "ヨ" },
    ]
  },
  {
    rowLabel: { jp: "ら行", rp: "r" }, cells: [
      { rp: "ra", h: "ら", k: "ラ" }, { rp: "ri", h: "り", k: "リ" }, { rp: "ru", h: "る", k: "ル" }, { rp: "re", h: "れ", k: "レ" }, { rp: "ro", h: "ろ", k: "ロ" },
    ]
  },
  {
    rowLabel: { jp: "わ行", rp: "w" }, cells: [
      { rp: "wa", h: "わ", k: "ワ" }, { rp: "wi", h: "ゐ", k: "ヰ" }, null, { rp: "we", h: "ゑ", k: "ヱ" }, { rp: "wo", h: "を", k: "ヲ" },
    ]
  },
  {
    rowLabel: { jp: "ん", rp: "n" }, cells: [
      { rp: "n", h: "ん", k: "ン" }, null, null, null, null
    ]
  },
];

// 取出所有可用音節（不含 null）
const ALL_ITEMS = GRID.flatMap(row => row.cells.filter(Boolean));

// ====== Utils ======
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, m => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[m]));
}

// ====== State ======
const state = {
  selected: new Set(ALL_ITEMS.map(x => x.rp)), // 預設全選音節
  includeHira: true,
  includeKata: true,

  // quiz
  quizList: [],        // [{rp,h,k, script:'h'|'k'}...]
  quizIndex: 0,
  revealRomaji: false,
  unknownCounts: new Map(), // rp -> count
};

// ====== DOM ======
const tableWrap = document.getElementById("tableWrap");
const toggleHira = document.getElementById("toggleHira");
const toggleKata = document.getElementById("toggleKata");
const toggleAll = document.getElementById("toggleAll");
const countInput = document.getElementById("countInput");
const startBtn = document.getElementById("startBtn");
const clearResultBtn = document.getElementById("clearResultBtn");

const statsText = document.getElementById("statsText");
const scriptText = document.getElementById("scriptText");

const overlay = document.getElementById("overlay");
const backdrop = document.getElementById("backdrop");
const progressText = document.getElementById("progressText");
const quizKana = document.getElementById("quizKana");
const quizRomaji = document.getElementById("quizRomaji");
const quizTip = document.getElementById("quizTip");
const nextBtn = document.getElementById("nextBtn");
const unknownBtn = document.getElementById("unknownBtn");
const quitOverlay = document.getElementById("quitOverlay");

const resultBox = document.getElementById("resultBox");
const resultHint = document.getElementById("resultHint");
const resultChips = document.getElementById("resultChips");

// ====== Render Gojuon Table ======
function renderTable() {
  const showH = state.includeHira;
  const showK = state.includeKata;

  const headerCols = ["", "a/i/u/e/o"]; // 只是佔位用
  // 用表格畫法：左側 row label + 5 欄
  let html = `
      <table class="gojuon" aria-label="五十音表">
        <thead>
          <tr>
            <th class="corner">行 / 段</th>
            <th>あ段</th><th>い段</th><th>う段</th><th>え段</th><th>お段</th>
          </tr>
        </thead>
        <tbody>
    `;

  for (const row of GRID) {
    html += `<tr>`;
    html += `
        <th>
          <div class="rowLabel">
            <div class="jp">${escapeHtml(row.rowLabel.jp)}</div>
            <div class="rp">${escapeHtml(row.rowLabel.rp)}</div>
          </div>
        </th>
      `;

    for (const cell of row.cells) {
      if (!cell) {
        html += `<td class="empty">—</td>`;
        continue;
      }
      const checked = state.selected.has(cell.rp) ? "checked" : "";
      const kanaText = (showH && showK)
        ? `${cell.h} / ${cell.k}`
        : (showH ? cell.h : (showK ? cell.k : "—"));

      html += `
          <td>
<label>
            <input class="pick" type="checkbox" data-rp="${escapeHtml(cell.rp)}" ${checked} aria-label="選擇 ${escapeHtml(cell.rp)}"/>
            <div class="cell">
              <div class="kana">${escapeHtml(kanaText)}</div>
              <div class="romaji">${escapeHtml(cell.rp)}</div>
            </div>
</label
          </td>
        `;
    }
    html += `</tr>`;
  }

  html += `</tbody></table>`;
  tableWrap.innerHTML = html;

  // 綁定 cell checkbox
  tableWrap.querySelectorAll('input.pick').forEach(cb => {
    cb.addEventListener("change", (e) => {
      const rp = e.target.getAttribute("data-rp");
      if (e.target.checked) state.selected.add(rp);
      else state.selected.delete(rp);

      syncToggleAll();
      updateStats();
    });
  });

  updateStats();
}

function syncToggleAll() {
  // 若全部音節都選了 => toggleAll 勾上；有任何沒選 => 不勾
  const allCount = ALL_ITEMS.length;
  toggleAll.checked = (state.selected.size === allCount);
}

function updateStats() {
  statsText.textContent = `已選音節：${state.selected.size} / ${ALL_ITEMS.length}`;
  const scriptLabel = state.includeHira && state.includeKata
    ? "平假名＋片假名（每題隨機）"
    : (state.includeHira ? "只出平假名" : (state.includeKata ? "只出片假名" : "（未選擇腳本）"));
  scriptText.textContent = `目前題目腳本：${scriptLabel}`;
}

// ====== Build Quiz List ======
function buildQuizList(n) {
  // 按照「盡量讓每個勾選音節都至少出現一次」：
  // 1) 先把 selected 全部打散
  // 2) 若 n <= selectedCount => 取前 n 個（無重複）
  // 3) 若 n > selectedCount => 先放全部，再隨機補到 n（允許重複）
  const pool = ALL_ITEMS.filter(x => state.selected.has(x.rp));
  const selectedCount = pool.length;
  const shuffled = shuffle(pool);

  let list = [];
  if (n <= selectedCount) {
    list = shuffled.slice(0, n);
  } else {
    list = shuffled.slice();
    while (list.length < n) {
      list.push(pickRandom(pool));
    }
    list = shuffle(list); // 再洗一次，避免前面整段剛好都不同
  }

  // 決定每題顯示平/片（看 checkbox）
  const scripts = [];
  if (state.includeHira) scripts.push("h");
  if (state.includeKata) scripts.push("k");

  return list.map(item => ({
    ...item,
    script: scripts.length === 1 ? scripts[0] : pickRandom(scripts),
  }));
}

// ====== Quiz UI ======
function openQuiz(list) {
  state.quizList = list;
  state.quizIndex = 0;
  state.revealRomaji = false;
  state.unknownCounts = new Map();

  overlay.classList.add("show");
  overlay.setAttribute("aria-hidden", "false");
  renderQuiz();
}

function closeQuiz() {
  overlay.classList.remove("show");
  overlay.setAttribute("aria-hidden", "true");
}

function currentQ() {
  return state.quizList[state.quizIndex];
}

function renderQuiz() {
  const q = currentQ();
  if (!q) return;

  const kana = (q.script === "h") ? q.h : q.k;
  quizKana.textContent = kana;
  progressText.textContent = `${state.quizIndex + 1} / ${state.quizList.length}`;

  if (state.revealRomaji) {
    quizRomaji.textContent = q.rp;
    quizRomaji.classList.add("show");
    quizTip.textContent = "再按「下一步」進入下一題";
    nextBtn.textContent = (state.quizIndex === state.quizList.length - 1) ? "結束" : "下一步";
  } else {
    quizRomaji.textContent = q.rp;
    quizRomaji.classList.remove("show");
    quizTip.textContent = "按「下一步」顯示羅馬拼音";
    nextBtn.textContent = "下一步";
  }
}


function checkArrayObjects(arr, keys = []) {
  return arr.every(obj =>
    keys.every(key => obj.hasOwnProperty(key) && obj[key] !== undefined && obj[key] !== null)
  );
}

let oldRecord = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

function finishQuiz(isUpdateRecordData = true) {
  // 顯示結果到首頁底部
  const entries = isUpdateRecordData ? Array.from(state.unknownCounts.entries())
    .map(([rp, count]) => {
      const item = ALL_ITEMS.find(x => x.rp === rp);
      return { rp, count, h: item?.h, k: item?.k };
    })
    .sort((a, b) => b.count - a.count || a.rp.localeCompare(b.rp)) : oldRecord;

  if (entries.length === 0) {
    resultBox.style.display = "block";
    resultHint.textContent = "恭喜！你沒有按下「我不清楚」。";
    resultChips.innerHTML = "";
  } else {
    resultBox.style.display = "block";
    resultHint.textContent = `你按下「我不清楚」的音節如下（顯示：平 / 片 / romaji）：`;
    resultChips.innerHTML = entries.map(e => `
        <div class="chip" title="${escapeHtml(e.rp)}">
          <span>${escapeHtml(e.h)} / ${escapeHtml(e.k)}</span>
          <span class="mini">${escapeHtml(e.rp)}</span>
          <span class="count">${e.count}</span>
        </div>
      `).join("");
  }

  if (isUpdateRecordData) {
    oldRecord = entries;
    closeQuiz();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }
  if (entries.length > 0) {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }
}

function checkOldRecord() {
  if (oldRecord.length > 0) {
    if (!checkArrayObjects(oldRecord, ['rp', 'count', 'h', 'k'])) {
      localStorage.removeItem(STORAGE_KEY);
      oldRecord.splice(0, oldRecord.length);
    } else {
      finishQuiz(false);
    }
  }
}

// ====== Events ======
toggleHira.addEventListener("change", () => {
  state.includeHira = toggleHira.checked;
  renderTable();
});

toggleKata.addEventListener("change", () => {
  state.includeKata = toggleKata.checked;
  renderTable();
});

toggleAll.addEventListener("change", () => {
  if (toggleAll.checked) {
    state.selected = new Set(ALL_ITEMS.map(x => x.rp));
  } else {
    state.selected = new Set();
  }
  renderTable();
});

// 限制：只能數字（type=number 已經做一層，這裡再保險）
countInput.addEventListener("input", () => {
  const v = countInput.value;
  // 移除非數字（避免某些瀏覽器可輸入 e / + / -）
  const cleaned = v.replace(/[^\d]/g, "");
  if (v !== cleaned) countInput.value = cleaned;
});

startBtn.addEventListener("click", () => {
  const n = parseInt(countInput.value, 10);

  if (!state.includeHira && !state.includeKata) {
    alert("請至少勾選：平假名 或 片假名");
    return;
  }
  if (state.selected.size === 0) {
    alert("請至少勾選一個音節");
    return;
  }
  if (!Number.isFinite(n) || n <= 0) {
    alert("題數請輸入大於 0 的數字");
    return;
  }

  const list = buildQuizList(n);
  openQuiz(list);
});

clearResultBtn.addEventListener("click", () => {
  if (oldRecord.length === 0) return;
  if (confirm("確定要清除記錄嗎？")) {
    resultBox.style.display = "none";
    resultHint.textContent = "";
    resultChips.innerHTML = "";
    localStorage.removeItem(STORAGE_KEY);
    oldRecord = [];
  }
});

backdrop.addEventListener("click", () => {
  // 防止誤關：你如果想允許點背景關閉，把下面註解拿掉
  // closeQuiz();
});

document.addEventListener("keydown", (e) => {
  if (!overlay.classList.contains("show")) return;
  if (e.key === "Escape") {
    // 防止誤關：不做事。如果你想 Esc 關閉，改成 closeQuiz()
    // closeQuiz();
  }
  if (e.key === "Enter") {
    nextBtn.click();
  }
});

nextBtn.addEventListener("click", () => {
  // Step 1: 顯示 romaji
  if (!state.revealRomaji) {
    state.revealRomaji = true;
    renderQuiz();
    return;
  }

  // Step 2: 進下一題 or 結束
  if (state.quizIndex >= state.quizList.length - 1) {
    finishQuiz();
    return;
  }

  state.quizIndex += 1;
  state.revealRomaji = false;
  renderQuiz();
});

unknownBtn.addEventListener("click", () => {
  const q = currentQ();
  if (!q) return;

  // 記錄不清楚（用 romaji 當 key）
  const prev = state.unknownCounts.get(q.rp) || 0;
  state.unknownCounts.set(q.rp, prev + 1);

  // 不清楚也照規則：先顯示 romaji（若還沒顯示），再由下一步推進
  if (!state.revealRomaji) {
    state.revealRomaji = true;
    renderQuiz();
  } else {
    // 若已顯示 romaji，直接跳下一題（更順）
    if (state.quizIndex >= state.quizList.length - 1) {
      finishQuiz();
    } else {
      state.quizIndex += 1;
      state.revealRomaji = false;
      renderQuiz();
    }
  }
});

quitOverlay.addEventListener("click", () => {
  confirm("確定要結束練習嗎？目前的進度不會被記錄。") && finishQuiz();
});

// ====== Init ======
renderTable();
syncToggleAll();
updateStats();
checkOldRecord();