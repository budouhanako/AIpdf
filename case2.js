const dropZone = document.querySelector("#drop-zone");
const fileInput = document.querySelector("#file-input");
const selectedFilesBar = document.querySelector("#selected-files");
const fileCount = document.querySelector("#file-count");
const aiSplitButton = document.querySelector("#ai-split-button");
const splitButtonLabel = document.querySelector("#split-button-label");
const splitSpinner = document.querySelector("#split-spinner");
const splitStatus = document.querySelector("#split-status");
const splitStatusText = document.querySelector("#split-status-text");
const openPreviewButton = document.querySelector("#open-preview");
const uploadButton = document.querySelector("#upload-button");
const previewBackdrop = document.querySelector("#preview-backdrop");
const previewDialog = document.querySelector("#preview-dialog");
const closePreviewButton = document.querySelector("#close-preview");
const cancelPreviewButton = document.querySelector("#cancel-preview");
const savePreviewButton = document.querySelector("#save-preview");
const previewSourceTabs = document.querySelector("#preview-source-tabs");
const previewResultCount = document.querySelector("#preview-result-count");
const previewContext = document.querySelector("#preview-context");
const resultScroller = document.querySelector("#result-scroller");
const resultTrack = document.querySelector("#result-track");
const resplitButton = document.querySelector("#resplit-button");
const previewProcessing = document.querySelector("#preview-processing");
const previewParenOpen = document.querySelector("#preview-paren-open");
const previewParenClose = document.querySelector("#preview-paren-close");
const filenamePrefix = document.querySelector("#filename-prefix");
const nameDate = document.querySelector("#name-date");
const nameParty = document.querySelector("#name-party");
const nameAmount = document.querySelector("#name-amount");
const filenameFormatExample = document.querySelector("#filename-format-example");
const toast = document.querySelector("#toast");
const imageViewer = document.querySelector("#image-viewer");
const imageViewerImage = document.querySelector("#image-viewer-image");
const closeImageViewer = document.querySelector("#close-image-viewer");

function fitDesignToViewport() {
  const horizontalPadding = 28;
  const verticalPadding = 28;
  const scale = Math.min(
    (window.innerWidth - horizontalPadding) / 1354,
    (window.innerHeight - verticalPadding) / 695,
    1,
  );
  document.documentElement.style.setProperty("--ui-scale", Math.max(scale, 0.55).toFixed(4));
}

window.addEventListener("resize", fitDesignToViewport);
fitDesignToViewport();

const DEMO_FILES = [
  { id: "hotel", name: "ホテルグランヴィア大阪.pdf" },
  { id: "seven", name: "領収書＿711.png" },
  { id: "lawson", name: "領収書＿Lawson.png" },
];

const DEMO_TEMPLATES = {
  hotel: [
    {
      id: "hotel-1",
      name: "mescius_20250617_メシウス株式会社_53680",
      date: "20250617",
      party: "メシウス株式会社",
      amount: "53680",
      pages: [
        {
          id: "h1-p1",
          page: 1,
          kind: "invoice",
          party: "メシウス株式会社 御中",
          amount: "¥53,680",
        },
      ],
    },
    {
      id: "hotel-2",
      name: "mescius_20250725_JR東日本_10670",
      date: "20250725",
      party: "JR東日本",
      amount: "10670",
      pages: [
        {
          id: "h2-p2",
          page: 2,
          kind: "receipt",
          party: "東日本旅客鉄道株式会社",
          amount: "¥10,670",
        },
      ],
    },
    {
      id: "hotel-3",
      name: "mescius_20250725_JR東日本_10670_2",
      date: "20250725",
      party: "JR東日本",
      amount: "10670",
      pages: [
        {
          id: "h2-p3",
          page: 3,
          kind: "receipt",
          party: "東日本旅客鉄道株式会社",
          amount: "¥10,670",
        },
      ],
    },
  ],
  seven: [
    {
      id: "seven-1",
      name: "mescius_20250728_セブン-イレブン_1280",
      date: "20250728",
      party: "セブン-イレブン",
      amount: "1280",
      pages: [
        {
          id: "s1-p1",
          page: 1,
          kind: "receipt",
          party: "セブン-イレブン",
          amount: "¥1,280",
        },
      ],
    },
    {
      id: "seven-2",
      name: "mescius_20250730_セブン-イレブン_980",
      date: "20250730",
      party: "セブン-イレブン",
      amount: "980",
      pages: [
        {
          id: "s2-p2",
          page: 2,
          kind: "receipt",
          party: "セブン-イレブン",
          amount: "¥980",
        },
      ],
    },
  ],
  lawson: [
    {
      id: "lawson-1",
      name: "mescius_20250801_Lawson_720",
      date: "20250801",
      party: "Lawson",
      amount: "720",
      pages: [
        {
          id: "l1-p1",
          page: 1,
          kind: "receipt",
          party: "株式会社ローソン",
          amount: "¥720",
        },
      ],
    },
  ],
};

let selectedFiles = DEMO_FILES.map((file) => ({ ...file }));
let splitState = "idle";
let splitSources = [];
let savedSources = [];
let previewSources = [];
let activeSourceId = null;
let splitTimer = null;
let toastTimer = null;
let formatPrefix = "mescius";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

function getSourceTemplate(fileId) {
  return clone(DEMO_TEMPLATES[fileId] || []);
}

function createGenericGroups(file, fileIndex) {
  const groupCount = /一括|複合|まとめ/.test(file.name) ? 2 : 1;
  return Array.from({ length: groupCount }, (_, groupIndex) => {
    const sequence = fileIndex * 2 + groupIndex + 1;
    const pageCount = groupCount > 1 ? 2 : 1;
    return {
      id: `generic-${fileIndex}-${groupIndex}`,
      name: `mescius_202510${String(sequence).padStart(2, "0")}_取引先${sequence}_${1000 + sequence * 120}`,
      date: `202510${String(sequence).padStart(2, "0")}`,
      party: `取引先${sequence}`,
      amount: String(1000 + sequence * 120),
      pages: Array.from({ length: pageCount }, (_, pageIndex) => ({
        id: `generic-${fileIndex}-${groupIndex}-${pageIndex}`,
        page: groupIndex * pageCount + pageIndex + 1,
        kind: pageIndex % 2 === 0 ? "invoice" : "receipt",
        party: `取引先${sequence}`,
        amount: `¥${(1000 + sequence * 120).toLocaleString("ja-JP")}`,
      })),
    };
  });
}

function createSplitSources() {
  return selectedFiles.map((file, index) => {
    const demoGroups = file.id ? getSourceTemplate(file.id) : [];
    return {
      id: file.id || `file-${index}`,
      name: file.name,
      groups: demoGroups.length ? demoGroups : createGenericGroups(file, index),
    };
  });
}

function getTotalGroupCount(sources) {
  return sources.reduce((total, source) => total + source.groups.length, 0);
}

function renderSelectedFiles() {
  selectedFilesBar.replaceChildren();

  selectedFiles.forEach((file, index) => {
    const chip = document.createElement("div");
    chip.className = "file-chip";

    const removeButton = document.createElement("button");
    removeButton.className = "file-remove-button";
    removeButton.type = "button";
    removeButton.textContent = "×";
    removeButton.setAttribute("aria-label", `${file.name}を削除`);
    removeButton.addEventListener("click", () => {
      if (splitState === "processing") {
        return;
      }
      selectedFiles.splice(index, 1);
      invalidateSplit();
      renderSelectedFiles();
    });

    const name = document.createElement("span");
    name.className = "file-chip-name";
    name.textContent = file.name;
    name.title = file.name;

    chip.append(removeButton, name);
    selectedFilesBar.append(chip);
  });

  const count =
    splitState === "ready" && splitSources.length
      ? getTotalGroupCount(splitSources)
      : selectedFiles.length;
  fileCount.textContent = `（${count}個のファイルを選択）`;
  aiSplitButton.disabled = selectedFiles.length === 0 || splitState === "processing";
  uploadButton.disabled = selectedFiles.length === 0 || splitState === "processing";
}

function setSplitStatus(type, text) {
  splitStatus.hidden = !text;
  splitStatus.classList.toggle("is-stale", type === "stale");
  splitStatusText.textContent = text || "";
  openPreviewButton.hidden = type !== "ready";
  previewParenOpen.hidden = type !== "ready";
  previewParenClose.hidden = type !== "ready";
}

function invalidateSplit() {
  window.clearTimeout(splitTimer);
  splitSources = [];
  savedSources = [];
  previewSources = [];
  activeSourceId = null;
  splitState = selectedFiles.length ? "stale" : "idle";
  splitSpinner.hidden = true;
  splitButtonLabel.textContent = "AIで分割する";
  if (selectedFiles.length) {
    setSplitStatus("stale", "添付ファイルが変更されました。再分割してください。");
  } else {
    setSplitStatus(null, "");
  }
  renderSelectedFiles();
}

function setSplitProcessing() {
  splitState = "processing";
  splitSpinner.hidden = false;
  splitButtonLabel.textContent = "分割中…";
  aiSplitButton.disabled = true;
  uploadButton.disabled = true;
  setSplitStatus("processing", "");
}

function completeSplit() {
  splitSources = createSplitSources();
  savedSources = clone(splitSources);
  splitState = "ready";
  splitSpinner.hidden = true;
  splitButtonLabel.textContent = "AIで分割する";
  const total = getTotalGroupCount(splitSources);
  setSplitStatus("ready", `${selectedFiles.length}個のファイルを${total}個に分割しました`);
  renderSelectedFiles();
}

function runSplit() {
  if (!selectedFiles.length || splitState === "processing") {
    return;
  }
  setSplitProcessing();
  splitTimer = window.setTimeout(completeSplit, 1500);
}

function renderPreviewSourcesTabs() {
  previewSourceTabs.replaceChildren();
  previewSources.forEach((source) => {
    const button = document.createElement("button");
    button.className = "source-file-chip";
    button.type = "button";
    button.role = "tab";
    button.setAttribute("aria-selected", String(source.id === activeSourceId));
    button.classList.toggle("is-active", source.id === activeSourceId);
    button.textContent = source.name;
    button.title = source.name;
    button.addEventListener("click", () => {
      activeSourceId = source.id;
      renderPreview();
    });
    previewSourceTabs.append(button);
  });
}

function getActiveSource() {
  return previewSources.find((source) => source.id === activeSourceId) || previewSources[0] || null;
}

function buildFilename(group) {
  const parts = [formatPrefix];
  const values = { "取引日": group.date || "日付", "取引先": group.party || "取引先", "金額": group.amount || "金額" };
  [nameDate, nameParty, nameAmount].forEach((select) => {
    if (values[select.value]) parts.push(values[select.value]);
  });
  return parts.join("_");
}

function applyFilenameFormat() {
  formatPrefix = filenamePrefix.value.trim() || "mescius";
  const active = getActiveSource();
  if (!active) {
    return;
  }
  active.groups.forEach((group) => {
    if (!group.nameEdited) {
      group.name = buildFilename(group);
    }
  });
  updateFormatExample();
  renderPreview();
}

function updateFormatExample() {
  filenameFormatExample.textContent = `${formatPrefix}_取引日_取引先_金額.pdf`;
}

function createPageElement(page, group) {
  const figure = document.createElement("figure");
  figure.className = `document-page ${page.kind === "receipt" ? "receipt-page" : "invoice-page"}`;

  const actions = document.createElement("div");
  actions.className = "page-actions";

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "page-action page-action--delete";
  deleteButton.textContent = "×";
  deleteButton.title = "このページを削除";
  deleteButton.setAttribute("aria-label", `ページ${page.page}を削除`);
  deleteButton.addEventListener("click", () => {
    const index = group.pages.findIndex((item) => item.id === page.id);
    if (index >= 0) {
      group.pages.splice(index, 1);
      if (!group.pages.length) {
        const active = getActiveSource();
        active.groups = active.groups.filter((item) => item.id !== group.id);
      }
      renderPreview();
    }
  });

  const zoomButton = document.createElement("button");
  zoomButton.type = "button";
  zoomButton.className = "page-action page-action--zoom";
  zoomButton.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"></circle><path d="m15.5 15.5 4.5 4.5"></path><path d="M10.5 7.5v6M7.5 10.5h6"></path></svg>';
  zoomButton.title = "ページを拡大";
  zoomButton.setAttribute("aria-label", `ページ${page.page}を拡大`);
  zoomButton.addEventListener("click", () => {
    imageViewerImage.src = image.src;
    imageViewerImage.alt = image.alt;
    imageViewer.hidden = false;
  });

  actions.append(deleteButton, zoomButton);
  const image = document.createElement("img");
  image.className = "document-page-image";
  if (page.kind === "receipt") {
    image.src = page.page % 2 === 0 ? "./assets/receipt-2.png" : "./assets/receipt-1.png";
  } else {
    image.src = "./assets/invoice.png";
  }
  image.alt = `P${page.page}の書類プレビュー`;

  const pageNumber = document.createElement("span");
  pageNumber.className = "page-number";
  pageNumber.textContent = `P${page.page}`;

  figure.append(actions, image, pageNumber);

  return figure;
}

function createMergeButton() {
  const button = document.createElement("button");
  button.className = "boundary-button merge-button";
  button.type = "button";
  button.textContent = "結合";
  return button;
}

function createSplitButton() {
  const button = document.createElement("button");
  button.className = "boundary-button split-button";
  button.type = "button";
  button.textContent = "分割";
  return button;
}

function createGroupElement(group, groupIndex) {
  const article = document.createElement("article");
  article.className = "result-group";
  article.style.width = `${Math.max(359, 24 + group.pages.length * 339 + (group.pages.length - 1) * 59)}px`;

  const header = document.createElement("div");
  header.className = "result-group-header";

  const filenameWrap = document.createElement("div");
  filenameWrap.className = "filename-with-extension";

  const input = document.createElement("input");
  input.className = "result-filename";
  input.type = "text";
  input.value = group.name;
  input.setAttribute("aria-label", "分割後ファイル名");
  input.addEventListener("input", () => {
    group.name = input.value;
    group.nameEdited = true;
  });

  const extension = document.createElement("span");
  extension.className = "file-extension";
  extension.textContent = ".pdf";

  filenameWrap.append(input, extension);
  header.append(filenameWrap);

  const pageSequence = document.createElement("div");
  pageSequence.className = "page-sequence";
  group.pages.forEach((page, pageIndex) => {
    if (pageIndex > 0) {
      const splitButton = createSplitButton();
      splitButton.addEventListener("click", () => {
        const active = getActiveSource();
        const targetIndex = active.groups.findIndex((item) => item.id === group.id);
        const movedPages = group.pages.splice(pageIndex);
        const newGroup = {
          id: `${group.id}-split-${Date.now()}`,
          name: `${group.name}_2`,
          date: group.date,
          party: group.party,
          amount: group.amount,
          pages: movedPages,
          nameEdited: true,
        };
        active.groups.splice(targetIndex + 1, 0, newGroup);
        renderPreview();
      });
      pageSequence.append(splitButton);
    }
    pageSequence.append(createPageElement(page, group));
  });

  article.append(header, pageSequence);
  return article;
}

function renderPreview() {
  const active = getActiveSource();
  renderPreviewSourcesTabs();

  if (!active) {
    resultTrack.replaceChildren();
    previewResultCount.textContent = "";
    return;
  }

  previewResultCount.textContent = `${active.groups.length}件`;
  previewContext.innerHTML = `<span>選択中</span><strong>${active.name}</strong>`;
  resultTrack.replaceChildren();

  active.groups.forEach((group, index) => {
    if (index > 0) {
      const mergeButton = createMergeButton();
      mergeButton.addEventListener("click", () => {
        const previous = active.groups[index - 1];
        previous.pages.push(...group.pages);
        active.groups.splice(index, 1);
        renderPreview();
      });
      resultTrack.append(mergeButton);
    }
    resultTrack.append(createGroupElement(group, index));
  });
}

function openPreview() {
  if (splitState !== "ready") {
    return;
  }
  toast.classList.remove("is-visible");
  previewSources = clone(savedSources);
  activeSourceId = previewSources[0]?.id || null;
  previewBackdrop.hidden = false;
  document.body.classList.add("has-dialog");
  renderPreview();
  window.requestAnimationFrame(() => closePreviewButton.focus());
}

function closePreview() {
  previewBackdrop.hidden = true;
  document.body.classList.remove("has-dialog");
}

function savePreview() {
  savedSources = clone(previewSources);
  splitSources = clone(previewSources);
  const total = getTotalGroupCount(savedSources);
  setSplitStatus("ready", `${selectedFiles.length}個のファイルを${total}個に分割しました`);
  closePreview();
  showToast("分割結果の調整内容を保存しました。");
}

function resplitActiveSource() {
  const active = getActiveSource();
  if (!active) {
    return;
  }
  previewProcessing.hidden = false;
  window.setTimeout(() => {
    const template = DEMO_TEMPLATES[active.id];
    const originalGroups = template
      ? clone(template)
      : createGenericGroups(
          { name: active.name },
          previewSources.findIndex((source) => source.id === active.id),
        );
    active.groups = originalGroups;
    previewProcessing.hidden = true;
    renderPreview();
    showToast("現在のファイルを再分割しました。");
  }, 900);
}

aiSplitButton.addEventListener("click", runSplit);
openPreviewButton.addEventListener("click", openPreview);
closePreviewButton.addEventListener("click", closePreview);
cancelPreviewButton.addEventListener("click", closePreview);
savePreviewButton.addEventListener("click", savePreview);

resplitButton.addEventListener("click", resplitActiveSource);

filenamePrefix.addEventListener("change", applyFilenameFormat);
nameDate.addEventListener("change", applyFilenameFormat);
nameParty.addEventListener("change", applyFilenameFormat);
nameAmount.addEventListener("change", applyFilenameFormat);

dropZone.addEventListener("click", () => fileInput.click());
dropZone.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    fileInput.click();
  }
});

["dragenter", "dragover"].forEach((eventName) => {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropZone.classList.add("is-dragover");
  });
});

["dragleave", "drop"].forEach((eventName) => {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropZone.classList.remove("is-dragover");
  });
});

dropZone.addEventListener("drop", (event) => {
  if (event.dataTransfer?.files?.length) {
    selectedFiles = Array.from(event.dataTransfer.files).map((file, index) => ({
      id: `file-${index}-${file.name}`,
      name: file.name,
    }));
    invalidateSplit();
  }
});

fileInput.addEventListener("change", () => {
  if (!fileInput.files?.length) {
    return;
  }
  selectedFiles = Array.from(fileInput.files).map((file, index) => ({
    id: `file-${index}-${file.name}`,
    name: file.name,
  }));
  invalidateSplit();
});

document.querySelector("#ai-ocr").addEventListener("change", (event) => {
  document.body.classList.toggle("ai-ocr-enabled", event.target.checked);
});

document.querySelector("#tax-split").addEventListener("change", (event) => {
  const secondAmount = document.querySelector(".amount-row--two .amount-input");
  secondAmount.disabled = !event.target.checked;
  if (!event.target.checked) {
    secondAmount.value = "";
  }
});

uploadButton.addEventListener("click", () => {
  if (uploadButton.disabled) {
    return;
  }
  showToast("一括アップロードを開始しました。OCRはアップロード後に実行されます（デモ）。");
});

document.querySelector("#cancel-upload").addEventListener("click", () => {
  showToast("キャンセルしました（デモ）。");
});

document.querySelector("#close-upload").addEventListener("click", () => {
  showToast("閉じる操作はデモでは省略しています。");
});

window.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") {
    return;
  }
  if (!imageViewer.hidden) {
    imageViewer.hidden = true;
    return;
  }
  if (!previewBackdrop.hidden) {
    closePreview();
  }
});

closeImageViewer.addEventListener("click", () => { imageViewer.hidden = true; });
imageViewer.addEventListener("click", (event) => {
  if (event.target === imageViewer) imageViewer.hidden = true;
});

updateFormatExample();
renderSelectedFiles();

const demoMode = new URLSearchParams(window.location.search).get("demo");
if (new URLSearchParams(window.location.search).get("capture") === "1") {
  document.body.classList.add("capture-mode");
}
if (demoMode === "ready") {
  completeSplit();
}
if (demoMode === "preview") {
  completeSplit();
  openPreview();
}
