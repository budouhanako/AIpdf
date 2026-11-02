const dropZone = document.querySelector("#drop-zone");
const fileInput = document.querySelector("#file-input");
const fileCount = document.querySelector("#file-count");
const filePanel = document.querySelector(".file-panel");
const selectedFilesBar = document.querySelector("#selected-files");
const aiOcr = document.querySelector("#ai-ocr");
const taxSplit = document.querySelector("#tax-split");
const secondAmount = document.querySelector(".amount-row--two .amount-input");
const splitRadios = [...document.querySelectorAll('input[name="split-upload-mode"]')];
const splitSettingsButton = document.querySelector("#split-settings-button");
const splitPreviewButton = document.querySelector("#split-preview-button");
const splitSection = document.querySelector(".split-section");
const splitSectionHeader = document.querySelector(".split-section-header");

let selectedFiles = [];

function syncSplitPreviewState() {
  const splitEnabled = splitRadios.some((radio) => radio.checked && radio.value === "on");
  splitPreviewButton.disabled = !splitEnabled || selectedFiles.length === 0;
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
      selectedFiles.splice(index, 1);
      renderSelectedFiles();
    });

    const name = document.createElement("span");
    name.className = "file-chip-name";
    name.textContent = file.name;
    name.title = file.name;

    chip.append(removeButton, name);
    selectedFilesBar.append(chip);
  });

  const count = selectedFiles.length;
  selectedFilesBar.hidden = count === 0;
  filePanel.classList.toggle("has-files", count > 0);
  fileCount.textContent = `（${count}個のファイルを選択）`;
  if (selectedFiles.every((file) => file instanceof File)) {
    const transfer = new DataTransfer();
    selectedFiles.forEach((file) => transfer.items.add(file));
    fileInput.files = transfer.files;
  }
  syncSplitPreviewState();
}

function updateSelectedFiles(fileList) {
  selectedFiles = Array.from(fileList);
  renderSelectedFiles();
}

dropZone.addEventListener("click", () => fileInput.click());
dropZone.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    fileInput.click();
  }
});

fileInput.addEventListener("change", () => updateSelectedFiles(fileInput.files));

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
    updateSelectedFiles(event.dataTransfer.files);
  }
});

splitRadios.forEach((radio) => {
  radio.addEventListener("change", syncSplitPreviewState);
});

splitSectionHeader.addEventListener("click", () => {
  const collapsed = splitSection.classList.toggle("is-collapsed");
  splitSectionHeader.setAttribute("aria-expanded", String(!collapsed));
});

splitSettingsButton.addEventListener("click", () => {
  window.dispatchEvent(new CustomEvent("ai-split-settings-requested"));
});

splitPreviewButton.addEventListener("click", () => {
  window.location.href = "./preview-result.html";
});

aiOcr.addEventListener("change", () => {
  document.body.classList.toggle("ai-ocr-enabled", aiOcr.checked);
});

taxSplit.addEventListener("change", () => {
  secondAmount.disabled = !taxSplit.checked;
  if (!taxSplit.checked) {
    secondAmount.value = "";
  }
});

const demoMode = new URLSearchParams(window.location.search).get("demo");
if (demoMode === "files") {
  document.querySelector('input[name="split-upload-mode"][value="on"]').checked = true;
  selectedFiles = ["84.jpg", "85.jpg", "86.jpg", "87.jpg", "88.jpg"].map((name) => ({ name }));
  renderSelectedFiles();
}
