// ToolVaults - Universal Tool Loader
let allTools = {};
let currentCategory = 'all';
let searchTerm = '';

// List of all JSON files to load
const categories = [
    'business', 'development', 'design', 'productivity', 'education',
    'entertainment', 'health', 'finance', 'marketing', 'social', 'utilities', 'ai'
];

document.addEventListener('DOMContentLoaded', function () {
    const toolsContainer = document.querySelector('#toolsContainer');
    if (!toolsContainer) return; // Skip pages without tool display

    const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
    currentCategory = categories.includes(currentPage) ? currentPage : 'all';

    addBasicStyles();
    loadAllData();
    setupEventListeners();
});

// Load tool data
async function loadAllData() {
    const promises = categories.map(async category => {
        try {
            const response = await fetch(`data/${category}.json`);
            if (!response.ok) throw new Error();
            const data = await response.json();
            allTools[category] = Array.isArray(data) ? data : data.tools || [];
        } catch {
            allTools[category] = [];
        }
    });

    await Promise.all(promises);
    displayTools();
    updateCategoryButtons();
}

// Setup search + filter
function setupEventListeners() {
    const searchInput = document.querySelector('#searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', e => {
            searchTerm = e.target.value.toLowerCase();
            displayTools();
        });
    }

    document.addEventListener('click', e => {
        if (e.target.matches('[data-category]')) {
            currentCategory = e.target.dataset.category;
            setActiveCategory(currentCategory);
            displayTools();
        }
    });
}

function setActiveCategory(category) {
    currentCategory = category;
    document.querySelectorAll('[data-category]').forEach(btn =>
        btn.classList.toggle('active', btn.dataset.category === category)
    );
}

function getFilteredTools() {
    let tools = currentCategory === 'all'
        ? Object.values(allTools).flat()
        : allTools[currentCategory] || [];

    if (searchTerm) {
        tools = tools.filter(tool => (
            `${tool.name} ${tool.title} ${tool.description} ${tool.category} ${tool.tags?.join(' ')}`.toLowerCase().includes(searchTerm)
        ));
    }
    return tools;
}

function displayTools() {
    const toolsContainer = document.querySelector('#toolsContainer');
    if (!toolsContainer) return;

    const toolsToShow = getFilteredTools();
    toolsContainer.innerHTML = toolsToShow.length
        ? `<div class="tools-grid">${toolsToShow.map(createToolCard).join('')}</div>`
        : `<div class="no-results"><h3>No tools found</h3><p>Try a different search or category.</p></div>`;
}

function createToolCard(tool) {
    const name = tool.name || tool.title || 'Untitled';
    const description = tool.description || '';
    const url = tool.url || tool.link || '#';
    const category = tool.category || '';
    const tags = tool.tags || [];

    return `
      <div class="tool-card">
        <div class="tool-header">
          <h3 class="tool-name"><a href="${url}" target="_blank">${escapeHtml(name)}</a></h3>
          <span class="tool-category">${escapeHtml(category)}</span>
        </div>
        <p class="tool-description">${escapeHtml(description)}</p>
        ${tags.length ? `<div class="tool-tags">${tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}</div>` : ''}
        <div class="tool-footer">
          <a href="${url}" target="_blank" class="visit-btn">Visit Tool →</a>
        </div>
      </div>`;
}

function updateCategoryButtons() {
    document.querySelectorAll('[data-category]').forEach(btn => {
        const cat = btn.dataset.category;
        const count = cat === 'all'
            ? Object.values(allTools).flat().length
            : (allTools[cat] || []).length;

        let countSpan = btn.querySelector('.count');
        if (!countSpan) {
            countSpan = document.createElement('span');
            countSpan.className = 'count';
            btn.appendChild(countSpan);
        }
        countSpan.textContent = `(${count})`;
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function addBasicStyles() {
    if (document.querySelector('#toolhub-styles')) return;

    const style = document.createElement('style');
    style.id = 'toolhub-styles';
    style.textContent = `
      .tools-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1.5rem;
        padding: 1rem;
      }
      .tool-card {
        background: #fff;
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 1rem;
        transition: box-shadow 0.2s ease;
      }
      .tool-card:hover {
        box-shadow: 0 4px 10px rgba(0,0,0,0.1);
      }
      .tool-name a {
        font-size: 1.1rem;
        font-weight: bold;
        text-decoration: none;
        color: #2c3e50;
      }
      .tool-category {
        display: inline-block;
        font-size: 0.8rem;
        margin-top: 0.25rem;
        color: #888;
      }
      .tool-description {
        margin: 0.75rem 0;
        font-size: 0.95rem;
        color: #555;
      }
      .tool-tags {
        margin-bottom: 0.75rem;
      }
      .tag {
        display: inline-block;
        background: #eef6fa;
        color: #3498db;
        font-size: 0.75rem;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        margin: 0 0.25rem 0.25rem 0;
      }
      .visit-btn {
        background: #3498db;
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        text-decoration: none;
        display: inline-block;
      }
      .visit-btn:hover {
        background: #2980b9;
      }
      .no-results {
        text-align: center;
        padding: 2rem;
        color: #7f8c8d;
      }
    `;
    document.head.appendChild(style);
}
