(() => {
    'use strict';
    const $ = id => document.getElementById(id), recipes = window.SR_RECIPES || [], prefix = 'sr_final_', data = (k, fallback) => { try {
        return JSON.parse(localStorage.getItem(prefix + k)) ?? fallback;
    }
    catch {
        return fallback;
    } }, save = (k, v) => localStorage.setItem(prefix + k, JSON.stringify(v)), escape = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])), path = location.pathname.split('/').pop() || 'index.html';
    const currentCategory = path === 'dessert.html' ? 'dessert' : path.replace('.html', '');
    document.querySelectorAll('.side-links a,.categories-drawer nav a').forEach(a => { if (a.getAttribute('href') === path)
        a.classList.add('current'); });
    const dark = data('theme', 'light') === 'dark';
    document.body.classList.toggle('dark', dark);
    function setTheme() { const d = document.body.classList.toggle('dark'); save('theme', d ? 'dark' : 'light'); $('theme-button').textContent = d ? 'Light Mode' : 'Dark Mode'; }
    $('theme-button').textContent = dark ? 'Light Mode' : 'Dark Mode';
    $('theme-button').addEventListener('click', setTheme);
    const drawer = $('categories-drawer'), shade = $('drawer-overlay'), brand = $('brand-menu');
    function openDrawer() { drawer.classList.add('open'); drawer.setAttribute('aria-hidden', 'false'); brand.setAttribute('aria-expanded', 'true'); shade.hidden = false; document.body.classList.add('drawer-lock'); drawer.querySelector('button').focus(); }
    function closeDrawer() { drawer.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true'); brand.setAttribute('aria-expanded', 'false'); shade.hidden = true; document.body.classList.remove('drawer-lock'); brand.focus(); }
    brand.addEventListener('click', e => { e.preventDefault(); drawer.classList.contains('open') ? closeDrawer() : openDrawer(); });
    document.querySelector('.close-drawer').addEventListener('click', closeDrawer);
    shade.addEventListener('click', closeDrawer);
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && drawer.classList.contains('open'))
        closeDrawer(); });
    const favorites = () => data('saved', []);
    function toggleSaved(name) { let s = favorites(); s = s.includes(name) ? s.filter(x => x !== name) : [...s, name]; save('saved', s); document.querySelectorAll('[data-save]').forEach(b => { if (b.dataset.save === name) {
        b.classList.toggle('saved', s.includes(name));
        b.textContent = s.includes(name) ? '♥ Saved' : '♡ Save';
    } }); if ($('saved-results'))
        renderRecipes($('saved-results'), recipes.filter(x => favorites().includes(x.name))); }
    function recipeCard(r) { return `<article class="recipe-card"><img loading="lazy" src="images/${escape(r.image)}.svg" alt="${escape(r.name)}"><div class="recipe-card-body"><h3>${escape(r.name)}</h3><p>${escape(r.description)}</p><div class="recipe-meta">${escape(r.time)} · ${escape(r.difficulty)}</div><div class="recipe-actions"><button class="outline-btn" type="button" data-details="${escape(r.name)}">View Recipe</button><button class="outline-btn ${favorites().includes(r.name) ? 'saved' : ''}" type="button" data-save="${escape(r.name)}">${favorites().includes(r.name) ? '♥ Saved' : '♡ Save'}</button></div></div></article>`; }
    function renderRecipes(el, list) { if (!el)
        return; el.innerHTML = list.length ? list.map(recipeCard).join('') : '<p>No recipes found.</p>'; }
    let filter = 'all';
    const homeSearch = $('home-search');
    function updateHome() { let q = (homeSearch?.value || '').toLowerCase().trim(); renderRecipes($('home-results'), recipes.filter(r => (filter === 'all' || r.category === filter) && [r.name, r.description, ...r.ingredients].join(' ').toLowerCase().includes(q))); }
    if (homeSearch) {
        homeSearch.addEventListener('input', updateHome);
        document.querySelectorAll('[data-filter]').forEach(btn => btn.addEventListener('click', () => { filter = btn.dataset.filter; document.querySelectorAll('[data-filter]').forEach(b => b.classList.toggle('active', b === btn)); updateHome(); }));
        updateHome();
    }
    const catResult = $('category-results'), catSearch = $('category-search');
    function updateCategory() { if (catResult)
        renderRecipes(catResult, recipes.filter(r => r.category === catResult.dataset.category && [r.name, r.description, ...r.ingredients].join(' ').toLowerCase().includes((catSearch?.value || '').trim().toLowerCase()))); }
    if (catResult) {
        catSearch.addEventListener('input', updateCategory);
        updateCategory();
    }
    document.addEventListener('click', e => { const saveBtn = e.target.closest('[data-save]'); if (saveBtn)
        toggleSaved(saveBtn.dataset.save); const detail = e.target.closest('[data-details]'); if (detail) {
        let r = recipes.find(x => x.name === detail.dataset.details);
        if (!r)
            return;
        let layer = document.createElement('div');
        layer.className = 'modal-overlay';
        layer.innerHTML = `<section role="dialog" aria-modal="true" aria-label="${escape(r.name)}" class="modal"><button class="outline-btn close-modal" type="button" aria-label="Close recipe">×</button><img src="images/${escape(r.image)}.svg" alt="${escape(r.name)}"><h2>${escape(r.name)}</h2><p>${escape(r.description)}</p><h3>Ingredients</h3><ul>${r.ingredients.map(i => `<li>${escape(i)}</li>`).join('')}</ul><h3>Instructions</h3><p>${escape(r.steps)}</p></section>`;
        document.body.append(layer);
        layer.querySelector('button').focus();
        const dismiss = () => { layer.remove(); document.removeEventListener('keydown', esc); };
        function esc(ev) { if (ev.key === 'Escape')
            dismiss(); }
        layer.addEventListener('click', ev => { if (ev.target === layer || ev.target.closest('.close-modal'))
            dismiss(); });
        document.addEventListener('keydown', esc);
    } });
    const invalid = (id, message) => { const s = document.querySelector(`[data-error-for="${id}"]`); if (s)
        s.textContent = message; const el = $(id); if (el)
        el.setAttribute('aria-invalid', message ? 'true' : 'false'); return !message; };
    const val = id => ($(id)?.value || '').trim(), emailOk = s => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s), phoneOk = s => /^\+?[\d\s()\-]{8,20}$/.test(s) && s.replace(/\D/g, '').length >= 8;
    function status(id, msg, ok) { const el = $(id); if (el) {
        el.textContent = msg;
        el.className = 'status ' + (ok ? 'success' : 'error');
    } }
    $('signup-form')?.addEventListener('submit', e => { e.preventDefault(); let name = val('signup-name'), email = val('signup-email').toLowerCase(), phone = val('signup-phone'), pw = $('signup-password').value, confirm = $('signup-confirm').value; let ok = [invalid('signup-name', name ? '' : 'Name is required.'), invalid('signup-email', emailOk(email) ? '' : 'Enter a valid email.'), invalid('signup-phone', phoneOk(phone) ? '' : 'Enter a valid phone number.'), invalid('signup-password', pw.length >= 8 ? '' : 'Use at least 8 characters.'), invalid('signup-confirm', confirm === pw && confirm ? '' : 'Passwords must match.')].every(Boolean); if (!ok) {
        status('signup-status', 'Please correct the fields above.', false);
        return;
    } let users = data('users', []); if (users.some(u => u.email === email)) {
        invalid('signup-email', 'This email already has a demo account.');
        return;
    } users.push({ name, email, phone, password: pw }); save('users', users); save('session', email); status('signup-status', 'Account created. Opening your profile...', true); location.href = 'profile.html'; });
    $('login-form')?.addEventListener('submit', e => { e.preventDefault(); let email = val('login-email').toLowerCase(), pw = $('login-password').value; let ok = [invalid('login-email', emailOk(email) ? '' : 'Enter a valid email.'), invalid('login-password', pw ? '' : 'Password is required.')].every(Boolean); if (!ok)
        return; let user = data('users', []).find(u => u.email === email && u.password === pw); if (!user) {
        status('login-status', 'Incorrect email or password for this demo account.', false);
        return;
    } save('session', email); location.href = 'profile.html'; });
    function renderProfile() { let el = $('profile-content'); if (!el)
        return; let email = data('session', null), u = data('users', []).find(x => x.email === email); el.innerHTML = u ? `<h2>Welcome, ${escape(u.name)}</h2><p><strong>Email:</strong> ${escape(u.email)}</p><p><strong>Phone:</strong> ${escape(u.phone)}</p><button class="primary-btn" type="button" id="logout">Log Out</button>` : '<h2>You are not logged in</h2><p>Log in to view your profile. Saved recipes are available on this device.</p><a href="login.html" class="primary-btn" style="display:inline-block">Log In</a>'; if (u)
        $('logout').addEventListener('click', () => { localStorage.removeItem(prefix + 'session'); renderProfile(); }); renderRecipes($('saved-results'), recipes.filter(r => favorites().includes(r.name))); }
    renderProfile();
    $('feedback-form')?.addEventListener('submit', e => { e.preventDefault(); let name = val('feedback-name'), email = val('feedback-email'), message = val('feedback-message'); let ok = [invalid('feedback-name', name ? '' : 'Name is required.'), invalid('feedback-email', emailOk(email) ? '' : 'Enter a valid email.'), invalid('feedback-message', message.length >= 10 ? '' : 'Please write at least 10 characters.')].every(Boolean); if (!ok)
        return; let arr = data('feedback', []); arr.push({ name, email, message, date: new Date().toISOString() }); save('feedback', arr); $('feedback-form').reset(); status('feedback-status', 'Thanks! Your feedback has been saved in this browser (demo only).', true); });
    $('api-form')?.addEventListener('submit', async (e) => { e.preventDefault(); let q = val('api-query'); if (!q) {
        status('api-status', 'Enter a search term.', false);
        return;
    } status('api-status', 'Loading recipes...', true); $('api-results').innerHTML = ''; try {
        let r = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s=' + encodeURIComponent(q));
        if (!r.ok)
            throw Error('API error');
        let j = await r.json(), meals = j.meals || [];
        $('api-results').innerHTML = meals.length ? meals.slice(0, 9).map(m => `<article class="recipe-card"><img class="api-photo" src="${escape(m.strMealThumb || '')}" alt="${escape(m.strMeal)}" loading="lazy"><div class="recipe-card-body"><h3>${escape(m.strMeal)}</h3><p>${escape(m.strCategory || 'Recipe')} · ${escape(m.strArea || '')}</p><p>${escape((m.strInstructions || '').slice(0, 180))}${(m.strInstructions || '').length > 180 ? '…' : ''}</p></div></article>`).join('') : '<p>No matching recipes found.</p>';
        status('api-status', `${meals.length} recipes found.`, true);
    }
    catch (err) {
        status('api-status', 'Could not load recipes. Check your internet connection or API availability.', false);
    } });
})();

