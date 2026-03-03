/* ============================================
   Main JavaScript - Component & Page Loader
   Rizqi Rifah Amarulloh - STT Terpadu Nurul Fikri
   ============================================ */

/**
 * Loads an HTML fragment into a target element.
 * @param {string} url  – path to the HTML file
 * @param {string} targetId – id of the container element
 * @returns {Promise<void>}
 */
async function loadComponent(url, targetId) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const html = await response.text();
    document.getElementById(targetId).innerHTML = html;
  } catch (err) {
    console.error(`Failed to load ${url}:`, err);
    document.getElementById(targetId).innerHTML =
      `<div class="alert alert-warning m-3">Gagal memuat komponen: ${url}</div>`;
  }
}

/**
 * Loads a page into #mainContent and updates active nav link.
 * @param {string} page – filename inside pages/ folder
 */
async function loadPage(page) {
  await loadComponent(`pages/${page}`, 'mainContent');

  // Update active state on nav links
  document.querySelectorAll('#navbarArea .nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('data-page') === page) {
      link.classList.add('active');
    }
  });

  // Re-initialise Bootstrap tooltips / popovers if any
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  tooltipTriggerList.forEach(el => new bootstrap.Tooltip(el));

  // Initialise DataTable if the page contains one
  if (page === 'datatables.html') {
    initDataTable();
  }
}

/**
 * Simple DataTable initialiser (sorting + search).
 */
function initDataTable() {
  const table = document.querySelector('#dataTable');
  if (!table) return;

  const searchInput = document.getElementById('tableSearch');
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      const filter = this.value.toLowerCase();
      const rows = table.querySelectorAll('tbody tr');
      rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(filter) ? '' : 'none';
      });
    });
  }

  // Column sort
  table.querySelectorAll('thead th[data-sort]').forEach(th => {
    th.style.cursor = 'pointer';
    th.addEventListener('click', () => {
      const idx = Array.from(th.parentNode.children).indexOf(th);
      const tbody = table.querySelector('tbody');
      const rows = Array.from(tbody.querySelectorAll('tr'));
      const asc = th.classList.toggle('asc');
      rows.sort((a, b) => {
        const at = a.children[idx].textContent.trim();
        const bt = b.children[idx].textContent.trim();
        return asc ? at.localeCompare(bt, undefined, { numeric: true })
                    : bt.localeCompare(at, undefined, { numeric: true });
      });
      rows.forEach(r => tbody.appendChild(r));
    });
  });
}

/* ---------- Bootstrap the application ---------- */
document.addEventListener('DOMContentLoaded', async () => {
  // 1. Load structural components in parallel
  await Promise.all([
    loadComponent('components/header.html',  'headerArea'),
    loadComponent('components/navbar.html',  'navbarArea'),
    loadComponent('components/sidebar.html', 'sidebarArea'),
    loadComponent('components/footer.html',  'footerArea'),
  ]);

  // 2. Attach click handlers to nav links (event delegation)
  document.getElementById('navbarArea').addEventListener('click', e => {
    const link = e.target.closest('.nav-link[data-page]');
    if (link) {
      e.preventDefault();
      loadPage(link.getAttribute('data-page'));
    }
  });

  // 3. Load default page
  loadPage('home.html');
});
