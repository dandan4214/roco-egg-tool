    let viewStack = ['home'];

    const homeGrid = document.getElementById('homeGroupGrid');
    eggGroupMeta.forEach(meta => {
      const list = petDatabase.filter(p => p.eggGroups.includes(meta.name));
      const previews = list.slice(0, 5).map(p => `
        <div class="img-wrap"><img src="${p.img}" alt=""></div>
      `).join('');
      const div = document.createElement('div');
      div.className = 'group-card';
      div.dataset.group = meta.name;
      div.innerHTML = `
        <div class="group-card-header">
          <div class="group-icon" style="background:${meta.bg};color:${meta.color}">${meta.icon}</div>
          <div>
            <div class="group-name" style="color:${meta.color}">${meta.name}</div>
            <div class="group-count">共 ${groupCounts[meta.name] || 0} 只精灵</div>
          </div>
          <div class="group-egg">🥚</div>
        </div>
        <div class="group-preview">${previews}</div>
      `;
      div.onclick = () => openGroup(meta.name);
      homeGrid.appendChild(div);
    });

    const quickContainer = document.getElementById('quickPets');
    hotPets.forEach(pet => {
      const div = document.createElement('div');
      div.className = 'quick-item';
      div.innerHTML = `<div class="img-wrap"><img src="${pet.img}" alt=""></div><span>${pet.name}</span>`;
      div.onclick = () => openPet(pet.name);
      quickContainer.appendChild(div);
    });

    function switchTab(tab) {
      document.querySelectorAll('.tab-item').forEach(el => el.classList.remove('active'));
      document.getElementById('tab-' + tab).classList.add('active');
      document.querySelectorAll('.view').forEach(el => el.classList.add('hide'));
      if (tab === 'home') {
        document.getElementById('view-home').classList.remove('hide');
        viewStack = ['home'];
      } else if (tab === 'search') {
        document.getElementById('view-search').classList.remove('hide');
        viewStack = ['search'];
      } else if (tab === 'shiny') {
        document.getElementById('view-shiny').classList.remove('hide');
        viewStack = ['shiny'];
      }
      updateTopBar();
    }

    function openGroup(groupName) {
      viewStack.push('group:' + groupName);
      showView('view-group');
      const meta = eggGroupMeta.find(m => m.name === groupName);
      const list = petDatabase.filter(p => p.eggGroups.includes(groupName));
      document.getElementById('groupIcon').textContent = meta ? meta.icon : '🥚';
      document.getElementById('groupIcon').style.background = meta ? meta.bg : '#f2f3f5';
      document.getElementById('groupIcon').style.color = meta ? meta.color : '#323233';
      document.getElementById('groupTitle').textContent = groupName;
      document.getElementById('groupTitle').style.color = meta ? meta.color : '#323233';
      document.getElementById('groupCount').textContent = `共 ${list.length} 只精灵 · 点击精灵查看详情`;
      const statusEl = document.getElementById('groupStatus');
      if (groupName === '无法孵蛋') {
        statusEl.className = 'status-bar status-ban';
        statusEl.innerHTML = '<span>🚫</span><span>该组精灵不能参与孵蛋</span>';
      } else {
        statusEl.className = 'status-bar status-ok';
        statusEl.innerHTML = '<span>✅</span><span>同蛋组精灵可以互相配对孵蛋</span>';
      }
      const grid = document.getElementById('groupPetGrid');
      grid.innerHTML = list.map(p => `
        <div class="pet-item" onclick="openPet('${p.name}')">
          <div class="img-wrap"><img src="${p.img}" alt=""></div>
          <div class="name">${p.name}</div>
        </div>
      `).join('');
      updateTopBar();
    }

    function openPet(name) {
      viewStack.push('pet:' + name);
      showView('view-pet');
      renderPetDetail(name, 'r');
      updateTopBar();
    }

    function showView(viewId) {
      document.querySelectorAll('.view').forEach(el => el.classList.add('hide'));
      document.getElementById(viewId).classList.remove('hide');
      window.scrollTo(0, 0);
    }

    function updateTopBar() {
      const backBtn = document.getElementById('backBtn');
      const searchWrap = document.getElementById('searchWrap');
      const pageTitle = document.getElementById('pageTitle');
      const current = viewStack[viewStack.length - 1];
      const isRoot = current === 'home' || current === 'search' || current === 'shiny';
      if (isRoot) {
        backBtn.classList.remove('visible');
        if (current === 'shiny') {
          searchWrap.classList.add('hide');
          pageTitle.classList.remove('hide');
          pageTitle.textContent = '异色传递';
        } else {
          searchWrap.classList.remove('hide');
          pageTitle.classList.add('hide');
        }
      } else {
        backBtn.classList.add('visible');
        searchWrap.classList.add('hide');
        pageTitle.classList.remove('hide');
        if (current.startsWith('group:')) pageTitle.textContent = current.split(':')[1];
        else if (current.startsWith('pet:')) pageTitle.textContent = '精灵详情';
      }
    }

    function goBack() {
      if (viewStack.length <= 1) return;
      viewStack.pop();
      const prev = viewStack[viewStack.length - 1];
      if (prev === 'home') switchTab('home');
      else if (prev === 'search') switchTab('search');
      else if (prev === 'shiny') switchTab('shiny');
      else if (prev.startsWith('group:')) { showView('view-group'); updateTopBar(); }
      else if (prev.startsWith('pet:')) { showView('view-pet'); updateTopBar(); }
    }

    function renderPetDetail(name, prefix) {
      const pet = petDatabase.find(p => p.name === name);
      if (!pet) return;
      document.getElementById(prefix + '-img').src = pet.img;
      document.getElementById(prefix + '-name').textContent = pet.name;
      document.getElementById(prefix + '-no').textContent = pet.no;
      const tagEl = document.getElementById(prefix + '-tag');
      const statusEl = document.getElementById(prefix + '-status');
      const noteEl = document.getElementById(prefix + '-multi-note');
      const partnerSection = document.getElementById(prefix === 'r' ? 'partnerSection' : 's-partnerSection');
      const partnerGrid = document.getElementById(prefix === 'r' ? 'partnerGrid' : 's-partnerGrid');

      const tagsHtml = pet.eggGroups.map(g => {
        if (g === '无法孵蛋') return '<span class="tag tag-ban">无法孵蛋</span>';
        const meta = eggGroupMeta.find(m => m.name === g);
        return `<span class="tag tag-egg" style="background:${meta ? meta.bg : '#e6f7ff'};color:${meta ? meta.color : '#1989fa'}">${g}</span>`;
      }).join('');
      tagEl.innerHTML = tagsHtml;

      const breedGroups = pet.eggGroups.filter(g => g !== '无法孵蛋');
      const canBreed = breedGroups.length > 0;

      if (canBreed) {
        statusEl.className = 'status-bar status-ok';
        statusEl.innerHTML = '<span>✅</span><span>该精灵可以参与孵蛋</span>';
        partnerSection.classList.remove('hide');
        noteEl.textContent = pet.eggGroups.length > 1 ? '可与任意一个蛋组下的精灵配对' : '';
        const partners = petDatabase.filter(p => {
          if (p.name === pet.name) return false;
          const common = p.eggGroups.filter(g => breedGroups.includes(g));
          return common.length > 0;
        }).slice(0, 20);
        partnerGrid.innerHTML = partners.map(p => `
          <div class="partner-item" onclick="openPet('${p.name}')">
            <div class="img-wrap"><img src="${p.img}" alt=""></div>
            <div class="p-name">${p.name}</div>
          </div>
        `).join('');
      } else {
        statusEl.className = 'status-bar status-ban';
        statusEl.innerHTML = '<span>🚫</span><span>该精灵不能参与孵蛋</span>';
        partnerSection.classList.add('hide');
        noteEl.textContent = '';
      }
    }

    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');

    searchInput.addEventListener('input', function() {
      const val = this.value.trim();
      if (!val) { searchResults.classList.remove('active'); return; }
      const matches = petDatabase.filter(p => p.name.toLowerCase().includes(val.toLowerCase())).slice(0, 20);
      renderSearchResults(matches);
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.top-bar')) {
        searchResults.classList.remove('active');
        if (shinyTargetResults) shinyTargetResults.classList.remove('active');
        const searchOverlay = document.getElementById('searchOverlay');
        if (searchOverlay) searchOverlay.classList.add('hide');
      }
    });

    function renderSearchResults(matches) {
      if (matches.length === 0) {
        searchResults.innerHTML = '<div class="search-item" style="color:#969799;justify-content:center">未找到相关精灵</div>';
      } else {
        searchResults.innerHTML = matches.map(p => `
          <div class="search-item" onclick="selectSearchPet('${p.name}')">
            <img src="${p.img}" alt="">
            <div>
              <div style="font-weight:500;font-size:14px">${p.name}</div>
              <div style="font-size:12px;color:#969799">${p.no} · ${p.eggGroups.join(' · ')}</div>
            </div>
          </div>
        `).join('');
      }
      searchResults.classList.add('active');
    }

    function toggleSearch() {
      const overlay = document.getElementById('searchOverlay');
      if (overlay) {
        overlay.classList.toggle('hide');
        if (!overlay.classList.contains('hide')) {
          overlay.querySelector('input').focus();
        }
      }
    }

    function selectSearchPet(name) {
      searchInput.value = name;
      searchResults.classList.remove('active');
      const searchOverlay = document.getElementById('searchOverlay');
      if (searchOverlay) searchOverlay.classList.add('hide');
      document.getElementById('searchEmpty').classList.add('hide');
      document.getElementById('searchResultCard').classList.remove('hide');
      renderPetDetail(name, 's');
    }
  
    
    // ========== 异色传递功能 ==========
    let shinyOwned = JSON.parse(localStorage.getItem('roco_shiny_owned') || '[]'); // {name, gender}
    let selectedGender = '公';
    let lastShinyResult = null;

    const {shinyPets, femaleOnly, nonBreedable, excluded, aliases, eggGroups} = shinyData;
    const shinyNames = new Set(shinyPets.map(p => p.name));
    const shinyMap = {};
    shinyPets.forEach(p => shinyMap[p.name] = p);
    const femaleOnlySet = new Set(femaleOnly);
    const excludedSet = new Set(excluded);

    // 性别选择
    function selectShinyGender(el) {
      document.querySelectorAll('.gender-btn').forEach(btn => btn.classList.remove('active'));
      el.classList.add('active');
      selectedGender = el.dataset.g;
    }

    // 异色网格选择
    const shinyPickGrid = document.getElementById('shinyPickGrid');
    function renderShinyPickGrid() {
      shinyPickGrid.innerHTML = shinyPets.map(p => {
        const hasMale = shinyOwned.some(o => o.name === p.name && o.gender === '公');
        const hasFemale = shinyOwned.some(o => o.name === p.name && o.gender === '母');
        let selClass = '';
        if (hasMale && hasFemale) selClass = 'selected-both';
        else if (hasMale) selClass = 'selected-male';
        else if (hasFemale) selClass = 'selected-female';
        const badges = [];
        if (hasMale) badges.push('<span class="shiny-pick-badge male">♂</span>');
        if (hasFemale) badges.push('<span class="shiny-pick-badge female">♀</span>');
        const imgWrap = `<div class="img-wrap ${(hasMale || hasFemale) ? 'shiny-glow' : ''}">
          <img src="${p.avatar}" alt="">
          ${badges.length ? `<div class="shiny-pick-badges">${badges.join('')}</div>` : ''}
        </div>`;
        return `
          <div class="shiny-pick-item ${selClass}" onclick="toggleShinyOwned('${p.name}')">
            ${imgWrap}
            <div class="name">${p.name}</div>
          </div>
        `;
      }).join('');
    }
    renderShinyPickGrid();

    // 恢复本地保存的异色数据
    if (shinyOwned.length > 0) {
      renderShinyOwnedList();
      calculateShiny();
    }

    function saveShinyOwned() {
      localStorage.setItem('roco_shiny_owned', JSON.stringify(shinyOwned));
    }

    function toggleShinyOwned(name) {
      const idx = shinyOwned.findIndex(o => o.name === name && o.gender === selectedGender);
      if (idx >= 0) {
        shinyOwned.splice(idx, 1);
      } else {
        shinyOwned.push({name, gender: selectedGender});
      }
      renderShinyPickGrid();
      renderShinyOwnedList();
      saveShinyOwned();
      if (shinyOwned.length > 0) calculateShiny();
      else {
        document.getElementById('shinyResultCard').classList.add('hide');
        document.getElementById('shinyTargetCard').classList.add('hide');
        document.getElementById('shinyRouteCard').classList.add('hide');
      }
    }

    function removeShinyOwned(name, gender) {
      const idx = shinyOwned.findIndex(o => o.name === name && o.gender === gender);
      if (idx >= 0) {
        shinyOwned.splice(idx, 1);
        renderShinyPickGrid();
        renderShinyOwnedList();
        saveShinyOwned();
        if (shinyOwned.length > 0) calculateShiny();
        else {
          document.getElementById('shinyResultCard').classList.add('hide');
          document.getElementById('shinyTargetCard').classList.add('hide');
          document.getElementById('shinyRouteCard').classList.add('hide');
        }
      }
    }

    function renderShinyOwnedList() {
      const listEl = document.getElementById('shinyOwnedList');
      const tipEl = document.getElementById('shinyOwnedTip');
      if (shinyOwned.length === 0) {
        listEl.innerHTML = '';
        tipEl.style.display = 'block';
        return;
      }
      tipEl.style.display = 'none';
      listEl.innerHTML = shinyOwned.map(o => {
        const pet = shinyMap[o.name];
        return `
          <div class="owned-chip">
            <div class="img-wrap" style="width:20px;height:20px;border-radius:4px;overflow:hidden;background:#fff;display:flex;align-items:center;justify-content:center;">
              <img src="${pet.avatar}" style="width:90%;height:90%;object-fit:contain;" alt="">
            </div>
            <span>${o.name}</span>
            <span class="gender">${o.gender === '公' ? '♂' : '♀'}</span>
            <span class="close" onclick="removeShinyOwned('${o.name}', '${o.gender}')">✕</span>
          </div>
        `;
      }).join('');
    }

    // 核心：异色传递SPFA计算
    function calculateShiny() {
      if (shinyOwned.length === 0) {
        alert('请先添加至少一只异色宠物');
        return;
      }

      const dist = {};
      const prev = {};

      // 初始化：已拥有的异色距离为0
      shinyOwned.forEach(o => {
        dist[o.name] = 0;
        prev[o.name] = null;
      });

      // 迭代松弛（图很小，多轮直到稳定）
      let changed = true;
      while (changed) {
        changed = false;
        for (const u of Object.keys(dist)) {
          const entry = shinyMap[u];
          if (!entry) continue;

          // u作为传递源的准备成本
          const ownedEntries = shinyOwned.filter(o => o.name === u);
          const hasMaleOwned = ownedEntries.some(o => o.gender === '公');
          let sourceCost = 0;
          if (hasMaleOwned) {
            sourceCost = 0;
          } else if (ownedEntries.length > 0) {
            // 只有母的拥有
            if (femaleOnlySet.has(u)) sourceCost = Infinity;
            else sourceCost = 1; // 母的非限定需要孵出公的
          } else {
            // u是通过传递获得的（获得的是母的）
            if (femaleOnlySet.has(u)) sourceCost = Infinity;
            else sourceCost = 1;
          }

          if (!isFinite(sourceCost)) continue;

          for (const v of entry.maleCandidates) {
            if (excludedSet.has(v)) continue;
            const newDist = dist[u] + sourceCost + 1;
            if (!(v in dist) || newDist < dist[v]) {
              dist[v] = newDist;
              prev[v] = u;
              changed = true;
            }
          }
        }
      }

      lastShinyResult = {dist, prev};

      const ownedNames = new Set(shinyOwned.map(o => o.name));
      const lightable = [];
      const missing = [];

      shinyPets.forEach(p => {
        if (ownedNames.has(p.name)) return;
        if (p.name in dist) {
          lightable.push({...p, chainLen: dist[p.name]});
        } else {
          missing.push(p);
        }
      });

      lightable.sort((a, b) => a.chainLen - b.chainLen);

      const statOwned = document.getElementById('stat-owned');
      const statLight = document.getElementById('stat-light');
      const statMiss = document.getElementById('stat-miss');
      statOwned.textContent = ownedNames.size;
      statLight.textContent = lightable.length;
      statMiss.textContent = missing.length;
      [statOwned, statLight, statMiss].forEach(el => el.classList.add('stat-gold'));

      const statusEl = document.getElementById('shinyCollectStatus');
      if (missing.length === 0) {
        statusEl.className = 'status-bar status-ok';
        statusEl.innerHTML = '<span>✅</span><span>通过传递可收集全部异色</span>';
      } else {
        statusEl.className = 'status-bar status-ban';
        statusEl.innerHTML = '<span>🚫</span><span>仍有部分异色无法通过传递获得</span>';
      }

      // 可点亮
      document.getElementById('shinyLightGrid').innerHTML = lightable.map(p => `
        <div class="shiny-item" onclick="showShinyChain('${p.name}')">
          <div class="img-wrap"><img src="${p.avatar}" alt=""></div>
          <div class="name">${p.name}</div>
          <div class="shiny-badge">${p.chainLen}步</div>
        </div>
      `).join('');

      // 缺失
      document.getElementById('shinyMissGrid').innerHTML = missing.map(p => `
        <div class="shiny-item dimmed" onclick="showShinyChain('${p.name}')">
          <div class="img-wrap"><img src="${p.avatar}" alt=""></div>
          <div class="name">${p.name}</div>
        </div>
      `).join('');

      document.getElementById('shinyResultCard').classList.remove('hide');
      document.getElementById('shinyTargetCard').classList.remove('hide');
      document.getElementById('shinyRouteCard').classList.remove('hide');

      renderShinyRoute(lightable, ownedNames);
    }

    function renderShinyRoute(lightable, ownedNames) {
      const routeBox = document.getElementById('shinyRouteBox');

      if (lightable.length === 0) {
        routeBox.innerHTML = '<div style="text-align:center;color:#969799;padding:10px;">已拥有全部可传递异色</div>';
        return;
      }

      const layers = {};
      lightable.forEach(p => {
        const d = p.chainLen;
        if (!layers[d]) layers[d] = [];
        layers[d].push(p);
      });
      const sortedDs = Object.keys(layers).map(Number).sort((a, b) => a - b);

      routeBox.innerHTML = sortedDs.map(d => {
        const list = layers[d];
        return `
          <div class="layer-group">
            <div class="layer-title">第 ${d} 步 · 共 ${list.length} 只</div>
            <div class="shiny-grid">
              ${list.map(p => `
                <div class="shiny-item" onclick="selectShinyTarget('${p.name}')">
                  <div class="img-wrap"><img src="${p.avatar}" alt=""></div>
                  <div class="name">${p.name}</div>
                  <div class="shiny-badge">${d}步</div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }).join('');
    }

    function getSharedEggGroups(nameA, nameB) {
      const petA = petDatabase.find(p => p.name === nameA);
      const petB = petDatabase.find(p => p.name === nameB);
      if (!petA || !petB) return [];
      return petA.eggGroups.filter(g => g !== '无法孵蛋' && petB.eggGroups.includes(g));
    }

    function showShinyChain(targetName) {
      if (!lastShinyResult) return;
      const {dist, prev} = lastShinyResult;

      if (!(targetName in dist)) {
        document.getElementById('shinyChainBox').innerHTML = '<div style="color:#969799;font-size:13px;padding:6px;">该目标无法通过传递获得</div>';
        return;
      }

      const path = [];
      let cur = targetName;
      while (cur) {
        path.unshift(cur);
        cur = prev[cur];
      }

      function getSourceCostForStep(name) {
        const ownedEntries = shinyOwned.filter(o => o.name === name);
        const hasMale = ownedEntries.some(o => o.gender === '公');
        if (hasMale) return 0;
        if (ownedEntries.length > 0) {
          if (femaleOnlySet.has(name)) return Infinity;
          return 1;
        }
        if (femaleOnlySet.has(name)) return Infinity;
        return 1;
      }

      const steps = [];
      for (let i = 0; i < path.length - 1; i++) {
        const u = path[i];
        const v = path[i + 1];
        const sourceCost = getSourceCostForStep(u);
        steps.push({u, v, needPrep: sourceCost === 1});
      }

      function renderChainNode(step) {
        const uPet = shinyMap[step.u];
        const vPet = shinyMap[step.v];
        const items = [];
        if (step.needPrep) {
          items.push(`
            <div class="tree-mini">
              <img src="${uPet.avatar}" alt=""><span>母的${step.u}</span>
              <span class="arrow">+</span>
              <img src="${uPet.avatar}" alt=""><span>公的${step.u}</span>
              <span class="arrow">→</span>
              <img src="${uPet.avatar}" alt=""><span class="result">公的${step.u}</span>
            </div>
          `);
        }
        items.push(`
          <div class="tree-mini">
            <img src="${uPet.avatar}" alt=""><span>公的${step.u}</span>
            <span class="arrow">+</span>
            <img src="${vPet.avatar}" alt=""><span>母的${step.v}</span>
            <span class="arrow">→</span>
            <img src="${vPet.avatar}" alt=""><span class="result">${step.v}</span>
          </div>
        `);
        return `<div class="tree-mini-row">${items.join('')}</div>`;
      }

      const html = steps.map((s, idx) => `
        <div class="tree-layer">
          <div class="tree-layer-title">第 ${idx + 1} 步</div>
          ${renderChainNode(s)}
        </div>
      `).join('');

      document.getElementById('shinyChainBox').innerHTML = `
        <div style="font-size:13px;font-weight:500;margin-bottom:10px;text-align:center;">最短路线：共 ${dist[targetName]} 步孵化操作</div>
        ${html}
      `;

      document.getElementById('shinyTargetInput').value = targetName;
    }

    // 目标搜索
    const shinyTargetInput = document.getElementById('shinyTargetInput');
    const shinyTargetResults = document.getElementById('shinyTargetResults');

    shinyTargetInput.addEventListener('input', function() {
      const val = this.value.trim();
      if (!val) {
        shinyTargetResults.classList.remove('active');
        return;
      }
      const matches = shinyPets.filter(p => p.name.toLowerCase().includes(val.toLowerCase())).slice(0, 10);
      if (matches.length === 0) {
        shinyTargetResults.innerHTML = '<div class="search-item" style="color:#969799;justify-content:center">未找到</div>';
      } else {
        shinyTargetResults.innerHTML = matches.map(p => `
          <div class="search-item" onclick="selectShinyTarget('${p.name}')">
            <div class="img-wrap" style="width:40px;height:40px;border-radius:8px;background:#f7f8fa;overflow:hidden;display:flex;align-items:center;justify-content:center;">
              <img src="${p.avatar}" alt="" style="width:90%;height:90%;object-fit:contain;">
            </div>
            <div style="font-weight:500;">${p.name}</div>
          </div>
        `).join('');
      }
      shinyTargetResults.classList.add('active');
    });

    function selectShinyTarget(name) {
      shinyTargetInput.value = name;
      shinyTargetResults.classList.remove('active');
      document.getElementById('shinyTargetCard').classList.remove('hide');
      showShinyChain(name);
      setTimeout(() => {
        document.getElementById('shinyTargetCard').scrollIntoView({behavior: 'smooth', block: 'start'});
      }, 50);
    }
