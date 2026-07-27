/**
 * Intek Space copy of OMNI form backbone (keep in sync with Grok/js/omni-form-validate.js).
 * See Grok/docs/FORM_VALIDATE.md
 */
(function (global) {
  var EMAIL_RE =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  function trim(s) {
    return String(s == null ? '' : s).replace(/^\s+|\s+$/g, '');
  }
  function digits(s) {
    return String(s || '').replace(/\D/g, '');
  }
  function labelOf(el) {
    if (!el) return 'Field';
    if (el.getAttribute('data-label')) return el.getAttribute('data-label');
    if (el.id) {
      var lab = document.querySelector('label[for="' + el.id + '"]');
      if (lab) {
        var t = trim(lab.textContent || '').replace(/\*$/, '');
        if (t) return t.slice(0, 48);
      }
    }
    return el.name || el.id || 'Field';
  }
  function kindOf(el) {
    var d = (el.getAttribute('data-validate') || '').toLowerCase();
    if (d) return d;
    var t = (el.type || el.tagName || '').toLowerCase();
    if (t === 'email') return 'email';
    if (t === 'tel') return 'phone';
    if (t === 'checkbox') return 'checkbox';
    if (t === 'date') return 'date';
    if (t === 'url') return 'url';
    if (el.tagName === 'TEXTAREA') return 'textarea';
    if (el.tagName === 'SELECT') return 'select';
    return 'text';
  }
  function maxOf(el) {
    var m = parseInt(el.getAttribute('data-max') || el.getAttribute('maxlength') || '', 10);
    if (!isNaN(m) && m > 0) return m;
    var k = kindOf(el);
    if (k === 'email') return 120;
    if (k === 'phone') return 32;
    if (k === 'name') return 80;
    if (k === 'textarea') return 4000;
    if (k === 'url') return 500;
    return 200;
  }
  function minOf(el) {
    var m = parseInt(el.getAttribute('data-min') || el.getAttribute('minlength') || '', 10);
    if (!isNaN(m) && m >= 0) return m;
    if (el.required || el.getAttribute('aria-required') === 'true') {
      var k = kindOf(el);
      if (k === 'phone') return 7;
      if (k === 'name') return 2;
      return 1;
    }
    return 0;
  }
  function isRequired(el) {
    return !!(el.required || el.getAttribute('aria-required') === 'true');
  }
  function validateEmail(v) {
    if (!v) return 'Enter an email address.';
    if (v.length > 120) return 'Email is too long.';
    if (!EMAIL_RE.test(v)) return 'Enter a valid email address.';
    return '';
  }
  function validatePhone(v) {
    if (!v) return '';
    var d = digits(v);
    if (d.length < 7) return 'Phone looks too short.';
    if (d.length > 15) return 'Phone looks too long.';
    return '';
  }
  function normalizePhone(v) {
    var d = digits(v);
    if (d.length === 10) return '(' + d.slice(0, 3) + ') ' + d.slice(3, 6) + '-' + d.slice(6);
    if (d.length === 11 && d.charAt(0) === '1')
      return '+1 (' + d.slice(1, 4) + ') ' + d.slice(4, 7) + '-' + d.slice(7);
    return trim(v);
  }
  function validateOne(el) {
    if (!el || el.disabled || el.type === 'hidden' || el.type === 'submit' || el.type === 'button') {
      return { ok: true, message: '', value: null };
    }
    if (el.getAttribute('data-honeypot') === 'true' || el.name === 'website_url_hp') {
      var hp = trim(el.value);
      return { ok: !hp, message: hp ? 'Spam check failed.' : '', value: hp, honeypot: true };
    }
    var kind = kindOf(el);
    var required = isRequired(el);
    var max = maxOf(el);
    var min = minOf(el);
    var raw = kind === 'checkbox' ? el.checked : trim(el.value);
    var label = labelOf(el);
    if (kind === 'checkbox') {
      if (required && !el.checked) return { ok: false, message: 'Please check: ' + label, value: false };
      return { ok: true, message: '', value: !!el.checked };
    }
    if (!raw) {
      if (required) return { ok: false, message: label + ' is required.', value: '' };
      return { ok: true, message: '', value: '' };
    }
    if (typeof raw === 'string' && raw.length > max) {
      return { ok: false, message: label + ' is too long (max ' + max + ').', value: raw };
    }
    if (typeof raw === 'string' && raw.length < min) {
      return { ok: false, message: label + ' is too short.', value: raw };
    }
    if (kind === 'email') {
      var em = validateEmail(raw);
      if (em) return { ok: false, message: em, value: raw };
      return { ok: true, message: '', value: raw.toLowerCase() };
    }
    if (kind === 'phone') {
      var ph = validatePhone(raw);
      if (ph) return { ok: false, message: ph, value: raw };
      return { ok: true, message: '', value: normalizePhone(raw) };
    }
    if (kind === 'url') {
      try {
        var u = raw.indexOf('://') === -1 ? 'https://' + raw : raw;
        var parsed = new URL(u);
        if (!/^https?:$/.test(parsed.protocol)) {
          return { ok: false, message: 'Use an http(s) URL.', value: raw };
        }
      } catch (_) {
        return { ok: false, message: 'Enter a valid URL.', value: raw };
      }
    }
    if (kind === 'name' && /[<>{}]/.test(raw)) {
      return { ok: false, message: label + ' has invalid characters.', value: raw };
    }
    if (kind === 'date' && !/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      return { ok: false, message: 'Use a valid date.', value: raw };
    }
    var matchSel = el.getAttribute('data-match');
    if (matchSel) {
      var other = document.querySelector(matchSel);
      if (other && trim(other.value) !== raw) {
        return { ok: false, message: label + ' does not match.', value: raw };
      }
    }
    return { ok: true, message: '', value: raw };
  }
  function clearFieldError(el) {
    if (!el) return;
    el.classList.remove('omni-field-error');
    el.removeAttribute('aria-invalid');
    var id = el.getAttribute('data-error-for') || el.id;
    if (id) {
      var box = document.querySelector('[data-error-id="' + id + '"]');
      if (box) {
        box.textContent = '';
        box.classList.add('hidden');
        box.setAttribute('hidden', 'hidden');
      }
    }
    var sib = el.parentNode && el.parentNode.querySelector('.omni-err');
    if (sib && sib.getAttribute('data-for') === (el.name || el.id)) {
      sib.textContent = '';
      sib.hidden = true;
    }
  }
  function showFieldError(el, msg) {
    if (!el) return;
    el.classList.add('omni-field-error');
    el.setAttribute('aria-invalid', 'true');
    var id = el.id || el.name;
    if (id) {
      var box = document.querySelector('[data-error-id="' + id + '"]');
      if (box) {
        box.textContent = msg;
        box.classList.remove('hidden');
        box.removeAttribute('hidden');
        return;
      }
    }
    var host = el.parentNode;
    if (!host) return;
    var err = host.querySelector('.omni-err[data-for="' + (el.name || el.id || '') + '"]');
    if (!err) {
      err = document.createElement('p');
      err.className = 'omni-err text-xs text-amber-300 mt-1';
      err.setAttribute('data-for', el.name || el.id || '');
      err.setAttribute('role', 'alert');
      host.appendChild(err);
    }
    err.textContent = msg;
    err.hidden = false;
  }
  function fieldsOf(form) {
    return Array.prototype.slice.call(form.elements || []).filter(function (el) {
      return el && el.name && !el.disabled && el.type !== 'submit' && el.type !== 'button' && el.type !== 'fieldset';
    });
  }
  function validateForm(form, opts) {
    opts = opts || {};
    var errors = [];
    var values = {};
    var firstBad = null;
    fieldsOf(form).forEach(function (el) {
      clearFieldError(el);
      var r = validateOne(el);
      if (r.honeypot) {
        if (!r.ok) errors.push({ name: el.name, message: 'Unable to submit. Please try again.' });
        return;
      }
      if (el.name) values[el.name] = r.value;
      if (!r.ok) {
        errors.push({ name: el.name || el.id, message: r.message, el: el });
        showFieldError(el, r.message);
        if (!firstBad) firstBad = el;
      } else if (el.type === 'tel' && r.value && opts.normalizePhone !== false) {
        el.value = r.value;
      } else if (kindOf(el) === 'email' && r.value) {
        el.value = r.value;
      }
    });
    return {
      ok: errors.length === 0,
      errors: errors,
      values: values,
      firstInvalid: firstBad,
      message: errors.length ? errors[0].message : '',
    };
  }
  function injectStyles() {
    if (document.getElementById('omni-form-validate-css')) return;
    var s = document.createElement('style');
    s.id = 'omni-form-validate-css';
    s.textContent =
      '.omni-field-error{border-color:rgba(251,191,36,0.65)!important;box-shadow:0 0 0 1px rgba(251,191,36,0.25);}' +
      '.omni-err{color:#fcd34d;font-size:0.75rem;margin-top:0.25rem;}' +
      '.omni-hp{position:absolute!important;left:-10000px!important;top:auto!important;width:1px!important;height:1px!important;overflow:hidden!important;}';
    document.head.appendChild(s);
  }
  function ensureHoneypot(form, name) {
    name = name || 'website_url_hp';
    if (form.querySelector('[name="' + name + '"]')) return;
    var wrap = document.createElement('div');
    wrap.className = 'omni-hp';
    wrap.setAttribute('aria-hidden', 'true');
    wrap.innerHTML =
      '<label>Website <input type="text" name="' +
      name +
      '" data-honeypot="true" tabindex="-1" autocomplete="off" /></label>';
    form.appendChild(wrap);
  }
  function bind(form, opts) {
    if (!form) return null;
    opts = opts || {};
    injectStyles();
    if (opts.honeypot !== false) ensureHoneypot(form, opts.honeypotName);
    if (opts.live !== false) {
      form.addEventListener(
        'blur',
        function (ev) {
          var el = ev.target;
          if (!el || !el.name || !form.contains(el)) return;
          if (el.type === 'checkbox' || el.type === 'radio') return;
          clearFieldError(el);
          var r = validateOne(el);
          if (!r.ok && !r.honeypot) showFieldError(el, r.message);
          else if (r.ok && el.type === 'tel' && r.value) el.value = r.value;
          else if (r.ok && kindOf(el) === 'email' && r.value) el.value = r.value;
        },
        true
      );
    }
    form.addEventListener('submit', function (ev) {
      var result = validateForm(form, opts);
      if (!result.ok) {
        ev.preventDefault();
        if (result.firstInvalid) {
          try {
            result.firstInvalid.focus();
          } catch (_) {}
        }
        if (opts.onInvalid) opts.onInvalid(result);
        return;
      }
      if (opts.onValid) {
        var cont = opts.onValid(result);
        if (cont === false) ev.preventDefault();
      }
    });
    return {
      validate: function () {
        return validateForm(form, opts);
      },
      clear: function () {
        fieldsOf(form).forEach(clearFieldError);
      },
    };
  }
  global.OMNI_FORM = {
    validateEmail: validateEmail,
    validatePhone: validatePhone,
    normalizePhone: normalizePhone,
    validateField: validateOne,
    validateForm: validateForm,
    bind: bind,
    showFieldError: showFieldError,
    clearFieldError: clearFieldError,
  };
})(typeof window !== 'undefined' ? window : this);
