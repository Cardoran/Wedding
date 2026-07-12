/* =========================================================================
   Hochzeitswebseite – main.js
   Reines Vanilla-JavaScript, keine externen Bibliotheken.

   HINWEIS ZUM INHALT-MODELL: In dieser Datei muss nichts geändert werden.
   Jede Funktion prüft zuerst, ob ihr HTML-Element überhaupt existiert
   ("guard clause"). Dadurch bricht nichts, wenn eine Sektion gelöscht wird.

   Das Hochzeitsdatum wird NICHT hier eingetragen, sondern im HTML am
   Countdown-Element (Attribut data-wedding-date). Siehe Anleitung in index.html.
   ========================================================================= */

   (function () {
    'use strict';
  
    /* ---------------------------------------------------------------------
       0. PASSWORT-SCHUTZ
       Liest das Passwort aus data-password am #passwordGate-Element.
       Richtige Eingabe wird im localStorage gemerkt (kein erneutes Fragen).
       Reiner Sichtschutz – keine echte Verschlüsselung.
    --------------------------------------------------------------------- */
    function initPasswordGate() {
      var gate = document.getElementById('passwordGate');
      if (!gate) return;
  
      var form = document.getElementById('passwordGateForm');
      var input = document.getElementById('passwordInput');
      var error = document.getElementById('passwordError');
      var expected = gate.getAttribute('data-password') || '';
      var KEY = 'tm_gate_ok';
  
      function unlock() {
        gate.classList.add('is-unlocked');
        document.body.style.overflow = '';
      }
  
      // schon einmal korrekt eingegeben? -> direkt durchlassen
      try {
        if (localStorage.getItem(KEY) === '1') { unlock(); return; }
      } catch (e) { /* localStorage gesperrt -> einfach jedes Mal fragen */ }
  
      document.body.style.overflow = 'hidden';
      if (input) input.focus();
  
      if (!form) return;
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var value = input ? input.value.trim() : '';
        if (value === expected) {
          try { localStorage.setItem(KEY, '1'); } catch (e2) { /* egal */ }
          unlock();
        } else {
          if (error) error.hidden = false;
          // Wackel-Animation neu starten
          gate.classList.remove('password-gate--error');
          void gate.offsetWidth;
          gate.classList.add('password-gate--error');
          if (input) input.select();
        }
      });
    }
  
    /* ---------------------------------------------------------------------
       1. COUNTDOWN
       Liest das Zieldatum aus data-wedding-date, aktualisiert jede Sekunde.
       Ist das Datum vergangen, wird „Wir haben geheiratet!" angezeigt.
    --------------------------------------------------------------------- 
    function initCountdown() {
      var el = document.getElementById('countdown');
      if (!el) return;
  
      var target = new Date(el.getAttribute('data-wedding-date')).getTime();
      if (isNaN(target)) return; // ungültiges Datum -> still aussteigen
  
      var fields = {
        days:    el.querySelector('[data-cd="days"]'),
        hours:   el.querySelector('[data-cd="hours"]'),
        minutes: el.querySelector('[data-cd="minutes"]'),
        seconds: el.querySelector('[data-cd="seconds"]')
      };
  
      var timer = null;
  
      function pad(n) { return (n < 10 ? '0' : '') + n; }
  
      function showPast() {
        el.innerHTML = '<span class="countdown--past">Wir haben geheiratet! 💍</span>';
        if (timer) clearInterval(timer);
      }
  
      function tick() {
        var diff = target - Date.now();
        if (diff <= 0) { showPast(); return; }
  
        var days = Math.floor(diff / 86400000);
        var hours = Math.floor((diff % 86400000) / 3600000);
        var minutes = Math.floor((diff % 3600000) / 60000);
        var seconds = Math.floor((diff % 60000) / 1000);
  
        if (fields.days)    fields.days.textContent = pad(days);
        if (fields.hours)   fields.hours.textContent = pad(hours);
        if (fields.minutes) fields.minutes.textContent = pad(minutes);
        if (fields.seconds) fields.seconds.textContent = pad(seconds);
      }
  
      tick();
      timer = setInterval(tick, 1000);
    }
  
     ---------------------------------------------------------------------
       2. STICKY HEADER
       Ab ~60px Scroll bekommt der Header die Klasse .is-scrolled.
    --------------------------------------------------------------------- */
    function initStickyHeader() {
      var header = document.getElementById('siteHeader');
      if (!header) return;
  
      function update() {
        if (window.scrollY > 60) header.classList.add('is-scrolled');
        else header.classList.remove('is-scrolled');
      }
      update();
      window.addEventListener('scroll', update, { passive: true });
    }
  
    /* ---------------------------------------------------------------------
       3. MOBILES MENÜ
       Öffnen/Schließen, Schließen bei Link-Klick und Escape, aria-Sync.
    --------------------------------------------------------------------- */
    function initMobileMenu() {
      var toggle = document.getElementById('navToggle');
      var menu = document.getElementById('navMobile');
      var closeBtn = document.getElementById('navClose');
      if (!toggle || !menu) return;
  
      function open() {
        menu.classList.add('is-open');
        menu.setAttribute('aria-hidden', 'false');
        toggle.setAttribute('aria-expanded', 'true');
        toggle.setAttribute('aria-label', 'Menü schließen');
        document.body.style.overflow = 'hidden';
      }
  
      function close() {
        menu.classList.remove('is-open');
        menu.setAttribute('aria-hidden', 'true');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Menü öffnen');
        document.body.style.overflow = '';
      }
  
      toggle.addEventListener('click', function () {
        if (menu.classList.contains('is-open')) close();
        else open();
      });
  
      if (closeBtn) closeBtn.addEventListener('click', close);
  
      // Schließen bei Klick auf einen Navigationslink
      menu.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', close);
      });
  
      // Schließen mit Escape
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && menu.classList.contains('is-open')) close();
      });
    }
  
    /* ---------------------------------------------------------------------
       4. SCROLL-REVEAL (IntersectionObserver)
       Elemente mit .js-reveal erhalten beim Sichtbarwerden .is-visible.
       Der versteckte Ausgangszustand wird per CSS-Klasse gesetzt, die es
       nur mit aktivem JS gibt -> ohne JS bleibt alles sichtbar.
       Bei "prefers-reduced-motion" wird alles sofort sichtbar geschaltet.
    --------------------------------------------------------------------- */
    function initScrollReveal() {
      var items = document.querySelectorAll('.js-reveal');
      if (!items.length) return;
  
      var reduceMotion = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
      if (reduceMotion || !('IntersectionObserver' in window)) {
        items.forEach(function (el) { el.classList.add('is-visible'); });
        return;
      }
  
      var observer = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  
      items.forEach(function (el) { observer.observe(el); });
    }
  
    /* ---------------------------------------------------------------------
       5. GALERIE-LIGHTBOX
       Öffnen/Schließen/Weiter/Zurück, Tastatur (Escape, Pfeile), Fokus.
       Arbeitet gegen die Klasse .galerie-item – funktioniert also auch,
       wenn die Platzhalter später durch echte <img> ersetzt werden.
    --------------------------------------------------------------------- */
    function initLightbox() {
      var items = Array.prototype.slice.call(document.querySelectorAll('.galerie-item'));
      var box = document.getElementById('lightbox');
      var content = document.getElementById('lightboxContent');
      var closeBtn = document.getElementById('lightboxClose');
      var prevBtn = document.getElementById('lightboxPrev');
      var nextBtn = document.getElementById('lightboxNext');
      if (!items.length || !box || !content) return;
  
      var current = 0;
      var lastFocused = null;
  
      // Baut den Inhalt für Index i: echtes Bild bevorzugt, sonst Platzhalter-Klon.
      function render(i) {
        content.innerHTML = '';
        var source = items[i];
        var img = source.querySelector('img');
        if (img) {
          var clone = document.createElement('img');
          clone.src = img.currentSrc || img.src;
          clone.alt = img.alt || '';
          content.appendChild(clone);
        } else {
          var ph = source.querySelector('.foto-platzhalter');
          if (ph) content.appendChild(ph.cloneNode(true));
        }
      }
  
      function open(i) {
        current = i;
        lastFocused = document.activeElement;
        render(current);
        box.classList.add('is-open');
        box.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        if (closeBtn) closeBtn.focus();
      }
  
      function close() {
        box.classList.remove('is-open');
        box.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        content.innerHTML = '';
        if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
      }
  
      function show(delta) {
        current = (current + delta + items.length) % items.length;
        render(current);
      }
  
      items.forEach(function (item, i) {
        item.addEventListener('click', function () { open(i); });
      });
  
      if (closeBtn) closeBtn.addEventListener('click', close);
      if (prevBtn) prevBtn.addEventListener('click', function () { show(-1); });
      if (nextBtn) nextBtn.addEventListener('click', function () { show(1); });
  
      // Klick auf den dunklen Hintergrund schließt die Lightbox
      box.addEventListener('click', function (e) {
        if (e.target === box) close();
      });
  
      // Tastatursteuerung
      document.addEventListener('keydown', function (e) {
        if (!box.classList.contains('is-open')) return;
        if (e.key === 'Escape') close();
        else if (e.key === 'ArrowLeft') show(-1);
        else if (e.key === 'ArrowRight') show(1);
      });
    }
  
    /* ---------------------------------------------------------------------
       6. FUSSZEILEN-JAHR automatisch setzen
    --------------------------------------------------------------------- */
    function initFooterYear() {
      var el = document.getElementById('footerYear');
      if (el) el.textContent = new Date().getFullYear();
    }
  
    /* ---------------------------------------------------------------------
       7. RSVP-FORMULAR
       a) Personen-Zeilen: Zeile 1 ist sichtbar, Zeilen 2–5 werden über den
          Button „+ Person hinzufügen" eingeblendet. (Alle Felder stehen im
          HTML, damit Netlify sie beim Deploy erkennt.)
       b) Allergie-Zeilen: Es erscheinen genauso viele wie Personen-Zeilen;
          die Beschriftung übernimmt den eingetragenen Namen.
       c) Detail-Bereich (#rsvpDetails): nur bei „Zusage" sichtbar. Bei
          Absage wird das Fieldset deaktiviert, damit Pflichtfelder darin
          nicht blockieren und die Felder nicht mitgesendet werden.
       d) Beim Absenden wird die Zahl der ausgefüllten Personen-Felder im
          sessionStorage gemerkt – die Danke-Seite formuliert damit ihren
          Text im Singular oder Plural.
       Ohne JavaScript bleibt alles sichtbar und der Button versteckt.
    --------------------------------------------------------------------- */
    function initRsvpForm() {
      var form = document.querySelector('form[name="rsvp"]');
      if (!form) return;
  
      var MAX = 5;
      var addBtn = document.getElementById('rsvpAddPerson');
      var details = document.getElementById('rsvpDetails');
      var visiblePersons = 1;
  
      function nameInput(i) {
        return form.querySelector('[name="person' + i + '_name"]');
      }
  
      // Zeigt Personen- und Allergie-Zeilen bis visiblePersons, versteckt den Rest.
      /*function syncRows() {
        for (var i = 1; i <= MAX; i++) {
          var show = i <= visiblePersons;
          var personRow = form.querySelector('.person-row[data-person="' + i + '"]');
          var allergyRow = form.querySelector('.allergy-row[data-person="' + i + '"]');
          if (personRow) personRow.hidden = !show;
          if (allergyRow) allergyRow.hidden = !show;
        }
        if (addBtn) addBtn.hidden = visiblePersons >= MAX;
        syncAllergyLabels();
      }
  
      // Übernimmt die eingetragenen Namen in die Allergie-Beschriftungen.
      function syncAllergyLabels() {
        for (var i = 1; i <= MAX; i++) {
          var span = form.querySelector('.allergy-row[data-person="' + i + '"] [data-allergy-name]');
          var input = nameInput(i);
          if (span) span.textContent = (input && input.value.trim()) || 'Person ' + i;
        }
      } */
        function syncRows() {
            for (var i = 1; i <= MAX; i++) {
              var show = i <= visiblePersons;
          
              var personRow = form.querySelector('.person-row[data-person="' + i + '"]');
              var allergyRow = form.querySelector('.allergy-row[data-person="' + i + '"]');
          
              if (personRow) {
                personRow.style.display = show ? '' : 'none';
              }
          
              if (allergyRow) {
                allergyRow.style.display = show ? '' : 'none';
              }
            }
          
            if (addBtn) {
              addBtn.hidden = visiblePersons >= MAX;
            }
          
            syncAllergyLabels();
          }
          
  
      // Blendet den Detail-Bereich nur bei „Zusage" ein.
      function syncDetails() {
        if (!details) return;
        var checked = form.querySelector('[name="teilnahme"]:checked');
        var yes = !!checked && checked.value === 'Zusage';
        details.hidden = !yes;
        details.disabled = !yes;
      }
  
      if (addBtn) {
        addBtn.addEventListener('click', function () {
          if (visiblePersons >= MAX) return;
          visiblePersons++;
          syncRows();
          var input = nameInput(visiblePersons);
          if (input) input.focus();
        });
      }
  
      form.addEventListener('input', function (e) {
        if (e.target && /^person\d+_name$/.test(e.target.name || '')) syncAllergyLabels();
      });
  
      form.querySelectorAll('[name="teilnahme"]').forEach(function (radio) {
        radio.addEventListener('change', syncDetails);
      });
  
      syncRows();
      syncDetails();
  
      form.addEventListener('submit', function () {
        try {
          var count = 0;
          for (var i = 1; i <= visiblePersons; i++) {
            var field = nameInput(i);
            if (field && field.value.trim()) count++;
          }
          sessionStorage.setItem('rsvpAnzahl', String(count || 1));
        } catch (e) { /* sessionStorage nicht verfügbar -> still ignorieren */ }
      });
    }
  
    /* ---------------------------------------------------------------------
       Start
    --------------------------------------------------------------------- */
    document.addEventListener('DOMContentLoaded', function () {
      initPasswordGate();
      initCountdown();
      initStickyHeader();
      initMobileMenu();
      initScrollReveal();
      initLightbox();
      initFooterYear();
      initRsvpForm();
    });
  })();
  