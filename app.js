const grid = document.getElementById('grid');
const empty = document.getElementById('empty');
const loading = document.getElementById('loading');
const searchInput = document.getElementById('search');
const countEl = document.getElementById('count');

let allReports = [];

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function slugFromFilename(filename) {
  return filename.replace(/\.html?$/i, '');
}

function renderCards(reports) {
  grid.innerHTML = '';

  if (reports.length === 0) {
    empty.classList.remove('hidden');
    countEl.textContent = '';
    return;
  }

  empty.classList.add('hidden');
  countEl.textContent = `${reports.length} reporte${reports.length !== 1 ? 's' : ''}`;

  reports.forEach(report => {
    const slug = slugFromFilename(report.filename);
    const card = document.createElement('a');
    card.className = 'card';
    card.href = `/${slug}`;
    card.innerHTML = `
      <div class="card-title">${escapeHtml(report.title)}</div>
      <div class="card-filename">${escapeHtml(report.filename)}</div>
      <div class="card-date">${formatDate(report.date)}</div>
    `;
    grid.appendChild(card);
  });
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

searchInput.addEventListener('input', () => {
  const q = searchInput.value.trim().toLowerCase();
  const filtered = q
    ? allReports.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.filename.toLowerCase().includes(q)
      )
    : allReports;
  renderCards(filtered);
});

async function loadReports() {
  try {
    const res = await fetch('/api/reports');
    if (!res.ok) throw new Error();
    allReports = await res.json();
  } catch {
    allReports = [];
  } finally {
    loading.classList.add('hidden');
    renderCards(allReports);
  }
}

loadReports();
