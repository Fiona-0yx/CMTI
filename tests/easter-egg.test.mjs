import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { test } from 'node:test';

const app = await readFile(new URL('../app.js', import.meta.url), 'utf8');

function page(stored = new Map()) {
  const elements = new Map();
  const element = selector => {
    if (!elements.has(selector)) {
      const classes = new Set(['hidden']);
      elements.set(selector, {
        dataset: {},
        style: {},
        value: '',
        checked: false,
        listeners: {},
        classList: {
          add: name => classes.add(name),
          remove: name => classes.delete(name),
          toggle: (name, enabled) => enabled ? classes.add(name) : classes.delete(name),
          contains: name => classes.has(name)
        },
        addEventListener(type, handler) { this.listeners[type] = handler; },
        showModal() { this.open = true; },
        close() { this.open = false; },
        focus() { this.focused = true; }
      });
    }
    return elements.get(selector);
  };
  const context = vm.createContext({
    document: {
      querySelector: element,
      querySelectorAll: selector => {
        if (selector === '[data-easter-close]') return [element('#easterClose')];
        if (selector === '[data-paywall-close]') return [element('#paywallClose')];
        if (selector === '[data-unlock]') return [element('#unlockButton')];
        if (selector === '.locked-content') return [element('#lockedContent')];
        return [];
      }
    },
    localStorage: {
      getItem: key => stored.get(key) ?? null,
      setItem: (key, value) => stored.set(key, value),
      removeItem: key => stored.delete(key)
    },
    crypto: { randomUUID: () => 'test-user-id' },
    fetch: async () => ({ json: async () => ({ aiConfigured: false }) }),
    window: { scrollTo() {}, setTimeout: callback => callback() },
    globalThis: { CMTI_CONTESTS: [] }
  });
  vm.runInContext(app, context);
  const enter = name => {
    element('#studentName').value = name;
    element('#studentMajor').value = '计算机科学';
    element('#privacyConsent').checked = true;
    element('#entryForm').listeners.submit({ preventDefault() {} });
  };
  return { context, element, stored, enter };
}

test('only the exact name opens the letter on every entry', () => {
  const { context, element, enter } = page();
  enter('武暄');
  assert.equal(element('#easterEggDialog').open, true);
  assert.equal(element('#quizView').classList.contains('hidden'), true);

  element('#easterClose').listeners.click();
  assert.equal(element('#easterEggDialog').open, false);
  assert.equal(element('#quizView').classList.contains('hidden'), false);
  assert.match(element('#questionList').innerHTML, /QUESTION 01/);
  assert.equal((element('#questionList').innerHTML.match(/class="question-card"/g) ?? []).length, 1);

  enter('武暄');
  assert.equal(element('#easterEggDialog').open, true);
  element('#easterClose').listeners.click();
  assert.equal(element('#quizView').classList.contains('hidden'), false);
  assert.equal(vm.runInContext('state.step', context), 0);
});

test('previous visits and old seen flags never suppress the letter', () => {
  const stored = new Map([['cmti.easter.seen.v1', 'true']]);
  const firstVisit = page(stored);
  firstVisit.enter('武暄');
  assert.equal(firstVisit.element('#easterEggDialog').open, true);
  firstVisit.element('#easterClose').listeners.click();

  const nextVisit = page(stored);
  nextVisit.enter('武暄');
  assert.equal(nextVisit.element('#easterEggDialog').open, true);
});

test('a returning visitor with a saved result can enter the name again', () => {
  const share = Object.fromEntries(['A', 'E', 'I', 'S', 'H', 'M'].map(code => [code, 16.7]));
  const stored = new Map([['cmti.profile.v1', JSON.stringify({
    user: { name: '武暄', major: '计算机科学' }, share, contestMatches: []
  })]]);
  const { element, enter } = page(stored);
  assert.equal(element('#resultView').classList.contains('hidden'), true);
  enter('武暄');
  assert.equal(element('#easterEggDialog').open, true);
  element('#easterClose').listeners.click();
  assert.equal(element('#quizView').classList.contains('hidden'), false);
});

test('different names and extra spaces do not trigger the letter', () => {
  for (const name of ['武宣', '武暄 ', ' 武暄', '其他同学']) {
    const { element, enter } = page();
    enter(name);
    assert.equal(element('#easterEggDialog').open, undefined, name);
    assert.equal(element('#quizView').classList.contains('hidden'), false, name);
  }
});

test('one answer advances one question and the final choice updates progress', () => {
  const { context, element, enter } = page();
  enter('普通同学');
  for (let i = 0; i < 24; i++) {
    assert.match(element('#questionList').innerHTML, new RegExp(`QUESTION ${String(i + 1).padStart(2, '0')}`));
    element('#questionList').onchange({
      target: { matches: () => true, name: `q${i}`, value: '5' }
    });
  }
  assert.equal(vm.runInContext('state.step', context), 24);
  assert.match(element('#questionList').innerHTML, /QUESTION 25/);
  assert.equal(element('#progressFill').style.width, '96%');
  element('#questionList').onchange({ target: { name: 'refinement', value: 'M' } });
  assert.equal(element('#progressFill').style.width, '100%');
});

test('closing the payment demo unlocks premium content for the current page', () => {
  const { element } = page();
  element('#lockedContent').inert = true;
  element('#unlockButton').listeners.click({ currentTarget: element('#unlockButton') });
  assert.equal(element('#paywallDialog').open, true);

  element('#paywallClose').listeners.click();
  assert.equal(element('#paywallDialog').open, false);
  assert.equal(element('.site-shell').classList.contains('premium-demo-unlocked'), true);
  assert.equal(element('#lockedContent').inert, false);
  assert.equal(element('#assistantView .module-badge').textContent, 'AI 助手 · 已解锁');
  assert.equal(element('#directoryView .module-badge').textContent, '完整版 · 已解锁');
});
