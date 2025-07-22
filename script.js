// ToolHub - Main JavaScript functionality
let allTools = {};
let currentCategory = 'all';
let searchTerm = '';

// List of all JSON files to load
const categories = [
    'business',
    'development',
    'design',
    'productivity',
    'education',
    'entertainment',
    'health',
    'finance',
    'marketing',
    'social',
    'utilities',
    'ai'
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadAllData();
    setupEventListeners();
});

// Load all JSON files
async function loadAllData() {
    console.log('Loading data...');
    
    try {
        // Load all category JSON files
        const promises = categories.map(async category => {
            try {
                const response = await fetch(`data/${category}.json`);
                if (response.ok) {
                    const data = await response.json();
                    allTools[category] = Array.isArray(data) ? data : data.tools || [];
                    console.log(`Loaded ${category}: ${allTools[category].length} tools`);
                } else {
                    console.warn(`Could not load ${category}.json`);
                    allTools[category] = [];
                }
            } catch (error) {
                console.warn(`Error loading ${category}.json:`, error);
                allTools[category] = [];
            }
        });

        await Promise.all(promises);
        
        // Display all tools initially
        displayTools();
        updateCategoryButtons();
        
        console.log('All data loaded successfully');
        
    } catch (error) {
        console.error('Error loading data:', error);
        showErrorMessage('Failed to load tools. Please try refreshing the page.');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    const searchInput = document.querySelector('#searchInput, [placeholder*="search"], input[type="search"], input[type="text"]');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            searchTerm = e.target.value.toLowerCase();
            displayTools();
        });
    }

    // Category buttons
    document.addEventListener('click', function(e) {
        // Handle category buttons
        if (e.target.matches('.category-btn, [data-category], .btn')) {
            const category = e.target.dataset.category || 
                           e.target.textContent.toLowerCase().replace(/\s+/g, '') ||
                           'all';
            
            setActiveCategory(category);
            displayTools();
        }
    });

    // Handle "All" or "Browse" buttons
    const allButton = document.querySelector('.all-btn, [data-category="all"]');
    if (allButton) {
        allButton.addEventListener('click', function() {
            setActiveCategory('all');
            displayTools();
        });
    }
}

// Set active category
function setActiveCategory(category) {
    currentCategory = category;
    
    // Update button states
    document.querySelectorAll('.category-btn, .btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeBtn = document.querySelector(`[data-category="${category}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
}

// Display tools based on current filters
function displayTools() {
    const toolsContainer = document.querySelector('#toolsContainer, .tools-grid, .tools-list, .container, main');
    
    if (!toolsContainer) {
        console.error('Tools container not found');
        return;
    }

    // Get filtered tools
    let toolsToShow = getFilteredTools();
    
    if (toolsToShow.length === 0) {
        toolsContainer.innerHTML = `
            <div class="no-results">
                <h3>No tools found</h3>
                <p>Try adjusting your search or selecting a different category.</p>
            </div>
        `;
        return;
    }

    // Generate HTML for tools
    const toolsHTML = toolsToShow.map(tool => createToolCard(tool)).join('');
    
    // Update the container
    toolsContainer.innerHTML = `
        <div class="tools-grid">
            ${toolsHTML}
        </div>
    `;
    
    console.log(`Displayed ${toolsToShow.length} tools`);
}

// Get filtered tools based on category and search
function getFilteredTools() {
    let tools = [];
    
    // Get tools from selected category
    if (currentCategory === 'all') {
        // Combine all categories
        Object.values(allTools).forEach(categoryTools => {
            tools.push(...categoryTools);
        });
    } else {
        tools = allTools[currentCategory] || [];
    }
    
    // Apply search filter
    if (searchTerm) {
        tools = tools.filter(tool => {
            const searchableText = `
                ${tool.name || ''} 
                ${tool.title || ''} 
                ${tool.description || ''} 
                ${tool.category || ''}
                ${tool.tags ? tool.tags.join(' ') : ''}
            `.toLowerCase();
            
            return searchableText.includes(searchTerm);
        });
    }
    
    return tools;
}

// Create HTML for a tool card
function createToolCard(tool) {
    const name = tool.name || tool.title || 'Untitled Tool';
    const description = tool.description || 'No description available';
    const url = tool.url || tool.link || '#';
    const category = tool.category || 'Uncategorized';
    const tags = tool.tags || [];
    
    return `
        <div class="tool-card">
            <div class="tool-header">
                <h3 class="tool-name">
                    <a href="${url}" target="_blank" rel="noopener noreferrer">
                        ${escapeHtml(name)}
                    </a>
                </h3>
                <span class="tool-category">${escapeHtml(category)}</span>
            </div>
            <p class="tool-description">${escapeHtml(description)}</p>
            ${tags.length > 0 ? `
                <div class="tool-tags">
                    ${tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
                </div>
            ` : ''}
            <div class="tool-footer">
                <a href="${url}" target="_blank" rel="noopener noreferrer" class="visit-btn">
                    Visit Tool →
                </a>
            </div>
        </div>
    `;
}

// Update category buttons with counts
function updateCategoryButtons() {
    document.querySelectorAll('[data-category]').forEach(btn => {
        const category = btn.dataset.category;
        const count = category === 'all' 
            ? Object.values(allTools).reduce((sum, tools) => sum + tools.length, 0)
            : (allTools[category] || []).length;
            
        const countSpan = btn.querySelector('.count') || document.createElement('span');
        countSpan.className = 'count';
        countSpan.textContent = `(${count})`;
        
        if (!btn.querySelector('.count')) {
            btn.appendChild(countSpan);
        }
    });
}

// Show error message
function showErrorMessage(message) {
    const container = document.querySelector('#toolsContainer, .tools-grid, .container, main');
    if (container) {
        container.innerHTML = `
            <div class="error-message">
                <h3>Oops! Something went wrong</h3>
                <p>${message}</p>
                <button onclick="location.reload()" class="retry-btn">Try Again</button>
            </div>
        `;
    }
}

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Add some basic styles if they don't exist
function addBasicStyles() {
    if (!document.querySelector('#toolhub-styles')) {
        const style = document.createElement('style');
        style.id = 'toolhub-styles';
        style.textContent = `
            .tools-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 1.5rem;
                padding: 1rem;
            }
            
            .tool-card {
                border: 1px solid #e1e5e9;
                border-radius: 8px;
                padding: 1.5rem;
                background: white;
                transition: transform 0.2s, box-shadow 0.2s;
            }
            
            .tool-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            
            .tool-name a {
                color: #2c3e50;
                text-decoration: none;
                font-weight: bold;
            }
            
            .tool-name a:hover {
                color: #3498db;
            }
            
            .tool-category {
                background: #ecf0f1;
                padding: 0.25rem 0.5rem;
                border-radius: 4px;
                font-size: 0.8rem;
                color: #7f8c8d;
            }
            
            .tool-description {
                color: #555;
                margin: 1rem 0;
                line-height: 1.5;
            }
            
            .tool-tags {
                margin: 1rem 0;
            }
            
            .tag {
                background: #e8f4f8;
                color: #2980b9;
                padding: 0.2rem 0.5rem;
                border-radius: 4px;
                font-size: 0.8rem;
                margin-right: 0.5rem;
            }
            
            .visit-btn {
                background: #3498db;
                color: white;
                padding: 0.5rem 1rem;
                text-decoration: none;
                border-radius: 4px;
                display: inline-block;
                transition: background 0.2s;
            }
            
            .visit-btn:hover {
                background: #2980b9;
            }
            
            .no-results, .error-message {
                text-align: center;
                padding: 3rem;
                color: #7f8c8d;
            }
            
            .category-btn.active {
                background: #3498db;
                color: white;
            }
            
            .count {
                margin-left: 0.5rem;
                opacity: 0.7;
                font-size: 0.9em;
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize styles
addBasicStyles();
