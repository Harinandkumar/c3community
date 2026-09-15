// ==========================================
// ========== SECTIONS BUILDER - JS ==========
// ==========================================

var API_BASE_URL = 'https://backend-glo6.onrender.com';
var API_BASE_ADMIN = API_BASE_URL + '/api/team';
var adminToken = localStorage.getItem('adminToken');

if (!adminToken) window.location.href = 'admin-login.html';

// ========== STATE ==========
var isSuperAdmin = false;
var userPermissions = null;
var canCreate = false, canEdit = false, canDelete = false;
var currentSection = null;
var blocks = [];
var selectedBlockIndex = -1;
var isDirty = false;
var currentView = 'desktop';
var leftTab = 'sections';

// ========== BLOCK PALETTE DEFINITION ==========
var BLOCK_TYPES = [
    { type: 'heading', icon: 'fas fa-heading', label: 'Heading' },
    { type: 'subheading', icon: 'fas fa-h-square', label: 'Subheading' },
    { type: 'paragraph', icon: 'fas fa-align-left', label: 'Paragraph' },
    { type: 'image', icon: 'fas fa-image', label: 'Image' },
    { type: 'video', icon: 'fas fa-video', label: 'Video' },
    { type: 'button', icon: 'fas fa-mouse-pointer', label: 'Button' },
    { type: 'gallery', icon: 'fas fa-images', label: 'Gallery' },
    { type: 'cardgrid', icon: 'fas fa-th-large', label: 'Card Grid' },
    { type: 'list', icon: 'fas fa-list', label: 'List' },
    { type: 'quote', icon: 'fas fa-quote-left', label: 'Quote' },
    { type: 'divider', icon: 'fas fa-minus', label: 'Divider' },
    { type: 'card', icon: 'fas fa-id-card', label: 'Card' },
    { type: 'cta', icon: 'fas fa-bullhorn', label: 'CTA' },
    { type: 'html', icon: 'fas fa-code', label: 'HTML' },
    { type: 'spacer', icon: 'fas fa-arrows-alt-v', label: 'Spacer' }
];

// ========== INIT ==========
(async function init() {
    await loadUserAndPermissions();

    if (!canCreate && !canEdit) {
        document.getElementById('noPermission').style.display = 'flex';
        document.getElementById('leftSidebar').style.display = 'none';
        document.getElementById('centerCanvas').style.display = 'none';
        document.getElementById('rightSidebar').style.display = 'none';
        return;
    }

    if (!canCreate) document.getElementById('btnNewSection').style.display = 'none';

    loadSections();
    renderBlockPalette();
})();

async function loadUserAndPermissions() {
    try {
        var response = await fetch(API_BASE_ADMIN + '/me', {
            headers: { 'Authorization': 'Bearer ' + adminToken }
        });

        if (!response.ok) {
            window.location.href = 'admin-login.html';
            return;
        }

        var member = await response.json();
        userPermissions = member.permissions;
        isSuperAdmin = (member.role === 'super_admin');

        document.getElementById('userInfo').textContent = member.name + ' (' + (isSuperAdmin ? 'Super Admin' : member.role) + ')';

        var cs = userPermissions?.customSections || {};
        canCreate = isSuperAdmin || cs.create === true;
        canEdit = isSuperAdmin || cs.edit === true;
        canDelete = isSuperAdmin || cs.delete === true;
    } catch (error) {
        console.error('Permission load error:', error);
        window.location.href = 'admin-login.html';
    }
}

// ========== LEFT TAB SWITCH ==========
function switchLeftTab(tab) {
    leftTab = tab;
    document.querySelectorAll('.left-tab').forEach(t => t.classList.remove('active'));
    document.querySelector('.left-tab[data-tab="' + tab + '"]').classList.add('active');

    if (tab === 'sections') {
        loadSections();
    } else {
        renderBlockPalette();
    }
}

// ========== LOAD SECTIONS ==========
async function loadSections() {
    try {
        var response = await fetch(API_BASE_ADMIN + '/custom-sections', {
            headers: { 'Authorization': 'Bearer ' + adminToken }
        });

        if (!response.ok) throw new Error('Failed to load');

        var sections = await response.json();
        displaySectionsList(sections);
    } catch (error) {
        document.getElementById('sectionsList').innerHTML = 
            '<div style="text-align:center;padding:20px;color:var(--danger);font-size:13px;">Failed to load</div>';
    }
}

function displaySectionsList(sections) {
    var container = document.getElementById('sectionsList');

    if (leftTab !== 'sections') return;

    if (!sections || sections.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-secondary);font-size:13px;">No sections yet. Click "New Section".</div>';
        return;
    }

    var html = '';
    sections.forEach(function (s) {
        var dotClass = s.isPublished ? 'published' : '';
        var activeClass = (currentSection && currentSection._id === s._id) ? 'active' : '';
        html += '<div class="section-list-item ' + activeClass + '">' +
            '<div class="section-item-inner" onclick="openSection(\'' + s._id + '\')">' +
            '<span class="icon">' + (s.icon || '📦') + '</span>' +
            '<span class="name">' + escapeHtml(s.title) + '</span>' +
            '<span class="status-dot ' + dotClass + '"></span>' +
            '</div>' +
            (canDelete ? '<button class="section-delete-btn" onclick="event.stopPropagation();deleteSection(\'' + s._id + '\', \'' + escapeHtml(s.title).replace(/'/g, "\\'") + '\')" title="Delete Section"><i class="fas fa-trash"></i></button>' : '') +
            '</div>';
    });
    container.innerHTML = html;
}

// ========== ✅ NEW: DELETE SECTION ==========
async function deleteSection(sectionId, sectionTitle) {
    if (!canDelete) {
        showToast('You don\'t have delete permission', 'error');
        return;
    }

    if (!confirm('⚠️ Delete section "' + sectionTitle + '"?\n\nThis will permanently delete all blocks and images inside it.')) {
        return;
    }

    try {
        var response = await fetch(API_BASE_ADMIN + '/custom-sections/' + sectionId, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + adminToken }
        });

        if (!response.ok) {
            var err = await response.json();
            throw new Error(err.message || 'Failed to delete');
        }

        showToast('✅ Section deleted successfully!', 'success');

        // Agar current open section delete hua, toh preview clear karo
        if (currentSection && currentSection._id === sectionId) {
            currentSection = null;
            blocks = [];
            selectedBlockIndex = -1;
            document.getElementById('previewEmpty').style.display = 'block';
            document.getElementById('previewContent').style.display = 'none';
            renderSettings();
        }

        isDirty = false;
        document.getElementById('saveBar').classList.remove('show');

        loadSections();
    } catch (error) {
        showToast('❌ ' + error.message, 'error');
    }
}

// ========== BLOCK PALETTE ==========
function renderBlockPalette() {
    var container = document.getElementById('sectionsList');
    if (leftTab !== 'blocks') return;

    var html = '<div class="palette-title">Click to Add Block</div>';
    html += '<div class="block-palette-grid">';

    BLOCK_TYPES.forEach(function (b) {
        html += '<button class="block-btn" onclick="addBlock(\'' + b.type + '\')">' +
            '<i class="' + b.icon + '"></i>' +
            '<span>' + b.label + '</span>' +
            '</button>';
    });

    html += '</div>';
    container.innerHTML = html;
}

// ========== PREVIEW VIEW TOGGLE ==========
function setPreviewView(view) {
    currentView = view;
    document.querySelectorAll('.view-toggle-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.view-toggle-btn[data-view="' + view + '"]').classList.add('active');

    var frame = document.getElementById('previewFrame');
    frame.className = 'preview-frame ' + view;
}

// ========== OPEN SECTION ==========
async function openSection(sectionId) {
    if (isDirty && !confirm('You have unsaved changes. Discard them?')) return;

    try {
        var response = await fetch(API_BASE_ADMIN + '/custom-sections/' + sectionId, {
            headers: { 'Authorization': 'Bearer ' + adminToken }
        });

        if (!response.ok) throw new Error('Failed to load');

        var section = await response.json();
        currentSection = section;
        blocks = JSON.parse(JSON.stringify(section.blocks || []));
        selectedBlockIndex = -1;

        document.getElementById('previewEmpty').style.display = 'none';
        document.getElementById('previewContent').style.display = 'block';

        document.getElementById('previewTitle').textContent = (section.icon ? section.icon + ' ' : '') + (section.title || 'Untitled');
        document.getElementById('previewDescription').textContent = section.description || '';

        renderPreview();
        renderSettings();
        loadSections();
    } catch (error) {
        showToast('❌ Failed to load: ' + error.message, 'error');
    }
}

// ========== ADD BLOCK ==========
function addBlock(type) {
    if (!currentSection) {
        showToast('Open a section first', 'error');
        return;
    }
    if (!canEdit) {
        showToast('You don\'t have edit permission', 'error');
        return;
    }

    var newBlock = {
        id: 'block_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        type: type,
        content: getDefaultContent(type),
        styles: {},
        order: blocks.length
    };

    blocks.push(newBlock);
    selectedBlockIndex = blocks.length - 1;

    renderPreview();
    renderSettings();
    markUnsaved();

    if (window.innerWidth < 900) {
        switchLeftTab('sections');
    }
}

function getDefaultContent(type) {
    switch (type) {
        case 'heading': return { text: 'Your Heading Here', size: 'h2', align: 'left' };
        case 'subheading': return { text: 'Subheading text', align: 'left' };
        case 'paragraph': return { text: 'Write your paragraph here...', align: 'left' };
        case 'image': return { url: '', publicId: '', caption: '', alt: '' };
        case 'video': return { url: '', caption: '' };
        case 'button': return { text: 'Click Me', url: '#', style: 'primary', target: '_self', align: 'left' };
        case 'gallery': return { images: [], columns: 3 };
        case 'cardgrid': return { columns: 3, cards: [
            { image: '', publicId: '', title: 'Card 1', subtitle: '', description: 'Description', link: '', linkText: 'Learn More' },
            { image: '', publicId: '', title: 'Card 2', subtitle: '', description: 'Description', link: '', linkText: 'Learn More' },
            { image: '', publicId: '', title: 'Card 3', subtitle: '', description: 'Description', link: '', linkText: 'Learn More' }
        ]};
        case 'list': return { items: ['Item 1', 'Item 2', 'Item 3'], listType: 'bullet' };
        case 'quote': return { text: 'Your quote here', author: '' };
        case 'divider': return { style: 'solid' };
        case 'card': return { icon: '⭐', title: 'Card Title', description: 'Card description', url: '' };
        case 'cta': return { heading: 'Ready to Join?', text: 'Sign up now', buttonText: 'Get Started', buttonUrl: '#' };
        case 'html': return { code: '<div>Your HTML here</div>' };
        case 'spacer': return { height: 40 };
        default: return {};
    }
}

// ========== RENDER PREVIEW ==========
function renderPreview() {
    var container = document.getElementById('previewBlocks');

    if (!blocks || blocks.length === 0) {
        container.innerHTML = '<div class="preview-empty" style="padding:40px 20px;"><i class="fas fa-plus-circle"></i><p>No blocks yet. Add from left palette.</p></div>';
        return;
    }

    var html = '';
    blocks.forEach(function (block, index) {
        var selected = (index === selectedBlockIndex) ? 'selected' : '';
        html += '<div class="preview-block ' + selected + '" data-index="' + index + '" onclick="selectBlock(' + index + ')">';

        html += '<div class="preview-block-actions">' +
            '<span class="drag-handle"><i class="fas fa-grip-vertical"></i></span>' +
            '<button onclick="event.stopPropagation();moveBlockUp(' + index + ')" title="Move Up"><i class="fas fa-arrow-up"></i></button>' +
            '<button onclick="event.stopPropagation();moveBlockDown(' + index + ')" title="Move Down"><i class="fas fa-arrow-down"></i></button>' +
            (canEdit ? '<button onclick="event.stopPropagation();duplicateBlock(' + index + ')" title="Duplicate"><i class="fas fa-copy"></i></button>' : '') +
            (canEdit ? '<button class="delete-btn" onclick="event.stopPropagation();deleteBlock(' + index + ')" title="Delete"><i class="fas fa-trash"></i></button>' : '') +
            '</div>';

        html += renderBlockPreview(block);

        html += '</div>';
    });

    container.innerHTML = html;

    if (typeof Sortable !== 'undefined') {
        new Sortable(container, {
            handle: '.drag-handle',
            animation: 150,
            onEnd: function (evt) {
                var moved = blocks.splice(evt.oldIndex, 1)[0];
                blocks.splice(evt.newIndex, 0, moved);
                if (selectedBlockIndex === evt.oldIndex) selectedBlockIndex = evt.newIndex;
                renderPreview();
                markUnsaved();
            }
        });
    }
}

function renderBlockPreview(block) {
    var c = block.content || {};
    var type = block.type;

    switch (type) {
        case 'heading':
            var hTag = c.size || 'h2';
            var hSize = { h1: '2.5rem', h2: '2rem', h3: '1.5rem', h4: '1.2rem' }[hTag] || '2rem';
            return '<div style="padding:10px;text-align:' + (c.align || 'left') + ';">' +
                '<' + hTag + ' style="font-size:' + hSize + ';font-weight:700;color:var(--text);margin:0;">' + escapeHtml(c.text || 'Heading') + '</' + hTag + '></div>';

        case 'subheading':
            return '<div style="padding:10px;text-align:' + (c.align || 'left') + ';">' +
                '<h3 style="font-size:1.3rem;color:var(--text);margin:0;">' + escapeHtml(c.text || 'Subheading') + '</h3></div>';

        case 'paragraph':
            return '<div style="padding:10px;text-align:' + (c.align || 'left') + ';color:var(--text-secondary);font-size:0.95rem;line-height:1.7;">' +
                escapeHtml(c.text || 'Paragraph text...').replace(/\n/g, '<br>') + '</div>';

        case 'image':
            if (!c.url) return '<div style="padding:30px;text-align:center;color:var(--text-secondary);background:var(--bg);border-radius:8px;">📷 No image set</div>';
            return '<div style="padding:10px;text-align:center;">' +
                '<img src="' + escapeAttr(c.url) + '" style="max-width:100%;border-radius:8px;" onerror="this.style.display=\'none\'">' +
                (c.caption ? '<p style="font-size:0.85rem;color:var(--text-secondary);margin-top:6px;">' + escapeHtml(c.caption) + '</p>' : '') +
                '</div>';

        case 'video':
            if (!c.url) return '<div style="padding:30px;text-align:center;color:var(--text-secondary);background:var(--bg);border-radius:8px;">🎬 No video set</div>';
            var vid = c.url;
            if (vid.includes('youtube.com/watch?v=')) {
                vid = 'https://www.youtube.com/embed/' + vid.split('v=')[1].split('&')[0];
            } else if (vid.includes('youtu.be/')) {
                vid = 'https://www.youtube.com/embed/' + vid.split('youtu.be/')[1].split('?')[0];
            }
            return '<div style="padding:10px;"><iframe src="' + escapeAttr(vid) + '" style="width:100%;aspect-ratio:16/9;border-radius:8px;border:none;" allowfullscreen></iframe></div>';

        case 'button':
            var btnStyle = c.style === 'outline' 
                ? 'background:transparent;border:2px solid var(--primary);color:var(--primary);' 
                : c.style === 'secondary'
                ? 'background:var(--card-bg);color:var(--text);border:1px solid var(--border);'
                : 'background:linear-gradient(135deg,var(--primary),var(--secondary));color:white;';
            return '<div style="padding:10px;text-align:' + (c.align || 'left') + ';">' +
                '<span style="display:inline-block;padding:12px 28px;border-radius:50px;font-weight:600;' + btnStyle + '">' + escapeHtml(c.text || 'Click') + '</span></div>';

        case 'gallery':
            if (!c.images || c.images.length === 0) return '<div style="padding:30px;text-align:center;color:var(--text-secondary);background:var(--bg);border-radius:8px;">📸 No images</div>';
            var cols = c.columns || 3;
            return '<div style="padding:10px;display:grid;grid-template-columns:repeat(' + cols + ',1fr);gap:10px;">' +
                c.images.map(img => '<img src="' + escapeAttr(img.url) + '" style="width:100%;height:120px;object-fit:cover;border-radius:8px;">').join('') +
                '</div>';

        case 'cardgrid':
            var cgCols = c.columns || 3;
            var cards = c.cards || [];
            if (cards.length === 0) return '<div style="padding:30px;text-align:center;color:var(--text-secondary);background:var(--bg);border-radius:8px;">🃏 No cards added</div>';
            return '<div style="padding:10px;display:grid;grid-template-columns:repeat(' + cgCols + ',1fr);gap:16px;">' +
                cards.map(card => 
                    '<div style="background:var(--bg);border:1px solid var(--border);border-radius:12px;padding:16px;text-align:center;">' +
                    (card.image ? '<img src="' + escapeAttr(card.image) + '" style="width:80px;height:80px;border-radius:50%;object-fit:cover;margin-bottom:10px;border:2px solid var(--primary);">' : '<div style="width:80px;height:80px;border-radius:50%;background:var(--card-bg);margin:0 auto 10px;display:flex;align-items:center;justify-content:center;font-size:24px;">👤</div>') +
                    '<h4 style="font-size:1rem;color:var(--text);margin-bottom:4px;">' + escapeHtml(card.title || 'Card Title') + '</h4>' +
                    (card.subtitle ? '<p style="font-size:0.8rem;color:var(--primary);margin-bottom:6px;">' + escapeHtml(card.subtitle) + '</p>' : '') +
                    (card.description ? '<p style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:10px;">' + escapeHtml(card.description) + '</p>' : '') +
                    (card.link ? '<span style="font-size:0.75rem;color:var(--primary);">' + escapeHtml(card.linkText || 'Learn More') + ' →</span>' : '') +
                    '</div>'
                ).join('') +
                '</div>';

        case 'list':
            if (!c.items || c.items.length === 0) return '<div style="padding:10px;color:var(--text-secondary);">Empty list</div>';
            var listTag = c.listType === 'number' ? 'ol' : 'ul';
            return '<' + listTag + ' style="padding:10px 10px 10px 32px;color:var(--text-secondary);line-height:1.8;">' +
                c.items.map(i => '<li>' + escapeHtml(i) + '</li>').join('') +
                '</' + listTag + '>';

        case 'quote':
            return '<blockquote style="padding:16px 20px;margin:10px;background:var(--bg);border-left:4px solid var(--primary);border-radius:8px;color:var(--text);">' +
                '<p style="font-style:italic;">' + escapeHtml(c.text || 'Quote') + '</p>' +
                (c.author ? '<cite style="display:block;text-align:right;font-size:0.85rem;color:var(--primary);margin-top:6px;">— ' + escapeHtml(c.author) + '</cite>' : '') +
                '</blockquote>';

        case 'divider':
            return '<hr style="margin:20px 10px;border:none;border-top:2px ' + (c.style || 'solid') + ' var(--border);">';

        case 'card':
            return '<div style="margin:10px;padding:20px;background:var(--bg);border-radius:12px;text-align:center;border:1px solid var(--border);">' +
                (c.icon ? '<div style="font-size:2rem;margin-bottom:8px;">' + c.icon + '</div>' : '') +
                '<h4 style="color:var(--primary);margin-bottom:6px;">' + escapeHtml(c.title || 'Card') + '</h4>' +
                '<p style="color:var(--text-secondary);font-size:0.9rem;">' + escapeHtml(c.description || '') + '</p>' +
                '</div>';

        case 'cta':
            return '<div style="margin:10px;padding:30px 20px;background:linear-gradient(135deg,rgba(0,240,255,0.08),rgba(255,45,117,0.05));border:1px solid rgba(0,240,255,0.2);border-radius:12px;text-align:center;">' +
                '<h3 style="color:var(--primary);margin-bottom:8px;">' + escapeHtml(c.heading || 'CTA') + '</h3>' +
                '<p style="color:var(--text-secondary);margin-bottom:16px;">' + escapeHtml(c.text || '') + '</p>' +
                '<span style="display:inline-block;padding:10px 24px;background:linear-gradient(135deg,var(--primary),var(--secondary));color:white;border-radius:50px;font-weight:600;font-size:0.9rem;">' + escapeHtml(c.buttonText || 'Click') + '</span>' +
                '</div>';

        case 'html':
            return '<div style="padding:10px;background:var(--bg);border-radius:8px;color:var(--text);">' +
                (c.code || '<em>HTML block</em>') + '</div>';

        case 'spacer':
            return '<div style="height:' + (c.height || 40) + 'px;background:rgba(0,240,255,0.03);border-radius:4px;display:flex;align-items:center;justify-content:center;color:var(--text-secondary);font-size:11px;">Spacer: ' + (c.height || 40) + 'px</div>';

        default:
            return '<div style="padding:10px;color:var(--text-secondary);">Unknown block: ' + type + '</div>';
    }
}

// ========== SELECT BLOCK ==========
function selectBlock(index) {
    selectedBlockIndex = index;
    renderPreview();
    renderSettings();
}

// ========== MOVE / DUPLICATE / DELETE ==========
function moveBlockUp(index) {
    if (index <= 0) return;
    var temp = blocks[index - 1];
    blocks[index - 1] = blocks[index];
    blocks[index] = temp;
    selectedBlockIndex = index - 1;
    renderPreview();
    markUnsaved();
}

function moveBlockDown(index) {
    if (index >= blocks.length - 1) return;
    var temp = blocks[index + 1];
    blocks[index + 1] = blocks[index];
    blocks[index] = temp;
    selectedBlockIndex = index + 1;
    renderPreview();
    markUnsaved();
}

function duplicateBlock(index) {
    if (!canEdit) return;
    var cloned = JSON.parse(JSON.stringify(blocks[index]));
    cloned.id = 'block_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    blocks.splice(index + 1, 0, cloned);
    selectedBlockIndex = index + 1;
    renderPreview();
    renderSettings();
    markUnsaved();
    showToast('✅ Block duplicated', 'success');
}

function deleteBlock(index) {
    if (!canEdit) return;
    if (!confirm('Delete this block?')) return;
    blocks.splice(index, 1);
    if (selectedBlockIndex === index) selectedBlockIndex = -1;
    else if (selectedBlockIndex > index) selectedBlockIndex--;
    renderPreview();
    renderSettings();
    markUnsaved();
}

// ========== SETTINGS PANEL ==========
function renderSettings() {
    var container = document.getElementById('rightContent');

    if (selectedBlockIndex < 0 || !blocks[selectedBlockIndex]) {
        container.innerHTML = '<div class="right-empty"><i class="fas fa-mouse-pointer"></i><p>Click a block to edit its settings</p></div>';
        document.getElementById('rightTitle').textContent = 'Settings';
        return;
    }

    var block = blocks[selectedBlockIndex];
    document.getElementById('rightTitle').textContent = block.type.toUpperCase() + ' Settings';

    var html = renderBlockSettings(block, selectedBlockIndex);
    container.innerHTML = html;
}

function updateBlockContent(key, value) {
    if (selectedBlockIndex < 0) return;
    if (!blocks[selectedBlockIndex].content) blocks[selectedBlockIndex].content = {};
    blocks[selectedBlockIndex].content[key] = value;
    renderPreview();
    markUnsaved();
}

function renderBlockSettings(block, index) {
    var c = block.content || {};
    var html = '';

    switch (block.type) {
        case 'heading':
            html += '<div class="setting-group"><label class="setting-label">Text</label>' +
                '<input type="text" class="setting-input" value="' + escapeAttr(c.text || '') + '" oninput="updateBlockContent(\'text\', this.value)"></div>' +
                '<div class="setting-row">' +
                '<div class="setting-group"><label class="setting-label">Size</label>' +
                '<select class="setting-select" onchange="updateBlockContent(\'size\', this.value)">' +
                ['h1','h2','h3','h4'].map(s => '<option value="' + s + '"' + (c.size === s ? ' selected' : '') + '>' + s.toUpperCase() + '</option>').join('') +
                '</select></div>' +
                '<div class="setting-group"><label class="setting-label">Align</label>' +
                '<select class="setting-select" onchange="updateBlockContent(\'align\', this.value)">' +
                ['left','center','right'].map(a => '<option value="' + a + '"' + (c.align === a ? ' selected' : '') + '>' + a + '</option>').join('') +
                '</select></div></div>';
            break;

        case 'subheading':
            html += '<div class="setting-group"><label class="setting-label">Text</label>' +
                '<input type="text" class="setting-input" value="' + escapeAttr(c.text || '') + '" oninput="updateBlockContent(\'text\', this.value)"></div>' +
                '<div class="setting-group"><label class="setting-label">Align</label>' +
                '<select class="setting-select" onchange="updateBlockContent(\'align\', this.value)">' +
                ['left','center','right'].map(a => '<option value="' + a + '"' + (c.align === a ? ' selected' : '') + '>' + a + '</option>').join('') +
                '</select></div>';
            break;

        case 'paragraph':
            html += '<div class="setting-group"><label class="setting-label">Text</label>' +
                '<textarea class="setting-textarea" oninput="updateBlockContent(\'text\', this.value)">' + escapeHtml(c.text || '') + '</textarea></div>' +
                '<div class="setting-group"><label class="setting-label">Align</label>' +
                '<select class="setting-select" onchange="updateBlockContent(\'align\', this.value)">' +
                ['left','center','right','justify'].map(a => '<option value="' + a + '"' + (c.align === a ? ' selected' : '') + '>' + a + '</option>').join('') +
                '</select></div>';
            break;

        case 'image':
            html += '<div class="setting-group"><label class="setting-label">Image</label>' +
                '<input type="file" class="setting-input" accept="image/*" onchange="uploadBlockImage(this, ' + index + ')"></div>' +
                '<div class="setting-group"><label class="setting-label">Or Paste URL</label>' +
                '<input type="text" class="setting-input" value="' + escapeAttr(c.url || '') + '" oninput="updateBlockContent(\'url\', this.value)" placeholder="https://..."></div>' +
                '<div class="setting-group"><label class="setting-label">Caption</label>' +
                '<input type="text" class="setting-input" value="' + escapeAttr(c.caption || '') + '" oninput="updateBlockContent(\'caption\', this.value)"></div>' +
                (c.url ? '<div class="image-preview-box"><img src="' + escapeAttr(c.url) + '"></div>' : '');
            break;

        case 'video':
            html += '<div class="setting-group"><label class="setting-label">Video URL</label>' +
                '<input type="text" class="setting-input" value="' + escapeAttr(c.url || '') + '" oninput="updateBlockContent(\'url\', this.value)" placeholder="YouTube / Vimeo URL"></div>' +
                '<div class="setting-group"><label class="setting-label">Caption</label>' +
                '<input type="text" class="setting-input" value="' + escapeAttr(c.caption || '') + '" oninput="updateBlockContent(\'caption\', this.value)"></div>';
            break;

        case 'button':
            html += '<div class="setting-group"><label class="setting-label">Button Text</label>' +
                '<input type="text" class="setting-input" value="' + escapeAttr(c.text || '') + '" oninput="updateBlockContent(\'text\', this.value)"></div>' +
                '<div class="setting-group"><label class="setting-label">Link URL</label>' +
                '<input type="text" class="setting-input" value="' + escapeAttr(c.url || '') + '" oninput="updateBlockContent(\'url\', this.value)"></div>' +
                '<div class="setting-row">' +
                '<div class="setting-group"><label class="setting-label">Style</label>' +
                '<select class="setting-select" onchange="updateBlockContent(\'style\', this.value)">' +
                ['primary','secondary','outline'].map(s => '<option value="' + s + '"' + (c.style === s ? ' selected' : '') + '>' + s + '</option>').join('') +
                '</select></div>' +
                '<div class="setting-group"><label class="setting-label">Align</label>' +
                '<select class="setting-select" onchange="updateBlockContent(\'align\', this.value)">' +
                ['left','center','right'].map(a => '<option value="' + a + '"' + (c.align === a ? ' selected' : '') + '>' + a + '</option>').join('') +
                '</select></div></div>' +
                '<div class="setting-group"><label class="setting-label">Target</label>' +
                '<select class="setting-select" onchange="updateBlockContent(\'target\', this.value)">' +
                '<option value="_self"' + (c.target === '_self' ? ' selected' : '') + '>Same Tab</option>' +
                '<option value="_blank"' + (c.target === '_blank' ? ' selected' : '') + '>New Tab</option>' +
                '</select></div>';
            break;

        case 'gallery':
            html += '<div class="setting-group"><label class="setting-label">Upload Images (multiple)</label>' +
                '<input type="file" class="setting-input" accept="image/*" multiple onchange="uploadGalleryImages(this, ' + index + ')"></div>' +
                '<div class="setting-group"><label class="setting-label">Columns</label>' +
                '<select class="setting-select" onchange="updateBlockContent(\'columns\', parseInt(this.value))">' +
                [2,3,4].map(n => '<option value="' + n + '"' + (c.columns === n ? ' selected' : '') + '>' + n + ' columns</option>').join('') +
                '</select></div>' +
                (c.images && c.images.length ? '<div class="setting-group"><label class="setting-label">' + c.images.length + ' image(s)</label>' +
                '<button class="btn btn-danger btn-sm" onclick="clearGalleryImages(' + index + ')" style="width:100%;"><i class="fas fa-trash"></i> Clear All</button></div>' : '');
            break;

        case 'cardgrid':
            html += renderCardGridSettings(c, index);
            break;

        case 'list':
            html += '<div class="setting-group"><label class="setting-label">Items (one per line)</label>' +
                '<textarea class="setting-textarea" oninput="updateBlockContent(\'items\', this.value.split(\'\\n\').filter(x=>x.trim()))">' + escapeHtml((c.items || []).join('\n')) + '</textarea></div>' +
                '<div class="setting-group"><label class="setting-label">List Type</label>' +
                '<select class="setting-select" onchange="updateBlockContent(\'listType\', this.value)">' +
                '<option value="bullet"' + (c.listType === 'bullet' ? ' selected' : '') + '>Bullet</option>' +
                '<option value="number"' + (c.listType === 'number' ? ' selected' : '') + '>Number</option>' +
                '</select></div>';
            break;

        case 'quote':
            html += '<div class="setting-group"><label class="setting-label">Quote</label>' +
                '<textarea class="setting-textarea" oninput="updateBlockContent(\'text\', this.value)">' + escapeHtml(c.text || '') + '</textarea></div>' +
                '<div class="setting-group"><label class="setting-label">Author</label>' +
                '<input type="text" class="setting-input" value="' + escapeAttr(c.author || '') + '" oninput="updateBlockContent(\'author\', this.value)"></div>';
            break;

        case 'divider':
            html += '<div class="setting-group"><label class="setting-label">Style</label>' +
                '<select class="setting-select" onchange="updateBlockContent(\'style\', this.value)">' +
                ['solid','dashed','dotted'].map(s => '<option value="' + s + '"' + (c.style === s ? ' selected' : '') + '>' + s + '</option>').join('') +
                '</select></div>';
            break;

        case 'card':
            html += '<div class="setting-group"><label class="setting-label">Icon (emoji)</label>' +
                '<input type="text" class="setting-input" value="' + escapeAttr(c.icon || '') + '" oninput="updateBlockContent(\'icon\', this.value)"></div>' +
                '<div class="setting-group"><label class="setting-label">Title</label>' +
                '<input type="text" class="setting-input" value="' + escapeAttr(c.title || '') + '" oninput="updateBlockContent(\'title\', this.value)"></div>' +
                '<div class="setting-group"><label class="setting-label">Description</label>' +
                '<textarea class="setting-textarea" oninput="updateBlockContent(\'description\', this.value)">' + escapeHtml(c.description || '') + '</textarea></div>' +
                '<div class="setting-group"><label class="setting-label">Link</label>' +
                '<input type="text" class="setting-input" value="' + escapeAttr(c.url || '') + '" oninput="updateBlockContent(\'url\', this.value)"></div>';
            break;

        case 'cta':
            html += '<div class="setting-group"><label class="setting-label">Heading</label>' +
                '<input type="text" class="setting-input" value="' + escapeAttr(c.heading || '') + '" oninput="updateBlockContent(\'heading\', this.value)"></div>' +
                '<div class="setting-group"><label class="setting-label">Text</label>' +
                '<textarea class="setting-textarea" oninput="updateBlockContent(\'text\', this.value)">' + escapeHtml(c.text || '') + '</textarea></div>' +
                '<div class="setting-group"><label class="setting-label">Button Text</label>' +
                '<input type="text" class="setting-input" value="' + escapeAttr(c.buttonText || '') + '" oninput="updateBlockContent(\'buttonText\', this.value)"></div>' +
                '<div class="setting-group"><label class="setting-label">Button Link</label>' +
                '<input type="text" class="setting-input" value="' + escapeAttr(c.buttonUrl || '') + '" oninput="updateBlockContent(\'buttonUrl\', this.value)"></div>';
            break;

        case 'html':
            html += '<div class="setting-group"><label class="setting-label">HTML Code</label>' +
                '<textarea class="setting-textarea" style="font-family:monospace;font-size:12px;" oninput="updateBlockContent(\'code\', this.value)">' + escapeHtml(c.code || '') + '</textarea></div>';
            break;

        case 'spacer':
            html += '<div class="setting-group"><label class="setting-label">Height (px)</label>' +
                '<input type="number" class="setting-input" value="' + (c.height || 40) + '" oninput="updateBlockContent(\'height\', parseInt(this.value))"></div>';
            break;
    }

    return html;
}

// ========== CARD GRID SETTINGS ==========
function renderCardGridSettings(c, index) {
    var cards = c.cards || [];
    var html = '';

    html += '<div class="setting-group"><label class="setting-label">Columns (desktop)</label>' +
        '<select class="setting-select" onchange="updateCardGridColumns(' + index + ', parseInt(this.value))">' +
        [2,3,4].map(n => '<option value="' + n + '"' + (c.columns === n ? ' selected' : '') + '>' + n + ' columns</option>').join('') +
        '</select></div>';

    html += '<div class="setting-group"><label class="setting-label">Cards (' + cards.length + ')</label>';

    cards.forEach(function (card, ci) {
        html += '<div class="cardgrid-item">' +
            '<div class="cardgrid-item-header">' +
            '<span>Card ' + (ci + 1) + '</span>' +
            '<button onclick="removeCard(' + index + ', ' + ci + ')"><i class="fas fa-times"></i></button>' +
            '</div>' +
            '<div class="setting-group"><label class="setting-label">Image</label>' +
            '<input type="file" class="setting-input" accept="image/*" onchange="uploadCardImage(this, ' + index + ', ' + ci + ')"></div>' +
            (card.image ? '<div class="image-preview-box" style="margin-bottom:8px;"><img src="' + escapeAttr(card.image) + '"></div>' : '') +
            '<div class="setting-group"><label class="setting-label">Title</label>' +
            '<input type="text" class="setting-input" value="' + escapeAttr(card.title || '') + '" oninput="updateCard(' + index + ', ' + ci + ', \'title\', this.value)"></div>' +
            '<div class="setting-group"><label class="setting-label">Subtitle</label>' +
            '<input type="text" class="setting-input" value="' + escapeAttr(card.subtitle || '') + '" oninput="updateCard(' + index + ', ' + ci + ', \'subtitle\', this.value)"></div>' +
            '<div class="setting-group"><label class="setting-label">Description</label>' +
            '<textarea class="setting-textarea" oninput="updateCard(' + index + ', ' + ci + ', \'description\', this.value)">' + escapeHtml(card.description || '') + '</textarea></div>' +
            '<div class="setting-group"><label class="setting-label">Link URL</label>' +
            '<input type="text" class="setting-input" value="' + escapeAttr(card.link || '') + '" oninput="updateCard(' + index + ', ' + ci + ', \'link\', this.value)"></div>' +
            '<div class="setting-group"><label class="setting-label">Link Text</label>' +
            '<input type="text" class="setting-input" value="' + escapeAttr(card.linkText || 'Learn More') + '" oninput="updateCard(' + index + ', ' + ci + ', \'linkText\', this.value)"></div>' +
            '</div>';
    });

    html += '</div>';
    html += '<button class="cardgrid-add-btn" onclick="addCard(' + index + ')"><i class="fas fa-plus"></i> Add Card</button>';

    return html;
}

function updateCardGridColumns(index, cols) {
    if (!blocks[index]) return;
    blocks[index].content.columns = cols;
    renderPreview();
    markUnsaved();
}

function addCard(index) {
    if (!blocks[index]) return;
    if (!blocks[index].content.cards) blocks[index].content.cards = [];
    blocks[index].content.cards.push({
        image: '', publicId: '', title: 'New Card', subtitle: '', description: '', link: '', linkText: 'Learn More'
    });
    renderPreview();
    renderSettings();
    markUnsaved();
}

function removeCard(index, cardIndex) {
    if (!blocks[index]) return;
    if (!confirm('Remove this card?')) return;
    blocks[index].content.cards.splice(cardIndex, 1);
    renderPreview();
    renderSettings();
    markUnsaved();
}

function updateCard(blockIndex, cardIndex, field, value) {
    if (!blocks[blockIndex]) return;
    if (!blocks[blockIndex].content.cards[cardIndex]) return;
    blocks[blockIndex].content.cards[cardIndex][field] = value;
    renderPreview();
    markUnsaved();
}

// ========== ✅ UPDATED: IMAGE UPLOADS (Ab custom-sections endpoint use karega) ==========
async function uploadBlockImage(input, index) {
    if (!input.files || !input.files[0]) return;
    await uploadSingleImage(input.files[0], function (url, publicId) {
        updateBlockContent('url', url);
        updateBlockContent('publicId', publicId);
        renderSettings();
    });
}

async function uploadCardImage(input, blockIndex, cardIndex) {
    if (!input.files || !input.files[0]) return;
    await uploadSingleImage(input.files[0], function (url, publicId) {
        updateCard(blockIndex, cardIndex, 'image', url);
        updateCard(blockIndex, cardIndex, 'publicId', publicId);
        renderSettings();
    });
}

async function uploadGalleryImages(input, index) {
    if (!input.files || input.files.length === 0) return;
    if (!blocks[index].content.images) blocks[index].content.images = [];

    var files = Array.from(input.files);
    showToast('⏳ Uploading ' + files.length + ' image(s)...', 'info');

    for (var i = 0; i < files.length; i++) {
        await uploadSingleImage(files[i], function (url, publicId) {
            blocks[index].content.images.push({ url: url, publicId: publicId });
        });
    }

    renderPreview();
    renderSettings();
    markUnsaved();
    showToast('✅ Images added', 'success');
}

async function uploadSingleImage(file, callback) {
    var fd = new FormData();
    fd.append('image', file);
    fd.append('title', 'section-image-' + Date.now());

    try {
        // ✅ Custom Sections endpoint — Gallery collection mein entry NAHI banayega
        var response = await fetch(API_BASE_ADMIN + '/custom-sections/upload-image', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + adminToken },
            body: fd
        });

        if (!response.ok) throw new Error('Upload failed');

        var data = await response.json();
        var url = data.url || '';
        var publicId = data.publicId || '';
        callback(url, publicId);
        showToast('✅ Image uploaded', 'success');
    } catch (error) {
        showToast('❌ Upload failed: ' + error.message, 'error');
    }
}

function clearGalleryImages(index) {
    if (!blocks[index]) return;
    if (!confirm('Clear all gallery images?')) return;
    blocks[index].content.images = [];
    renderPreview();
    renderSettings();
    markUnsaved();
}

// ========== SAVE ==========
function markUnsaved() {
    isDirty = true;
    document.getElementById('saveBar').classList.add('show');
}

async function saveAllChanges() {
    if (!currentSection) return;

    try {
        showToast('💾 Saving...', 'info');

        var metaResponse = await fetch(API_BASE_ADMIN + '/custom-sections/' + currentSection._id, {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + adminToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: document.getElementById('previewTitle').textContent.replace(/^[^\s]+\s/, ''),
                isPublished: currentSection.isPublished === true
            })
        });

        if (!metaResponse.ok) throw new Error('Metadata save failed');

        var blocksResponse = await fetch(API_BASE_ADMIN + '/custom-sections/' + currentSection._id + '/blocks', {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + adminToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ blocks: blocks })
        });

        if (!blocksResponse.ok) throw new Error('Blocks save failed');

        isDirty = false;
        document.getElementById('saveBar').classList.remove('show');
        showToast('✅ Saved successfully!', 'success');
        loadSections();
    } catch (error) {
        showToast('❌ ' + error.message, 'error');
    }
}

// ========== CREATE SECTION ==========
function openCreateSectionModal() {
    document.getElementById('sectionForm').reset();
    document.getElementById('sectionModal').classList.add('active');
}

function closeSectionModal() {
    document.getElementById('sectionModal').classList.remove('active');
}

async function saveSection(e) {
    e.preventDefault();

    var title = document.getElementById('modalSectionTitle').value.trim();
    var name = document.getElementById('modalSectionName').value.trim().toLowerCase().replace(/\s+/g, '-');
    var description = document.getElementById('modalSectionDescription').value.trim();
    var icon = document.getElementById('modalSectionIcon').value.trim() || '📦';
    var background = document.getElementById('modalSectionBg').value;

    if (!title || !name) {
        showToast('Title and name are required', 'error');
        return;
    }

    var btn = document.getElementById('sectionSubmitBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';

    try {
        var response = await fetch(API_BASE_ADMIN + '/custom-sections', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + adminToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: name, title: title, description: description, icon: icon, background: background })
        });

        if (!response.ok) {
            var err = await response.json();
            throw new Error(err.message || 'Failed to create');
        }

        var data = await response.json();
        showToast('✅ Section created!', 'success');
        closeSectionModal();
        await loadSections();
        openSection(data.section._id);
    } catch (error) {
        showToast('❌ ' + error.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-save"></i> Create Section';
    }
}

// ========== TOAST ==========
function showToast(message, type) {
    var toast = document.createElement('div');
    toast.className = 'toast toast-' + (type || 'info');
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(function () { toast.remove(); }, 3000);
}

// ========== UTILS ==========
function escapeHtml(text) {
    if (!text) return '';
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function escapeAttr(text) {
    if (!text) return '';
    return String(text).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ========== THEME ==========
var savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);

// ========== UNSAVED WARNING ==========
window.addEventListener('beforeunload', function (e) {
    if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
    }
});