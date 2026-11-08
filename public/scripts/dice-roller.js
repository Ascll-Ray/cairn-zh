/**
 * Zero-dependency OSR Tabletop Tool Suite for Starlight SRD:
 * 1. Safe TreeWalker Dice Formula Parser & Click-to-Roll
 * 2. Multi-roll Floating Dice Tray (with history log)
 * 3. Table Auto-Roller (one-click roll and scroll-to-row highlight)
 * 4. Monster Statblock Capsule Formatter
 */
(function () {
  const DICE_REGEX = /(?<![a-zA-Z0-9_\/.#-])(\d*d(?:4|6|8|10|12|20|66|100)(?:\s*[+\-]\s*(?:\d*d(?:4|6|8|10|12|20|66|100)|\d+))*)(?![a-zA-Z0-9_])/gi;
  const SKIP_TAGS = new Set(['CODE', 'PRE', 'A', 'BUTTON', 'SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'TH']);

  const state = {
    history: [],
    trayCollapsed: true,
  };

  function rollFormula(formula) {
    const clean = formula.toLowerCase().replace(/\s+/g, '');
    const tokens = clean.match(/([+-]?[^+-]+)/g);
    if (!tokens) return null;

    let total = 0;
    const details = [];

    for (const token of tokens) {
      const sign = token.startsWith('-') ? -1 : 1;
      const body = token.replace(/^[+-]/, '');

      const diceMatch = body.match(/^(\d*)d(\d+)$/);
      if (diceMatch) {
        const count = diceMatch[1] ? parseInt(diceMatch[1], 10) : 1;
        const sides = parseInt(diceMatch[2], 10);
        if (sides === 66) {
          const tens = Math.floor(Math.random() * 6) + 1;
          const ones = Math.floor(Math.random() * 6) + 1;
          const val = tens * 10 + ones;
          total += sign * val;
          details.push((sign < 0 ? '-' : '') + '[' + tens + ', ' + ones + ']');
        } else {
          const rolls = [];
          let subSum = 0;
          for (let i = 0; i < Math.min(count, 50); i++) {
            const r = Math.floor(Math.random() * sides) + 1;
            rolls.push(r);
            subSum += r;
          }
          total += sign * subSum;
          details.push((sign < 0 ? '-' : '') + '[' + rolls.join(', ') + ']');
        }
      } else if (/^\d+$/.test(body)) {
        const num = parseInt(body, 10);
        total += sign * num;
        details.push((sign < 0 ? '-' : '+') + num);
      } else {
        return null;
      }
    }

    return { total, detail: details.join(' ') };
  }

  // ==========================================
  // 1. 浮动 Dice Tray 托盘组件
  // ==========================================
  function ensureDiceTray() {
    let tray = document.getElementById('cairn-dice-tray');
    if (tray) return tray;

    tray = document.createElement('div');
    tray.id = 'cairn-dice-tray';
    tray.className = 'cairn-dice-tray';
    tray.style.cssText = [
      'position:fixed',
      'bottom:1.5rem',
      'right:1.5rem',
      'z-index:9998',
      'font-family:var(--sl-font)',
      'display:flex',
      'flex-direction:column',
      'align-items:flex-end',
      'gap:0.5rem',
      'pointer-events:none'
    ].join(';');

    const panel = document.createElement('div');
    panel.id = 'cairn-dice-panel';
    panel.style.cssText = [
      'width:260px',
      'background:#1f1e24',
      'border:1px solid #44434d',
      'border-radius:6px',
      'box-shadow:0 8px 30px rgba(0,0,0,0.6)',
      'padding:0.75rem',
      'display:none',
      'flex-direction:column',
      'gap:0.5rem',
      'pointer-events:auto',
      'color:#e6e1e8',
      'font-size:0.875rem'
    ].join(';');

    const header = document.createElement('div');
    header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #3c3b44;padding-bottom:0.4rem;';
    header.innerHTML = `
      <strong style="font-size:0.85rem;color:#ffffff;display:flex;align-items:center;gap:0.35rem;">
        <span>🎲</span> 投骰记录
      </strong>
      <div style="display:flex;gap:0.5rem;">
        <button id="cairn-dice-clear" type="button" style="background:none;border:none;color:#9e9da6;cursor:pointer;font-size:0.75rem;padding:0 2px;">清空</button>
        <button id="cairn-dice-close" type="button" style="background:none;border:none;color:#9e9da6;cursor:pointer;font-size:0.85rem;line-height:1;padding:0 2px;">✕</button>
      </div>
    `;

    const list = document.createElement('div');
    list.id = 'cairn-dice-list';
    list.style.cssText = 'display:flex;flex-direction:column;gap:0.4rem;max-height:190px;overflow-y:auto;';

    panel.appendChild(header);
    panel.appendChild(list);

    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'cairn-dice-toggle';
    toggleBtn.type = 'button';
    toggleBtn.style.cssText = [
      'background:#2e2d33',
      'border:1px solid #44434d',
      'color:#ffffff',
      'border-radius:20px',
      'padding:0.45rem 0.9rem',
      'font-size:0.825rem',
      'font-weight:600',
      'cursor:pointer',
      'pointer-events:auto',
      'display:inline-flex',
      'align-items:center',
      'gap:0.4rem',
      'box-shadow:0 4px 16px rgba(0,0,0,0.4)',
      'transition:all 0.15s ease'
    ].join(';');
    toggleBtn.innerHTML = `<span>🎲</span> <span id="cairn-dice-last-badge">投骰</span>`;

    toggleBtn.addEventListener('mouseenter', () => {
      toggleBtn.style.borderColor = '#7253ed';
      toggleBtn.style.color = '#a981ff';
    });
    toggleBtn.addEventListener('mouseleave', () => {
      toggleBtn.style.borderColor = '#44434d';
      toggleBtn.style.color = '#ffffff';
    });

    toggleBtn.addEventListener('click', () => {
      state.trayCollapsed = !state.trayCollapsed;
      panel.style.display = state.trayCollapsed ? 'none' : 'flex';
    });

    header.querySelector('#cairn-dice-close').addEventListener('click', () => {
      state.trayCollapsed = true;
      panel.style.display = 'none';
    });

    header.querySelector('#cairn-dice-clear').addEventListener('click', () => {
      state.history = [];
      renderDiceList();
      toggleBtn.innerHTML = `<span>🎲</span> <span id="cairn-dice-last-badge">投骰</span>`;
    });

    tray.appendChild(panel);
    tray.appendChild(toggleBtn);
    document.body.appendChild(tray);

    return tray;
  }

  function addDiceRecord(title, resultStr, detailStr) {
    ensureDiceTray();
    state.history.unshift({
      title,
      result: resultStr,
      detail: detailStr,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    });
    if (state.history.length > 5) state.history.pop();

    const panel = document.getElementById('cairn-dice-panel');
    // 尊重用户的收起偏好：仅当面板原本就是展开状态时才保持显示，收起状态下绝不强行弹开打扰阅读
    if (!state.trayCollapsed && panel) {
      panel.style.display = 'flex';
    }

    const badge = document.getElementById('cairn-dice-last-badge');
    if (badge) badge.textContent = `${title}: ${resultStr}`;

    // 悬浮胶囊呼吸发光反馈
    const toggleBtn = document.getElementById('cairn-dice-toggle');
    if (toggleBtn) {
      toggleBtn.classList.remove('cairn-pulse');
      void toggleBtn.offsetWidth;
      toggleBtn.classList.add('cairn-pulse');
    }

    renderDiceList();
  }

  function renderDiceList() {
    const list = document.getElementById('cairn-dice-list');
    if (!list) return;

    if (state.history.length === 0) {
      list.innerHTML = `<div style="color:#6e6d78;font-size:0.775rem;text-align:center;padding:0.75rem 0;">暂无投骰记录</div>`;
      return;
    }

    list.innerHTML = state.history.map((item, idx) => `
      <div style="background:${idx === 0 ? 'rgba(114, 83, 237, 0.15)' : 'rgba(255,255,255,0.03)'};border:1px solid ${idx === 0 ? 'rgba(114, 83, 237, 0.4)' : '#2e2d33'};border-radius:4px;padding:0.35rem 0.5rem;display:flex;justify-content:space-between;align-items:center;">
        <div>
          <div style="font-weight:600;font-size:0.8rem;color:${idx === 0 ? '#a981ff' : '#e6e1e8'}">${item.title}</div>
          <div style="font-size:0.7rem;color:#9e9da6;font-family:var(--sl-font-mono)">${item.detail}</div>
        </div>
        <div style="font-size:1.15rem;font-weight:700;color:#ffffff;font-family:var(--sl-font-mono);">${item.result}</div>
      </div>
    `).join('');
  }

  // ==========================================
  // 2. 正文内联骰子解析 (TreeWalker)
  // ==========================================
  function hydrateDiceNodes() {
    const main = document.querySelector('.sl-markdown-content');
    if (!main) return;

    const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue || !DICE_REGEX.test(node.nodeValue)) return NodeFilter.FILTER_REJECT;
        let parent = node.parentElement;
        while (parent && parent !== main) {
          if (SKIP_TAGS.has(parent.tagName) || parent.classList.contains('dice-roll')) {
            return NodeFilter.FILTER_REJECT;
          }
          parent = parent.parentElement;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach((textNode) => {
      const frag = document.createDocumentFragment();
      let lastIdx = 0;
      const text = textNode.nodeValue;
      DICE_REGEX.lastIndex = 0;
      let match;

      while ((match = DICE_REGEX.exec(text)) !== null) {
        if (match.index > lastIdx) {
          frag.appendChild(document.createTextNode(text.slice(lastIdx, match.index)));
        }
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'dice-roll';
        btn.textContent = match[1];
        btn.dataset.formula = match[1];
        btn.title = `点击投掷 ${match[1]}`;
        btn.style.cssText = 'all:unset;cursor:pointer;font-family:var(--sl-font-mono);font-weight:600;border-bottom:1px dashed var(--sl-color-text-accent);color:var(--sl-color-text-accent);padding:0 2px;transition:all 0.15s ease;';

        btn.addEventListener('mouseenter', () => { btn.style.color = '#ffffff'; btn.style.background = 'rgba(114, 83, 237, 0.25)'; });
        btn.addEventListener('mouseleave', () => { btn.style.color = 'var(--sl-color-text-accent)'; btn.style.background = 'transparent'; });
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const res = rollFormula(btn.dataset.formula);
          if (res) {
            addDiceRecord(btn.dataset.formula.toUpperCase(), res.total, res.detail);
          }
        });

        frag.appendChild(btn);
        lastIdx = DICE_REGEX.lastIndex;
      }
      if (lastIdx < text.length) {
        frag.appendChild(document.createTextNode(text.slice(lastIdx)));
      }
      textNode.parentNode.replaceChild(frag, textNode);
    });
  }

  // ==========================================
  // 3. 随机表格一键点选掷骰 (Table Auto-Roller)
  // ==========================================
  function hydrateTableRollers() {
    const main = document.querySelector('.sl-markdown-content');
    if (!main) return;

    const tables = main.querySelectorAll('table');
    tables.forEach((table) => {
      if (table.dataset.cairnRollerBound) return;
      table.dataset.cairnRollerBound = 'true';

      const thFirst = table.querySelector('thead th:first-child');
      const rows = Array.from(table.querySelectorAll('tbody tr'));
      if (!thFirst || rows.length < 2) return;

      let maxVal = 0;
      let minVal = 999;
      const rowRanges = [];

      rows.forEach((row, idx) => {
        const td = row.querySelector('td:first-child');
        if (!td) return;
        const txt = td.textContent.trim();
        const rangeMatch = txt.match(/^(\d+)(?:\s*[-–—~至]\s*(\d+))?$/);
        if (rangeMatch) {
          const start = parseInt(rangeMatch[1], 10);
          const end = rangeMatch[2] ? parseInt(rangeMatch[2], 10) : start;
          minVal = Math.min(minVal, start);
          maxVal = Math.max(maxVal, end);
          rowRanges.push({ row, start, end, idx });
        } else {
          rowRanges.push({ row, start: idx + 1, end: idx + 1, idx });
        }
      });

      if (rowRanges.length < 2) return;
      if (maxVal === 0) {
        minVal = 1;
        maxVal = rows.length;
      }

      const thText = thFirst.textContent.toLowerCase();
      let diceFormula = `1d${maxVal}`;
      if (thText.includes('2d6')) diceFormula = '2d6';
      else if (thText.includes('d20') || maxVal === 20) diceFormula = '1d20';
      else if (thText.includes('d12') || maxVal === 12) diceFormula = '1d12';
      else if (thText.includes('d10') || maxVal === 10) diceFormula = '1d10';
      else if (thText.includes('d8') || maxVal === 8) diceFormula = '1d8';
      else if (thText.includes('d6') || maxVal === 6) diceFormula = '1d6';
      else if (thText.includes('d66') || maxVal === 66) diceFormula = '1d66';
      else if (thText.includes('d100') || maxVal === 100) diceFormula = '1d100';

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cairn-table-roll-btn';
      btn.innerHTML = `🎲 投点`;
      btn.title = `随机投掷此表 (${diceFormula})`;
      btn.style.cssText = [
        'display:inline-flex',
        'align-items:center',
        'gap:0.25rem',
        'margin-left:0.5rem',
        'padding:0.15rem 0.45rem',
        'font-size:0.75rem',
        'font-weight:600',
        'color:#a981ff',
        'background:rgba(114, 83, 237, 0.15)',
        'border:1px solid rgba(114, 83, 237, 0.4)',
        'border-radius:4px',
        'cursor:pointer',
        'vertical-align:middle',
        'transition:all 0.15s ease'
      ].join(';');

      btn.addEventListener('mouseenter', () => {
        btn.style.background = '#7253ed';
        btn.style.color = '#ffffff';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.background = 'rgba(114, 83, 237, 0.15)';
        btn.style.color = '#a981ff';
      });

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const res = rollFormula(diceFormula);
        if (!res) return;

        let hit = rowRanges.find(r => res.total >= r.start && res.total <= r.end);
        if (!hit) hit = rowRanges[Math.min(res.total - 1, rowRanges.length - 1)];

        if (hit && hit.row) {
          table.querySelectorAll('.cairn-row-highlight').forEach(el => el.classList.remove('cairn-row-highlight'));
          hit.row.classList.add('cairn-row-highlight');
          hit.row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          setTimeout(() => {
            hit.row.classList.remove('cairn-row-highlight');
          }, 2000);
        }

        addDiceRecord(`查表 (${diceFormula})`, res.total, res.detail);
      });

      thFirst.appendChild(btn);
    });
  }

  function runAllHydrations() {
    hydrateDiceNodes();
    hydrateTableRollers();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAllHydrations);
  } else {
    runAllHydrations();
  }

  document.addEventListener('astro:page-load', runAllHydrations);
})();
