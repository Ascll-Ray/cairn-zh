/**
 * Bestiary Instant Filter & Tabletop Quick Search for Starlight TTRPG SRD.
 * Provides instant category filtering (All, Beasts, Undead, Fey...) and live search.
 */
(function () {
  const MONSTER_DATA = {
    '侍僧': { en: 'Acolyte', cat: '类人' },
    '蛛化人': { en: 'Aranea', cat: '类虫' },
    '强盗': { en: 'Bandit', cat: '类人' },
    '报丧女妖': { en: 'Banshee', cat: '神话生物' },
    '石化蜥蜴': { en: 'Basilisk', cat: '蜥蜴' },
    '闪现犬': { en: 'Blink Dog', cat: '魔法生物' },
    '血麋': { en: 'Blood Elk', cat: '野兽' },
    '博格特': { en: 'Boggart', cat: '妖精' },
    '骸骨造物': { en: 'Bone Construct', cat: '构装体' },
    '熊地精': { en: 'Bugbear', cat: '类地精' },
    '掘地恐魔': { en: 'Burrowing Horror', cat: '类虫' },
    '洞穴蝗虫': { en: 'Cave Locust', cat: '类虫' },
    '半人马': { en: 'Centaur', cat: '混种' },
    '卵石猎犬': { en: 'Cobblehounds', cat: '构装体' },
    '蔓生藤蔓': { en: 'Creeping Vines', cat: '植物' },
    '墓穴守卫': { en: 'Crypt Guardian', cat: '亡灵' },
    '树精': { en: 'Dryad', cat: '妖精' },
    '双头巨人': { en: 'Ettin', cat: '巨人' },
    '恐惧之眼': { en: 'Eye of Terror', cat: '异界生物' },
    '霜精灵': { en: 'Frost Elf', cat: '妖精' },
    '石像鬼': { en: 'Gargoyle', cat: '构装体' },
    '凝胶软泥怪': { en: 'Gelatinous Ooze', cat: '异怪' },
    '幽灵': { en: 'Ghost', cat: '亡灵' },
    '食尸鬼': { en: 'Ghoul', cat: '亡灵' },
    '巨蝎': { en: 'Giant Scorpion', cat: '类虫' },
    '豺狼人': { en: 'Gnoll', cat: '类人' },
    '哥布林': { en: 'Goblin', cat: '类地精' },
    '绿龙': { en: 'Green Dragon', cat: '巨兽' },
    '狮鹫': { en: 'Griffon', cat: '神话生物' },
    '灰熊': { en: 'Grizzly Bear', cat: '野兽' },
    '鹰身女妖': { en: 'Harpy', cat: '神话生物' },
    '地狱犬': { en: 'Hellhound', cat: '恶魔' },
    '大地精': { en: 'Hobgoblin', cat: '类地精' },
    '兜帽人': { en: 'Hooded Men', cat: '类人' },
    '九头蛇': { en: 'Hydra', cat: '蜥蜴' },
    '隐形潜猎者': { en: 'Invisible Stalker', cat: '虚体' },
    '杀人蜂': { en: 'Killer Bees', cat: '野兽' },
    '狗头人': { en: 'Kobold', cat: '蜥蜴' },
    '拉弥亚': { en: 'Lamia', cat: '神话生物' },
    '巫妖': { en: 'Lich', cat: '亡灵' },
    '蝎狮': { en: 'Manticore', cat: '混种' },
    '拟形怪': { en: 'Mimic', cat: '异怪' },
    '夺心鞭': { en: 'Mind Lasher', cat: '异界生物' },
    '牛头人': { en: 'Minotaur', cat: '混种' },
    '木乃伊': { en: 'Mummy', cat: '亡灵' },
    '娜迦': { en: 'Naga', cat: '蜥蜴' },
    '夜猫': { en: 'Night Cat', cat: '野兽' },
    '夜鬼婆': { en: 'Night Hag', cat: '妖精' },
    '梦魇': { en: 'Nightmare', cat: '恶魔' },
    '食人魔': { en: 'Ogre', cat: '类地精' },
    '枭熊': { en: 'Owlbear', cat: '混种' },
    '不死鸟': { en: 'Phoenix', cat: '禽鸟' },
    '小妖精': { en: 'Pixie', cat: '妖精' },
    '紫虫': { en: 'Purple Worm', cat: '巨兽' },
    '红帽妖': { en: 'Red Cap', cat: '妖精' },
    '蜥蜴人': { en: 'Reptilian', cat: '蜥蜴' },
    '根地精': { en: 'Root Goblin', cat: '类地精' },
    '根须女巫': { en: 'Root Witch', cat: '植物' },
    '锈蚀怪': { en: 'Rust Monster', cat: '异怪' },
    '海鬼婆': { en: 'Sea Hag', cat: '妖精' },
    '暗影': { en: 'Shadow', cat: '虚体' },
    '蹒跚蔓尸': { en: 'Shambling Mound', cat: '植物' },
    '骷髅': { en: 'Skeleton', cat: '亡灵' },
    '天穹巨人': { en: 'Sky Giant', cat: '巨人' },
    '斯芬克斯': { en: 'Sphinx', cat: '混种' },
    '风暴巨人': { en: 'Storm Giant', cat: '巨人' },
    '猪形怪': { en: 'Swine Thing', cat: '变形者' },
    '泰坦': { en: 'Titan', cat: '巨人' },
    '树人': { en: 'Treant', cat: '植物' },
    '海卫': { en: 'Triton', cat: '类人' },
    '巨魔': { en: 'Troll', cat: '类地精' },
    '独角兽': { en: 'Unicorn', cat: '神话生物' },
    '吸血鬼': { en: 'Vampire', cat: '亡灵' },
    '毒蛇': { en: 'Viper', cat: '野兽' },
    '次元豹': { en: 'Warp Panther', cat: '魔法生物' },
    '战士蜗牛': { en: 'Warrior Snail', cat: '异怪' },
    '水元素': { en: 'Water Elemental', cat: '魔法生物' },
    '狼人': { en: 'Werewolf', cat: '变形者' },
    '尸妖': { en: 'Wight', cat: '亡灵' },
    '鬼火': { en: 'Will-o-Wisp', cat: '妖精' },
    '狼': { en: 'Wolf', cat: '野兽' },
    '木巨魔': { en: 'Wood Troll', cat: '类地精' },
    '双足飞龙': { en: 'Wyvern', cat: '禽鸟' },
    '僵尸': { en: 'Zombie', cat: '亡灵' },
  };

  function toSlug(zh, en) {
    const cleanEn = (en || '').toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
    return `${zh}-${cleanEn}`;
  }

  function initBestiaryFilter() {
    const main = document.querySelector('.sl-markdown-content');
    if (!main) return;

    // Detect Bestiary page
    const categoriesHeading = main.querySelector('h2#怪物分类, h2#monster-categories');
    if (!categoriesHeading) return;

    if (main.dataset.bestiaryFilterBound) return;
    main.dataset.bestiaryFilterBound = 'true';

    // 1. Group each monster into a clean .cairn-monster-entry container
    const allH2 = Array.from(main.querySelectorAll('h2'));
    const monsterH2s = allH2.filter((h) => h !== categoriesHeading);
    if (monsterH2s.length === 0) return;

    const monsterCards = [];

    monsterH2s.forEach((h2) => {
      const card = document.createElement('div');
      card.className = 'cairn-monster-entry';

      // Move h2 and all following siblings until next h2
      const nodesToMove = [h2];
      let sibling = h2.nextSibling;
      while (sibling && sibling.nodeName !== 'H2') {
        const next = sibling.nextSibling;
        nodesToMove.push(sibling);
        sibling = next;
      }

      h2.parentNode.insertBefore(card, h2);
      nodesToMove.forEach((node) => card.appendChild(node));

      // Match monster metadata from dictionary
      const rawTitle = h2.textContent.trim();
      let matchedZh = '';
      for (const zh in MONSTER_DATA) {
        if (rawTitle.startsWith(zh)) {
          matchedZh = zh;
          break;
        }
      }

      const meta = matchedZh ? MONSTER_DATA[matchedZh] : null;
      const category = meta ? meta.cat : '';
      const enName = meta ? meta.en : '';

      // Set bilingual title if not present
      if (meta && !rawTitle.includes(enName)) {
        h2.textContent = `${matchedZh} ${enName}`;
      }

      // Ensure anchor id exists for both Chinese and bilingual slug
      if (meta) {
        const slug = toSlug(matchedZh, enName);
        if (!card.querySelector(`a#${slug}`) && h2.id !== slug) {
          const anchor = document.createElement('a');
          anchor.id = slug;
          card.insertBefore(anchor, h2);
        }
        if (!card.querySelector(`a#${matchedZh}`) && h2.id !== matchedZh) {
          const zhAnchor = document.createElement('a');
          zhAnchor.id = matchedZh;
          card.insertBefore(zhAnchor, h2);
        }
      }

      // Add category meta badge if not present
      if (category && !card.querySelector('.cairn-monster-meta')) {
        const metaBox = document.createElement('div');
        metaBox.className = 'cairn-monster-meta';
        metaBox.innerHTML = `<span class="cairn-monster-cat-tag">${category}</span><span style="color:#a7a5af;font-size:0.8rem">${enName}</span>`;
        h2.parentNode.insertBefore(metaBox, h2.nextSibling);
      }

      // Add back-to-top button
      if (!card.querySelector('.cairn-monster-back-top')) {
        const backBox = document.createElement('div');
        backBox.style.cssText = 'text-align:right;margin-top:0.6rem;';
        backBox.innerHTML = '<a href="#怪物分类" class="cairn-monster-back-top">↑ 返回怪物分类</a>';
        card.appendChild(backBox);
      }

      card.dataset.category = category;
      card.dataset.name = `${rawTitle} ${enName}`.toLowerCase();
      monsterCards.push(card);
    });

    // 2. Build Tabletop Quick Filter UI
    const filterBar = document.createElement('div');
    filterBar.className = 'cairn-bestiary-filter-bar';

    const categories = [
      '全部', '禽鸟', '野兽', '巨兽', '构装体', '恶魔', '异界生物',
      '妖精', '巨人', '类地精', '类人', '混种', '虚体', '类虫',
      '蜥蜴', '魔法生物', '神话生物', '植物', '变形者', '亡灵', '异怪'
    ];

    let currentCategory = '全部';
    let searchQuery = '';

    const searchWrapper = document.createElement('div');
    searchWrapper.style.cssText = 'position:relative;margin-bottom:0.85rem;';

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.className = 'cairn-bestiary-search';
    searchInput.placeholder = '🔍 快速过滤怪物（输入名称或英文原名，如: 哥布林 / Lich / 狼）...';
    searchInput.style.marginBottom = '0';
    searchInput.style.paddingRight = '2.2rem';

    const clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.innerHTML = '✕';
    clearBtn.title = '清除搜索';
    clearBtn.style.cssText = 'position:absolute;right:0.6rem;top:50%;transform:translateY(-50%);background:none;border:none;color:#9e9da6;cursor:pointer;font-size:0.95rem;display:none;padding:2px 6px;line-height:1;transition:color 0.15s ease;';
    clearBtn.addEventListener('mouseenter', () => { clearBtn.style.color = '#ffffff'; });
    clearBtn.addEventListener('mouseleave', () => { clearBtn.style.color = '#9e9da6'; });
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchQuery = '';
      clearBtn.style.display = 'none';
      searchInput.focus();
      updateFilter();
    });

    searchWrapper.appendChild(searchInput);
    searchWrapper.appendChild(clearBtn);

    const chipsContainer = document.createElement('div');
    chipsContainer.className = 'cairn-bestiary-chips';

    const countStatus = document.createElement('div');
    countStatus.className = 'cairn-bestiary-status';

    const emptyState = document.createElement('div');
    emptyState.id = 'cairn-bestiary-empty';
    emptyState.style.cssText = 'border:1px dashed #44434d;border-radius:6px;padding:2rem 1.5rem;text-align:center;color:#9e9da6;margin:2rem 0;display:none;background:rgba(31,30,36,0.5);';
    emptyState.innerHTML = `
      <div style="font-size:1.6rem;margin-bottom:0.4rem;">🔍</div>
      <div style="color:#ffffff;font-weight:600;font-size:0.95rem;margin-bottom:0.35rem;">未找到匹配的怪物</div>
      <div style="font-size:0.825rem;margin-bottom:1rem;color:#8f8e99;">请尝试其他关键词（支持中英双语检索，如 “Goblin” 或 “狼”）</div>
      <button type="button" id="cairn-bestiary-reset-all" style="background:#7253ed;color:#ffffff;border:none;border-radius:4px;padding:0.45rem 1rem;cursor:pointer;font-size:0.825rem;font-weight:600;transition:background 0.15s ease;">重置所有筛选</button>
    `;
    emptyState.querySelector('#cairn-bestiary-reset-all').addEventListener('click', () => {
      resetAllFilters();
    });

    function resetAllFilters() {
      currentCategory = '全部';
      searchQuery = '';
      searchInput.value = '';
      clearBtn.style.display = 'none';
      chipsContainer.querySelectorAll('.cairn-chip-btn').forEach((b) => {
        b.classList.toggle('active', b.textContent === '全部');
      });
      updateFilter();
    }

    function updateFilter() {
      let matchedCount = 0;
      const query = searchQuery.trim().toLowerCase();

      monsterCards.forEach((card) => {
        const matchesCategory = currentCategory === '全部' || card.dataset.category === currentCategory;
        const matchesQuery = !query || card.dataset.name.includes(query) || card.textContent.toLowerCase().includes(query);

        if (matchesCategory && matchesQuery) {
          card.style.display = '';
          matchedCount++;
        } else {
          card.style.display = 'none';
        }
      });

      if (matchedCount === 0) {
        emptyState.style.display = 'block';
      } else {
        emptyState.style.display = 'none';
      }

      countStatus.innerHTML = `<span>当前分类: <strong style="color:#a981ff">${currentCategory}</strong></span><span>匹配 <strong>${matchedCount}</strong> / ${monsterCards.length} 个怪物</span>`;
    }

    categories.forEach((cat) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cairn-chip-btn' + (cat === '全部' ? ' active' : '');
      btn.textContent = cat;
      btn.addEventListener('click', () => {
        currentCategory = cat;
        chipsContainer.querySelectorAll('.cairn-chip-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        updateFilter();
      });
      chipsContainer.appendChild(btn);
    });

    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      clearBtn.style.display = searchQuery ? 'block' : 'none';
      updateFilter();
    });

    filterBar.appendChild(searchWrapper);
    filterBar.appendChild(chipsContainer);
    filterBar.appendChild(countStatus);

    // Insert right after the categories table
    const table = categoriesHeading.nextElementSibling;
    if (table && table.tagName === 'TABLE') {
      table.parentNode.insertBefore(filterBar, table.nextSibling);
      table.parentNode.insertBefore(emptyState, filterBar.nextSibling);
    } else {
      categoriesHeading.parentNode.insertBefore(filterBar, monsterCards[0] || categoriesHeading.nextSibling);
      categoriesHeading.parentNode.insertBefore(emptyState, filterBar.nextSibling);
    }

    // Reset filter when clicking on table anchor links
    if (table) {
      table.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
          if (currentCategory !== '全部' || searchQuery) {
            resetAllFilters();
          }
        });
      });
    }

    updateFilter();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBestiaryFilter);
  } else {
    initBestiaryFilter();
  }
  document.addEventListener('astro:page-load', initBestiaryFilter);
})();
