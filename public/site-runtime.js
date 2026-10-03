(() => {
  const cfg = window.TPS_SITE_CONFIG || {};
  let site = {...(cfg.defaults || {})};

  function setText(selector, value) {
    if (value == null || value === '') return;
    document.querySelectorAll(selector).forEach(el => el.textContent = value);
  }
  function applySite(data = {}) {
    site = {...site, ...data};
    setText('[data-site-city]', site.city);
    setText('[data-site-location-name]', site.location_name || [site.business_name, site.city].filter(Boolean).join(' '));
    setText('[data-site-street]', site.street);
    setText('[data-site-postal]', site.postal_code);
    setText('[data-site-address-inline]', [site.street, [site.postal_code, site.city].filter(Boolean).join(' ')].filter(Boolean).join(', '));
    setText('[data-site-email]', site.email);
    setText('[data-site-phone]', site.phone);
    document.querySelectorAll('a[data-site-email-link]').forEach(a => a.href = `mailto:${site.email || ''}`);
    document.querySelectorAll('a[data-site-phone-link]').forEach(a => a.href = `tel:${String(site.phone || '').replace(/[^+\d]/g,'')}`);
    const title = document.querySelector('title');
    if (title && site.city) title.textContent = title.textContent.replace(/Freudenstadt/g, site.city);
    const meta = document.querySelector('meta[name="description"]');
    if (meta && site.city) meta.content = meta.content.replace(/Freudenstadt/g, site.city);
    window.TPS_SITE = site;
    window.dispatchEvent(new CustomEvent('tps-site-ready', {detail: site}));
  }

  async function rpc(name, body = {}) {
    if (!cfg.supabaseUrl || !cfg.supabasePublishableKey) throw new Error('Supabase nicht konfiguriert');
    const r = await fetch(`${cfg.supabaseUrl}/rest/v1/rpc/${name}`, {
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'apikey': cfg.supabasePublishableKey,
        'Authorization': `Bearer ${cfg.supabasePublishableKey}`
      },
      body: JSON.stringify(body)
    });
    if (!r.ok) throw new Error(await r.text() || `HTTP ${r.status}`);
    const text = await r.text();
    return text ? JSON.parse(text) : null;
  }

  window.TPS_API = {rpc};
  applySite(site);
  rpc('get_homepage_public_data').then(data => {
    if (data?.site) applySite(data.site);
    window.TPS_PUBLIC_OFFERS = Array.isArray(data?.offers) ? data.offers : [];
    window.dispatchEvent(new CustomEvent('tps-public-data-ready', {detail:data}));
  }).catch(() => {
    window.TPS_PUBLIC_OFFERS = [];
    window.dispatchEvent(new CustomEvent('tps-public-data-ready', {detail:{site,offers:[]}}));
  });
})();
