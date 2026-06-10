const industryData = [
  {
    id: "tech",
    name: "信息技术",
    children: [
      {
        id: "semiconductor",
        name: "半导体",
        children: [
          { id: "power-semiconductor", name: "功率半导体" },
          { id: "analog-chip", name: "模拟芯片" },
          { id: "memory-chip", name: "存储芯片" }
        ]
      },
      {
        id: "ai-computing",
        name: "AI 算力",
        children: [
          { id: "gpu-accelerator", name: "GPU 加速器" },
          { id: "optical-module", name: "光模块" },
          { id: "server-supply-chain", name: "服务器供应链" }
        ]
      }
    ]
  },
  {
    id: "medicine",
    name: "医药生物",
    children: [
      {
        id: "innovative-drug",
        name: "创新药",
        children: [
          { id: "chemical-innovative-drug", name: "化学创新药" },
          { id: "biotech-innovative-drug", name: "生物创新药" }
        ]
      },
      {
        id: "medical-device",
        name: "医疗器械",
        children: [
          { id: "high-value-consumables", name: "高值耗材" },
          { id: "ivd", name: "体外诊断" }
        ]
      }
    ]
  },
  {
    id: "new-energy",
    name: "新能源",
    children: [
      {
        id: "lithium-chain",
        name: "锂电产业链",
        children: [
          { id: "cathode-material", name: "正极材料" },
          { id: "separator", name: "隔膜" },
          { id: "battery-equipment", name: "锂电设备" }
        ]
      },
      {
        id: "photovoltaic",
        name: "光伏",
        children: [
          { id: "pv-inverter", name: "光伏逆变器" },
          { id: "pv-glass", name: "光伏玻璃" }
        ]
      }
    ]
  }
];

const STORAGE_KEY = "industry-watchlist-records";
const statusList = ["观察中", "已选股", "已放弃"];

let watchRecords = loadRecords();
let toastTimer = null;

const elements = {
  industryTree: document.querySelector("#industryTree"),
  watchlist: document.querySelector("#watchlist"),
  watchCount: document.querySelector("#watchCount"),
  searchInput: document.querySelector("#searchInput"),
  level1Filter: document.querySelector("#level1Filter"),
  statusFilter: document.querySelector("#statusFilter"),
  starFilter: document.querySelector("#starFilter"),
  toast: document.querySelector("#toast")
};

function loadRecords() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.warn("观察池数据读取失败，已使用空数据。", error);
    return [];
  }
}

function saveRecords() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(watchRecords));
}

function formatDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function createRecordId(level3Id) {
  return `${level3Id}-${Date.now()}`;
}

function isAdded(level3Id) {
  return watchRecords.some((record) => record.level3Id === level3Id);
}

function renderLevel1Filters() {
  elements.level1Filter.innerHTML = '<option value="all">全部</option>';
  industryData.forEach((level1) => {
    const option = document.createElement("option");
    option.value = level1.id;
    option.textContent = level1.name;
    elements.level1Filter.appendChild(option);
  });
}

function renderIndustryTree() {
  elements.industryTree.innerHTML = "";

  industryData.forEach((level1) => {
    const group = document.createElement("article");
    group.className = "tree-group";

    const level1Button = document.createElement("button");
    level1Button.type = "button";
    level1Button.className = "tree-row tree-toggle";
    level1Button.setAttribute("aria-expanded", "true");
    level1Button.innerHTML = `<span><span class="chevron">›</span>${level1.name}</span>`;

    const level1Children = document.createElement("div");
    level1Children.className = "tree-children";

    level1Button.addEventListener("click", () => toggleTree(level1Button, level1Children));

    level1.children.forEach((level2) => {
      const level2Group = document.createElement("div");
      level2Group.className = "level2-group";

      const level2Button = document.createElement("button");
      level2Button.type = "button";
      level2Button.className = "tree-row level2-toggle";
      level2Button.setAttribute("aria-expanded", "true");
      level2Button.innerHTML = `<span><span class="chevron">›</span>${level2.name}</span>`;

      const level3List = document.createElement("div");
      level3List.className = "level3-list";

      level2Button.addEventListener("click", () => toggleTree(level2Button, level3List));

      level2.children.forEach((level3) => {
        const row = document.createElement("div");
        row.className = "level3-row";

        const name = document.createElement("span");
        name.textContent = level3.name;

        const addButton = document.createElement("button");
        addButton.type = "button";
        addButton.className = "add-btn";
        addButton.textContent = isAdded(level3.id) ? "已加入" : "+";
        addButton.disabled = isAdded(level3.id);
        addButton.setAttribute("aria-label", `加入 ${level3.name} 到观察池`);
        addButton.addEventListener("click", () => addToWatchlist(level1, level2, level3));

        row.append(name, addButton);
        level3List.appendChild(row);
      });

      level2Group.append(level2Button, level3List);
      level1Children.appendChild(level2Group);
    });

    group.append(level1Button, level1Children);
    elements.industryTree.appendChild(group);
  });
}

function toggleTree(button, content) {
  const isExpanded = button.getAttribute("aria-expanded") === "true";
  button.setAttribute("aria-expanded", String(!isExpanded));
  content.hidden = isExpanded;
}

function addToWatchlist(level1, level2, level3) {
  if (isAdded(level3.id)) {
    showToast("该行业已在观察池中");
    renderIndustryTree();
    return;
  }

  const today = formatDate();
  watchRecords.unshift({
    id: createRecordId(level3.id),
    level1Id: level1.id,
    level1Name: level1.name,
    level2Id: level2.id,
    level2Name: level2.name,
    level3Id: level3.id,
    level3Name: level3.name,
    status: "观察中",
    isStarred: false,
    note: "",
    createdAt: today,
    updatedAt: today
  });

  saveRecords();
  renderAll();
  showToast("已加入观察池");
}

function getFilteredRecords() {
  const keyword = elements.searchInput.value.trim().toLowerCase();
  const level1Value = elements.level1Filter.value;
  const statusValue = elements.statusFilter.value;
  const starValue = elements.starFilter.value;

  return watchRecords.filter((record) => {
    const searchText = [
      record.level1Name,
      record.level2Name,
      record.level3Name,
      record.note
    ].join(" ").toLowerCase();

    const matchesKeyword = !keyword || searchText.includes(keyword);
    const matchesLevel1 = level1Value === "all" || record.level1Id === level1Value;
    const matchesStatus = statusValue === "all" || record.status === statusValue;
    const matchesStar = starValue === "all" || record.isStarred;

    return matchesKeyword && matchesLevel1 && matchesStatus && matchesStar;
  });
}

function renderWatchlist() {
  const filteredRecords = getFilteredRecords();
  elements.watchCount.textContent = `${watchRecords.length} 条`;
  elements.watchlist.innerHTML = "";

  if (watchRecords.length === 0) {
    elements.watchlist.innerHTML = '<div class="empty-state">还没有加入任何三级行业。请从左侧行业树中点击 + 添加。</div>';
    return;
  }

  if (filteredRecords.length === 0) {
    elements.watchlist.innerHTML = '<div class="empty-state">没有符合当前筛选条件的记录。</div>';
    return;
  }

  filteredRecords.forEach((record) => {
    elements.watchlist.appendChild(createWatchCard(record));
  });
}

function createWatchCard(record) {
  const card = document.createElement("article");
  card.className = "watch-card";

  const top = document.createElement("div");
  top.className = "card-top";

  const titleBox = document.createElement("div");
  titleBox.innerHTML = `
    <div class="title-line">
      <span class="industry-name">${record.level3Name}</span>
    </div>
    <div class="path">${record.level1Name} / ${record.level2Name}</div>
  `;

  const actions = document.createElement("div");
  actions.className = "card-actions";

  const starButton = document.createElement("button");
  starButton.type = "button";
  starButton.className = `star-btn${record.isStarred ? " is-starred" : ""}`;
  starButton.textContent = record.isStarred ? "★" : "☆";
  starButton.title = record.isStarred ? "取消星标" : "标记星标";
  starButton.addEventListener("click", () => toggleStar(record.id));

  const statusButton = document.createElement("button");
  statusButton.type = "button";
  statusButton.className = `status-btn ${getStatusClass(record.status)}`;
  statusButton.textContent = record.status;
  statusButton.title = "点击切换状态";
  statusButton.addEventListener("click", () => toggleStatus(record.id));

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "delete-btn";
  deleteButton.textContent = "删";
  deleteButton.title = "删除记录";
  deleteButton.addEventListener("click", () => deleteRecord(record.id));

  actions.append(starButton, statusButton, deleteButton);
  top.append(titleBox, actions);

  const noteLabel = document.createElement("label");
  noteLabel.className = "note-label";
  noteLabel.textContent = "一句话理由 / 备注";

  const noteInput = document.createElement("textarea");
  noteInput.placeholder = "例如：新能源车需求恢复，关注周期修复。";
  noteInput.value = record.note;
  noteInput.addEventListener("input", (event) => updateNote(record.id, event.target.value));
  noteLabel.appendChild(noteInput);

  const meta = document.createElement("div");
  meta.className = "meta";
  meta.innerHTML = `<span>创建时间：${record.createdAt}</span><span>更新时间：${record.updatedAt}</span>`;

  card.append(top, noteLabel, meta);
  return card;
}

function getStatusClass(status) {
  if (status === "已选股") return "status-done";
  if (status === "已放弃") return "status-drop";
  return "";
}

function findRecord(recordId) {
  return watchRecords.find((record) => record.id === recordId);
}

function touchRecord(record) {
  record.updatedAt = formatDate();
}

function toggleStatus(recordId) {
  const record = findRecord(recordId);
  if (!record) return;

  const currentIndex = statusList.indexOf(record.status);
  record.status = statusList[(currentIndex + 1) % statusList.length];
  touchRecord(record);
  saveRecords();
  renderWatchlist();
}

function toggleStar(recordId) {
  const record = findRecord(recordId);
  if (!record) return;

  record.isStarred = !record.isStarred;
  touchRecord(record);
  saveRecords();
  renderWatchlist();
}

function updateNote(recordId, note) {
  const record = findRecord(recordId);
  if (!record) return;

  record.note = note;
  touchRecord(record);
  saveRecords();
}

function deleteRecord(recordId) {
  const record = findRecord(recordId);
  if (!record) return;

  const confirmed = window.confirm(`确定删除「${record.level3Name}」吗？`);
  if (!confirmed) return;

  watchRecords = watchRecords.filter((item) => item.id !== recordId);
  saveRecords();
  renderAll();
  showToast("已删除观察记录");
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  toastTimer = window.setTimeout(() => {
    elements.toast.classList.remove("show");
  }, 1800);
}

function renderAll() {
  renderIndustryTree();
  renderWatchlist();
}

function bindFilters() {
  [
    elements.searchInput,
    elements.level1Filter,
    elements.statusFilter,
    elements.starFilter
  ].forEach((element) => {
    element.addEventListener("input", renderWatchlist);
    element.addEventListener("change", renderWatchlist);
  });
}

renderLevel1Filters();
bindFilters();
renderAll();
