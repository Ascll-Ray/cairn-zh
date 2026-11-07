/**
 * Zero-dependency OSR Tabletop Dice Roller for Starlight SRD.
 * Safely parses text nodes via TreeWalker without corrupting DOM attributes.
 */
(function () {
  const DICE_REGEX = /\b(\d*d(?:4|6|8|10|12|20|66|100)(?:\s*[+\-]\s*\d+)?)\b/gi;
  const SKIP_TAGS = new Set(['CODE', 'PRE', 'A', 'BUTTON', 'SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT']);

  function rollFormula(formula) {
    const clean = formula.toLowerCase().replace(/\s+/g, '');
    const match = clean.match(/^(\d*)d(\d+)([+\-]\d+)?$/);
    if (!match) return null;

    const count = match[1] ? parseInt(match[1], 10) : 1;
    const sides = parseInt(match[2], 10);
    const mod = match[3] ? parseInt(match[3], 10) : 0;

    if (sides === 66) {
      const tens = Math.floor(Math.random() * 6) + 1;
      const ones = Math.floor(Math.random() * 6) + 1;
      return { total: tens * 10 + ones, detail: `[${tens}, ${ones}]` };
    }

    const rolls = [];
    let sum = 0;
    for (let i = 0; i < Math.min(count, 50); i++) {
      const r = Math.floor(Math.random() * sides) + 1;
      rolls.push(r);
      sum += r;
    }
    const total = sum + mod;
    const modStr = mod > 0 ? `+${mod}` : mod < 0 ? `${mod}` : '';
    return { total, detail: `[${rolls.join(', ')}]${modStr}` };
  }

  function showToast(formula, result) {
    let toast = document.getElementById('osr-dice-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'osr-dice-toast';
      toast.style.cssText = [
        'position:fixed', 'bottom:1.5rem', 'right:1.5rem', 'z-index:9999',
        'padding:0.75rem 1.25rem', 'border:2px double var(--sl-color-text)',
        'background:var(--sl-color-bg-sidebar)', 'color:var(--sl-color-text)',
        'font-family:var(--sl-font-mono)', 'font-size:0.9rem',
        'box-shadow:0 4px 12px rgba(0,0,0,0.4)', 'cursor:pointer',
        'transition:opacity 0.2s ease'
      ].join(';');
      toast.title = 'Click to dismiss';
      toast.addEventListener('click', () => { toast.style.opacity = '0'; });
      document.body.appendChild(toast);
    }
    toast.style.opacity = '1';
    toast.innerHTML = `<div><strong>ROLL ${formula.toUpperCase()}</strong></div>` +
      `<div style="font-size:1.4rem;font-weight:700;color:var(--sl-color-text-accent)">Result: ${result.total}</div>` +
      `<div style="font-size:0.75rem;opacity:0.75">Dice: ${result.detail}</div>`;
  }

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
        btn.style.cssText = 'all:unset;cursor:pointer;font-family:var(--sl-font-mono);font-weight:600;border-bottom:1px dashed var(--sl-color-text-accent);color:var(--sl-color-text-accent);padding:0 2px;';
        btn.addEventListener('click', () => {
          const res = rollFormula(btn.dataset.formula);
          if (res) showToast(btn.dataset.formula, res);
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

  document.addEventListener('DOMContentLoaded', hydrateDiceNodes);
})();
