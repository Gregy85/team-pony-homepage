const menuBtn = document.querySelector('.menu-btn');
const nav = document.querySelector('.mainnav');
if (menuBtn && nav) {
  menuBtn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
  }));
}

document.getElementById('year').textContent = new Date().getFullYear();

let workshops = [
  {
    id: '2026-09-19-herbstzauber', monthGroup: 'September 2026', date: '2026-09-19', day: '19', month: 'SEP', weekday: 'Samstag',
    type: 'Eltern-Kind Workshop', title: 'Herbstzauber', age: '2–4 Jahre', time: '15:00–16:30 Uhr', duration: '1,5 Stunden', price: '22,50 €',
    description: 'Die Blätter fallen, der Wald wird bunt und die Zeit beginnt, in der wir so eine schöne Natur erleben dürfen. Igel sind unterwegs, Eichhörnchen legen Futtervorräte an und die Blätter tanzen im Wind. Gemeinsam mit den Ponys heißen wir den Herbst willkommen.',
    extra: '', parentChild: true
  },
  {
    id: '2026-09-26-futtergarten', monthGroup: 'September 2026', date: '2026-09-26', day: '26', month: 'SEP', weekday: 'Samstag',
    type: 'Eltern-Kind Workshop', title: 'Futtergarten', age: '2–4 Jahre', time: '10:00–11:30 Uhr', duration: '1,5 Stunden', price: '22,50 €',
    description: 'Kennt ihr das Spiel Obstgarten? Wir haben es für Ponys umgebaut und lernen dabei, was Ponys fressen dürfen. Anschließend richten wir den Ponys eine Portion Futter und schauen zu, wie schnell ihre Schüsseln leer sind.',
    extra: '', parentChild: true
  },
  {
    id: '2026-09-26-ponyerlebniszeit', monthGroup: 'September 2026', date: '2026-09-26', day: '26', month: 'SEP', weekday: 'Samstag',
    type: 'Workshop Mini', title: 'Ponyerlebniszeit', age: '4–9 Jahre', time: '10:00–12:00 Uhr', duration: '2 Stunden', price: '30 €',
    description: 'Erste Erfahrungen mit dem Leben der Ponys, ihrer Haltung und ihren Bedürfnissen. Wir entdecken spielerisch, wie eine Herde funktioniert und warum sie für Pferde so wichtig ist. Danach wird gestriegelt, gespielt und geritten.',
    extra: 'Bitte etwas zu trinken mitbringen.', parentChild: false
  },
  {
    id: '2026-10-03-herbstzauber', monthGroup: 'Oktober 2026', date: '2026-10-03', day: '03', month: 'OKT', weekday: 'Samstag',
    type: 'Workshop Mini', title: 'Herbstzauber', age: '4–6 Jahre', time: '15:00–17:00 Uhr', duration: '2 Stunden', price: '30 €',
    description: 'Die Blätter fallen, der Wald wird bunt und die Natur zeigt sich von ihrer herbstlichen Seite. Nach dem Striegeln geht es los und wir heißen gemeinsam mit den Ponys den Herbst willkommen.',
    extra: 'Bitte etwas zu trinken mitbringen.', parentChild: false
  },
  {
    id: '2026-10-10-farbenwichtel', monthGroup: 'Oktober 2026', date: '2026-10-10', day: '10', month: 'OKT', weekday: 'Samstag',
    type: 'Eltern-Kind Workshop', title: 'Farbenwichtel', age: '2–4 Jahre', time: '10:00–11:30 Uhr', duration: '1,5 Stunden', price: '22,50 €',
    description: 'Hilfe! Der Farbenwichtel war da und hat alles durcheinandergebracht. Die ganze Ponyschule steht Kopf. Gemeinsam helfen wir den Ponys dabei, die Farben wieder richtig zu sortieren.',
    extra: '', parentChild: true
  },
  {
    id: '2026-10-17-halloweenmarkt', monthGroup: 'Oktober 2026', date: '2026-10-17', day: '17', month: 'OKT', weekday: 'Samstag',
    type: 'Workshop Maxi', title: 'Halloweenmarkt', age: '6–9 Jahre', time: '14:00–17:00 Uhr', duration: '3 Stunden', price: '45 €',
    description: 'Auf dem Halloweenjahrmarkt warten knifflige Aufgaben auf uns: durch den Hexenwald reiten, über die schaurige Brücke balancieren, eine Augapfelachterbahn fahren und auf Fledermäuse schießen – natürlich gemeinsam mit unseren Ponys.',
    extra: 'Bitte etwas zu trinken und eine Kleinigkeit zu knabbern mitbringen. Wer möchte, darf gerne verkleidet kommen.', parentChild: false
  },
  {
    id: '2026-10-24-verlorene-kuerbis', monthGroup: 'Oktober 2026', date: '2026-10-24', day: '24', month: 'OKT', weekday: 'Samstag',
    type: 'Eltern-Mitmachworkshop', title: 'Der verlorene Kürbis', age: '4–9 Jahre', time: '14:00–16:00 Uhr', duration: '2 Stunden', price: '30 €',
    description: 'Die Ponys möchten ein Herbstfest feiern und brauchen dafür einen Kürbis. Um ihn zu bekommen, müssen einige Aufgaben gelöst werden. Weil Ponys nicht lesen können, brauchen sie ganz dringend unsere Hilfe.',
    extra: 'Mama, Papa oder eine andere volljährige Person darf mitgebracht werden. Gemeinsam geht es auch auf einen Ausritt.', parentChild: false
  }
];

function isWorkshopCurrent(workshop) {
  const today = new Date();
  const localToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const [y, m, d] = workshop.date.split('-').map(Number);
  const eventDate = new Date(y, m - 1, d);
  return localToday <= eventDate;
}

function renderWorkshops() {
  const host = document.getElementById('workshopList');
  if (!host) return;
  const visibleWorkshops = workshops.filter(isWorkshopCurrent);
  if (!visibleWorkshops.length) {
    host.innerHTML = `<div class="workshop-empty">Zurzeit sind keine aktuellen Workshops veröffentlicht. Neue Termine erscheinen hier automatisch.</div>`;
    return;
  }
  const groups = visibleWorkshops.reduce((acc, workshop) => {
    (acc[workshop.monthGroup] ||= []).push(workshop);
    return acc;
  }, {});
  host.innerHTML = Object.entries(groups).map(([month, items]) => `
    <section class="workshop-month" aria-label="${month}">
      <div class="workshop-month-title"><h3>${month}</h3></div>
      <div class="workshop-grid">
        ${items.map(w => `
          <article class="workshop-card" data-workshop-id="${w.id}">
            <div class="workshop-date"><span class="day">${w.day}</span><span class="month">${w.month}</span><span class="weekday">${w.weekday}</span></div>
            <div class="workshop-card-body">
              <div class="workshop-card-top"><span class="workshop-type">${w.type}</span><span class="workshop-age">${w.age}</span></div>
              <h4>${w.title}</h4>
              <div class="workshop-meta"><span>🕒 ${w.time}</span><span>⏱ ${w.duration}</span></div>
              <p class="workshop-description">${w.description}</p>
              ${w.extra ? `<p class="workshop-extra">${w.extra}</p>` : ''}
              <div class="workshop-card-actions">
                <div class="workshop-price"><strong>${w.price}</strong><span>pro Kind</span></div>
                <button class="btn primary workshop-request" type="button" data-workshop-id="${w.id}">Workshop anfragen</button>
              </div>
            </div>
          </article>`).join('')}
      </div>
    </section>`).join('');
}
renderWorkshops();

const offerSelect = document.getElementById('offerSelect');
const messageField = document.querySelector('#inquiryForm textarea[name="message"]');

function formatWorkshopDate(w) {
  const [, month, day] = w.date.split('-');
  return `${day}.${month}.2026`;
}

function workshopOfferLabel(w) {
  return `${w.title} – ${formatWorkshopDate(w)} · ${w.time}`;
}

function addWorkshopOptions() {
  if (!offerSelect) return;
  offerSelect.querySelectorAll('optgroup[data-dynamic-workshops="1"]').forEach(g => g.remove());
  const current = workshops.filter(isWorkshopCurrent);
  if (!current.length) return;
  const group = document.createElement('optgroup');
  group.label = 'Aktuelle Workshops';
  group.dataset.dynamicWorkshops = '1';
  current.forEach(w => {
    const option = document.createElement('option');
    option.value = workshopOfferLabel(w);
    option.textContent = workshopOfferLabel(w);
    option.dataset.workshopId = w.id;
    group.appendChild(option);
  });
  offerSelect.appendChild(group);
}
addWorkshopOptions();

function prepareOffer(wanted, details = '') {
  if (offerSelect) {
    const exact = [...offerSelect.options].find(o => o.value === wanted || o.text === wanted);
    if (exact) {
      offerSelect.value = exact.value;
    } else {
      const normalized = wanted.toLowerCase().replace('aktuelles angebot','workshop');
      const option = [...offerSelect.options].find(o => o.text.toLowerCase().includes(normalized));
      if (option) offerSelect.value = option.value;
      else if (wanted.toLowerCase().includes('workshop') || details) offerSelect.value = 'Workshop / Aktion';
    }
  }
  if (messageField && details) messageField.value = details;
  document.getElementById('anfrage')?.scrollIntoView({behavior:'smooth'});
}

document.querySelectorAll('[data-offer]').forEach(el => {
  el.addEventListener('click', () => prepareOffer(el.dataset.offer || ''));
});

document.addEventListener('click', (e) => {
  const btn = e.target.closest('.workshop-request');
  if (!btn) return;
  const workshop = workshops.find(w => w.id === btn.dataset.workshopId);
  if (!workshop) return;
  const label = workshopOfferLabel(workshop);
  const details = `Ich interessiere mich für den Workshop „${workshop.title}“ am ${formatWorkshopDate(workshop)}, ${workshop.time}.`;
  prepareOffer(label, details);
});

const form = document.getElementById('inquiryForm');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const d = new FormData(form);
    const submitButton = form.querySelector('button[type="submit"]');
    const statusEl = document.getElementById('formStatus');
    const subject = `Anfrage Team Pony Schule – ${d.get('offer')}`;
    const body = [
      'Hallo Sabrina,',
      '',
      `ich interessiere mich für: ${d.get('offer')}`,
      '',
      `Name: ${d.get('name') || ''}`,
      `Kind: ${d.get('child') || ''}`,
      `Alter: ${d.get('age') || ''}`,
      `Anzahl Kinder: ${d.get('child_count') || ''}`,
      `Wunschdatum: ${d.get('requested_date') || ''}`,
      `Wunschzeit: ${d.get('requested_time') || ''}`,
      `Telefon: ${d.get('phone') || ''}`,
      `E-Mail: ${d.get('email') || ''}`,
      '',
      'Nachricht:',
      `${d.get('message') || ''}`,
      '',
      'Viele Grüße'
    ].join('\n');

    if (submitButton) submitButton.disabled = true;
    if (statusEl) statusEl.textContent = 'Anfrage wird übermittelt …';

    const messageWithChild = [
      d.get('child') ? `Kind: ${d.get('child')}` : '',
      d.get('age') ? `Alter: ${d.get('age')}` : '',
      d.get('message') || ''
    ].filter(Boolean).join('\n');

    try {
      if (!window.TPS_API?.rpc) throw new Error('Online-Schnittstelle nicht bereit');
      await window.TPS_API.rpc('submit_homepage_inquiry', {
        p_customer_name: String(d.get('name') || ''),
        p_email: String(d.get('email') || ''),
        p_phone: String(d.get('phone') || ''),
        p_service: String(d.get('offer') || 'Allgemeine Anfrage'),
        p_message: messageWithChild,
        p_child_count: d.get('child_count') ? Number(d.get('child_count')) : null,
        p_requested_date: d.get('requested_date') || null,
        p_requested_time: String(d.get('requested_time') || ''),
        p_honeypot: String(d.get('website') || '')
      });
      if (statusEl) statusEl.textContent = 'Danke! Die Anfrage wurde gespeichert und erscheint in der Team-Pony-Datenbank.';
      form.reset();
    } catch (err) {
      if (statusEl) statusEl.textContent = 'Die Online-Übertragung war nicht möglich. Es wird stattdessen eine E-Mail vorbereitet.';
      const email = window.TPS_SITE?.email || 'sabrinaheidenwag@freenet.de';
      window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
}

function publicOfferToWorkshop(o) {
  if (!o?.date || !o?.name) return null;
  const [y,m,d] = String(o.date).split('-').map(Number);
  if (!y || !m || !d) return null;
  const dt = new Date(y,m-1,d);
  const monthNames = ['JAN','FEB','MÄR','APR','MAI','JUN','JUL','AUG','SEP','OKT','NOV','DEZ'];
  const monthGroups = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
  const weekdays = ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'];
  const fmtTime = (v) => v ? String(v).slice(0,5) : '';
  const time = o.time ? `${fmtTime(o.time)}${o.end_time ? '–'+fmtTime(o.end_time) : ''} Uhr` : '';
  const duration = o.duration_minutes ? `${String(o.duration_minutes/60).replace('.', ',')} Stunden` : '';
  const price = o.price != null ? `${Number(o.price).toLocaleString('de-DE',{minimumFractionDigits:Number(o.price)%1?2:0,maximumFractionDigits:2})} €` : '';
  const free = o.free_spots != null ? `Noch ${o.free_spots} freie ${Number(o.free_spots)===1?'Platz':'Plätze'}.` : '';
  return {
    id: String(o.id), monthGroup: `${monthGroups[m-1]} ${y}`, date: String(o.date), day:String(d).padStart(2,'0'), month:monthNames[m-1], weekday:weekdays[dt.getDay()],
    type: o.offer_type || 'Workshop', title:o.name, age:o.age_text || '', time, duration, price,
    description:o.description || '', extra:free, parentChild:/eltern/i.test(String(o.offer_type||''))
  };
}

window.addEventListener('tps-public-data-ready', (e) => {
  const live = (e.detail?.offers || []).map(publicOfferToWorkshop).filter(Boolean);
  if (!live.length) return; // feste Termine bleiben als Fallback, bis die App Angebote veröffentlicht
  workshops = live;
  renderWorkshops();
  addWorkshopOptions();
});
