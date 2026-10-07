// Endereço do backend publicado no Render.
const PRODUCTION_API_URL = "https://verifica-eleicao-api.onrender.com/api/analyze";

// No seu computador usa o servidor local; publicado, usa o de produção.
const isLocal = location.protocol === "file:" ||
  ["localhost", "127.0.0.1"].includes(location.hostname);
const API_URL = isLocal ? "http://localhost:3000/api/analyze" : PRODUCTION_API_URL;

const dropZone = document.getElementById("dropZone");
const imageInput = document.getElementById("imageInput");
const selectButton = document.getElementById("selectButton");
const changeButton = document.getElementById("changeButton");
const verifyButton = document.getElementById("verifyButton");
const previewArea = document.getElementById("previewArea");
const uploadPlaceholder = document.getElementById("uploadPlaceholder");
const previewImage = document.getElementById("previewImage");
const statusBox = document.getElementById("status");
const resultSection = document.getElementById("resultSection");
const newCheckButton = document.getElementById("newCheckButton");

let selectedFile = null;

selectButton.addEventListener("click", () => imageInput.click());
changeButton.addEventListener("click", () => imageInput.click());

imageInput.addEventListener("change", () => {
  if (imageInput.files.length) setFile(imageInput.files[0]);
});

["dragenter", "dragover"].forEach(eventName => {
  dropZone.addEventListener(eventName, e => {
    e.preventDefault();
    dropZone.classList.add("dragover");
  });
});
["dragleave", "drop"].forEach(eventName => {
  dropZone.addEventListener(eventName, e => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
  });
});
dropZone.addEventListener("drop", e => {
  if (e.dataTransfer.files.length) setFile(e.dataTransfer.files[0]);
});

function setFile(file) {
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
    showStatus("Escolha uma imagem PNG, JPG ou WebP.", true);
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    showStatus("A imagem deve ter no máximo 10 MB.", true);
    return;
  }

  selectedFile = file;
  previewImage.src = URL.createObjectURL(file);
  uploadPlaceholder.classList.add("hidden");
  previewArea.classList.remove("hidden");
  hideStatus();
  resultSection.classList.add("hidden");
}

verifyButton.addEventListener("click", analyze);

async function analyze() {
  if (!selectedFile) return;

  if (API_URL.includes("SEU-BACKEND-AQUI")) {
    showStatus("Configure a URL do backend no arquivo script.js antes de testar.", true);
    return;
  }

  verifyButton.disabled = true;
  verifyButton.textContent = "Analisando...";
  showStatus("A IA está lendo o print e verificando as informações. Isso pode levar alguns segundos.");

  // Se passar de 5 segundos, avisa que a demora é por causa da alta demanda.
  const slowTimer = setTimeout(() => {
    showStatus("A análise está demorando um pouco mais porque os servidores estão com alta demanda no momento. Aguarde, por favor.");
  }, 5000);

  try {
    const formData = new FormData();
    formData.append("image", selectedFile);

    const response = await fetch(API_URL, {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Não foi possível realizar a análise.");
    }

    renderResult(data);
    resultSection.classList.remove("hidden");
    resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
    showStatus("Análise concluída.");
  } catch (error) {
    showStatus(error.message, true);
  } finally {
    clearTimeout(slowTimer);
    verifyButton.disabled = false;
    verifyButton.textContent = "Verificar notícia";
  }
}

function renderResult(data) {
  const verdict = (data.verdict || "Não confirmado").toLowerCase();
  const map = {
    "verdadeiro": { icon: "✓", className: "true" },
    "falso": { icon: "×", className: "false" },
    "enganoso": { icon: "!", className: "warning" },
    "parcialmente verdadeiro": { icon: "≈", className: "warning" },
    "não confirmado": { icon: "?", className: "unknown" }
  };
  const visual = map[verdict] || map["não confirmado"];

  const icon = document.getElementById("verdictIcon");
  icon.textContent = visual.icon;
  icon.style.color = verdict === "verdadeiro" ? "var(--success)" :
                      verdict === "falso" ? "var(--danger)" :
                      verdict === "enganoso" || verdict.includes("parcial") ? "var(--warning)" :
                      "var(--muted)";

  document.getElementById("verdict").textContent = data.verdict || "Não confirmado";
  document.getElementById("claim").textContent = data.claim || "Não foi possível identificar a afirmação principal.";
  document.getElementById("summary").textContent = data.summary || "Sem resumo disponível.";
  const evidence = data.evidence || "Sem evidências suficientes.";
  document.getElementById("evidence").textContent = data.webSearch === false
    ? `${evidence} (Análise feita sem pesquisa na internet.)`
    : evidence;

  const sourcesList = document.getElementById("sourcesList");
  sourcesList.innerHTML = "";

  (data.sources || []).forEach(source => {
    const item = document.createElement("div");
    item.className = "source";

    const title = document.createElement("a");
    title.textContent = source.title || source.name || "Fonte";
    if (source.url) title.href = source.url;
    title.target = "_blank";
    title.rel = "noopener noreferrer";

    const description = document.createElement("p");
    description.textContent = source.description || "";

    item.appendChild(title);
    item.appendChild(description);
    sourcesList.appendChild(item);
  });

  if (!data.sources?.length) {
    sourcesList.innerHTML = "<p>Não foram retornadas fontes clicáveis.</p>";
  }
}

newCheckButton.addEventListener("click", () => {
  selectedFile = null;
  imageInput.value = "";
  previewImage.removeAttribute("src");
  previewArea.classList.add("hidden");
  uploadPlaceholder.classList.remove("hidden");
  resultSection.classList.add("hidden");
  hideStatus();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

function showStatus(message, error = false) {
  statusBox.textContent = message;
  statusBox.classList.remove("hidden");
  statusBox.classList.toggle("error", error);
}
function hideStatus() {
  statusBox.classList.add("hidden");
}
