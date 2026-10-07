const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const ui = {
  healthValue: document.getElementById("healthValue"),
  shieldValue: document.getElementById("shieldValue"),
  goldValue: document.getElementById("goldValue"),
  waveValue: document.getElementById("waveValue"),
  timeValue: document.getElementById("timeValue"),
  shopTimerValue: document.getElementById("shopTimerValue"),
  healthBar: document.getElementById("healthBar"),
  shieldBar: document.getElementById("shieldBar"),
  statsList: document.getElementById("statsList"),
  weaponList: document.getElementById("weaponList"),
  upgradeList: document.getElementById("upgradeList"),
  overlayMessage: document.getElementById("overlayMessage"),
  shopModal: document.getElementById("shopModal"),
  shopChoices: document.getElementById("shopChoices"),
  shopGoldLabel: document.getElementById("shopGoldLabel"),
  shopHint: document.getElementById("shopHint"),
  rerollButton: document.getElementById("rerollButton"),
  skipShopButton: document.getElementById("skipShopButton"),
  pauseButton: document.getElementById("pauseButton"),
  restartButton: document.getElementById("restartButton"),
};

const center = { x: canvas.width / 2, y: canvas.height / 2 };

const RARITY_COLORS = {
  Common: "#94a8bf",
  Uncommon: "#56c476",
  Rare: "#7980ff",
  Epic: "#d470ff",
};

const RARITY_PRICES = {
  Common: 80,
  Uncommon: 140,
  Rare: 220,
  Epic: 320,
};

const WEAPON_POOL = [
  {
    id: "bow",
    name: "Bow",
    rarity: "Common",
    attackType: "single",
    damageType: "Piercing",
    damage: 100,
    cooldown: 0.95,
    range: 270,
    color: "#d7efff",
    description: "Fast single-target arrows with reliable range.",
  },
  {
    id: "magicMissile",
    name: "Magic Missile",
    rarity: "Common",
    attackType: "single",
    damageType: "Magic",
    damage: 105,
    cooldown: 0.9,
    range: 260,
    color: "#8ab0ff",
    description: "Simple magic bolts that scale well with generic damage.",
  },
  {
    id: "frostBow",
    name: "Frost Bow",
    rarity: "Uncommon",
    attackType: "single",
    damageType: "Piercing",
    damage: 180,
    cooldown: 0.62,
    range: 290,
    color: "#91e7ff",
    status: { kind: "frost", amount: 12 },
    description: "Applies frost stacks and slows targets.",
  },
  {
    id: "arcaneBall",
    name: "Arcane Ball",
    rarity: "Uncommon",
    attackType: "splash",
    damageType: "Magic",
    damage: 320,
    cooldown: 1.2,
    range: 315,
    splashRadius: 55,
    color: "#b08cff",
    description: "Explodes on impact for area magic damage.",
  },
  {
    id: "mortarLauncher",
    name: "Mortar Launcher",
    rarity: "Uncommon",
    attackType: "splash",
    damageType: "Siege",
    damage: 600,
    cooldown: 1.9,
    range: 360,
    splashRadius: 75,
    color: "#ffbc7d",
    description: "Heavy siege blasts punish clumped waves.",
  },
  {
    id: "missileBarrage",
    name: "Missile Barrage",
    rarity: "Uncommon",
    attackType: "barrage",
    damageType: "Siege",
    damage: 130,
    cooldown: 0.92,
    range: 320,
    barrageCount: 4,
    color: "#ff9f68",
    description: "Splits into multiple tracking rockets.",
  },
  {
    id: "quills",
    name: "Quills",
    rarity: "Uncommon",
    attackType: "aura",
    damageType: "Normal",
    damage: 135,
    cooldown: 0.5,
    range: 150,
    color: "#ffe6aa",
    description: "Continuous short-range spray around the tower.",
  },
  {
    id: "bouncyCannonball",
    name: "Bouncy Cannonball",
    rarity: "Rare",
    attackType: "bounce",
    damageType: "Siege",
    damage: 420,
    cooldown: 1.8,
    range: 360,
    bounces: 4,
    color: "#ffd27a",
    description: "Chains between multiple targets for high wave clear.",
  },
  {
    id: "iceSpears",
    name: "Ice Spears",
    rarity: "Rare",
    attackType: "barrage",
    damageType: "Frost",
    damage: 260,
    cooldown: 1.4,
    range: 230,
    barrageCount: 4,
    color: "#86f4ff",
    status: { kind: "frost", amount: 18 },
    description: "Fires several icy spears and freezes after enough stacks.",
  },
  {
    id: "poisonSpear",
    name: "Poison Spear",
    rarity: "Rare",
    attackType: "single",
    damageType: "Poison",
    damage: 800,
    cooldown: 1.05,
    range: 220,
    color: "#87d768",
    status: { kind: "poison", amount: 320 },
    description: "High damage spear that adds a poison damage-over-time effect.",
  },
  {
    id: "necromancersTome",
    name: "Necromancer's Tome",
    rarity: "Rare",
    attackType: "aura",
    damageType: "Chaos",
    damage: 460,
    cooldown: 1.5,
    range: 205,
    color: "#d189ff",
    description: "A cursed orbit burns down everything near the tower.",
  },
  {
    id: "flamethrower",
    name: "Flamethrower",
    rarity: "Epic",
    attackType: "beam",
    damageType: "Fire",
    damage: 145,
    cooldown: 0.13,
    range: 235,
    color: "#ff845c",
    status: { kind: "burn", amount: 36 },
    description: "Rapid fire stream that stacks burn very quickly.",
  },
];

const UPGRADE_POOL = [
  {
    id: "magicCoin",
    name: "Magic Coin",
    rarity: "Common",
    category: "Income",
    description: "+5 gold per second.",
    apply: (tower) => {
      tower.goldPerSecond += 5;
    },
  },
  {
    id: "goldMine",
    name: "Gold Mine",
    rarity: "Uncommon",
    category: "Income",
    description: "+10 gold per second and +10% income.",
    apply: (tower) => {
      tower.goldPerSecond += 10;
      tower.incomeMultiplier += 0.1;
    },
  },
  {
    id: "improvedAttacks",
    name: "Improved Attacks",
    rarity: "Common",
    category: "Damage",
    description: "+8% all damage.",
    apply: (tower) => {
      tower.damageMultiplier += 0.08;
    },
  },
  {
    id: "rapidfire",
    name: "Rapidfire",
    rarity: "Uncommon",
    category: "Attack Speed",
    description: "+12% attack speed.",
    apply: (tower) => {
      tower.attackSpeedMultiplier += 0.12;
    },
  },
  {
    id: "improvedMasonry",
    name: "Improved Masonry",
    rarity: "Common",
    category: "HP",
    description: "+500 max health and heal 500.",
    apply: (tower) => {
      tower.maxHp += 500;
      tower.hp = Math.min(tower.maxHp, tower.hp + 500);
    },
  },
  {
    id: "repairCrew",
    name: "Repair Crew",
    rarity: "Common",
    category: "Regen",
    description: "+20 health regeneration.",
    apply: (tower) => {
      tower.regen += 20;
    },
  },
  {
    id: "spikedBarricades",
    name: "Spiked Barricades",
    rarity: "Common",
    category: "Spikes",
    description: "+25 spikes damage.",
    apply: (tower) => {
      tower.spikes += 25;
    },
  },
  {
    id: "criticalStrike",
    name: "Critical Strike",
    rarity: "Uncommon",
    category: "Critical",
    description: "+5% critical chance.",
    apply: (tower) => {
      tower.critChance += 0.05;
    },
  },
  {
    id: "criticalDecimation",
    name: "Critical Decimation",
    rarity: "Rare",
    category: "Critical",
    description: "+10% critical chance and +20% critical power.",
    apply: (tower) => {
      tower.critChance += 0.1;
      tower.critPower += 0.2;
    },
  },
  {
    id: "bountyHunter",
    name: "Bounty Hunter",
    rarity: "Uncommon",
    category: "Bounty",
    description: "+50% kill bounty.",
    apply: (tower) => {
      tower.bountyMultiplier += 0.5;
    },
  },
  {
    id: "manaShield",
    name: "Mana Shield",
    rarity: "Common",
    category: "Defense",
    description: "+1000 mana shield.",
    apply: (tower) => {
      tower.manaShieldMax += 1000;
      tower.manaShield += 1000;
    },
  },
  {
    id: "mawOfDeath",
    name: "Maw of Death",
    rarity: "Uncommon",
    category: "Defense",
    description: "+1500 mana shield and restore 15 shield on kill.",
    apply: (tower) => {
      tower.manaShieldMax += 1500;
      tower.manaShield += 1500;
      tower.manaOnKill += 15;
    },
  },
  {
    id: "maskOfDeath",
    name: "Mask of Death",
    rarity: "Uncommon",
    category: "Sustain",
    description: "+1000 max health and heal 20 on kill.",
    apply: (tower) => {
      tower.maxHp += 1000;
      tower.hp += 1000;
      tower.healOnKill += 20;
    },
  },
  {
    id: "reactiveArmor",
    name: "Reactive Armor",
    rarity: "Rare",
    category: "Armor",
    description: "+10 armor and gain scaling armor while attacked.",
    apply: (tower) => {
      tower.armor += 10;
      tower.reactiveArmor += 0.18;
    },
  },
  {
    id: "powerGenerator",
    name: "Power Generator",
    rarity: "Uncommon",
    category: "Scaling",
    description: "+2% damage and +1% more every 30 seconds.",
    apply: (tower) => {
      tower.damageMultiplier += 0.02;
      tower.powerGeneratorStacks += 1;
    },
  },
  {
    id: "focusfire",
    name: "Focusfire",
    rarity: "Rare",
    category: "Damage",
    description: "+22% damage for single-target weapons.",
    apply: (tower) => {
      tower.singleTargetBonus += 0.22;
    },
  },
  {
    id: "shatter",
    name: "Shatter",
    rarity: "Rare",
    category: "Frost",
    description: "+25% damage against frozen enemies.",
    apply: (tower) => {
      tower.shatterBonus += 0.25;
    },
  },
  {
    id: "moltenSpikes",
    name: "Molten Spikes",
    rarity: "Rare",
    category: "Spikes",
    description: "+60 spikes and attackers may ignite.",
    apply: (tower) => {
      tower.spikes += 60;
      tower.moltenSpikes = true;
    },
  },
];

const state = {};
let lastFrame = performance.now();

function createTower() {
  return {
    x: center.x,
    y: center.y,
    radius: 31,
    maxHp: 4000,
    hp: 4000,
    regen: 8,
    armor: 0,
    manaShieldMax: 0,
    manaShield: 0,
    gold: 250,
    goldPerSecond: 8,
    incomeMultiplier: 1,
    bountyMultiplier: 1,
    damageMultiplier: 1,
    attackSpeedMultiplier: 1,
    critChance: 0.05,
    critPower: 1.5,
    spikes: 0,
    healOnKill: 0,
    manaOnKill: 0,
    reactiveArmor: 0,
    reactiveArmorBonus: 0,
    powerGeneratorStacks: 0,
    singleTargetBonus: 0,
    shatterBonus: 0,
    moltenSpikes: false,
  };
}

function resetGame() {
  state.time = 0;
  state.wave = 1;
  state.enemies = [];
  state.projectiles = [];
  state.effects = [];
  state.floatingTexts = [];
  state.mines = [];
  state.activeWeapons = [];
  state.upgradeCounts = {};
  state.tower = createTower();
  state.spawnTimer = 0;
  state.incomeTimer = 0;
  state.shopInterval = 24;
  state.nextShopAt = state.shopInterval;
  state.shopOpen = false;
  state.shopOffers = [];
  state.paused = false;
  state.gameOver = false;
  state.victory = false;
  state.killCount = 0;
  state.rerollCost = 50;
  state.message = "";
  state.shockwaves = [];

  addWeaponById("bow");
  addWeaponById("magicMissile");
  addUpgradeById("magicCoin");
  closeShop();
  setOverlay("");
  updateSidebar();
  updateHud();
}

function findWeaponDef(id) {
  return WEAPON_POOL.find((weapon) => weapon.id === id);
}

function findUpgradeDef(id) {
  return UPGRADE_POOL.find((upgrade) => upgrade.id === id);
}

function addWeaponById(id) {
  const def = findWeaponDef(id);
  if (!def) {
    return;
  }
  const existing = state.activeWeapons.find((weapon) => weapon.id === id);
  if (existing) {
    existing.level += 1;
    existing.cooldownRemaining = Math.min(existing.cooldownRemaining, 0.2);
  } else {
    state.activeWeapons.push({
      id: def.id,
      level: 1,
      cooldownRemaining: Math.random() * def.cooldown,
      orbitAngle: Math.random() * Math.PI * 2,
    });
  }
}

function addUpgradeById(id) {
  const def = findUpgradeDef(id);
  if (!def) {
    return;
  }
  def.apply(state.tower);
  state.upgradeCounts[id] = (state.upgradeCounts[id] || 0) + 1;
}

function rarityWeight(rarity) {
  const elapsed = state.time;
  if (rarity === "Common") {
    return Math.max(1, 56 - elapsed * 0.05);
  }
  if (rarity === "Uncommon") {
    return 28 + elapsed * 0.035;
  }
  if (rarity === "Rare") {
    return 10 + elapsed * 0.025;
  }
  return 2 + elapsed * 0.012;
}

function weightedPick(items) {
  const weights = items.map((item) => rarityWeight(item.rarity));
  const total = weights.reduce((sum, value) => sum + value, 0);
  let roll = Math.random() * total;
  for (let index = 0; index < items.length; index += 1) {
    roll -= weights[index];
    if (roll <= 0) {
      return items[index];
    }
  }
  return items[items.length - 1];
}

function generateShopOffers() {
  const offerMap = new Map();
  const combinedPool = [
    ...WEAPON_POOL.map((item) => ({ ...item, kind: "weapon" })),
    ...UPGRADE_POOL.map((item) => ({ ...item, kind: "upgrade" })),
  ];

  // Generate a fresh set every time the timed shop opens or is rerolled.
  while (offerMap.size < 4) {
    const choice = weightedPick(combinedPool);
    offerMap.set(`${choice.kind}:${choice.id}`, choice);
  }

  return [...offerMap.values()];
}

function openShop() {
  // A timed-shop event always gets a brand-new set immediately.
  state.shopOffers = generateShopOffers();
  state.shopOpen = true;
  state.paused = true;
  ui.shopModal.classList.remove("hidden");
  renderShop();
}

function closeShop() {
  state.shopOpen = false;
  if (!state.gameOver && !state.victory) {
    state.paused = false;
  }
  ui.shopModal.classList.add("hidden");
}

function buyOffer(kind, id, price) {
  if (state.tower.gold < price) {
    flashMessage("Not enough gold");
    return;
  }
  state.tower.gold -= price;
  if (kind === "weapon") {
    addWeaponById(id);
  } else {
    addUpgradeById(id);
  }
  updateSidebar();
  updateHud();
  closeShop();
  state.nextShopAt = state.time + state.shopInterval;
}

function rerollShop() {
  if (state.tower.gold < state.rerollCost) {
    flashMessage("Need more gold to reroll");
    return;
  }
  state.tower.gold -= state.rerollCost;
  state.shopOffers = generateShopOffers();
  renderShop();
  updateHud();
}

function formatPercent(value) {
  return `${Math.round(value * 100)}%`;
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function setOverlay(message) {
  if (!message) {
    ui.overlayMessage.classList.add("hidden");
    ui.overlayMessage.textContent = "";
    return;
  }
  ui.overlayMessage.textContent = message;
  ui.overlayMessage.classList.remove("hidden");
}

function flashMessage(message) {
  state.message = message;
  state.messageTimer = 1.2;
}

function renderShop() {
  ui.shopGoldLabel.textContent = `Gold: ${Math.floor(state.tower.gold)}`;
  ui.shopChoices.innerHTML = "";

  state.shopOffers.forEach((offer) => {
    const card = document.createElement("button");
    const price = RARITY_PRICES[offer.rarity];
    const affordable = state.tower.gold >= price;
    card.type = "button";
    card.className = `shop-choice ${offer.rarity.toLowerCase()} ${affordable ? "" : "disabled"}`;
    card.disabled = !affordable;
    const levelText =
      offer.kind === "weapon"
        ? `Owned: ${state.activeWeapons.find((weapon) => weapon.id === offer.id)?.level || 0}`
        : `Stacks: ${state.upgradeCounts[offer.id] || 0}`;
    card.innerHTML = `
      <div>
        <strong>${offer.name}</strong>
        <span class="rarity-chip ${offer.rarity.toLowerCase()}">${offer.rarity}</span>
      </div>
      <p class="meta">${offer.kind === "weapon" ? offer.damageType : offer.category} | ${levelText}</p>
      <p class="description">${offer.description}</p>
      <div class="price">
        <span>${offer.kind === "weapon" ? "Weapon" : "Upgrade"}</span>
        <span>${price}g</span>
      </div>
    `;
    card.addEventListener("click", () => buyOffer(offer.kind, offer.id, price));
    ui.shopChoices.appendChild(card);
  });
}

function updateHud() {
  const tower = state.tower;
  ui.healthValue.textContent = `${Math.ceil(tower.hp)} / ${tower.maxHp}`;
  ui.shieldValue.textContent = `${Math.ceil(tower.manaShield)} / ${tower.manaShieldMax}`;
  ui.goldValue.textContent = Math.floor(tower.gold);
  ui.waveValue.textContent = String(state.wave);
  ui.timeValue.textContent = formatTime(state.time);
  ui.shopTimerValue.textContent = state.shopOpen
    ? "Open"
    : `${Math.max(0, Math.ceil(state.nextShopAt - state.time))}s`;
  ui.healthBar.style.width = `${Math.max(0, (tower.hp / tower.maxHp) * 100)}%`;
  ui.shieldBar.style.width = tower.manaShieldMax
    ? `${Math.max(0, (tower.manaShield / tower.manaShieldMax) * 100)}%`
    : "0%";
}

function buildRarityChip(rarity) {
  return `<span class="rarity-chip ${rarity.toLowerCase()}">${rarity}</span>`;
}

function updateSidebar() {
  const tower = state.tower;
  const stats = [
    ["Damage", formatPercent(tower.damageMultiplier)],
    ["Attack Speed", formatPercent(tower.attackSpeedMultiplier)],
    ["Crit Chance", formatPercent(tower.critChance)],
    ["Crit Power", formatPercent(tower.critPower - 1)],
    ["Gold / sec", `${Math.round(tower.goldPerSecond * tower.incomeMultiplier)}`],
    ["Bounty", formatPercent(tower.bountyMultiplier)],
    ["Regen", `${tower.regen.toFixed(0)} / sec`],
    ["Armor", `${(tower.armor + tower.reactiveArmorBonus).toFixed(1)}`],
    ["Spikes", `${tower.spikes.toFixed(0)}`],
  ];

  ui.statsList.innerHTML = stats
    .map(
      ([label, value]) =>
        `<div class="stat-row"><span>${label}</span><strong>${value}</strong></div>`,
    )
    .join("");

  const sortedWeapons = [...state.activeWeapons].sort((a, b) => b.level - a.level);
  ui.weaponList.innerHTML = sortedWeapons
    .map((weaponState) => {
      const def = findWeaponDef(weaponState.id);
      const statsForLevel = getWeaponStats(weaponState);
      return `
        <div class="list-item">
          <div><strong>${def.name}</strong>${buildRarityChip(def.rarity)}</div>
          <small>Level ${weaponState.level} | ${def.damageType} | ${def.attackType}</small>
          <small>${Math.round(statsForLevel.damage)} damage, ${statsForLevel.cooldown.toFixed(2)}s cooldown, ${Math.round(
            statsForLevel.range,
          )} range</small>
        </div>
      `;
    })
    .join("");

  const ownedUpgrades = Object.entries(state.upgradeCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([id, count]) => {
      const def = findUpgradeDef(id);
      return `
        <div class="list-item">
          <div><strong>${def.name}</strong>${buildRarityChip(def.rarity)}</div>
          <small>${def.category} | Stacks ${count}</small>
          <small>${def.description}</small>
        </div>
      `;
    });

  ui.upgradeList.innerHTML =
    ownedUpgrades.join("") ||
    `<div class="list-item"><strong>No upgrades yet</strong><small>Your next shop will offer weapons and defensive scaling.</small></div>`;
}

function getEnemyBaseStats() {
  const scale = 1 + state.time / 90 + state.wave * 0.12;
  return {
    hp: 110 * scale,
    damage: 34 * scale,
    speed: 38 + state.wave * 1.8 + state.time * 0.02,
    bounty: 8 + state.wave * 2,
  };
}

function spawnEnemy() {
  const base = getEnemyBaseStats();
  const side = Math.floor(Math.random() * 4);
  const margin = 35;
  let x = 0;
  let y = 0;
  if (side === 0) {
    x = Math.random() * canvas.width;
    y = -margin;
  } else if (side === 1) {
    x = canvas.width + margin;
    y = Math.random() * canvas.height;
  } else if (side === 2) {
    x = Math.random() * canvas.width;
    y = canvas.height + margin;
  } else {
    x = -margin;
    y = Math.random() * canvas.height;
  }

  const elite = Math.random() < Math.min(0.05 + state.wave * 0.008, 0.25);
  const hpMultiplier = elite ? 3.6 : 1;
  const speedMultiplier = elite ? 0.7 : 1;
  const damageMultiplier = elite ? 1.5 : 1;
  const radius = elite ? 20 : 11 + Math.random() * 3;

  state.enemies.push({
    id: crypto.randomUUID(),
    x,
    y,
    radius,
    maxHp: base.hp * hpMultiplier,
    hp: base.hp * hpMultiplier,
    speed: base.speed * speedMultiplier,
    baseSpeed: base.speed * speedMultiplier,
    damage: base.damage * damageMultiplier,
    bounty: Math.round(base.bounty * hpMultiplier * 0.5),
    attackTimer: 0.8 + Math.random() * 0.5,
    elite,
    burn: 0,
    poison: 0,
    frost: 0,
    frozenTimer: 0,
  });
}

function getNearestEnemy(originX, originY, maxRange) {
  let best = null;
  let bestDistance = Infinity;
  for (const enemy of state.enemies) {
    const distance = Math.hypot(enemy.x - originX, enemy.y - originY);
    if (distance <= maxRange && distance < bestDistance) {
      bestDistance = distance;
      best = enemy;
    }
  }
  return best;
}

function getNearestEnemies(originX, originY, maxRange, count) {
  return [...state.enemies]
    .map((enemy) => ({ enemy, distance: Math.hypot(enemy.x - originX, enemy.y - originY) }))
    .filter((entry) => entry.distance <= maxRange)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, count)
    .map((entry) => entry.enemy);
}

function getWeaponStats(weaponState) {
  const def = findWeaponDef(weaponState.id);
  const levelScale = 1 + (weaponState.level - 1) * 0.55;
  const tower = state.tower;
  const typeDamageBonus =
    def.attackType === "single" ? tower.singleTargetBonus : 0;

  return {
    damage: def.damage * levelScale * tower.damageMultiplier * (1 + typeDamageBonus),
    cooldown:
      Math.max(0.08, def.cooldown / (tower.attackSpeedMultiplier * (1 + (weaponState.level - 1) * 0.06))),
    range: def.range + (weaponState.level - 1) * 12,
  };
}

function launchProjectile(config) {
  state.projectiles.push({
    ...config,
    age: 0,
  });
}

function pushFloatingText(x, y, text, color) {
  state.floatingTexts.push({
    x,
    y,
    text,
    color,
    life: 0.8,
  });
}

function createExplosion(x, y, radius, color) {
  state.effects.push({
    kind: "explosion",
    x,
    y,
    radius,
    color,
    life: 0.3,
    maxLife: 0.3,
  });
}

function createBeam(x1, y1, x2, y2, color) {
  state.effects.push({
    kind: "beam",
    x1,
    y1,
    x2,
    y2,
    color,
    life: 0.08,
    maxLife: 0.08,
  });
}

function fireWeapon(weaponState) {
  const def = findWeaponDef(weaponState.id);
  const statsForLevel = getWeaponStats(weaponState);
  const originX = state.tower.x;
  const originY = state.tower.y;

  if (def.attackType === "single") {
    const target = getNearestEnemy(originX, originY, statsForLevel.range);
    if (!target) {
      return;
    }
    launchProjectile({
      kind: "single",
      x: originX,
      y: originY,
      targetId: target.id,
      damage: statsForLevel.damage,
      speed: 520,
      radius: 5,
      color: def.color,
      source: def,
    });
    return;
  }

  if (def.attackType === "splash") {
    const target = getNearestEnemy(originX, originY, statsForLevel.range);
    if (!target) {
      return;
    }
    launchProjectile({
      kind: "splash",
      x: originX,
      y: originY,
      targetId: target.id,
      damage: statsForLevel.damage,
      splashRadius: def.splashRadius + weaponState.level * 4,
      speed: 360,
      radius: 7,
      color: def.color,
      source: def,
    });
    return;
  }

  if (def.attackType === "barrage") {
    const targets = getNearestEnemies(originX, originY, statsForLevel.range, def.barrageCount + Math.floor(weaponState.level / 4));
    targets.forEach((target, index) => {
      launchProjectile({
        kind: "single",
        x: originX,
        y: originY,
        targetId: target.id,
        damage: statsForLevel.damage * (index === 0 ? 1 : 0.92),
        speed: 560,
        radius: 4,
        color: def.color,
        source: def,
      });
    });
    return;
  }

  if (def.attackType === "bounce") {
    const targets = getNearestEnemies(originX, originY, statsForLevel.range, def.bounces + 1);
    if (!targets.length) {
      return;
    }
    let damage = statsForLevel.damage;
    for (let index = 0; index < targets.length; index += 1) {
      const current = targets[index];
      applyDamage(current, damage, def, { allowCrit: true });
      createBeam(
        index === 0 ? originX : targets[index - 1].x,
        index === 0 ? originY : targets[index - 1].y,
        current.x,
        current.y,
        def.color,
      );
      damage *= 0.82;
    }
    return;
  }

  if (def.attackType === "aura") {
    const radius = statsForLevel.range;
    let hitCount = 0;
    for (const enemy of state.enemies) {
      const distance = Math.hypot(enemy.x - originX, enemy.y - originY);
      if (distance <= radius) {
        hitCount += 1;
        applyDamage(enemy, statsForLevel.damage * 0.9, def, { allowCrit: true });
      }
    }
    if (hitCount > 0) {
      state.shockwaves.push({
        x: originX,
        y: originY,
        radius: radius * 0.35,
        maxRadius: radius,
        color: def.color,
        life: 0.24,
      });
    }
    return;
  }

  if (def.attackType === "beam") {
    const target = getNearestEnemy(originX, originY, statsForLevel.range);
    if (!target) {
      return;
    }
    createBeam(originX, originY, target.x, target.y, def.color);
    applyDamage(target, statsForLevel.damage, def, { allowCrit: true });
  }
}

function applyStatus(enemy, source) {
  if (!source.status) {
    return;
  }
  if (source.status.kind === "burn") {
    enemy.burn += source.status.amount;
  }
  if (source.status.kind === "poison") {
    enemy.poison += source.status.amount;
  }
  if (source.status.kind === "frost") {
    enemy.frost += source.status.amount;
    if (enemy.frost >= 50 && enemy.frozenTimer <= 0) {
      enemy.frozenTimer = 1.8;
      enemy.frost = 25;
      pushFloatingText(enemy.x, enemy.y, "Frozen", "#8be7ff");
    }
  }
}

function applyDamage(enemy, amount, source, options = {}) {
  if (!enemy || enemy.hp <= 0) {
    return;
  }

  const allowCrit = options.allowCrit || false;
  const showText = options.showText !== false;
  let damage = amount;
  if (enemy.frozenTimer > 0) {
    damage *= 1 + state.tower.shatterBonus;
  }
  if (allowCrit && Math.random() < state.tower.critChance) {
    damage *= state.tower.critPower;
    if (showText) {
      pushFloatingText(enemy.x, enemy.y, "Crit!", "#ffd86f");
    }
  }
  enemy.hp -= damage;
  applyStatus(enemy, source);
  if (showText) {
    pushFloatingText(enemy.x, enemy.y - 6, Math.round(damage).toString(), source.color || "#ffffff");
  }
  if (enemy.hp <= 0) {
    handleEnemyDeath(enemy, source);
  }
}

function handleEnemyDeath(enemy, source) {
  if (enemy.dead) {
    return;
  }
  enemy.dead = true;
  const bounty = enemy.bounty * state.tower.bountyMultiplier;
  state.tower.gold += bounty;
  state.killCount += 1;
  if (state.tower.healOnKill > 0) {
    state.tower.hp = Math.min(state.tower.maxHp, state.tower.hp + state.tower.healOnKill);
  }
  if (state.tower.manaOnKill > 0) {
    state.tower.manaShield = Math.min(
      state.tower.manaShieldMax,
      state.tower.manaShield + state.tower.manaOnKill,
    );
  }
  createExplosion(enemy.x, enemy.y, enemy.radius * 2.6, source.color || "#ffffff");
  pushFloatingText(enemy.x, enemy.y - 16, `+${Math.round(bounty)}g`, "#ffdb74");
}

function damageTower(amount, attacker) {
  const tower = state.tower;
  if (tower.spikes > 0 && attacker && attacker.hp > 0) {
    applyDamage(attacker, tower.spikes, { color: "#ffc06e" }, { showText: false });
    if (tower.moltenSpikes && Math.random() < 0.2) {
      attacker.burn += 220;
    }
  }

  if (tower.reactiveArmor > 0) {
    tower.reactiveArmorBonus += tower.reactiveArmor;
  }

  const flatReduced = Math.max(1, amount);
  const armorFactor = 100 / (100 + (tower.armor + tower.reactiveArmorBonus) * 10);
  let damage = flatReduced * armorFactor;

  if (tower.manaShield > 0) {
    const absorbed = Math.min(tower.manaShield, damage);
    tower.manaShield -= absorbed;
    damage -= absorbed;
  }

  if (damage > 0) {
    tower.hp -= damage;
    pushFloatingText(center.x + 22, center.y - 24, `-${Math.round(damage)}`, "#ff8c8c");
  }
}

function updateTower(dt) {
  const tower = state.tower;
  tower.hp = Math.min(tower.maxHp, tower.hp + tower.regen * dt);
  tower.reactiveArmorBonus = Math.max(0, tower.reactiveArmorBonus - dt * 0.4);

  state.incomeTimer += dt;
  if (state.incomeTimer >= 1) {
    state.incomeTimer -= 1;
    tower.gold += tower.goldPerSecond * tower.incomeMultiplier;
  }

  if (tower.powerGeneratorStacks > 0) {
    const previousTick = Math.floor((state.time - dt) / 30);
    const currentTick = Math.floor(state.time / 30);
    if (currentTick > previousTick) {
      tower.damageMultiplier += 0.01 * tower.powerGeneratorStacks;
      updateSidebar();
    }
  }

  for (const weapon of state.activeWeapons) {
    weapon.cooldownRemaining -= dt;
    const statsForLevel = getWeaponStats(weapon);
    if (weapon.cooldownRemaining <= 0) {
      fireWeapon(weapon);
      weapon.cooldownRemaining += statsForLevel.cooldown;
    }
  }
}

function updateEnemies(dt) {
  for (const enemy of state.enemies) {
    if (enemy.dead) {
      continue;
    }

    if (enemy.burn > 0) {
      const burnDamage = enemy.burn * 0.18 * dt;
      enemy.burn = Math.max(0, enemy.burn - 28 * dt);
      applyDamage(enemy, burnDamage, { color: "#ff9d6f" }, { showText: false });
    }

    if (enemy.poison > 0) {
      const poisonDamage = enemy.poison * 0.24 * dt;
      enemy.poison = Math.max(0, enemy.poison - 64 * dt);
      applyDamage(enemy, poisonDamage, { color: "#90e064" }, { showText: false });
    }

    if (enemy.dead) {
      continue;
    }

    if (enemy.frozenTimer > 0) {
      enemy.frozenTimer -= dt;
    }

    const distanceToTower = Math.hypot(center.x - enemy.x, center.y - enemy.y);
    const slowFactor = enemy.frozenTimer > 0 ? 0 : Math.max(0.25, 1 - enemy.frost / 100);
    const moveSpeed = enemy.baseSpeed * slowFactor;

    if (distanceToTower > state.tower.radius + enemy.radius) {
      const dirX = (center.x - enemy.x) / distanceToTower;
      const dirY = (center.y - enemy.y) / distanceToTower;
      enemy.x += dirX * moveSpeed * dt;
      enemy.y += dirY * moveSpeed * dt;
      enemy.attackTimer = Math.min(enemy.attackTimer + dt * 0.15, 1.2);
    } else {
      enemy.attackTimer -= dt;
      if (enemy.attackTimer <= 0) {
        damageTower(enemy.damage, enemy);
        enemy.attackTimer = enemy.elite ? 0.8 : 1.0;
      }
    }
  }

  state.enemies = state.enemies.filter((enemy) => !enemy.dead);
}

function updateProjectiles(dt) {
  for (const projectile of state.projectiles) {
    projectile.age += dt;
    const target = state.enemies.find((enemy) => enemy.id === projectile.targetId);
    if (!target) {
      projectile.done = true;
      continue;
    }

    const dx = target.x - projectile.x;
    const dy = target.y - projectile.y;
    const distance = Math.hypot(dx, dy);
    if (distance <= projectile.speed * dt + target.radius) {
      projectile.x = target.x;
      projectile.y = target.y;
      if (projectile.kind === "single") {
        applyDamage(target, projectile.damage, projectile.source, { allowCrit: true });
      } else if (projectile.kind === "splash") {
        for (const enemy of state.enemies) {
          const splashDistance = Math.hypot(enemy.x - target.x, enemy.y - target.y);
          if (splashDistance <= projectile.splashRadius + enemy.radius) {
            const falloff = Math.max(0.45, 1 - splashDistance / (projectile.splashRadius * 1.8));
            applyDamage(enemy, projectile.damage * falloff, projectile.source, { allowCrit: true });
          }
        }
        createExplosion(target.x, target.y, projectile.splashRadius, projectile.source.color);
      }
      projectile.done = true;
    } else {
      projectile.x += (dx / distance) * projectile.speed * dt;
      projectile.y += (dy / distance) * projectile.speed * dt;
    }
  }

  state.projectiles = state.projectiles.filter((projectile) => !projectile.done);
}

function updateEffects(dt) {
  for (const effect of state.effects) {
    effect.life -= dt;
  }
  state.effects = state.effects.filter((effect) => effect.life > 0);

  for (const text of state.floatingTexts) {
    text.life -= dt;
    text.y -= 18 * dt;
  }
  state.floatingTexts = state.floatingTexts.filter((text) => text.life > 0);

  for (const shockwave of state.shockwaves) {
    shockwave.life -= dt;
    shockwave.radius += (shockwave.maxRadius / 0.24) * dt;
  }
  state.shockwaves = state.shockwaves.filter((wave) => wave.life > 0);

  if (state.messageTimer > 0) {
    state.messageTimer -= dt;
    if (state.messageTimer <= 0) {
      state.message = "";
    }
  }
}

function updateWaveScaling(dt) {
  const spawnInterval = Math.max(0.18, 1.05 - state.time * 0.006 - state.wave * 0.02);
  state.spawnTimer += dt;
  while (state.spawnTimer >= spawnInterval) {
    state.spawnTimer -= spawnInterval;
    spawnEnemy();
  }

  const newWave = 1 + Math.floor(state.time / 25);
  if (newWave !== state.wave) {
    state.wave = newWave;
  }

  if (!state.shopOpen && state.time >= state.nextShopAt) {
    openShop();
  }
}

function updateGame(dt) {
  if (state.paused || state.gameOver || state.victory) {
    return;
  }

  state.time += dt;
  updateWaveScaling(dt);
  updateTower(dt);
  updateEnemies(dt);
  updateProjectiles(dt);
  updateEffects(dt);

  if (state.tower.hp <= 0) {
    state.gameOver = true;
    state.paused = true;
    setOverlay(`The tower has fallen.\nSurvived ${formatTime(state.time)}`);
  }

  if (state.time >= 360 && !state.gameOver) {
    state.victory = true;
    state.paused = true;
    setOverlay(`Victory!\nYou survived ${formatTime(state.time)}`);
  }
}

function drawBackground() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const gradient = ctx.createRadialGradient(center.x, center.y, 60, center.x, center.y, 520);
  gradient.addColorStop(0, "rgba(72, 118, 255, 0.18)");
  gradient.addColorStop(1, "rgba(4, 8, 15, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(140, 180, 255, 0.08)";
  ctx.lineWidth = 1;
  for (let ring = 120; ring <= 360; ring += 60) {
    ctx.beginPath();
    ctx.arc(center.x, center.y, ring, 0, Math.PI * 2);
    ctx.stroke();
  }

  for (let x = 0; x < canvas.width; x += 52) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += 52) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

function drawTower() {
  const tower = state.tower;
  const auraGradient = ctx.createRadialGradient(center.x, center.y, 10, center.x, center.y, 90);
  auraGradient.addColorStop(0, "rgba(122, 176, 255, 0.32)");
  auraGradient.addColorStop(1, "rgba(122, 176, 255, 0)");
  ctx.fillStyle = auraGradient;
  ctx.beginPath();
  ctx.arc(center.x, center.y, 90, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#0d1826";
  ctx.beginPath();
  ctx.arc(center.x, center.y, tower.radius + 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#8bb8ff";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(center.x, center.y, tower.radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "#d5e8ff";
  ctx.beginPath();
  ctx.arc(center.x, center.y, tower.radius - 10, 0, Math.PI * 2);
  ctx.fill();

  for (const weapon of state.activeWeapons) {
    const def = findWeaponDef(weapon.id);
    weapon.orbitAngle += 0.012;
    const orbitRadius = tower.radius + 16 + (weapon.level % 4) * 6;
    const orbitX = center.x + Math.cos(weapon.orbitAngle) * orbitRadius;
    const orbitY = center.y + Math.sin(weapon.orbitAngle) * orbitRadius;
    ctx.fillStyle = def.color;
    ctx.beginPath();
    ctx.arc(orbitX, orbitY, Math.min(6, 3 + weapon.level * 0.3), 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawEnemies() {
  for (const enemy of state.enemies) {
    const healthRatio = Math.max(0, enemy.hp / enemy.maxHp);
    const baseColor = enemy.elite ? "#ff8c72" : "#c8d2e8";
    ctx.fillStyle = baseColor;
    if (enemy.burn > 0) {
      ctx.fillStyle = "#ff8e69";
    } else if (enemy.poison > 0) {
      ctx.fillStyle = "#7ece6f";
    } else if (enemy.frozenTimer > 0 || enemy.frost > 0) {
      ctx.fillStyle = "#8defff";
    }

    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
    ctx.fillRect(enemy.x - enemy.radius, enemy.y - enemy.radius - 11, enemy.radius * 2, 4);
    ctx.fillStyle = enemy.elite ? "#ff9a86" : "#74e67f";
    ctx.fillRect(enemy.x - enemy.radius, enemy.y - enemy.radius - 11, enemy.radius * 2 * healthRatio, 4);
  }
}

function drawProjectiles() {
  for (const projectile of state.projectiles) {
    ctx.fillStyle = projectile.color;
    ctx.beginPath();
    ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const effect of state.effects) {
    const alpha = Math.max(0, effect.life / effect.maxLife);
    if (effect.kind === "explosion") {
      ctx.strokeStyle = hexToRgba(effect.color, alpha * 0.8);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, effect.radius * (1 - alpha * 0.25), 0, Math.PI * 2);
      ctx.stroke();
    } else if (effect.kind === "beam") {
      ctx.strokeStyle = hexToRgba(effect.color, alpha);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(effect.x1, effect.y1);
      ctx.lineTo(effect.x2, effect.y2);
      ctx.stroke();
    }
  }

  for (const shockwave of state.shockwaves) {
    ctx.strokeStyle = hexToRgba(shockwave.color, shockwave.life / 0.24);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(shockwave.x, shockwave.y, shockwave.radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  for (const text of state.floatingTexts) {
    ctx.fillStyle = hexToRgba(text.color, Math.min(1, text.life / 0.8));
    ctx.font = "bold 13px Arial";
    ctx.fillText(text.text, text.x, text.y);
  }
}

function drawUiText() {
  if (state.message) {
    ctx.fillStyle = "rgba(7, 17, 26, 0.88)";
    ctx.fillRect(canvas.width / 2 - 120, 18, 240, 34);
    ctx.fillStyle = "#f1f6ff";
    ctx.font = "600 15px Arial";
    ctx.textAlign = "center";
    ctx.fillText(state.message, canvas.width / 2, 40);
    ctx.textAlign = "left";
  }
}

function hexToRgba(hex, alpha) {
  const normalized = hex.replace("#", "");
  const bigint = parseInt(normalized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function render() {
  drawBackground();
  drawTower();
  drawEnemies();
  drawProjectiles();
  drawUiText();
}

function gameLoop(now) {
  const delta = Math.min(0.033, (now - lastFrame) / 1000);
  lastFrame = now;
  updateGame(delta);
  updateHud();
  render();
  requestAnimationFrame(gameLoop);
}

ui.pauseButton.addEventListener("click", () => {
  if (state.gameOver || state.victory || state.shopOpen) {
    return;
  }
  state.paused = !state.paused;
  ui.pauseButton.textContent = state.paused ? "Resume" : "Pause";
  if (state.paused) {
    setOverlay("Paused");
  } else {
    setOverlay("");
  }
});

ui.restartButton.addEventListener("click", () => {
  ui.pauseButton.textContent = "Pause";
  resetGame();
});

ui.rerollButton.addEventListener("click", rerollShop);

function skipShop() {
  // Keep the skip action independent of the modal's visual state so it
  // always closes the current shop and schedules the next normal shop.
  if (!state.shopOpen) {
    return;
  }
  closeShop();
  state.nextShopAt = state.time + state.shopInterval;
  updateHud();
}

ui.skipShopButton.addEventListener("click", skipShop);

window.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "p") {
    ui.pauseButton.click();
  }
  if (event.key.toLowerCase() === "r") {
    ui.restartButton.click();
  }
});

resetGame();
requestAnimationFrame(gameLoop);
