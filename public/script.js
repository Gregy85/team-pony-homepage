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

const TPS_HOMEPAGE_TEST_MODE = true; // Homepage V15
const TPS_HOMEPAGE_TEST_CODE = '4826';
let tpsTestUnlocked = sessionStorage.getItem('tps_homepage_test_unlocked') === '1';

function applyHomepageTestLock() {
  
window.tpsSelectedVoucherTemplate = null;

function voucherTemplateImage(t) {
  return t?.template_data?.dataUrl || '';
}
async function loadPublicVoucherTemplates() {
  const box=document.getElementById('publicVoucherTemplates');
  if(!box||!window.TPS_API?.rpc) return;
  try{
    const rows=await window.TPS_API.rpc('get_public_voucher_templates')||[];
    if(!rows.length){box.innerHTML='<p>Noch keine Gutschein-Designs verfügbar.</p>';return}
    box.innerHTML=rows.map(t=>{
      const img=voucherTemplateImage(t);
      return '<button type="button" class="public-voucher-template" data-voucher-template="'+escapeHtml(t.id)+'">'+(img?'<img src="'+img+'" alt="'+escapeHtml(t.name)+'">':'')+'<strong>'+escapeHtml(t.name)+'</strong></button>';
    }).join('');
    box.querySelectorAll('[data-voucher-template]').forEach(btn=>btn.addEventListener('click',()=>{
      window.tpsSelectedVoucherTemplate=btn.dataset.voucherTemplate;
      box.querySelectorAll('.public-voucher-template').forEach(x=>x.classList.toggle('active',x===btn));
      const buy=document.getElementById('publicVoucherBuyTest');
      if(buy) buy.disabled=!tpsTestUnlocked;
    }));
  }catch(e){box.innerHTML='<p>Gutschein-Designs konnten gerade nicht geladen werden.</p>'}
}
function voucherDateDE(v){if(!v)return '—';return new Date(v+'T12:00:00').toLocaleDateString('de-DE')}
async function createHomepageTestVoucher(){
  const status=document.getElementById('publicVoucherStatus'),result=document.getElementById('publicVoucherResult'),btn=document.getElementById('publicVoucherBuyTest');
  if(!tpsTestUnlocked){document.getElementById('testUnlockBox')?.scrollIntoView({behavior:'smooth'});return}
  const value=Number(document.getElementById('publicVoucherValue')?.value||0);
  if(!window.tpsSelectedVoucherTemplate){status.textContent='Bitte zuerst ein Design auswählen.';return}
  if(value<=0){status.textContent='Bitte einen Wunschbetrag eingeben.';return}
  btn.disabled=true; status.textContent='Testzahlung wird durchgeführt …';
  try{
    const v=await window.TPS_API.rpc('create_test_voucher_purchase',{
      p_value:value,p_template_id:window.tpsSelectedVoucherTemplate,
      p_buyer_name:document.getElementById('publicVoucherBuyer')?.value||null,
      p_buyer_email:document.getElementById('publicVoucherEmail')?.value||null,
      p_recipient_name:document.getElementById('publicVoucherRecipient')?.value||null,
      p_message:document.getElementById('publicVoucherMessage')?.value||null,p_service:null
    });
    status.textContent='Testzahlung erfolgreich – es wurde kein echtes Geld abgebucht.';
    result.innerHTML='<div class="voucher-success"><strong>TEST-GUTSCHEIN ERSTELLT</strong><div id="publicVoucherQr"></div><b>'+escapeHtml(v.code)+'</b><span>'+Number(v.value).toLocaleString('de-DE',{style:'currency',currency:'EUR'})+' · gültig bis '+voucherDateDE(v.valid_until)+'</span><button class="btn secondary" type="button" onclick="window.print()">Gutschein / Bestätigung drucken</button></div>';
    if(window.QRCode) new QRCode(document.getElementById('publicVoucherQr'),{text:'TEAM-PONY-VOUCHER:'+v.code,width:180,height:180,correctLevel:QRCode.CorrectLevel.H});
  }catch(e){status.textContent='Testkauf fehlgeschlagen: '+(e?.message||e)}
  finally{btn.disabled=!tpsTestUnlocked||!window.tpsSelectedVoucherTemplate}
}
document.getElementById('publicVoucherBuyTest')?.addEventListener('click',createHomepageTestVoucher);
window.addEventListener('tps-site-ready',loadPublicVoucherTemplates);
if(window.TPS_API) loadPublicVoucherTemplates();

const form = document.getElementById('inquiryForm');
  const status = document.getElementById('testUnlockStatus');
  if (!form || !TPS_HOMEPAGE_TEST_MODE) return;
  form.classList.toggle('is-test-locked', !tpsTestUnlocked);
  form.querySelectorAll('input,select,textarea,button[type="submit"]').forEach(el => {
    if (el.name === 'website') return;
    el.disabled = !tpsTestUnlocked;
  });
  if (status) status.textContent = tpsTestUnlocked
    ? 'Testmodus freigeschaltet – Testanfragen werden deutlich als TEST markiert.'
    : 'Anfrageformular ist gesperrt.';
  const voucherBuy = document.getElementById('publicVoucherBuyTest');
  if (voucherBuy) voucherBuy.disabled = !tpsTestUnlocked || !window.tpsSelectedVoucherTemplate;
  const voucherStatus = document.getElementById('publicVoucherStatus');
  if (voucherStatus) voucherStatus.textContent = tpsTestUnlocked
    ? 'Testmodus freigeschaltet. Es wird kein echtes Geld abgebucht.'
    : 'Zum Testen zuerst den Testzugang unten auf der Seite freischalten.';
}

function unlockHomepageTestMode() {
  const input = document.getElementById('testAccessCode');
  const status = document.getElementById('testUnlockStatus');
  if (String(input?.value || '').trim() === TPS_HOMEPAGE_TEST_CODE) {
    tpsTestUnlocked = true;
    sessionStorage.setItem('tps_homepage_test_unlocked','1');
    if (input) input.value = '';
    applyHomepageTestLock();
  } else if (status) {
    status.textContent = 'Testcode ist nicht korrekt.';
  }
}

document.getElementById('testUnlockButton')?.addEventListener('click', unlockHomepageTestMode);
document.getElementById('testAccessCode')?.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); unlockHomepageTestMode(); } });
applyHomepageTestLock();


function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function updateWorkshopMonthsText() {
  const el=document.getElementById('workshopMonthsText');
  const intro=document.getElementById('workshopIntroText');
  const today=new Date(); today.setHours(0,0,0,0);
  const dates=(workshops||[]).map(w=>new Date(String(w.date||'')+'T12:00:00')).filter(d=>!Number.isNaN(d.getTime())&&d>=today);
  const groups=[...new Map(dates.sort((a,b)=>a-b).map(d=>[d.getFullYear()+'-'+d.getMonth(),{month:d.toLocaleDateString('de-DE',{month:'long'}),year:d.getFullYear()}])).values()];
  let label='';
  if(groups.length===1) label=groups[0].month+' '+groups[0].year;
  else if(groups.length>1){
    const sameYear=groups.every(g=>g.year===groups[0].year);
    const names=groups.map((g,i)=>sameYear?g.month:g.month+' '+g.year);
    label=names.length===2?names.join(' und '):names.slice(0,-1).join(', ')+' und '+names.at(-1);
    if(sameYear) label+=' '+groups[0].year;
  }
  const text=label?('Die aktuell verfügbaren Workshops für '+label+' findest du direkt hier.'):'Neue Workshop-Termine folgen.';
  if(el) el.textContent=text;
  if(intro) intro.textContent=text;
}


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
              ${Array.isArray(w.images)&&w.images.length ? `<div class="workshop-photos ${w.images.length>1?'two':''}">${w.images.slice(0,2).map((src,i)=>`<img src="${src}" alt="${escapeHtml(w.title)} – Foto ${i+1}">`).join('')}</div>` : ''}
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
const requestedDateLabel = document.getElementById('requestedDateLabel');
const fixedOfferSchedule = document.getElementById('fixedOfferSchedule');
const childCountInput = document.getElementById('childCountInput');
const childNameFields = document.getElementById('childNameFields');

function renderChildNameFields() {
  if (!childNameFields) return;
  const count = Math.max(1, Math.min(30, Number(childCountInput?.value || 1)));
  const old = [...childNameFields.querySelectorAll('input')].map(i => i.value);
  childNameFields.innerHTML = Array.from({length:count}, (_,i) =>
    `<label>Name Kind ${i+1}<input name="child_name_${i+1}" placeholder="Vorname" value="${escapeHtml(old[i] || '')}" /></label>`
  ).join('');
}
childCountInput?.addEventListener('input', renderChildNameFields);
renderChildNameFields();

function selectedOfferOption() {
  return offerSelect?.selectedOptions?.[0] || null;
}
function updateInquiryScheduleFields() {
  const option = selectedOfferOption();
  const fixedDate = option?.dataset?.fixedDate || '';
  const fixedTime = option?.dataset?.fixedTime || '';
  const hasFixed = !!fixedDate;
  if (requestedDateLabel) requestedDateLabel.hidden = hasFixed;
  const dateInput = document.querySelector('#inquiryForm input[name="requested_date"]');
  if (dateInput && hasFixed) dateInput.value = '';
  if (fixedOfferSchedule) {
    fixedOfferSchedule.hidden = !hasFixed;
    fixedOfferSchedule.textContent = hasFixed
      ? ('Fester Termin: ' + fixedDate.split('-').reverse().join('.') + (fixedTime ? ' · ' + fixedTime : ''))
      : '';
  }
}
offerSelect?.addEventListener('change', updateInquiryScheduleFields);

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
    option.dataset.offerId = w.id;
    option.dataset.fixedDate = w.date || '';
    option.dataset.fixedTime = w.time || '';
    group.appendChild(option);
  });
  offerSelect.appendChild(group);
}
addWorkshopOptions();
updateInquiryScheduleFields();

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
  updateInquiryScheduleFields();
  document.getElementById('anfrage')?.scrollIntoView({behavior:'smooth'});
}


function applyOfferFromUrl() {
  const wanted = new URLSearchParams(location.search).get('angebot');
  if (!wanted || !offerSelect) return false;
  const option = [...offerSelect.options].find(o =>
    String(o.dataset.offerId||o.dataset.courseId||o.dataset.workshopId||'') === String(wanted) ||
    String(o.value||'') === String(wanted)
  );
  if (!option) return false;
  offerSelect.value = option.value;
  updateInquiryScheduleFields();
  setTimeout(()=>document.getElementById('anfrage')?.scrollIntoView({behavior:'smooth',block:'start'}),50);
  return true;
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
    if (TPS_HOMEPAGE_TEST_MODE && !tpsTestUnlocked) {
      document.getElementById('testUnlockBox')?.scrollIntoView({behavior:'smooth',block:'center'});
      const lockedStatus = document.getElementById('testUnlockStatus');
      if (lockedStatus) lockedStatus.textContent = 'Bitte zuerst den Testcode eingeben.';
      return;
    }
    const d = new FormData(form);
    const submitButton = form.querySelector('button[type="submit"]');
    const statusEl = document.getElementById('formStatus');
    const subject = `${TPS_HOMEPAGE_TEST_MODE ? '[TEST] ' : ''}Anfrage Team Pony Schule – ${d.get('offer')}`;
    const body = [
      'Hallo Sabrina,',
      '',
      `ich interessiere mich für: ${d.get('offer')}`,
      '',
      `Name: ${d.get('name') || ''}`,
      `Kinder: ${Array.from({length:Math.max(1,Number(d.get('child_count')||1))},(_,i)=>d.get('child_name_'+(i+1))).filter(Boolean).join(', ')}`,
      `Alter: ${d.get('age') || ''}`,
      `Anzahl Kinder: ${d.get('child_count') || ''}`,
      `Termin/Datum: ${(selectedOfferOption()?.dataset?.fixedDate || d.get('requested_date') || '')}`,
      `Uhrzeit: ${(selectedOfferOption()?.dataset?.fixedTime || '')}`,
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
      TPS_HOMEPAGE_TEST_MODE ? '[TESTANFRAGE] Nur Test – nicht als echte Buchung/Einnahme verbuchen.' : '',
      Array.from({length:Math.max(1,Number(d.get('child_count')||1))},(_,i)=>d.get('child_name_'+(i+1))).filter(Boolean).length ? `Kinder: ${Array.from({length:Math.max(1,Number(d.get('child_count')||1))},(_,i)=>d.get('child_name_'+(i+1))).filter(Boolean).join(', ')}` : '',
      d.get('age') ? `Alter: ${d.get('age')}` : '',
      d.get('message') || ''
    ].filter(Boolean).join('\n');

    try {
      if (!window.TPS_API?.rpc) throw new Error('Online-Schnittstelle nicht bereit');
      await window.TPS_API.rpc('submit_homepage_inquiry', {
        p_customer_name: String(d.get('name') || ''),
        p_email: String(d.get('email') || ''),
        p_phone: String(d.get('phone') || ''),
        p_service: `${TPS_HOMEPAGE_TEST_MODE ? '[TEST] ' : ''}${String(d.get('offer') || 'Allgemeine Anfrage')}`,
        p_message: messageWithChild,
        p_child_count: d.get('child_count') ? Number(d.get('child_count')) : null,
        p_requested_date: selectedOfferOption()?.dataset?.fixedDate || d.get('requested_date') || null,
        p_requested_time: String(selectedOfferOption()?.dataset?.fixedTime || ''),
        p_honeypot: String(d.get('website') || '')
      });
      if (statusEl) statusEl.textContent = TPS_HOMEPAGE_TEST_MODE ? 'Testanfrage gespeichert. Sie erscheint im TPS Manager deutlich als TEST.' : 'Danke! Die Anfrage wurde gespeichert und erscheint in der Team-Pony-Datenbank.';
      form.reset();
      if(childCountInput) childCountInput.value='1';
      renderChildNameFields();
      updateInquiryScheduleFields();
    } catch (err) {
      if (statusEl) statusEl.textContent = 'Die Online-Übertragung war nicht möglich. Es wird stattdessen eine E-Mail vorbereitet.';
      const email = window.TPS_SITE?.email || 'info@team-pony-schule-freudenstadt.de';
      window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
}

function isCourseOffer(o) {
  const type = String(o?.offer_type || '').toLowerCase();
  const level = String(o?.course_level || '').toLowerCase();
  return type.includes('kurs') || level === 'mini' || level === 'maxi';
}

function formatPublicDate(v) {
  if (!v) return '';
  const [y,m,d] = String(v).split('-');
  return y && m && d ? `${d}.${m}.${y}` : String(v);
}

function renderDynamicCourses(offers = []) {
  const cards = document.querySelector('#angebote .cards');
  if (!cards) return;
  cards.querySelectorAll('.dynamic-course-card').forEach(el => el.remove());
  const anchor = [...cards.children].find(el => el.classList?.contains('offer-card') && !el.classList.contains('course-card')) || null;
  offers.filter(isCourseOffer)
    .filter(o => !['abgesagt','beendet'].includes(String(o.status || '').toLowerCase()))
    .forEach(o => {
      const level = String(o.course_level || '').toLowerCase();
      const icon = level === 'maxi' ? '🐴' : '🌼';
      const tag = o.age_text || (level === 'maxi' ? 'Maxi' : level === 'mini' ? 'Mini / Beginner' : 'Kurs');
      const chips = [];
      if (o.block_size) chips.push(`${o.block_size} Termine`);
      if (o.free_spots != null) chips.push(`${o.free_spots} ${Number(o.free_spots) === 1 ? 'freier Platz' : 'freie Plätze'}`);
      if (o.status) chips.push(String(o.status).replaceAll('_',' '));
      if (o.date) chips.push(formatPublicDate(o.date));
      const price = o.price != null && o.price !== '' ? `${Number(o.price).toLocaleString('de-DE',{minimumFractionDigits:Number(o.price)%1?2:0,maximumFractionDigits:2})} €` : '';
      const article = document.createElement('article');
      article.className = 'offer-card course-card dynamic-course-card';
      article.innerHTML = `
        <div class="offer-top"><div class="offer-icon">${icon}</div><span class="tag">${escapeHtml(tag)}</span></div>
        <h3>${escapeHtml(o.name || 'Kurs')}</h3>
        <p>${escapeHtml(o.description || 'Fortlaufender Ponykurs in einer kleinen Gruppe.')}</p>
        ${[o.image_data,o.social_payload?.image2].filter(Boolean).length ? `<div class="dynamic-offer-photos ${[o.image_data,o.social_payload?.image2].filter(Boolean).length>1?'two':''}">${[o.image_data,o.social_payload?.image2].filter(Boolean).slice(0,2).map((src,i)=>`<img src="${src}" alt="${escapeHtml(o.name||'Kurs')} – Foto ${i+1}">`).join('')}</div>` : ''}
        ${chips.length ? `<div class="chips">${chips.map(x=>`<span>${escapeHtml(x)}</span>`).join('')}</div>` : ''}
        ${price ? `<div class="offer-price"><strong>${price}</strong><span>${o.block_size ? `pro Kind · ${escapeHtml(o.block_size)} Termine` : 'pro Kind'}</span></div>` : ''}
        <a href="#anfrage" class="dynamic-course-request" data-course-id="${escapeHtml(o.id)}" data-course-name="${escapeHtml(o.name || 'Kurs')}">Kurs anfragen →</a>`;
      cards.insertBefore(article, anchor);
    });
}

function addDynamicCourseOptions(offers = []) {
  if (!offerSelect) return;
  offerSelect.querySelectorAll('optgroup[data-dynamic-courses="1"]').forEach(g => g.remove());
  const current = offers.filter(isCourseOffer).filter(o => !['abgesagt','beendet'].includes(String(o.status || '').toLowerCase()));
  if (!current.length) return;
  const group = document.createElement('optgroup');
  group.label = 'Aktuelle Kurse';
  group.dataset.dynamicCourses = '1';
  current.forEach(o => {
    const option = document.createElement('option');
    const date = o.date ? ` – ${formatPublicDate(o.date)}` : '';
    option.value = `${o.name}${date}`;
    option.textContent = `${o.name}${date}`;
    option.dataset.courseId = o.id;
    option.dataset.offerId = o.id;
    option.dataset.fixedDate = o.date || '';
    option.dataset.fixedTime = o.time ? String(o.time).slice(0,5) + ' Uhr' : '';
    group.appendChild(option);
  });
  offerSelect.appendChild(group);
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
    description:o.description || '', extra:free, parentChild:/eltern/i.test(String(o.offer_type||'')), images:[o.image_data,o.social_payload?.image2].filter(Boolean).slice(0,2)
  };
}

function applyBirthdayPriceOverride(offers = []) {
  const birthday = offers.find(o => /kindergeburtstag/i.test(String(o?.offer_type||o?.name||'')));
  if (!birthday || birthday.price == null || birthday.price === '') return;
  const low = Number(birthday.price);
  const high = Number(birthday.social_payload?.birthday_price_high ?? 70);
  const cards = [...document.querySelectorAll('#angebote .offer-card, #preise .price-card')].filter(card =>
    /kindergeburtstag/i.test(card.querySelector('h3')?.textContent || '')
  );
  cards.forEach(card => {
    const strongs = card.querySelectorAll('.offer-price strong, .price-lines strong');
    if (strongs[0]) strongs[0].textContent = low.toLocaleString('de-DE',{minimumFractionDigits:0,maximumFractionDigits:2}) + ' € / h';
    if (strongs[1]) strongs[1].textContent = high.toLocaleString('de-DE',{minimumFractionDigits:0,maximumFractionDigits:2}) + ' € / h';
  });
}


function isBaseHomepageOffer(o){
  return o?.social_payload?.base_offer===true || String(o?.social_payload?.base_offer||'')==='true';
}
function tpsEuro(v){
  if(v==null||v===''||Number.isNaN(Number(v))) return '';
  return Number(v).toLocaleString('de-DE',{minimumFractionDigits:Number(v)%1?2:0,maximumFractionDigits:2})+' €';
}
function tpsFindStaticOfferCard(key){
  const map={
    'mini-course':'Mini-Kurse','maxi-course':'Maxi-Kurse','workshops-actions':'Workshops & Aktionen',
    'parent-child-workshop':'Eltern-Kind-Workshops','birthday':'Kindergeburtstage',
    'family-friends':'Familien- & Freundezeit','school-fit':'Mit dem Pony fit für die Schule',
    'kindergarten-school':'Kindergärten & Schulen'
  };
  let card=document.querySelector('#angebote .offer-card[data-static-key="'+key+'"]');
  if(card) return card;
  card=[...document.querySelectorAll('#angebote .offer-card')].find(x=>(x.querySelector('h3')?.textContent||'').trim()===map[key]);
  if(card) card.dataset.staticKey=key;
  return card;
}
function tpsSetBaseOfferPhotos(card,o){
  if(!card) return;
  card.querySelector('.base-offer-photos')?.remove();
  const imgs=[o.image_data,o.social_payload?.image2].filter(Boolean).slice(0,2);
  if(!imgs.length) return;
  const host=document.createElement('div');
  host.className='dynamic-offer-photos base-offer-photos'+(imgs.length>1?' two':'');
  host.innerHTML=imgs.map((src,i)=>'<img src="'+src+'" alt="'+escapeHtml(o.name||'Angebot')+' – Foto '+(i+1)+'">').join('');
  const p=[...card.children].find(el=>el.tagName==='P');
  if(p) p.insertAdjacentElement('afterend',host); else card.appendChild(host);
}
function applyEditableBaseOffers(offers=[]){
  const base=offers.filter(isBaseHomepageOffer);
  base.forEach(o=>{
    const key=o.social_payload?.static_key; if(!key) return;
    const card=tpsFindStaticOfferCard(key);
    if(card){
      const h=card.querySelector('h3'); if(h&&o.name) h.textContent=o.name;
      const p=[...card.children].find(el=>el.tagName==='P'); if(p&&o.description) p.textContent=o.description;
      const tag=card.querySelector('.tag'); if(tag&&o.age_text) tag.textContent=o.age_text;
      tpsSetBaseOfferPhotos(card,o);
      if(key==='mini-course'||key==='maxi-course'){
        const el=card.querySelector('.offer-price strong'); if(el&&o.price!=null) el.textContent=tpsEuro(o.price);
      }else if(key==='workshops-actions'){
        const vals=[o.price,o.social_payload?.price_2h,o.social_payload?.price_3h];
        card.querySelectorAll('.mini-prices span').forEach((el,i)=>{if(vals[i]!=null){const h=el.querySelector('strong')?.textContent||'';el.innerHTML='<strong>'+escapeHtml(h)+'</strong> '+tpsEuro(vals[i])}});
      }else if(key==='parent-child-workshop'){
        const el=card.querySelector('.mini-prices span'); if(el&&o.price!=null){const h=el.querySelector('strong')?.textContent||'1,5 h';el.innerHTML='<strong>'+escapeHtml(h)+'</strong> '+tpsEuro(o.price)}
      }else if(key==='birthday'||key==='family-friends'){
        const vals=[o.price,o.social_payload?.birthday_price_high??o.social_payload?.tier_price_high??70];
        card.querySelectorAll('.offer-price strong').forEach((el,i)=>{if(vals[i]!=null)el.textContent=tpsEuro(vals[i])+' / h'});
      }
    }
    if(key==='school-fit'){
      const sec=document.querySelector('.school-fit');
      if(sec){const h=sec.querySelector('h2'),p=sec.querySelector('.fit-copy > p');if(h&&o.name)h.textContent=o.name;if(p&&o.description)p.textContent=o.description}
    }
  });
  const byKey=Object.fromEntries(base.map(o=>[o.social_payload?.static_key,o]));
  const pcs=[...document.querySelectorAll('#preise .price-card')], pc=t=>pcs.find(x=>(x.querySelector('h3')?.textContent||'').trim()===t);
  const mini=byKey['mini-course'],maxi=byKey['maxi-course'],cp=pc('Mini- & Maxi-Kurse');
  if(cp&&(mini?.price!=null||maxi?.price!=null)){const el=cp.querySelector('.big-price');if(el){const a=mini?.price,b=maxi?.price;el.textContent=(a!=null&&b!=null&&Number(a)!==Number(b))?'Mini '+tpsEuro(a)+' · Maxi '+tpsEuro(b):tpsEuro(a??b)}}
  const wa=byKey['workshops-actions'],wp=pc('Workshops');if(wa&&wp){[wa.price,wa.social_payload?.price_2h,wa.social_payload?.price_3h].forEach((v,i)=>{const el=wp.querySelectorAll('.price-lines strong')[i];if(el&&v!=null)el.textContent=tpsEuro(v)})}
  const par=byKey['parent-child-workshop'],parp=pc('Eltern-Kind-Workshops');if(par&&parp&&parp.querySelector('.price-lines strong'))parp.querySelector('.price-lines strong').textContent=tpsEuro(par.price);
  const fam=byKey['family-friends'],famp=pc('Familien- & Freundezeit');if(fam&&famp){[fam.price,fam.social_payload?.tier_price_high??70].forEach((v,i)=>{const el=famp.querySelectorAll('.price-lines strong')[i];if(el&&v!=null)el.textContent=tpsEuro(v)+' / h'})}
  const bd=byKey['birthday'],bdp=pc('Kindergeburtstag');if(bd&&bdp){[bd.price,bd.social_payload?.birthday_price_high??70].forEach((v,i)=>{const el=bdp.querySelectorAll('.price-lines strong')[i];if(el&&v!=null)el.textContent=tpsEuro(v)+' / h'})}
}

window.addEventListener('tps-public-data-ready', (e) => {
  const offers = e.detail?.offers || [];
  const courseOffers = offers.filter(isCourseOffer).filter(o=>!isBaseHomepageOffer(o));
  const live = offers.filter(o => !isCourseOffer(o) && !isBaseHomepageOffer(o)).map(publicOfferToWorkshop).filter(Boolean);
  applyEditableBaseOffers(offers);
  applyBirthdayPriceOverride(offers);

  // Manuell angelegte Kurse bekommen exakt dieselben Angebotskarten wie die vorhandenen Kurse.
  renderDynamicCourses(courseOffers);
  addDynamicCourseOptions(courseOffers);
  updateInquiryScheduleFields();

  // Nur Nicht-Kurse ersetzen die festen Workshop-Termine. Dadurch landet ein Kurs nie im Workshop-Layout.
  if (live.length) {
    workshops = live;
    renderWorkshops();
    addWorkshopOptions();
  }
  applyOfferFromUrl();
});

document.addEventListener('click', (e) => {
  const a = e.target.closest('.dynamic-course-request');
  if (!a) return;
  const name = a.dataset.courseName || 'Kurs';
  const option = offerSelect ? [...offerSelect.options].find(o => o.dataset.courseId === a.dataset.courseId) : null;
  prepareOffer(option?.value || name, `Ich interessiere mich für den Kurs „${name}“.`);
});

window.addEventListener('tps-public-data-ready',()=>setTimeout(updateWorkshopMonthsText,0));
setTimeout(updateWorkshopMonthsText,0);
