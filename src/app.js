const DATA_FILES = {
  items: "./data/items.json",
  enemies: "./data/enemies.json",
  facilities: "./data/facilities.json",
  planet: "./data/planet_rust_mother.json",
  loot: "./data/loot_tables.json"
};

const SAVE_KEY = "wastebot_idle_save_v9";
const $ = (selector) => document.querySelector(selector);
const now = () => Date.now();
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const fmt = (value) => Math.floor(value).toLocaleString("zh-CN");
const pct = (value) => `${clamp(value, 0, 100).toFixed(1)}%`;
const rand = (min, max) => min + Math.random() * (max - min);
const choice = (list) => list[Math.floor(Math.random() * list.length)];

const tabs = [
  ["station", "补给站", "station"],
  ["explore", "星球探索", "radar"],
  ["inventory", "货舱仓库", "box"],
  ["equipment", "机体装备", "module"],
  ["facilities", "设施升级", "facility"],
  ["collection", "废星图鉴", "archive"],
  ["log", "运行日志", "log"]
];

const slots = ["weapon", "shell", "battery", "radar", "arm", "chip", "cargo", "special"];
const slotName = {
  weapon: "武器",
  shell: "外壳",
  battery: "电池",
  radar: "雷达",
  arm: "采集臂",
  chip: "芯片",
  cargo: "货舱",
  special: "特殊模块"
};
const categoryName = {
  junk: "废品",
  material: "材料",
  equipment: "装备",
  consumable: "补给",
  collectible: "收藏品",
  relic: "遗物",
  blueprint: "蓝图",
  anomaly: "异常物"
};
const rarityName = {
  common: "普通",
  uncommon: "改良",
  rare: "稀有",
  epic: "史诗",
  legendary: "传说",
  anomaly: "异常"
};
const rarityWeight = {
  common: 100,
  uncommon: 42,
  rare: 16,
  epic: 7,
  legendary: 3,
  anomaly: 2
};

const TRADE_OFFERS = [
  {
    id: "supply_cache",
    name: "远行补给箱",
    desc: "适合下一次长时间外出的基础补给。",
    minLevel: 1,
    stock: 2,
    cost: 120,
    items: { consumable_001: 1, consumable_004: 1 }
  },
  {
    id: "repair_bundle",
    name: "维修零件包",
    desc: "补足早期设施升级常用材料。",
    minLevel: 1,
    stock: 2,
    cost: 160,
    items: { mat_scrap_iron: 3, mat_broken_chip: 2, mat_micro_gear: 2 }
  },
  {
    id: "combat_tape",
    name: "战斗测试包",
    desc: "提升下一次探索的战斗表现。",
    minLevel: 1,
    stock: 1,
    cost: 180,
    items: { consumable_007: 1, mat_rubber_pad: 2 }
  },
  {
    id: "radar_bundle",
    name: "雷达校准包",
    desc: "提高稀有发现和隐藏事件的准备包。",
    minLevel: 2,
    stock: 1,
    cost: 320,
    items: { consumable_003: 1, consumable_018: 1, mat_signal_copper: 3 }
  },
  {
    id: "arm_starter",
    name: "采集臂旧库存",
    desc: "一件早期采集装备，能明显改善拾荒效率。",
    minLevel: 2,
    stock: 1,
    cost: 420,
    items: { eq_arm_027: 1 }
  }
];

const CRAFT_RECIPES = [
  {
    id: "field_repair_pack",
    name: "野外维修包",
    desc: "把常见材料压成可直接装入补给的维修道具。",
    result: { itemId: "consumable_004", qty: 2 },
    minWorkbench: 1,
    repeatable: true,
    cost: { money: 60, items: { mat_scrap_iron: 4, mat_rubber_pad: 3, mat_broken_chip: 2 } }
  },
  {
    id: "starter_battery",
    name: "拼接电池包",
    desc: "第一件明确延长探索时间的电池装备。",
    result: { itemId: "eq_battery_016", qty: 1 },
    minWorkbench: 1,
    repeatable: false,
    cost: { money: 180, items: { mat_low_grade_battery: 3, mat_copper_wire: 4, mat_micro_gear: 2 } }
  },
  {
    id: "salvage_arm",
    name: "磁吸采集臂",
    desc: "把材料收益和废品价值都往上推一截。",
    result: { itemId: "eq_arm_028", qty: 1 },
    minWorkbench: 1,
    repeatable: false,
    cost: { money: 240, items: { mat_scrap_iron: 6, mat_magnetic_bearing: 2, mat_flexible_joint: 2 } }
  },
  {
    id: "old_station_radar",
    name: "补给站旧天线",
    desc: "增加稀有发现和隐藏事件概率。",
    result: { itemId: "eq_radar_023", qty: 1 },
    minWorkbench: 2,
    repeatable: false,
    cost: { money: 360, items: { mat_signal_copper: 5, mat_clean_lens: 2, mat_data_pin: 2 } }
  },
  {
    id: "trade_beacon_plan",
    name: "交易信标蓝图复原",
    desc: "缺交易信标蓝图时，可以用战斗和探索材料硬复原。",
    result: { itemId: "bp_trade_beacon", qty: 1 },
    minWorkbench: 2,
    repeatable: false,
    cost: { money: 520, items: { mat_station_relay: 1, mat_signal_copper: 6, mat_power_cable: 3 } }
  },
  {
    id: "solar_battery_pack",
    name: "旧太阳能电池",
    desc: "进入太阳能农场后的长线探索装备。",
    result: { itemId: "eq_battery_017", qty: 1 },
    minWorkbench: 2,
    repeatable: false,
    cost: { money: 620, items: { mat_solar_fragment: 6, mat_low_grade_battery: 4, mat_clean_lens: 2 } }
  }
];

const COLLECTION_SETS = [
  {
    id: "station_memories",
    name: "补给站生活痕迹",
    desc: "这些小物件说明这里曾经不是废墟，而是有人每天醒来的地方。",
    itemIds: ["junk_014", "junk_015", "junk_019", "junk_020", "junk_031"],
    reward: { money: 240, effects: { rareFind: 0.02 }, itemId: "relic_005" }
  },
  {
    id: "solar_notes",
    name: "太阳农场旧日账本",
    desc: "把农场居民的日常碎片拼回去。",
    itemIds: ["junk_041", "junk_044", "junk_065", "junk_072", "junk_074"],
    reward: { money: 360, effects: { maxExploreMinutes: 8 }, itemId: "relic_007" }
  },
  {
    id: "city_childhood",
    name: "机械城童年套组",
    desc: "废墟里最轻的东西，往往比钢铁更难回收。",
    itemIds: ["junk_076", "junk_078", "junk_080", "junk_100", "junk_101"],
    reward: { money: 520, effects: { gatherYield: 0.03 }, itemId: "relic_016" }
  },
  {
    id: "maintenance_wall",
    name: "维修通道留言墙",
    desc: "被涂鸦、票根和旧地图串起来的逃生路线。",
    itemIds: ["junk_109", "junk_110", "junk_119", "junk_120", "junk_121"],
    reward: { money: 680, effects: { defense: 2 }, itemId: "relic_021" }
  },
  {
    id: "launch_souvenirs",
    name: "旧发射场纪念套",
    desc: "纪念品店没能等到最后一班飞船。",
    itemIds: ["junk_133", "junk_141", "junk_155", "junk_170", "junk_174"],
    reward: { money: 860, effects: { attack: 3 }, itemId: "relic_024" }
  },
  {
    id: "last_message",
    name: "最后寄出的信号",
    desc: "把明信片、合影和瓶中信合在一起，得到这颗星球最后的声音。",
    itemIds: ["junk_175", "junk_178", "junk_184", "junk_188", "junk_189"],
    reward: { money: 1200, effects: { hiddenEvent: 0.04, rareFind: 0.02 }, itemId: "relic_035" }
  }
];

let data;
let itemById;
let enemyById;
let facilityById;
let activeTab = "station";
let state;
let toastTimer;

function icon(type) {
  const paths = {
    station: '<path d="M4 19h16M6 19V8l6-4 6 4v11M9 19v-6h6v6"/><path d="M9 10h.01M15 10h.01"/>',
    radar: '<circle cx="12" cy="12" r="3"/><path d="M4.9 19.1a10 10 0 0 1 0-14.2M19.1 4.9a10 10 0 0 1 0 14.2M8 16l-4 4M16 16l4 4"/>',
    box: '<path d="M21 8v8a2 2 0 0 1-1 1.73l-7 4a2 2 0 0 1-2 0l-7-4A2 2 0 0 1 3 16V8"/><path d="M3.3 7 12 12l8.7-5M12 22V12"/><path d="m7.5 4.3 9 5.2"/>',
    module: '<path d="M9 3h6v4H9zM9 17h6v4H9zM3 9h4v6H3zM17 9h4v6h-4z"/><path d="M7 12h10M12 7v10"/>',
    facility: '<path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-7h6v7"/><path d="M9 9h6"/>',
    archive: '<path d="M4 4h16v4H4zM6 8v12h12V8M9 12h6"/>',
    log: '<path d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h5"/>',
    play: '<path d="m8 5 11 7-11 7z"/>',
    coin: '<circle cx="12" cy="12" r="8"/><path d="M9 10c0-1 1.2-2 3-2s3 1 3 2-1.2 2-3 2-3 1-3 2 1.2 2 3 2 3-1 3-2"/>',
    wrench: '<path d="M14.7 6.3a4 4 0 0 0-5 5L4 17l3 3 5.7-5.7a4 4 0 0 0 5-5l-2.8 2.8-2-2z"/>',
    warning: '<path d="M12 3 2 21h20z"/><path d="M12 9v5M12 17h.01"/>'
  };
  return `<svg class="svg-icon" viewBox="0 0 24 24" aria-hidden="true">${paths[type] ?? paths.module}</svg>`;
}

async function loadData() {
  const entries = await Promise.all(
    Object.entries(DATA_FILES).map(async ([key, url]) => [key, await fetch(url).then((response) => response.json())])
  );
  data = Object.fromEntries(entries);
  itemById = Object.fromEntries(data.items.map((item) => [item.id, item]));
  enemyById = Object.fromEntries(data.enemies.map((enemy) => [enemy.id, enemy]));
  facilityById = Object.fromEntries(data.facilities.map((facility) => [facility.id, facility]));
}

function defaultState() {
  return {
    money: 120,
    speed: 30,
    robot: {
      level: 1,
      exp: 0,
      hp: 120
    },
    inventory: {},
    equipped: Object.fromEntries(slots.map((slot) => [slot, null])),
    facilities: Object.fromEntries(data.facilities.map((facility) => [facility.id, 0])),
    collection: {
      items: {},
      enemies: {}
    },
    defeatedBosses: {},
    unlockedAreas: ["station_outskirts"],
    inventoryFilter: "all",
    preparedSupply: {
      effects: {},
      names: []
    },
    stats: {
      areaRuns: {},
      soldJunk: 0,
      soldItems: 0,
      specialEvents: 0,
      enemiesDefeated: 0,
      crafted: 0,
      collectionSets: 0
    },
    tradePurchases: {},
    craftedRecipes: {},
    claimedSets: {},
    permanentBonuses: {},
    highlights: [],
    run: null,
    logs: [
      "补给站重启完成。拾荒机器人 W-07 接入荒原频道。",
      "建议先执行一次补给站外围探索，再回收废品和升级设施。"
    ],
    lastSaveTime: now()
  };
}

function migrateSave(saved) {
  const base = defaultState();
  return {
    ...base,
    ...saved,
    robot: { ...base.robot, ...(saved.robot ?? {}) },
    inventory: saved.inventory ?? {},
    equipped: { ...base.equipped, ...(saved.equipped ?? {}) },
    facilities: { ...base.facilities, ...(saved.facilities ?? {}) },
    collection: {
      items: saved.collection?.items ?? {},
      enemies: saved.collection?.enemies ?? {}
    },
    defeatedBosses: saved.defeatedBosses ?? {},
    unlockedAreas: saved.unlockedAreas ?? base.unlockedAreas,
    inventoryFilter: saved.inventoryFilter ?? "all",
    preparedSupply: saved.preparedSupply ?? base.preparedSupply,
    tradePurchases: saved.tradePurchases ?? {},
    craftedRecipes: saved.craftedRecipes ?? {},
    claimedSets: saved.claimedSets ?? {},
    permanentBonuses: saved.permanentBonuses ?? {},
    stats: {
      ...base.stats,
      ...(saved.stats ?? {}),
      areaRuns: saved.stats?.areaRuns ?? {}
    },
    highlights: saved.highlights ?? [],
    logs: Array.isArray(saved.logs) ? saved.logs : base.logs
  };
}

function loadSave() {
  const saved = localStorage.getItem(SAVE_KEY);
  if (!saved) return defaultState();
  try {
    return migrateSave(JSON.parse(saved));
  } catch {
    return defaultState();
  }
}

function applyOfflineProgress() {
  const elapsedMs = now() - (state.lastSaveTime ?? now());
  const stats = robotStats();
  const cappedMs = clamp(elapsedMs, 0, stats.offlineCapHours * 60 * 60 * 1000);
  if (cappedMs < 60 * 1000) return;
  const minutes = cappedMs / 60000;
  const areaTier = bestArea()?.tier ?? 1;
  const earned = Math.floor(minutes * stats.offlineEfficiency * (1.4 + areaTier * 0.65));
  if (earned <= 0) return;
  state.money += earned;
  addLog(`离线自动派遣：结算 ${Math.floor(minutes)} 分钟，废币 +${fmt(earned)}。`, "good");
}

function save() {
  state.lastSaveTime = now();
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

function notify(message, tone = "info") {
  const toast = $("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast show ${tone}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2400);
}

function addLog(message, tone = "info") {
  const line = {
    time: new Date().toLocaleTimeString("zh-CN", { hour12: false }),
    message,
    tone
  };
  state.logs.unshift(line);
  state.logs = state.logs.slice(0, 240);
  if (state.run) {
    state.run.logs.unshift(line);
    state.run.logs = state.run.logs.slice(0, 180);
  }
}

function pushHighlight(title, body, tone = "rare") {
  const entry = {
    time: new Date().toLocaleTimeString("zh-CN", { hour12: false }),
    title,
    body,
    tone
  };
  state.highlights.unshift(entry);
  state.highlights = state.highlights.slice(0, 18);
  if (state.run) {
    state.run.highlights.unshift(entry);
    state.run.highlights = state.run.highlights.slice(0, 10);
  }
}

function categoryGlyph(category) {
  return {
    junk: "废",
    material: "材",
    equipment: "装",
    consumable: "补",
    collectible: "藏",
    relic: "遗",
    blueprint: "图",
    anomaly: "异"
  }[category] ?? "物";
}

function logText(line) {
  return typeof line === "string" ? line : `${line.time} ${line.message}`;
}

function countMap(map) {
  return Object.values(map).reduce((sum, qty) => sum + qty, 0);
}

function addItem(itemId, qty = 1, target = state.inventory) {
  target[itemId] = (target[itemId] ?? 0) + qty;
  if (!state.collection.items[itemId]) {
    state.collection.items[itemId] = now();
    addLog(`新图鉴记录：${itemById[itemId]?.name ?? itemId}`, "rare");
  }
}

function addRunLoot(itemId, qty = 1) {
  const firstSeen = !state.collection.items[itemId];
  const item = itemById[itemId];
  state.run.loot[itemId] = (state.run.loot[itemId] ?? 0) + qty;
  if (firstSeen) {
    state.collection.items[itemId] = now();
    addLog(`扫描到新物品：${item?.name ?? itemId}`, "rare");
    pushHighlight("新图鉴", `${item?.name ?? itemId} x${qty}`, item?.rarity === "common" ? "info" : "rare");
  } else if (["equipment", "relic", "blueprint", "anomaly"].includes(item?.category) || ["rare", "epic", "legendary", "anomaly"].includes(item?.rarity)) {
    pushHighlight(`${categoryName[item.category]}发现`, `${item.name} x${qty}`, item.rarity === "common" ? "rare" : item.rarity);
  }
}

function removeItem(itemId, qty = 1) {
  if ((state.inventory[itemId] ?? 0) < qty) return false;
  state.inventory[itemId] -= qty;
  if (state.inventory[itemId] <= 0) delete state.inventory[itemId];
  return true;
}

function hasItem(itemId) {
  return (state.inventory[itemId] ?? 0) > 0 || Boolean(state.collection.items[itemId]);
}

function currentFacilityEffect(id) {
  const level = state.facilities[id] ?? 0;
  if (!level) return {};
  return facilityById[id]?.levels[level - 1]?.effects ?? {};
}

function addEffects(target, effects = {}) {
  for (const [key, value] of Object.entries(effects)) {
    target[key] = (target[key] ?? 0) + value;
  }
}

function applyEffectsToStats(stats, effects = {}) {
  for (const [key, value] of Object.entries(effects)) {
    if (key === "maxExploreMinutes") stats.exploreMinutes += value;
    else if (key === "repairHp") stats.repairHp = (stats.repairHp ?? 0) + value;
    else if (key === "attackPct") stats.attack *= 1 + value;
    else if (key === "defensePct") stats.defense *= 1 + value;
    else stats[key] = (stats[key] ?? 0) + value;
  }
}

function foundRelicCount() {
  return data.items.filter((item) => item.category === "relic" && state.collection.items[item.id]).length;
}

function robotStats() {
  const stats = {
    maxHp: 120,
    attack: 14,
    defense: 4,
    cargoSlots: 60,
    exploreMinutes: data.planet.initialExploreMinutes,
    rareFind: 0,
    hiddenEvent: 0,
    anomalyFind: 0,
    gatherYield: 0,
    materialFind: 0,
    junkValue: 0,
    xpGain: 0,
    escapeChance: 0.05,
    enemyRate: 0,
    eventSafety: 0,
    offlineCapHours: 4,
    offlineEfficiency: 0.4,
    repairHp: 0,
    repair: 0,
    trade: 0,
    crafting: 0,
    research: 0,
    planetUnlock: 0
  };

  for (const [facilityId, level] of Object.entries(state.facilities)) {
    if (!level) continue;
    const effects = currentFacilityEffect(facilityId);
    for (const [key, value] of Object.entries(effects)) {
      if (key === "exploreMinutes") stats.exploreMinutes += value;
      else if (key === "storageSlots") stats.cargoSlots += Math.floor(value / 10);
      else stats[key] = (stats[key] ?? 0) + value;
    }
  }

  applyEffectsToStats(stats, state.permanentBonuses ?? {});

  if (stats.research > 0) {
    const relicCount = foundRelicCount();
    stats.xpGain += stats.research * 0.05 + relicCount * stats.research * 0.01;
    stats.rareFind += stats.research * 0.01 + relicCount * stats.research * 0.004;
  }

  for (const itemId of Object.values(state.equipped)) {
    if (!itemId) continue;
    const effects = itemById[itemId]?.effects ?? {};
    applyEffectsToStats(stats, effects);
  }

  if (state.run?.supplyEffects) applyEffectsToStats(stats, state.run.supplyEffects);

  stats.attack = Math.floor(stats.attack);
  stats.defense = Math.floor(stats.defense);
  state.robot.hp = Math.min(state.robot.hp, stats.maxHp);
  return stats;
}

function robotPower() {
  const stats = robotStats();
  return Math.floor(stats.attack * 8 + stats.defense * 7 + stats.maxHp * 0.8 + stats.cargoSlots * 1.2);
}

function expToNext() {
  return 80 + state.robot.level * state.robot.level * 35;
}

function gainExp(amount) {
  state.robot.exp += amount;
  while (state.robot.exp >= expToNext()) {
    state.robot.exp -= expToNext();
    state.robot.level += 1;
    state.robot.hp = robotStats().maxHp;
    addLog(`核心升级：机器人达到 Lv.${state.robot.level}`, "good");
  }
}

function completionPercent() {
  const itemScore = Object.keys(state.collection.items).reduce((sum, id) => sum + (itemById[id]?.collectionPoints ?? 0), 0);
  const enemyScore = Object.keys(state.collection.enemies).reduce((sum, id) => sum + (enemyById[id]?.collectionPoints ?? 1), 0);
  return clamp(itemScore + enemyScore, 0, 100);
}

function collectionPercent() {
  return data.items.length ? (Object.keys(state.collection.items).length / data.items.length) * 100 : 0;
}

function areaById(areaId) {
  return data.planet.areas.find((area) => area.id === areaId);
}

function areaUnlockReason(area) {
  const condition = area.unlockCondition;
  if (!condition || condition.type === "default") return "";
  if (condition.type === "planetCompletion") return `需要星球完成度 ${condition.value}%`;
  if (condition.type === "bossDefeated") return `需要击败 ${enemyById[condition.enemyId]?.name ?? "指定目标"}`;
  if (condition.type === "facilityLevel") return `需要 ${facilityById[condition.facilityId]?.name ?? "设施"} Lv.${condition.level}`;
  if (condition.type === "areaRuns") return `需要完成 ${areaById(condition.areaId)?.name ?? "指定区域"} 探索 ${condition.count} 次`;
  return "尚未满足解锁条件";
}

function unlockAreas() {
  const completion = completionPercent();
  for (const area of data.planet.areas) {
    if (state.unlockedAreas.includes(area.id)) continue;
    const c = area.unlockCondition;
    let ok = c.type === "default";
    if (c.type === "planetCompletion") ok = completion >= c.value;
    if (c.type === "bossDefeated") ok = Boolean(state.defeatedBosses[c.enemyId]);
    if (c.type === "facilityLevel") ok = (state.facilities[c.facilityId] ?? 0) >= c.level;
    if (c.type === "areaRuns") ok = (state.stats.areaRuns[c.areaId] ?? 0) >= c.count;
    if (ok) {
      state.unlockedAreas.push(area.id);
      addLog(`新区域解锁：${area.name}`, "good");
    }
  }
}

function weightedPick(entries, weightOf) {
  const weighted = entries
    .map((entry) => [entry, Math.max(0, weightOf(entry))])
    .filter(([, weight]) => weight > 0);
  const total = weighted.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = Math.random() * total;
  for (const [entry, weight] of weighted) {
    roll -= weight;
    if (roll <= 0) return entry;
  }
  return weighted[weighted.length - 1]?.[0];
}

function pickEventCategory(area) {
  const stats = robotStats();
  const weights = { ...area.eventWeights };
  weights.equipment *= 1 + stats.rareFind * 2.2;
  weights.relic *= 1 + stats.hiddenEvent * 2.5;
  weights.blueprint *= 1 + stats.rareFind * 1.4;
  weights.anomaly *= 1 + stats.anomalyFind * 3.2;
  weights.enemy = Math.max(2, weights.enemy * (1 + stats.enemyRate));
  weights.hazard = Math.max(1, weights.hazard * (1 - stats.eventSafety));
  return weightedPick(Object.keys(weights), (key) => weights[key]);
}

function pickLoot(area, category) {
  const pool = data.loot.areaPools[area.id].itemIds
    .map((id) => itemById[id])
    .filter((item) => category === "junk" ? ["junk", "collectible"].includes(item?.category) : item?.category === category);
  if (!pool.length) return null;
  const stats = robotStats();
  return weightedPick(pool, (item) => {
    const rareBoost = ["rare", "epic", "legendary", "anomaly"].includes(item.rarity) ? 1 + stats.rareFind * 4 : 1;
    return (rarityWeight[item.rarity] ?? 12) * rareBoost;
  });
}

function addMoney(amount, reason = "废币入账") {
  const finalAmount = Math.max(0, Math.floor(amount));
  if (!finalAmount) return 0;
  state.money += finalAmount;
  addLog(`${reason}：废币 +${fmt(finalAmount)}`, "good");
  return finalAmount;
}

function describeItemBundle(items) {
  return Object.entries(items)
    .map(([itemId, qty]) => `${itemById[itemId]?.name ?? itemId} x${qty}`)
    .join("、");
}

function addItemBundleToRun(items) {
  for (const [itemId, qty] of Object.entries(items)) {
    if (itemById[itemId]) addRunLoot(itemId, qty);
  }
}

function processSpecialExplorationEvent(area, forcedType = "") {
  if (!state.run) return false;
  const stats = robotStats();
  const eventTypes = ["sealed_cache", "anomaly_signal", "broken_robot"];
  const type = forcedType || choice(eventTypes);
  let title = "";
  let body = "";

  if (type === "sealed_cache") {
    const material = pickLoot(area, "material");
    const consumable = pickLoot(area, "consumable");
    const bonus = Math.random() < 0.28 + stats.rareFind ? pickLoot(area, "equipment") : null;
    const bundle = {};
    if (material) bundle[material.id] = Math.ceil(rand(2, 4 + area.tier));
    if (consumable) bundle[consumable.id] = 1;
    if (bonus) bundle[bonus.id] = 1;
    addItemBundleToRun(bundle);
    title = "密封箱";
    body = `撬开一只旧时代密封箱：${describeItemBundle(bundle)}`;
    addLog(`特殊事件：${body}`, "rare");
  }

  if (type === "anomaly_signal") {
    const anomaly = area.tier >= 3 ? pickLoot(area, "anomaly") : null;
    const fallback = anomaly ?? pickLoot(area, "relic") ?? pickLoot(area, "blueprint");
    if (fallback) addRunLoot(fallback.id, 1);
    const pulseDamage = Math.ceil(rand(1, 4 + area.tier) * (1 - stats.eventSafety));
    state.run.hp -= pulseDamage;
    state.run.xp += 4 + area.tier * 3;
    title = "异常信号";
    body = `${fallback ? `锁定 ${fallback.name}` : "记录到不可解析频段"}，耐久 -${pulseDamage}，经验 +${4 + area.tier * 3}`;
    addLog(`特殊事件：${body}`, "rare");
  }

  if (type === "broken_robot") {
    const material = pickLoot(area, "material");
    const equipment = Math.random() < 0.18 + stats.rareFind ? pickLoot(area, "equipment") : null;
    const bundle = {};
    if (material) bundle[material.id] = Math.ceil(rand(1, 3 + area.tier));
    if (equipment) bundle[equipment.id] = 1;
    addItemBundleToRun(bundle);
    const xp = 6 + area.tier * 4;
    state.run.xp += xp;
    title = "残破机器人";
    body = `拆解残破机器人：${describeItemBundle(bundle)}，经验 +${xp}`;
    addLog(`特殊事件：${body}`, "good");
  }

  if (!title) return false;
  state.stats.specialEvents += 1;
  pushHighlight(title, body, type === "anomaly_signal" ? "anomaly" : "rare");
  if (state.run?.hp <= 0) {
    state.run.failed = true;
    finishRun("异常事件导致耐久耗尽，紧急返航");
  }
  return true;
}

function startRun(areaId) {
  if (state.run) {
    notify("机器人已经在外出拾荒，可以先手动返航。", "warn");
    return false;
  }
  const area = areaById(areaId);
  if (!area) return false;
  if (!state.unlockedAreas.includes(areaId)) {
    notify(areaUnlockReason(area), "warn");
    addLog(`无法进入 ${area.name}：${areaUnlockReason(area)}`, "warn");
    render();
    return false;
  }

  const stats = robotStats();
  const supplyEffects = { ...(state.preparedSupply?.effects ?? {}) };
  const supplyNames = [...(state.preparedSupply?.names ?? [])];
  const launchStats = { ...stats };
  applyEffectsToStats(launchStats, supplyEffects);
  if (supplyEffects.repairHp) {
    state.robot.hp = Math.min(stats.maxHp, state.robot.hp + supplyEffects.repairHp);
  }
  state.run = {
    areaId,
    elapsed: 0,
    duration: Math.floor(launchStats.exploreMinutes * 60),
    nextEvent: rand(data.planet.baseEventIntervalSeconds.min, data.planet.baseEventIntervalSeconds.max),
    hp: state.robot.hp,
    loot: {},
    xp: 0,
    events: 0,
    failed: false,
    logs: [],
    highlights: [],
    combats: [],
    supplyEffects,
    supplyNames
  };
  state.preparedSupply = { effects: {}, names: [] };
  activeTab = "explore";
  addLog(`开始探索：${area.name}，预计 ${Math.round(launchStats.exploreMinutes)} 分钟。${supplyNames.length ? `补给：${supplyNames.join("、")}` : ""}`, "good");
  notify(`已派遣到 ${area.name}`, "good");
  render();
  save();
  return true;
}

function finishRun(reason = "探索完成，自动返航") {
  if (!state.run) {
    notify("当前没有正在进行的探索。", "warn");
    return;
  }
  const run = state.run;
  const stats = robotStats();
  const keepRate = run.failed ? clamp(0.7 + (stats.repair ?? 0), 0.7, 0.9) : 1;
  const kept = {};
  for (const [itemId, qty] of Object.entries(run.loot)) {
    const finalQty = Math.max(0, Math.floor(qty * keepRate));
    if (finalQty > 0) {
      kept[itemId] = finalQty;
      addItem(itemId, finalQty);
    }
  }
  gainExp(run.xp);
  const safeFloor = run.failed ? Math.ceil(stats.maxHp * 0.25) : 1;
  state.robot.hp = clamp(Math.floor(run.hp), safeFloor, stats.maxHp);
  state.stats.areaRuns[run.areaId] = (state.stats.areaRuns[run.areaId] ?? 0) + 1;
  state.run = null;
  addLog(`${reason}：带回 ${countMap(kept)} 件物资，获得 ${run.xp} 经验。`, run.failed ? "warn" : "good");
  notify(`返航完成：${countMap(kept)} 件物资`, "good");
  unlockAreas();
  save();
  render();
}

function cargoUsed(run = state.run) {
  return run ? countMap(run.loot) : 0;
}

function processLootEvent(area, category) {
  const item = pickLoot(area, category);
  if (!item) return;
  const stats = robotStats();
  let qty = 1;
  if (category === "junk") qty = Math.ceil(rand(1, 3 + area.tier) * (1 + stats.gatherYield));
  if (category === "material") qty = Math.ceil(rand(1, 2 + area.tier * 0.45) * (1 + stats.gatherYield + stats.materialFind));
  addRunLoot(item.id, qty);
  addLog(`拾取：${item.name} x${qty}`, item.rarity === "common" ? "info" : "rare");
}

function processHazard(area) {
  const stats = robotStats();
  const rawDamage = rand(4, 8 + area.tier * 3) * Math.max(0.35, 1 - stats.eventSafety - stats.repair * 0.25);
  const damage = Math.ceil(Math.min(rawDamage, stats.maxHp * 0.12));
  state.run.hp -= damage;
  addLog(`危险事件：碎片风暴划伤外壳，耐久 -${damage}`, "warn");
  if (state.run.hp <= 0) {
    state.run.failed = true;
    finishRun("耐久耗尽，紧急返航");
  } else if (state.run.hp <= stats.maxHp * 0.2) {
    finishRun("耐久低于安全线，自动返航");
  }
}

function processEnemy(area) {
  const stats = robotStats();
  const areaPowerOk = robotPower() >= Math.max(80, area.recommendedPower * 0.85);
  const enemyIds = data.loot.areaPools[area.id].enemies.filter((id) => {
    const isBoss = id.startsWith("boss");
    return !isBoss || (areaPowerOk && state.run.events >= 10 && Math.random() < 0.05);
  });
  const enemy = enemyById[choice(enemyIds)];
  if (!enemy) return;
  let enemyHp = enemy.hp;
  let rounds = 0;
  const combatLines = [];
  const hpBefore = state.run.hp;
  addLog(`遭遇敌人：${enemy.name}`, "warn");

  while (enemyHp > 0 && state.run.hp > 0 && rounds < 14) {
    rounds += 1;
    const robotHit = Math.random() <= clamp(0.9 - enemy.dodge + stats.rareFind * 0.05, 0.58, 0.97);
    const robotCrit = Math.random() <= clamp(0.04 + (stats.crit ?? 0), 0.04, 0.32);
    const robotDamage = robotHit
      ? Math.max(1, (stats.attack - enemy.defense * 0.48) * rand(0.9, 1.18) * (robotCrit ? 1.75 : 1))
      : 0;
    enemyHp -= robotDamage;
    combatLines.push(`R${rounds} ${robotHit ? `机器人${robotCrit ? "暴击" : "攻击"} ${Math.ceil(robotDamage)}` : "机器人攻击落空"}`);
    if (enemyHp <= 0) break;
    const enemyHit = Math.random() <= clamp(enemy.accuracy - (stats.defense / 500), 0.52, 0.94);
    const enemyCrit = Math.random() <= enemy.crit;
    const enemyDamage = enemyHit ? Math.min(
      Math.max(1, (enemy.attack - stats.defense * 0.55) * rand(0.82, 1.16) * (enemyCrit ? 1.55 : 1) * Math.max(0.5, 1 - stats.repair * 0.35)),
      stats.maxHp * 0.18
    ) : 0;
    state.run.hp -= enemyDamage;
    combatLines.push(`R${rounds} ${enemyHit ? `${enemy.name}${enemyCrit ? "暴击" : "反击"} ${Math.ceil(enemyDamage)}` : `${enemy.name}反击落空`}`);
  }

  const damageTaken = Math.max(0, Math.ceil(hpBefore - state.run.hp));
  addLog(`战斗过程：${combatLines.join("；")}；承受伤害 ${damageTaken}`, damageTaken > 0 ? "warn" : "good");

  if (enemyHp <= 0) {
    if (!state.collection.enemies[enemy.id]) {
      state.collection.enemies[enemy.id] = now();
      if (enemy.tags.includes("boss")) state.defeatedBosses[enemy.id] = true;
    }
    const xp = Math.floor(enemy.xp * (1 + stats.xpGain));
    state.run.xp += xp;
    addLog(`战斗胜利：${enemy.name}，经验 +${xp}`, "good");
    state.stats.enemiesDefeated += 1;
    const bounty = addMoney((enemy.xp * 1.8 + enemy.tier * 16) * (enemy.tags.includes("boss") ? 2.5 : 1), "战斗拆解赏金");
    const dropped = [];
    for (const drop of enemy.dropTable ?? []) {
      if (Math.random() <= drop.chance) {
        const qty = Math.max(1, Math.floor(rand(drop.min, drop.max + 1)));
        addRunLoot(drop.itemId, qty);
        dropped.push(`${itemById[drop.itemId]?.name ?? drop.itemId} x${qty}`);
        addLog(`战利品：${itemById[drop.itemId]?.name ?? drop.itemId} x${qty}`, "rare");
      }
    }
    if (!dropped.length && enemy.dropTable?.length) {
      const fallback = enemy.dropTable[0];
      addRunLoot(fallback.itemId, 1);
      dropped.push(`${itemById[fallback.itemId]?.name ?? fallback.itemId} x1`);
      addLog(`拆解保底：${itemById[fallback.itemId]?.name ?? fallback.itemId} x1`, "rare");
    }
    const bonusCategory = enemy.tags.includes("boss") || Math.random() < 0.18 + stats.rareFind ? "equipment" : "material";
    const bonusItem = pickLoot(area, bonusCategory);
    if (bonusItem) {
      addRunLoot(bonusItem.id, 1);
      dropped.push(`${bonusItem.name} x1`);
      addLog(`战斗追加奖励：${bonusItem.name} x1`, "rare");
    }
    state.run.combats.unshift({
      enemy: enemy.name,
      rounds,
      xp,
      bounty,
      damageTaken,
      drops: dropped,
      lines: combatLines.slice(0, 6)
    });
    state.run.combats = state.run.combats.slice(0, 5);
    pushHighlight("战斗胜利", `${enemy.name} · +${xp}经验 · +${bounty}废币 · ${dropped.join("、") || "无掉落"}`, "good");
    if (state.run.hp <= stats.maxHp * 0.2) finishRun("战斗后耐久低于安全线，自动返航");
  } else {
    state.run.failed = true;
    addLog(`战斗失败：${enemy.name} 迫使机器人撤退。`, "bad");
    finishRun("战斗失败，紧急返航");
  }
}

function processEvent() {
  if (!state.run) return;
  const area = areaById(state.run.areaId);
  const category = pickEventCategory(area);
  state.run.events += 1;

  const stats = robotStats();
  const specialChance = clamp(0.04 + stats.hiddenEvent * 0.75 + stats.rareFind * 0.18, 0.04, 0.22);
  if (!["enemy", "hazard"].includes(category) && Math.random() < specialChance) processSpecialExplorationEvent(area);
  else if (category === "enemy") processEnemy(area);
  else if (category === "hazard") processHazard(area);
  else processLootEvent(area, category);

  if (!state.run) return;
  if (cargoUsed() >= stats.cargoSlots) {
    finishRun("货舱已满，自动返航");
    return;
  }
  state.run.nextEvent += rand(data.planet.baseEventIntervalSeconds.min, data.planet.baseEventIntervalSeconds.max);
}

function tick() {
  if (state.run) {
    state.run.elapsed += state.speed;
    while (state.run && state.run.elapsed >= state.run.nextEvent) processEvent();
    if (state.run && state.run.elapsed >= state.run.duration) finishRun();
  }
  render();
  save();
}

function sellJunk() {
  const stats = robotStats();
  let earned = 0;
  let sold = 0;
  for (const [itemId, qty] of Object.entries({ ...state.inventory })) {
    const item = itemById[itemId];
    if (item?.category !== "junk") continue;
    earned += item.value * qty * (1 + stats.junkValue);
    sold += qty;
    delete state.inventory[itemId];
  }
  if (!sold) {
    notify("仓库里暂时没有可批量出售的废品。", "warn");
    addLog("回收机空转：没有废品可出售。", "warn");
    render();
    return;
  }
  state.money += Math.floor(earned);
  state.stats.soldJunk += sold;
  state.stats.soldItems += sold;
  addLog(`回收结算：出售 ${sold} 件废品，废币 +${fmt(earned)}`, "good");
  notify(`出售完成：废币 +${fmt(earned)}`, "good");
  save();
  render();
}

function sellItem(itemId, qty = 1) {
  const item = itemById[itemId];
  const owned = state.inventory[itemId] ?? 0;
  if (!item || owned <= 0) {
    notify("仓库里没有这个物品。", "warn");
    return false;
  }
  const sellQty = Math.min(qty, owned);
  const stats = robotStats();
  const multiplier = item.category === "junk" ? 1 + stats.junkValue : 1;
  const earned = Math.floor(item.value * sellQty * multiplier);
  removeItem(itemId, sellQty);
  state.money += earned;
  if (item.category === "junk") state.stats.soldJunk += sellQty;
  state.stats.soldItems += sellQty;
  addLog(`出售：${item.name} x${sellQty}，废币 +${fmt(earned)}`, "good");
  notify(`出售 ${item.name}：+${fmt(earned)} 废币`, "good");
  save();
  render();
  return true;
}

function isBulkSellProtected(item) {
  if (!item) return true;
  if (item.category !== "junk") return true;
  if (!item.tags?.includes("sell_only")) return true;
  return ["rare", "epic", "legendary", "anomaly"].includes(item.rarity);
}

function sellCategory(category) {
  const entries = Object.entries({ ...state.inventory }).filter(([itemId]) => {
    const item = itemById[itemId];
    if (category !== "all" && item?.category !== category) return false;
    return !isBulkSellProtected(item);
  });
  if (!entries.length) {
    notify("当前没有可批量出售的废品。收藏品、材料和稀有物需要手动卖。", "warn");
    return;
  }
  let earned = 0;
  let sold = 0;
  const stats = robotStats();
  for (const [itemId, qty] of entries) {
    const item = itemById[itemId];
    const multiplier = item.category === "junk" ? 1 + stats.junkValue : 1;
    earned += Math.floor(item.value * qty * multiplier);
    sold += qty;
    if (item.category === "junk") state.stats.soldJunk += qty;
    delete state.inventory[itemId];
  }
  state.stats.soldItems += sold;
  state.money += earned;
  addLog(`批量出售：${category === "all" ? "全部物品" : categoryName[category]} ${sold} 件，废币 +${fmt(earned)}`, "good");
  notify(`批量出售完成：+${fmt(earned)} 废币`, "good");
  save();
  render();
}

function useConsumable(itemId) {
  const item = itemById[itemId];
  if (!item || item.category !== "consumable") {
    notify("这个物品不是补给。", "warn");
    return false;
  }
  if (state.run) {
    notify("机器人外出中，补给只能在出发前装入。", "warn");
    return false;
  }
  if (!removeItem(itemId, 1)) {
    notify("仓库里没有这个补给。", "warn");
    return false;
  }
  addEffects(state.preparedSupply.effects, item.effects ?? {});
  state.preparedSupply.names.push(item.name);
  addLog(`装入补给：${item.name}（${effectText(item.effects)}）。将在下一次探索生效。`, "good");
  notify(`${item.name} 已装入下一次探索`, "good");
  save();
  render();
  return true;
}

function tradeLevel() {
  return state.facilities.trade_beacon ?? 0;
}

function tradePrice(offer) {
  const stats = robotStats();
  const discount = Math.min(0.35, (stats.trade ?? 0) * 0.45);
  return Math.max(1, Math.floor(offer.cost * (1 - discount)));
}

function availableTradeOffers() {
  const level = tradeLevel();
  return TRADE_OFFERS.filter((offer) => level >= offer.minLevel);
}

function buyTradeOffer(offerId) {
  if (tradeLevel() < 1) {
    notify("交易信标 Lv.1 后开放商人交易站。", "warn");
    return false;
  }
  const offer = TRADE_OFFERS.find((item) => item.id === offerId);
  if (!offer || tradeLevel() < offer.minLevel) {
    notify("这个交易订单尚未开放。", "warn");
    return false;
  }
  const bought = state.tradePurchases[offer.id] ?? 0;
  if (bought >= offer.stock) {
    notify("这组货物已经买空。", "warn");
    return false;
  }
  const price = tradePrice(offer);
  if (state.money < price) {
    notify(`购买需要 ${price} 废币。`, "warn");
    return false;
  }
  state.money -= price;
  state.tradePurchases[offer.id] = bought + 1;
  for (const [itemId, qty] of Object.entries(offer.items)) addItem(itemId, qty);
  addLog(`商人交易：购买 ${offer.name}，废币 -${fmt(price)}，获得 ${describeItemBundle(offer.items)}`, "good");
  notify(`已购买 ${offer.name}`, "good");
  save();
  render();
  return true;
}

function workbenchLevel() {
  return state.facilities.workbench ?? 0;
}

function recipeResultText(recipe) {
  const item = itemById[recipe.result.itemId];
  return `${item?.name ?? recipe.result.itemId} x${recipe.result.qty}`;
}

function recipeCostText(recipe) {
  return Object.entries(recipe.cost.items)
    .map(([itemId, qty]) => `${itemById[itemId]?.name ?? itemId} ${state.inventory[itemId] ?? 0}/${qty}`)
    .join("、");
}

function canCraft(recipe) {
  if (workbenchLevel() < recipe.minWorkbench) return [false, `需要工作台 Lv.${recipe.minWorkbench}`];
  if (!recipe.repeatable && state.craftedRecipes[recipe.id]) return [false, "已制作"];
  const price = craftPrice(recipe);
  if (state.money < price) return [false, `废币不足，还差 ${fmt(price - state.money)}`];
  for (const [itemId, qty] of Object.entries(recipe.cost.items)) {
    const owned = state.inventory[itemId] ?? 0;
    if (owned < qty) return [false, `${itemById[itemId]?.name ?? itemId} 不足：${owned}/${qty}`];
  }
  return [true, ""];
}

function craftPrice(recipe) {
  const stats = robotStats();
  const discount = Math.min(0.35, (stats.crafting ?? 0) * 0.5);
  return Math.max(1, Math.floor(recipe.cost.money * (1 - discount)));
}

function craftRecipe(recipeId) {
  const recipe = CRAFT_RECIPES.find((item) => item.id === recipeId);
  if (!recipe) return false;
  const [ok, reason] = canCraft(recipe);
  if (!ok) {
    notify(reason, "warn");
    addLog(`${recipe.name} 无法制作：${reason}`, "warn");
    render();
    return false;
  }
  const price = craftPrice(recipe);
  state.money -= price;
  for (const [itemId, qty] of Object.entries(recipe.cost.items)) removeItem(itemId, qty);
  addItem(recipe.result.itemId, recipe.result.qty);
  state.craftedRecipes[recipe.id] = (state.craftedRecipes[recipe.id] ?? 0) + 1;
  state.stats.crafted += 1;
  addLog(`制作完成：${recipe.name} -> ${recipeResultText(recipe)}，废币 -${fmt(price)}`, "good");
  pushHighlight("制作完成", `${recipe.name} -> ${recipeResultText(recipe)}`, itemById[recipe.result.itemId]?.rarity ?? "rare");
  notify(`制作完成：${recipe.name}`, "good");
  save();
  render();
  return true;
}

function collectionSetProgress(set) {
  const found = set.itemIds.filter((itemId) => state.collection.items[itemId]).length;
  return { found, total: set.itemIds.length, complete: found >= set.itemIds.length };
}

function rewardEffectText(effects = {}) {
  const labels = {
    attack: "攻击",
    defense: "防御",
    rareFind: "稀有发现",
    hiddenEvent: "特殊事件",
    gatherYield: "采集",
    maxExploreMinutes: "探索时长"
  };
  return Object.entries(effects)
    .map(([key, value]) => `${labels[key] ?? key} +${key.includes("Find") || key === "hiddenEvent" || key === "gatherYield" ? `${Math.round(value * 100)}%` : value}`)
    .join("、");
}

function effectText(effects = {}) {
  const labels = {
    maxExploreMinutes: "探索时长",
    repairHp: "出发前维修",
    attackPct: "攻击",
    defensePct: "防御",
    attack: "攻击",
    defense: "防御",
    cargoSlots: "货舱",
    rareFind: "稀有发现",
    hiddenEvent: "特殊事件",
    anomalyFind: "异常发现",
    gatherYield: "采集",
    materialFind: "材料发现",
    junkValue: "废品售价",
    xpGain: "经验",
    eventSafety: "安全",
    enemyRate: "遇敌",
    escapeChance: "撤离"
  };
  const percentKeys = new Set(["attackPct", "defensePct", "rareFind", "hiddenEvent", "anomalyFind", "gatherYield", "materialFind", "junkValue", "xpGain", "eventSafety", "enemyRate", "escapeChance"]);
  const minuteKeys = new Set(["maxExploreMinutes"]);
  const hpKeys = new Set(["repairHp"]);
  return Object.entries(effects)
    .map(([key, value]) => {
      const sign = value >= 0 ? "+" : "";
      const label = labels[key] ?? key;
      if (percentKeys.has(key)) return `${label} ${sign}${Math.round(value * 100)}%`;
      if (minuteKeys.has(key)) return `${label} ${sign}${Math.round(value)}分钟`;
      if (hpKeys.has(key)) return `${label} ${sign}${Math.round(value)}耐久`;
      return `${label} ${sign}${value}`;
    })
    .join("、") || "无明确效果";
}

function claimCollectionSet(setId) {
  const set = COLLECTION_SETS.find((item) => item.id === setId);
  if (!set) return false;
  const progress = collectionSetProgress(set);
  if (!progress.complete) {
    notify(`还差 ${progress.total - progress.found} 件收藏品。`, "warn");
    return false;
  }
  if (state.claimedSets[set.id]) {
    notify("这个套装奖励已经领取过。", "warn");
    return false;
  }
  state.claimedSets[set.id] = now();
  state.stats.collectionSets += 1;
  if (set.reward.money) addMoney(set.reward.money, `收藏套装「${set.name}」奖励`);
  if (set.reward.effects) addEffects(state.permanentBonuses, set.reward.effects);
  if (set.reward.itemId) addItem(set.reward.itemId, 1);
  addLog(`收藏套装完成：${set.name}。永久加成：${rewardEffectText(set.reward.effects) || "无"}`, "rare");
  pushHighlight("收藏套装完成", `${set.name} · ${rewardEffectText(set.reward.effects)}${set.reward.itemId ? ` · ${itemById[set.reward.itemId]?.name}` : ""}`, "legendary");
  notify(`套装完成：${set.name}`, "good");
  save();
  render();
  return true;
}

function repair() {
  const stats = robotStats();
  const missing = stats.maxHp - state.robot.hp;
  if (missing <= 0) {
    notify("耐久已满，不需要维修。", "warn");
    return;
  }
  const repairDiscount = Math.min(0.45, (stats.repair ?? 0) * 0.5);
  const costRate = Math.max(0.35, 0.8 - repairDiscount);
  const cost = Math.ceil(missing * costRate);
  if (state.money < cost) {
    notify(`维修需要 ${cost} 废币。`, "warn");
    return;
  }
  state.money -= cost;
  state.robot.hp = stats.maxHp;
  addLog(`维修完成：废币 -${fmt(cost)}`, "good");
  notify("维修完成。", "good");
  save();
  render();
}

function canUpgrade(facility) {
  const current = state.facilities[facility.id] ?? 0;
  if (current >= facility.maxLevel) return [false, "已满级"];
  const next = facility.levels[current];
  if (state.money < next.cost.money) return [false, `废币不足，还差 ${fmt(next.cost.money - state.money)}`];
  for (const cost of next.cost.materials) {
    const owned = state.inventory[cost.itemId] ?? 0;
    if (owned < cost.qty) return [false, `${itemById[cost.itemId].name} 不足：${owned}/${cost.qty}`];
  }
  for (const blueprint of next.cost.blueprints) {
    if (!hasItem(blueprint)) return [false, `缺少 ${itemById[blueprint].name}`];
  }
  return [true, ""];
}

function upgradeFacility(id) {
  const facility = facilityById[id];
  if (!facility) return;
  const [ok, reason] = canUpgrade(facility);
  if (!ok) {
    notify(reason, "warn");
    addLog(`${facility.name} 无法升级：${reason}`, "warn");
    render();
    return;
  }
  const current = state.facilities[id] ?? 0;
  const next = facility.levels[current];
  state.money -= next.cost.money;
  for (const cost of next.cost.materials) removeItem(cost.itemId, cost.qty);
  state.facilities[id] = current + 1;
  addLog(`${facility.name} 升级到 Lv.${current + 1}`, "good");
  notify(`${facility.name} 升级完成`, "good");
  unlockAreas();
  save();
  render();
}

function equip(itemId) {
  const item = itemById[itemId];
  const slot = item?.tags?.find((tag) => slots.includes(tag));
  if (!item || item.category !== "equipment" || !slot) {
    notify("这件物品不能装备。", "warn");
    return;
  }
  if (!removeItem(itemId, 1)) {
    notify("背包里没有这件装备。", "warn");
    return;
  }
  const old = state.equipped[slot];
  if (old) addItem(old, 1);
  state.equipped[slot] = itemId;
  addLog(`装备安装：${slotName[slot]} -> ${item.name}`, "good");
  notify(`已装备 ${item.name}`, "good");
  save();
  render();
}

function unequip(slot) {
  const itemId = state.equipped[slot];
  if (!itemId) {
    notify("这个槽位是空的。", "warn");
    return;
  }
  state.equipped[slot] = null;
  addItem(itemId, 1);
  addLog(`卸下装备：${itemById[itemId].name}`, "info");
  notify("装备已放回背包。", "good");
  save();
  render();
}

function bestArea() {
  const power = robotPower();
  return [...data.planet.areas]
    .filter((area) => state.unlockedAreas.includes(area.id) && area.recommendedPower <= power * 1.15)
    .pop() ?? areaById("rust_plain");
}

function setSpeed(value) {
  const nextSpeed = Math.round(Number(value));
  if (!Number.isFinite(nextSpeed) || nextSpeed < 1) {
    notify("时间倍率至少为 x1。", "warn");
    render();
    return false;
  }
  state.speed = clamp(nextSpeed, 1, 300);
  notify(`时间倍率已设为 x${state.speed}`, "good");
  save();
  render();
  return true;
}

function resetSave() {
  if (!confirm("确认重置当前存档？")) return;
  localStorage.removeItem(SAVE_KEY);
  state = defaultState();
  activeTab = "station";
  notify("存档已重置。", "good");
  render();
}

function debugGrant() {
  const sample = ["mat_scrap_iron", "mat_micro_gear", "mat_broken_chip", "mat_clean_lens", "mat_rubber_pad", "mat_low_grade_battery", "mat_copper_wire", "junk_001", "junk_002"];
  for (const id of sample) addItem(id, id.startsWith("junk") ? 4 : 3);
  state.money += 300;
  addLog("测试补给已加入仓库。", "good");
  notify("已加入少量测试资源。", "good");
  render();
}

function grantFacilityCost(facilityId) {
  const facility = facilityById[facilityId];
  const level = state.facilities[facilityId] ?? 0;
  const next = facility?.levels[level];
  if (!next) return;
  state.money = Math.max(state.money, next.cost.money + 100);
  for (const cost of next.cost.materials) {
    state.inventory[cost.itemId] = Math.max(state.inventory[cost.itemId] ?? 0, cost.qty);
  }
  for (const blueprint of next.cost.blueprints) {
    state.inventory[blueprint] = Math.max(state.inventory[blueprint] ?? 0, 1);
  }
}

function grantRecipeCost(recipeId) {
  const recipe = CRAFT_RECIPES.find((item) => item.id === recipeId);
  if (!recipe) return;
  state.money = Math.max(state.money, recipe.cost.money + 120);
  for (const [itemId, qty] of Object.entries(recipe.cost.items)) {
    state.inventory[itemId] = Math.max(state.inventory[itemId] ?? 0, qty);
  }
}

function statCard(label, value, sub = "") {
  return `<div class="stat-card"><span>${label}</span><b>${value}</b>${sub ? `<small>${sub}</small>` : ""}</div>`;
}

function progressBar(value, label = "") {
  return `<div class="bar" aria-label="${label}"><i style="width:${clamp(value, 0, 100)}%"></i></div>`;
}

function currentObjectives() {
  const stationRuns = state.stats.areaRuns.station_outskirts ?? 0;
  const recyclerLevel = state.facilities.recycler ?? 0;
  const rustUnlocked = state.unlockedAreas.includes("rust_plain");
  const tradePurchased = Object.values(state.tradePurchases).some((count) => count > 0);
  if (tradePurchased || workbenchLevel() >= 1 || state.stats.crafted > 0 || state.stats.collectionSets > 0) {
    return [
      {
        label: "升级工作台 Lv.1",
        done: workbenchLevel() >= 1,
        progress: `Lv.${workbenchLevel()}/1`
      },
      {
        label: "完成 1 次制作",
        done: state.stats.crafted >= 1,
        progress: `${Math.min(state.stats.crafted, 1)}/1`
      },
      {
        label: "发现 5 件收藏品",
        done: data.items.filter((item) => item.category === "collectible" && state.collection.items[item.id]).length >= 5,
        progress: `${Math.min(data.items.filter((item) => item.category === "collectible" && state.collection.items[item.id]).length, 5)}/5`
      },
      {
        label: "领取 1 个收藏套装",
        done: state.stats.collectionSets >= 1,
        progress: `${Math.min(state.stats.collectionSets, 1)}/1`
      }
    ];
  }
  if (rustUnlocked) {
    const trade = tradeLevel();
    return [
      {
        label: "触发特殊探索事件 1 次",
        done: state.stats.specialEvents >= 1,
        progress: `${Math.min(state.stats.specialEvents, 1)}/1`
      },
      {
        label: "击败敌人 3 次",
        done: state.stats.enemiesDefeated >= 3,
        progress: `${Math.min(state.stats.enemiesDefeated, 3)}/3`
      },
      {
        label: "升级交易信标 Lv.1",
        done: trade >= 1,
        progress: `Lv.${trade}/1`
      },
      {
        label: "购买 1 组商人货物",
        done: Object.values(state.tradePurchases).some((count) => count > 0),
        progress: Object.values(state.tradePurchases).reduce((sum, count) => sum + count, 0) ? "已购买" : "交易站"
      }
    ];
  }
  return [
    {
      label: "探索补给站外围 1 次",
      done: stationRuns >= 1,
      progress: `${stationRuns}/1`
    },
    {
      label: "出售废品 10 件",
      done: state.stats.soldJunk >= 10,
      progress: `${Math.min(state.stats.soldJunk, 10)}/10`
    },
    {
      label: "升级回收机 Lv.1",
      done: recyclerLevel >= 1,
      progress: `Lv.${recyclerLevel}/1`
    },
    {
      label: "解锁锈蚀平原",
      done: state.unlockedAreas.includes("rust_plain"),
      progress: state.unlockedAreas.includes("rust_plain") ? "已解锁" : "回收机 Lv.1"
    }
  ];
}

function renderObjectivePanel() {
  const objectives = currentObjectives();
  const done = objectives.filter((item) => item.done).length;
  const rustUnlocked = state.unlockedAreas.includes("rust_plain");
  const craftStage = Object.values(state.tradePurchases).some((count) => count > 0) || workbenchLevel() >= 1 || state.stats.crafted > 0 || state.stats.collectionSets > 0;
  return `
    <section class="panel span-12 objective-panel">
      <div class="panel-head">
        <div>
          <h2>当前阶段：${craftStage ? "制作与收藏" : rustUnlocked ? "荒原扩张" : "补给站重启"}</h2>
          <p class="muted">${craftStage ? "把材料变成装备，把收藏品拼成套装奖励。" : rustUnlocked ? "开始强化战斗收益，寻找特殊事件，并把交易信标修起来。" : "先把外围跑通、卖出废品、修好回收机，再进入锈蚀平原。"}</p>
        </div>
        <span class="pill">${done}/${objectives.length}</span>
      </div>
      <div class="objective-list">
        ${objectives.map((objective) => `
          <article class="${objective.done ? "done" : ""}">
            <b>${objective.done ? "完成" : "进行中"}</b>
            <span>${objective.label}</span>
            <small>${objective.progress}</small>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function facilityEffectText(facility, level) {
  if (!level) return "当前未启用";
  const effects = facility.levels[level - 1]?.effects ?? {};
  const parts = [];
  if (effects.junkValue) parts.push(`废品售价 +${Math.round(effects.junkValue * 100)}%`);
  if (effects.exploreMinutes) parts.push(`外出时长 +${Math.round(effects.exploreMinutes)} 分钟`);
  if (effects.storageSlots) parts.push(`货舱整理 +${Math.floor(effects.storageSlots / 10)} 格`);
  if (effects.rareFind) parts.push(`稀有发现 +${Math.round(effects.rareFind * 100)}%`);
  if (effects.hiddenEvent) parts.push(`特殊事件 +${Math.round(effects.hiddenEvent * 100)}%`);
  if (effects.repair) parts.push(`战损/维修成本降低 ${Math.round(effects.repair * 100)}%`);
  if (effects.trade) parts.push(`商人折扣 +${Math.round(Math.min(0.35, effects.trade * 0.45) * 100)}%`);
  if (effects.offlineCapHours) parts.push(`离线收益上限 ${effects.offlineCapHours} 小时`);
  if (effects.crafting) parts.push(`制作废币成本 -${Math.round(Math.min(0.35, effects.crafting * 0.5) * 100)}%`);
  if (effects.research) {
    const relicCount = foundRelicCount();
    const xp = effects.research * 5 + relicCount * effects.research;
    const rare = effects.research + relicCount * effects.research * 0.4;
    parts.push(`研究加成：经验 +${xp.toFixed(1)}%，稀有 +${rare.toFixed(1)}%（已解析遗物 ${relicCount} 件）`);
  }
  if (effects.planetUnlock) parts.push(level >= 3 ? "满足下一星球导航条件" : level >= 2 ? "已解锁旧时代发射场" : "导航校准中");
  return parts.join("、") || "特殊功能已启用";
}

function facilityUnlockText(facilityId, level) {
  if (!level) return "";
  const unlocks = {
    recycler: "功能开放：一键出售废品与废品溢价生效。",
    charger: "功能开放：提升探索时长，并扩大离线结算上限。",
    warehouse: "功能开放：提升单次探索货舱容量。",
    workbench: "功能开放：制作工坊，可把材料变成补给、装备和蓝图。",
    radar_tower: "功能开放：密封箱、异常信号、残破机器人等特殊事件更容易出现。",
    repair_bay: "功能开放：战斗/危险损伤降低，失败返航保留更多货物。",
    research_terminal: "功能开放：已发现遗物会转化为经验和稀有发现加成。",
    trade_beacon: "功能开放：补给站商人交易站。",
    dispatch: "功能开放：离线收益能力提升。",
    navigation: "功能开放：后续区域和下一星球条件推进。"
  };
  return unlocks[facilityId] ?? "";
}

function renderTradePanel() {
  const level = tradeLevel();
  if (level < 1) {
    return `
      <section class="panel span-12 trade-panel locked">
        <div class="panel-head">
          <div>
            <h2>商人交易站</h2>
            <p class="muted">升级交易信标 Lv.1 后开放。这里会出售补给、材料包和少量装备库存。</p>
          </div>
          <span class="pill">未开放</span>
        </div>
      </section>
    `;
  }

  return `
    <section class="panel span-12 trade-panel">
      <div class="panel-head">
        <div>
          <h2>商人交易站</h2>
          <p class="muted">交易信标 Lv.${level} 在线。购买会直接进入仓库，库存卖完后本轮存档不会刷新。</p>
        </div>
        <span class="pill">${availableTradeOffers().length} 组货物</span>
      </div>
      <div class="trade-grid">
        ${availableTradeOffers().map((offer) => {
          const bought = state.tradePurchases[offer.id] ?? 0;
          const left = Math.max(0, offer.stock - bought);
          const price = tradePrice(offer);
          return `
            <article class="trade-card">
              <div class="row-title">
                <strong>${offer.name}</strong>
                <span class="pill">库存 ${left}/${offer.stock}</span>
              </div>
              <p class="mini">${offer.desc}</p>
              <p class="mini rare">${describeItemBundle(offer.items)}</p>
              <button class="${left && state.money >= price ? "primary" : "ghost"}" data-action="buy-trade" data-offer="${offer.id}">
                ${left ? `购买 ${fmt(price)} 废币` : "已售罄"}
              </button>
            </article>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

function renderCraftingPanel() {
  const level = workbenchLevel();
  if (level < 1) {
    return `
      <section class="panel span-12 craft-panel locked">
        <div class="panel-head">
          <div>
            <h2>制作工坊</h2>
            <p class="muted">升级工作台 Lv.1 后开放。材料、蓝图和部分收藏线索会开始转化为明确目标。</p>
          </div>
          <span class="pill">未开放</span>
        </div>
      </section>
    `;
  }

  return `
    <section class="panel span-12 craft-panel">
      <div class="panel-head">
        <div>
          <h2>制作工坊</h2>
          <p class="muted">工作台 Lv.${level} 在线。不可重复配方会保留完成记录，补给加工可重复制作。</p>
        </div>
        <span class="pill">${state.stats.crafted} 次制作</span>
      </div>
      <div class="craft-grid">
        ${CRAFT_RECIPES.map((recipe) => {
          const [ok, reason] = canCraft(recipe);
          const made = state.craftedRecipes[recipe.id] ?? 0;
          return `
            <article class="craft-card">
              <div class="row-title">
                <strong>${recipe.name}</strong>
                <span class="pill">工作台 Lv.${recipe.minWorkbench}</span>
              </div>
              <p class="mini">${recipe.desc}</p>
              <p class="mini rare">产出：${recipeResultText(recipe)}</p>
              <p class="mini">消耗：废币 ${fmt(state.money)}/${fmt(craftPrice(recipe))} · ${recipeCostText(recipe)}</p>
              ${made ? `<p class="mini good-text">已制作 ${made} 次</p>` : ""}
              ${!ok ? `<p class="mini warn-text">${reason}</p>` : ""}
              <button class="${ok ? "primary" : "ghost"}" data-action="craft" data-recipe="${recipe.id}">
                ${ok ? "制作" : "查看缺口"}
              </button>
            </article>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

function renderTop() {
  const stats = robotStats();
  const run = state.run;
  $("#statStrip").innerHTML = [
    statCard("废币", fmt(state.money), "回收废品获得"),
    statCard("耐久", `${fmt(state.robot.hp)} / ${fmt(stats.maxHp)}`, "战斗和危险会消耗"),
    statCard("等级", `Lv.${state.robot.level}`, `${fmt(state.robot.exp)} / ${fmt(expToNext())} 经验`),
    statCard("战力", fmt(robotPower()), "影响区域风险"),
    statCard("外出时长", `${Math.round(stats.exploreMinutes)} 分钟`, `测试倍率 x${state.speed}`),
    statCard("收集率", pct(collectionPercent()), `${Object.keys(state.collection.items).length}/${data.items.length} 道具`)
  ].join("");

  $("#runStrip").innerHTML = run
    ? `
      <div class="run-panel active-run">
        <div>
          <strong>${areaById(run.areaId).name}</strong>
          <span>探索中 · ${pct((run.elapsed / run.duration) * 100)} · 事件 ${run.events}</span>
        </div>
        ${progressBar((run.elapsed / run.duration) * 100, "探索进度")}
        <div class="run-metrics">
          <span>货舱 ${cargoUsed()} / ${stats.cargoSlots}</span>
          <span>耐久 ${Math.max(0, Math.floor(run.hp))}</span>
          <span>经验 ${run.xp}</span>
        </div>
      </div>`
    : `
      <div class="run-panel">
        <div>
          <strong>待命</strong>
          <span>推荐目标：${bestArea().name}。先外出拾荒，再出售废品与升级设施。</span>
        </div>
        ${progressBar(collectionPercent(), "道具收集率")}
        <div class="run-metrics">
          <span>探索进度 ${pct(completionPercent())}</span>
          <span>离线收益 ${Math.round(stats.offlineEfficiency * 100)}%</span>
          <span>上限 ${stats.offlineCapHours.toFixed(0)} 小时</span>
          <span>已解锁 ${state.unlockedAreas.length}/${data.planet.areas.length} 区域</span>
        </div>
      </div>`;
}

function renderTabs() {
  $("#tabs").innerHTML = tabs.map(([id, name, iconType]) => `
    <button class="tab ${activeTab === id ? "active" : ""}" data-tab="${id}">
      ${icon(iconType)}<span>${name}</span>
    </button>
  `).join("");
}

function renderRobotVisual() {
  const stats = robotStats();
  return `
    <div class="robot-bay">
      <div class="robot-figure">
        <div class="antenna"></div>
        <div class="head"><i></i><i></i></div>
        <div class="body">
          <span></span><span></span><span></span>
        </div>
        <div class="treads"></div>
      </div>
      <div class="robot-readout">
        <b>W-07 拾荒单元</b>
        <span>电池：${Math.round(stats.exploreMinutes)} 分钟</span>
        <span>货舱：${stats.cargoSlots} 格</span>
        <span>稀有扫描：${Math.round(stats.rareFind * 100)}%</span>
      </div>
    </div>
  `;
}

function preparedSupplyText() {
  if (!state.preparedSupply.names.length) return "未装入补给";
  return `${state.preparedSupply.names.join("、")}；效果：${effectText(state.preparedSupply.effects)}`;
}

function renderStation() {
  const stats = robotStats();
  return `
    <div class="screen-grid">
      <section class="command-deck span-7">
        <div>
          <p class="eyebrow">补给站主控</p>
          <h2>派遣、回收、升级，一轮一轮把废星啃下来。</h2>
            <p class="muted">当前最顺的节奏是：派遣到推荐区域，等货舱有收获后返航，卖废品拿废币，再用材料升级回收机、充电桩或雷达塔。</p>
          <div class="button-row">
            <button class="primary" data-action="quick-run">${icon("play")}派遣到推荐区域</button>
            <button data-action="sell-junk">${icon("coin")}出售废品</button>
            <button data-action="repair">${icon("wrench")}维修</button>
          </div>
        </div>
        ${renderRobotVisual()}
      </section>
      <section class="panel span-5">
        <div class="panel-head">
          <h2>补给参数</h2>
          <span class="pill">原型测试</span>
        </div>
        <label class="control-row">
          <span>时间倍率</span>
          <input class="speed-input" data-action="speed-custom" type="number" min="1" max="300" step="1" value="${state.speed}" title="自定义倍率，范围 1-300" />
        </label>
        <div class="stat-grid compact">
          ${statCard("攻击", stats.attack)}
          ${statCard("防御", stats.defense)}
          ${statCard("采集", `${Math.round(stats.gatherYield * 100)}%`)}
          ${statCard("废品溢价", `${Math.round(stats.junkValue * 100)}%`)}
        </div>
        <div class="supply-status">
          <b>下次探索补给</b>
          <p>${preparedSupplyText()}</p>
        </div>
        <button class="ghost full" data-action="debug-grant">加入少量测试资源</button>
      </section>
      ${renderObjectivePanel()}
      ${renderTradePanel()}
      ${renderCraftingPanel()}
      <section class="panel span-12">
        <div class="panel-head">
          <h2>星球区域</h2>
          <span class="muted">锁定区域也可以点击，会显示具体条件。</span>
        </div>
        ${renderAreas(false)}
      </section>
      <section class="panel span-12">
        <div class="panel-head">
          <h2>扫描播报</h2>
          <span class="muted">新图鉴、稀有物、装备、遗物和战斗结果会在这里突出显示。</span>
        </div>
        ${renderHighlights(state.highlights)}
      </section>
    </div>
  `;
}

function renderAreas(showButtons = true) {
  const power = robotPower();
  return `<div class="area-list">
    ${data.planet.areas.map((area) => {
      const unlocked = state.unlockedAreas.includes(area.id);
      const pressure = area.recommendedPower ? (power / area.recommendedPower) * 100 : 100;
      const rareWeight = area.eventWeights.equipment + area.eventWeights.relic + area.eventWeights.blueprint + area.eventWeights.anomaly;
      return `
        <article class="area-row ${unlocked ? "unlocked" : "locked"}">
          <div>
            <div class="row-title">
              <strong>${area.name}</strong>
              <span class="pill">T${area.tier} · 推荐战力 ${area.recommendedPower}</span>
            </div>
            <p class="mini">废品 ${area.eventWeights.junk} · 材料 ${area.eventWeights.material} · 敌人 ${area.eventWeights.enemy} · 稀有 ${rareWeight}</p>
            ${progressBar(pressure, "战力匹配")}
            <p class="mini">${unlocked ? "区域可探索" : areaUnlockReason(area)}</p>
          </div>
          <button class="${unlocked ? "primary" : "ghost"}" data-action="start-run" data-area="${area.id}">
            ${unlocked ? "外出拾荒" : "查看条件"}
          </button>
        </article>
      `;
    }).join("")}
  </div>`;
}

function renderExplore() {
  const run = state.run;
  return `
    <div class="screen-grid">
      <section class="panel span-5">
        <div class="panel-head">
          <h2>选择区域</h2>
          <span class="pill">${state.run ? "探索中" : "待命"}</span>
        </div>
        ${renderAreas(true)}
      </section>
      <section class="panel span-7">
        <div class="panel-head">
          <h2>实时拾荒日志</h2>
          <div class="button-row tight">
            <button data-action="pulse-run">推进 1 分钟</button>
            <button data-action="return-run">手动返航</button>
          </div>
        </div>
        <div class="terminal-log" data-scroll-key="explore-log">
          ${(run?.logs ?? []).map((line) => `<p class="${line.tone}"><span>${line.time}</span>${line.message}</p>`).join("") || "<p class='muted'>机器人正在补给站待命。选择区域后会开始滚动日志。</p>"}
        </div>
      </section>
      <section class="panel span-5">
        <div class="panel-head">
          <h2>本次惊喜</h2>
          <span class="muted">${run ? `${run.highlights.length} 条播报` : "待命"}</span>
        </div>
        ${renderHighlights(run?.highlights ?? [])}
      </section>
      <section class="panel span-7">
        <div class="panel-head">
          <h2>战斗记录</h2>
          <span class="muted">胜利会获得经验和拆解掉落。</span>
        </div>
        ${renderCombatCards(run?.combats ?? [])}
      </section>
      <section class="panel span-12">
        <div class="panel-head">
          <h2>本次货舱</h2>
          <span class="muted">${run ? `${cargoUsed()} 件物资 · 补给 ${run.supplyNames?.length ? run.supplyNames.join("、") : "无"}` : "尚未外出"}</span>
        </div>
        ${renderLootSummary(run?.loot ?? {})}
      </section>
    </div>
  `;
}

function renderHighlights(entries) {
  if (!entries.length) return "<p class='empty'>暂时没有特别发现。普通废品会进入货舱，稀有物会在这里跳出来。</p>";
  return `<div class="highlight-grid">
    ${entries.slice(0, 8).map((entry) => `
      <article class="highlight-card ${entry.tone}">
        <span>${entry.time}</span>
        <b>${entry.title}</b>
        <p>${entry.body}</p>
      </article>
    `).join("")}
  </div>`;
}

function renderCombatCards(combats) {
  if (!combats.length) return "<p class='empty'>还没有战斗记录。遇敌后会显示回合、经验和掉落。</p>";
  return `<div class="combat-list">
    ${combats.map((combat) => `
      <article class="combat-card">
        <div class="row-title"><strong>${combat.enemy}</strong><span class="pill">${combat.rounds} 回合 · +${combat.xp} 经验 · +${combat.bounty ?? 0} 废币</span></div>
        <p class="mini">承受伤害：${combat.damageTaken ?? 0}</p>
        <p class="mini">${combat.lines.join("；")}</p>
        <p class="mini rare">掉落：${combat.drops.join("、") || "无"}</p>
      </article>
    `).join("")}
  </div>`;
}

function renderLootSummary(map) {
  const entries = Object.entries(map);
  if (!entries.length) return "<p class='empty'>货舱暂无物资。</p>";
  return `<div class="loot-grid">
    ${entries.map(([id, qty]) => {
      const item = itemById[id];
      return `<div class="loot-card rarity-${item.rarity}">
        <div class="item-icon">${categoryGlyph(item.category)}</div>
        <b>${item.name}</b>
        <span>${categoryName[item.category]} · ${rarityName[item.rarity] ?? item.rarity}</span>
        <strong>x${qty}</strong>
      </div>`;
    }).join("")}
  </div>`;
}

function inventoryEntries() {
  return Object.entries(state.inventory)
    .map(([id, qty]) => ({ item: itemById[id], qty }))
    .filter(({ item }) => item)
    .sort((a, b) => a.item.category.localeCompare(b.item.category) || b.item.value - a.item.value);
}

function renderInventory() {
  const entries = inventoryEntries();
  const filter = state.inventoryFilter ?? "all";
  const visibleEntries = filter === "all" ? entries : entries.filter(({ item }) => item.category === filter);
  const totalValue = entries.reduce((sum, { item, qty }) => sum + item.value * qty, 0);
  return `
    <div class="screen-grid">
      <section class="panel span-12">
        <div class="panel-head">
          <div>
            <h2>货舱仓库</h2>
            <p class="muted">废品负责换钱，材料负责升级，装备可以安装到机体槽位。</p>
          </div>
          <div class="button-row">
            <span class="pill">估值 ${fmt(totalValue)}</span>
            <button data-action="sell-junk">${icon("coin")}出售全部废品</button>
            <button data-action="sell-category" data-category="${filter}">${filter === "all" || filter === "junk" ? "出售全部废品" : "批量出售可售项"}</button>
          </div>
        </div>
        ${renderInventoryFilters(entries)}
        <div class="inventory-icon-grid">
          ${visibleEntries.map(({ item, qty }) => `
            <article class="inventory-icon-card rarity-${item.rarity}" title="${item.description || item.name}">
              <div class="item-icon">${categoryGlyph(item.category)}</div>
              <b>${item.name}</b>
              <span>${categoryName[item.category]} · ${rarityName[item.rarity] ?? item.rarity}</span>
              <em>${itemPurpose(item)}</em>
              <strong>x${qty}</strong>
              <div class="card-actions">
                ${item.category === "equipment" ? `<button class="primary" data-action="equip" data-item="${item.id}">安装</button>` : ""}
                ${item.category === "consumable" ? `<button class="primary" data-action="use-consumable" data-item="${item.id}">装入补给</button>` : ""}
                <button data-action="sell-one" data-item="${item.id}">卖1个</button>
                <button data-action="sell-stack" data-item="${item.id}">全卖</button>
              </div>
            </article>
          `).join("") || "<p class='empty'>这个分类暂时没有东西。</p>"}
        </div>
      </section>
    </div>
  `;
}

function itemPurpose(item) {
  if (item.category === "junk") return "用途：放心批量出售";
  if (item.category === "collectible") return "用途：收藏套装奖励/永久加成，批量出售保护";
  if (item.category === "material") return "用途：设施升级/装备合成";
  if (item.category === "equipment") return "用途：安装到机体槽位";
  if (item.category === "consumable") return `用途：装入下一次探索；效果：${effectText(item.effects)}`;
  if (item.category === "relic") return "用途：剧情收藏/完成度";
  if (item.category === "blueprint") return "用途：解锁设施或制作项";
  if (item.category === "anomaly") return "用途：特殊规则道具";
  return "用途：待识别";
}

function sourceHintForItem(itemId) {
  const item = itemById[itemId];
  const areaNames = (item?.sourceAreas ?? []).slice(0, 2).map((areaId) => areaById(areaId)?.name).filter(Boolean);
  const enemyNames = data.enemies
    .filter((enemy) => enemy.dropTable?.some((drop) => drop.itemId === itemId))
    .slice(0, 2)
    .map((enemy) => enemy.name);
  const hints = [...areaNames, ...enemyNames];
  return hints.length ? hints.join("、") : "未知来源";
}

function renderInventoryFilters(entries) {
  const counts = entries.reduce((acc, { item, qty }) => {
    acc[item.category] = (acc[item.category] ?? 0) + qty;
    acc.all += qty;
    return acc;
  }, { all: 0 });
  const filters = ["all", ...Object.keys(categoryName)];
  return `<div class="filter-row">
    ${filters.map((key) => `
      <button class="${(state.inventoryFilter ?? "all") === key ? "active-filter" : ""}" data-action="filter-inventory" data-filter="${key}">
        ${key === "all" ? "全部" : categoryName[key]} <span>${counts[key] ?? 0}</span>
      </button>
    `).join("")}
  </div>`;
}

function renderEquipment() {
  return `
    <div class="screen-grid">
      <section class="panel span-12">
        <div class="panel-head">
          <h2>机体装备</h2>
          <span class="muted">装备会改变探索时间、战斗强度、货舱容量和稀有发现率。</span>
        </div>
        <div class="equip-grid">
          ${slots.map((slot) => {
            const itemId = state.equipped[slot];
            const item = itemId ? itemById[itemId] : null;
            return `<article class="equip-row">
              <div class="slot-mark">${slotName[slot].slice(0, 1)}</div>
              <div>
                <h3>${slotName[slot]}</h3>
                ${item
                  ? `<b class="rarity-${item.rarity}">${item.name}</b><p class="mini">${Object.entries(item.effects ?? {}).map(([key, value]) => `${key} ${value}`).join(" / ")}</p>`
                  : "<p class='muted'>空槽位</p>"}
              </div>
              <button data-action="unequip" data-slot="${slot}">${item ? "卸下" : "空"}</button>
            </article>`;
          }).join("")}
        </div>
      </section>
    </div>
  `;
}

function renderCost(next) {
  if (!next) return "";
  const materials = next.cost.materials.map((cost) => {
    const owned = state.inventory[cost.itemId] ?? 0;
    const ok = owned >= cost.qty;
    return `<span class="${ok ? "ok" : "miss"}">${itemById[cost.itemId].name} ${owned}/${cost.qty}</span>`;
  }).join("");
  const blueprints = next.cost.blueprints.map((id) => {
    const ok = hasItem(id);
    return `<span class="${ok ? "ok" : "miss"}">${itemById[id].name}</span>`;
  }).join("");
  const moneyOk = state.money >= next.cost.money;
  return `<div class="cost-line">
    <span class="${moneyOk ? "ok" : "miss"}">废币 ${fmt(state.money)}/${fmt(next.cost.money)}</span>
    ${materials}${blueprints}
  </div>`;
}

function renderFacilities() {
  return `
    <div class="screen-grid">
      <section class="panel span-12">
        <div class="panel-head">
          <h2>设施升级</h2>
          <span class="muted">不能升级时也能点击，系统会告诉你缺什么。</span>
        </div>
        <div class="facility-list">
          ${data.facilities.map((facility) => {
            const level = state.facilities[facility.id] ?? 0;
            const next = facility.levels[level];
            const [ok, reason] = canUpgrade(facility);
            return `<article class="facility-row">
              <div>
                <div class="row-title">
                  <strong>${facility.name}</strong>
                  <span class="pill">Lv.${level} / ${facility.maxLevel}</span>
                </div>
                <p class="mini">${facility.description}</p>
                <p class="mini good-text">当前效果：${facilityEffectText(facility, level)}</p>
                ${facilityUnlockText(facility.id, level) ? `<p class="mini rare">${facilityUnlockText(facility.id, level)}</p>` : ""}
                ${renderCost(next)}
                ${next ? `<p class="mini">推荐来源：${[...new Set(next.cost.materials.flatMap((cost) => sourceHintForItem(cost.itemId).split("、")))].slice(0, 4).join("、")}</p>` : ""}
                ${!ok && next ? `<p class="mini warn-text">${reason}</p>` : ""}
              </div>
              <button class="${ok ? "primary" : "ghost"}" data-action="upgrade" data-facility="${facility.id}">
                ${level >= facility.maxLevel ? "满级" : ok ? "升级" : "查看缺口"}
              </button>
            </article>`;
          }).join("")}
        </div>
      </section>
    </div>
  `;
}

function renderCollection() {
  const foundItems = Object.keys(state.collection.items).length;
  const defeated = Object.keys(state.collection.enemies).length;
  return `
    <div class="screen-grid">
      <section class="panel span-4">
        <div class="panel-head"><h2>收集率</h2></div>
        <div class="big-number">${pct(collectionPercent())}</div>
        ${progressBar(collectionPercent(), "收集率")}
        <p class="mini">已发现 ${foundItems} / ${data.items.length} 个道具，击败 ${defeated} / ${data.enemies.length} 种敌人。</p>
        <p class="mini rare">探索进度：${pct(completionPercent())}。该数值按稀有物、遗物、敌人和套装权重计算，用于区域/星球条件。</p>
      </section>
      <section class="panel span-8">
        <div class="panel-head"><h2>分类进度</h2></div>
        <div class="collection-grid">
          ${Object.keys(categoryName).map((category) => {
            const total = data.items.filter((item) => item.category === category).length;
            const found = data.items.filter((item) => item.category === category && state.collection.items[item.id]).length;
            return `<article class="collection-row">
              <div class="row-title"><strong>${categoryName[category]}</strong><span>${found} / ${total}</span></div>
              ${progressBar((found / total) * 100, categoryName[category])}
            </article>`;
          }).join("")}
        </div>
      </section>
      <section class="panel span-12">
        <div class="panel-head">
          <div>
            <h2>收藏套装</h2>
            <p class="muted">收藏品不会被批量出售。凑齐一组后可领取永久加成和纪念遗物。</p>
          </div>
          <span class="pill">${Object.keys(state.claimedSets).length}/${COLLECTION_SETS.length}</span>
        </div>
        <div class="set-grid">
          ${COLLECTION_SETS.map((set) => {
            const progress = collectionSetProgress(set);
            const claimed = Boolean(state.claimedSets[set.id]);
            return `
              <article class="set-card ${claimed ? "claimed" : ""}">
                <div class="row-title">
                  <strong>${set.name}</strong>
                  <span class="pill">${claimed ? "已领取" : `${progress.found}/${progress.total}`}</span>
                </div>
                <p class="mini">${set.desc}</p>
                ${progressBar((progress.found / progress.total) * 100, set.name)}
                <p class="mini">需要：${set.itemIds.map((itemId) => `<span class="${state.collection.items[itemId] ? "ok-text" : "dim-text"}">${itemById[itemId]?.name ?? itemId}</span>`).join("、")}</p>
                <p class="mini rare">奖励：${set.reward.money} 废币 · ${rewardEffectText(set.reward.effects)}${set.reward.itemId ? ` · ${itemById[set.reward.itemId]?.name}` : ""}</p>
                <button class="${progress.complete && !claimed ? "primary" : "ghost"}" data-action="claim-set" data-set="${set.id}">
                  ${claimed ? "已领取" : progress.complete ? "领取奖励" : "未集齐"}
                </button>
              </article>
            `;
          }).join("")}
        </div>
      </section>
    </div>
  `;
}

function renderLog() {
  return `
    <div class="screen-grid">
      <section class="panel span-12">
        <div class="panel-head">
          <h2>运行日志</h2>
          <button data-action="save">保存</button>
        </div>
        <div class="terminal-log tall" data-scroll-key="full-log">
          ${state.logs.map((line) => `<p class="${line.tone ?? ""}"><span>${typeof line === "string" ? "" : line.time}</span>${typeof line === "string" ? line : line.message}</p>`).join("")}
        </div>
      </section>
    </div>
  `;
}

function renderView() {
  const view = $("#view");
  if (activeTab === "station") view.innerHTML = renderStation();
  if (activeTab === "explore") view.innerHTML = renderExplore();
  if (activeTab === "inventory") view.innerHTML = renderInventory();
  if (activeTab === "equipment") view.innerHTML = renderEquipment();
  if (activeTab === "facilities") view.innerHTML = renderFacilities();
  if (activeTab === "collection") view.innerHTML = renderCollection();
  if (activeTab === "log") view.innerHTML = renderLog();
}

function render() {
  const scrollState = [...document.querySelectorAll(".terminal-log")].map((el) => ({
    key: el.dataset.scrollKey ?? "",
    top: el.scrollTop
  }));
  unlockAreas();
  renderTabs();
  renderTop();
  renderView();
  for (const entry of scrollState) {
    const el = document.querySelector(`.terminal-log[data-scroll-key="${entry.key}"]`);
    if (el && entry.top > 0) el.scrollTop = entry.top;
  }
}

function handleAction(target) {
  const action = target.dataset.action;
  if (!action) return;
  if (action === "quick-run") startRun(bestArea().id);
  if (action === "start-run") startRun(target.dataset.area);
  if (action === "return-run") finishRun("手动返航");
  if (action === "pulse-run") {
    if (!state.run) notify("没有正在进行的探索。", "warn");
    else {
      state.run.elapsed += 60;
      while (state.run && state.run.elapsed >= state.run.nextEvent) processEvent();
      render();
    }
  }
  if (action === "sell-junk") sellJunk();
  if (action === "sell-one") sellItem(target.dataset.item, 1);
  if (action === "sell-stack") sellItem(target.dataset.item, state.inventory[target.dataset.item] ?? 0);
  if (action === "sell-category") sellCategory(target.dataset.category);
  if (action === "use-consumable") useConsumable(target.dataset.item);
  if (action === "buy-trade") buyTradeOffer(target.dataset.offer);
  if (action === "craft") craftRecipe(target.dataset.recipe);
  if (action === "claim-set") claimCollectionSet(target.dataset.set);
  if (action === "repair") repair();
  if (action === "upgrade") upgradeFacility(target.dataset.facility);
  if (action === "equip") equip(target.dataset.item);
  if (action === "unequip") unequip(target.dataset.slot);
  if (action === "filter-inventory") {
    state.inventoryFilter = target.dataset.filter;
    render();
  }
  if (action === "debug-grant") debugGrant();
  if (action === "save") {
    save();
    notify("存档完成。", "good");
  }
}

function bindEvents() {
  $("#tabs").addEventListener("click", (event) => {
    const tab = event.target.closest("[data-tab]");
    if (!tab) return;
    activeTab = tab.dataset.tab;
    render();
  });
  $("#view").addEventListener("click", (event) => {
    const target = event.target.closest("[data-action]");
    if (target) handleAction(target);
  });
  $("#view").addEventListener("change", (event) => {
    const target = event.target.closest("[data-action='speed-custom']");
    if (target) setSpeed(target.value);
  });
  $("#saveBtn").addEventListener("click", () => {
    save();
    notify("存档完成。", "good");
  });
  $("#resetBtn").addEventListener("click", resetSave);
}

async function runSmokeTest() {
  localStorage.removeItem(SAVE_KEY);
  state = defaultState();
  render();
  const started = startRun("rust_plain");
  for (let i = 0; i < 5; i += 1) {
    if (!state.run) break;
    state.run.elapsed += 60;
    while (state.run && state.run.elapsed >= state.run.nextEvent) processEvent();
  }
  if (state.run) finishRun("烟测返航");
  sellJunk();
  debugGrant();
  upgradeFacility("recycler");
  activeTab = "facilities";
  render();
  const result = document.createElement("div");
  result.id = "smoke-result";
  result.dataset.started = String(started);
  result.dataset.money = String(state.money);
  result.dataset.recycler = String(state.facilities.recycler);
  result.dataset.items = String(Object.keys(state.collection.items).length);
  result.textContent = `SMOKE_OK started=${started} recycler=${state.facilities.recycler} items=${Object.keys(state.collection.items).length}`;
  document.body.appendChild(result);
}

function clickQa(selector, label, results) {
  const target = document.querySelector(selector);
  if (!target) {
    results.push({ label, ok: false, detail: `找不到 ${selector}` });
    return false;
  }
  target.click();
  results.push({ label, ok: true, detail: "clicked" });
  return true;
}

function auditFacilityEffectWiring() {
  const originalState = state;
  const failures = [];
  const check = (label, ok) => {
    if (!ok) failures.push(label);
  };

  state = defaultState();
  const base = robotStats();

  state.facilities.recycler = 1;
  check("回收机废品售价", robotStats().junkValue > base.junkValue);
  state.facilities.recycler = 0;

  state.facilities.charger = 1;
  const chargerStats = robotStats();
  check("充电桩探索时长", chargerStats.exploreMinutes > base.exploreMinutes);
  check("充电桩离线上限", chargerStats.offlineCapHours > base.offlineCapHours);
  state.facilities.charger = 0;

  state.facilities.warehouse = 1;
  check("仓库货舱容量", robotStats().cargoSlots > base.cargoSlots);
  state.facilities.warehouse = 0;

  state.facilities.workbench = 1;
  check("工作台制作折扣", workbenchLevel() >= 1 && craftPrice(CRAFT_RECIPES[0]) < CRAFT_RECIPES[0].cost.money);
  state.facilities.workbench = 0;

  state.facilities.radar_tower = 1;
  const radarStats = robotStats();
  check("雷达塔稀有发现", radarStats.rareFind > base.rareFind && radarStats.hiddenEvent > base.hiddenEvent);
  state.facilities.radar_tower = 0;

  state.facilities.repair_bay = 1;
  check("维修仓战损减免", robotStats().repair > base.repair);
  state.facilities.repair_bay = 0;

  state.facilities.research_terminal = 1;
  state.collection.items.relic_001 = now();
  const researchStats = robotStats();
  check("研究终端遗物加成", researchStats.xpGain > base.xpGain && researchStats.rareFind > base.rareFind);
  state.facilities.research_terminal = 0;
  state.collection.items = {};

  state.facilities.trade_beacon = 1;
  check("交易信标商人折扣", availableTradeOffers().length > 0 && tradePrice(TRADE_OFFERS[0]) < TRADE_OFFERS[0].cost);
  state.facilities.trade_beacon = 0;

  state.facilities.dispatch = 1;
  const dispatchStats = robotStats();
  check("自动派遣离线收益", dispatchStats.offlineCapHours > base.offlineCapHours && dispatchStats.offlineEfficiency > base.offlineEfficiency);
  state.facilities.dispatch = 0;

  state.facilities.navigation = 2;
  unlockAreas();
  check("星际导航区域解锁", state.unlockedAreas.includes("old_launch_site"));

  state = originalState;
  return {
    ok: failures.length === 0,
    detail: failures.length ? failures.join("、") : "10/10 facilities wired"
  };
}

async function runClickQaTest() {
  localStorage.removeItem(SAVE_KEY);
  state = defaultState();
  const results = [];
  results.push({
    label: "初始只开放补给站外围",
    ok: state.unlockedAreas.length === 1 && state.unlockedAreas.includes("station_outskirts"),
    detail: state.unlockedAreas.join(",")
  });
  activeTab = "station";
  render();
  const speedInput = document.querySelector(`[data-action="speed-custom"]`);
  if (speedInput) {
    speedInput.value = "77";
    speedInput.dispatchEvent(new Event("change", { bubbles: true }));
  }
  results.push({
    label: "时间倍率支持自定义输入",
    ok: state.speed === 77,
    detail: `speed=${state.speed}`
  });
  const facilityAudit = auditFacilityEffectWiring();
  results.push({
    label: "所有设施升级均接入实际玩法效果",
    ok: facilityAudit.ok,
    detail: facilityAudit.detail
  });

  const battery = data.items.find((item) => item.category === "equipment" && item.tags.includes("battery"));
  addItem(battery.id, 1);
  activeTab = "inventory";
  render();
  clickQa(`[data-action="equip"][data-item="${battery.id}"]`, "点击安装电池", results);
  results.push({
    label: "电池已装备",
    ok: state.equipped.battery === battery.id,
    detail: state.equipped.battery ?? "empty"
  });

  activeTab = "equipment";
  render();
  clickQa(`[data-action="unequip"][data-slot="battery"]`, "点击卸下电池", results);
  results.push({
    label: "电池已卸下并回到背包",
    ok: state.equipped.battery === null && (state.inventory[battery.id] ?? 0) >= 1,
    detail: `slot=${state.equipped.battery}; inventory=${state.inventory[battery.id] ?? 0}`
  });

  addItem("junk_001", 3);
  const collectible = data.items.find((item) => item.category === "collectible");
  addItem(collectible.id, 1);
  const moneyBeforeSell = state.money;
  activeTab = "inventory";
  render();
  clickQa(`[data-action="sell-junk"]`, "点击出售全部废品", results);
  results.push({
    label: "废品已出售且收藏品被保护",
    ok: (state.inventory.junk_001 ?? 0) === 0 && (state.inventory[collectible.id] ?? 0) === 1 && state.money > moneyBeforeSell,
    detail: `money ${moneyBeforeSell} -> ${state.money}; junk=${state.inventory.junk_001 ?? 0}; collectible=${state.inventory[collectible.id] ?? 0}`
  });

  addItem("junk_002", 2);
  addItem("mat_scrap_iron", 2);
  activeTab = "inventory";
  render();
  clickQa(`[data-action="filter-inventory"][data-filter="material"]`, "点击材料分类", results);
  results.push({
    label: "仓库分类切到材料",
    ok: state.inventoryFilter === "material",
    detail: state.inventoryFilter
  });

  const moneyBeforeMaterialSell = state.money;
  clickQa(`[data-action="sell-one"][data-item="mat_scrap_iron"]`, "点击出售1个材料", results);
  results.push({
    label: "材料可以出售且废币增加",
    ok: state.money > moneyBeforeMaterialSell && (state.inventory.mat_scrap_iron ?? 0) === 1,
    detail: `money ${moneyBeforeMaterialSell} -> ${state.money}; mat=${state.inventory.mat_scrap_iron ?? 0}`
  });

  const supply = data.items.find((item) => item.category === "consumable" && item.effects?.maxExploreMinutes);
  addItem(supply.id, 1);
  activeTab = "inventory";
  state.inventoryFilter = "consumable";
  render();
  clickQa(`[data-action="use-consumable"][data-item="${supply.id}"]`, "点击装入补给", results);
  results.push({
    label: "补给进入下一次探索队列",
    ok: state.preparedSupply.names.includes(supply.name),
    detail: state.preparedSupply.names.join(",")
  });
  activeTab = "station";
  render();
  results.push({
    label: "首页显示补给具体效果",
    ok: document.body.textContent.includes("效果：") && document.body.textContent.includes("探索时长"),
    detail: preparedSupplyText()
  });

  grantFacilityCost("recycler");
  const recyclerBefore = state.facilities.recycler;
  activeTab = "facilities";
  render();
  clickQa(`[data-action="upgrade"][data-facility="recycler"]`, "点击升级回收机", results);
  results.push({
    label: "回收机等级增加",
    ok: state.facilities.recycler === recyclerBefore + 1,
    detail: `recycler ${recyclerBefore} -> ${state.facilities.recycler}`
  });
  results.push({
    label: "回收机Lv1后解锁锈蚀平原",
    ok: state.unlockedAreas.includes("rust_plain"),
    detail: state.unlockedAreas.join(",")
  });
  results.push({
    label: "废弃太阳能农场不会早于锈蚀平原探索解锁",
    ok: !state.unlockedAreas.includes("solar_farm"),
    detail: state.unlockedAreas.join(",")
  });

  state.robot.hp = robotStats().maxHp;
  const baseMinutes = data.planet.initialExploreMinutes;
  const started = startRun("rust_plain");
  results.push({
    label: "补给影响探索时长",
    ok: started && state.run.duration > baseMinutes * 60,
    detail: `duration=${state.run?.duration}; base=${baseMinutes * 60}`
  });
  for (let i = 0; i < 16 && state.run; i += 1) {
    processEnemy(areaById("rust_plain"));
  }
  const hpAfterCombat = state.run ? state.run.hp : state.robot.hp;
  results.push({
    label: "连续战斗不会把耐久直接压到1",
    ok: started && hpAfterCombat > 1,
    detail: `hp=${hpAfterCombat}`
  });
  results.push({
    label: "战斗产生可见记录或战斗日志",
    ok: state.logs.some((line) => line.message?.includes("战斗胜利") || line.message?.includes("战斗失败")),
    detail: state.logs.find((line) => line.message?.includes("战斗"))?.message ?? "no combat log"
  });
  results.push({
    label: "运行日志显示战斗过程和承受伤害",
    ok: state.logs.some((line) => line.message?.includes("战斗过程") && line.message?.includes("承受伤害")),
    detail: state.logs.find((line) => line.message?.includes("战斗过程"))?.message ?? "no combat detail"
  });
  results.push({
    label: "战斗奖励会增加废币和击败计数",
    ok: state.stats.enemiesDefeated > 0 && state.logs.some((line) => line.message?.includes("战斗拆解赏金")),
    detail: `defeated=${state.stats.enemiesDefeated}; money=${state.money}`
  });

  if (state.run) finishRun("QA战斗后返航");
  results.push({
    label: "完成锈蚀平原探索后解锁废弃太阳能农场",
    ok: state.unlockedAreas.includes("solar_farm"),
    detail: state.unlockedAreas.join(",")
  });
  startRun("station_outskirts");
  const specialBefore = state.stats.specialEvents;
  processSpecialExplorationEvent(areaById("station_outskirts"), "sealed_cache");
  results.push({
    label: "特殊探索事件会产出播报和奖励",
    ok: state.stats.specialEvents === specialBefore + 1 && state.highlights.some((entry) => entry.title === "密封箱"),
    detail: `special=${state.stats.specialEvents}; cargo=${cargoUsed()}`
  });
  if (state.run) finishRun("QA特殊事件返航");

  grantFacilityCost("trade_beacon");
  state.money = Math.max(state.money, 1000);
  const tradeBefore = state.facilities.trade_beacon;
  activeTab = "facilities";
  render();
  clickQa(`[data-action="upgrade"][data-facility="trade_beacon"]`, "点击升级交易信标", results);
  results.push({
    label: "交易信标升级后开放商人交易站",
    ok: state.facilities.trade_beacon === tradeBefore + 1 && tradeLevel() >= 1,
    detail: `trade=${state.facilities.trade_beacon}`
  });
  activeTab = "station";
  render();
  const moneyBeforeTrade = state.money;
  clickQa(`[data-action="buy-trade"][data-offer="supply_cache"]`, "点击购买商人货物", results);
  results.push({
    label: "商人交易购买生效",
    ok: state.money < moneyBeforeTrade && (state.tradePurchases.supply_cache ?? 0) === 1 && (state.inventory.consumable_001 ?? 0) >= 1,
    detail: `money ${moneyBeforeTrade} -> ${state.money}; bought=${state.tradePurchases.supply_cache ?? 0}`
  });

  grantFacilityCost("workbench");
  const workbenchBefore = state.facilities.workbench;
  activeTab = "facilities";
  render();
  clickQa(`[data-action="upgrade"][data-facility="workbench"]`, "点击升级工作台", results);
  results.push({
    label: "工作台升级后开放制作工坊",
    ok: state.facilities.workbench === workbenchBefore + 1 && workbenchLevel() >= 1,
    detail: `workbench=${state.facilities.workbench}`
  });

  grantRecipeCost("field_repair_pack");
  activeTab = "station";
  render();
  const craftedBefore = state.stats.crafted;
  clickQa(`[data-action="craft"][data-recipe="field_repair_pack"]`, "点击制作野外维修包", results);
  results.push({
    label: "制作消耗材料并产出补给",
    ok: state.stats.crafted === craftedBefore + 1 && (state.inventory.consumable_004 ?? 0) >= 2,
    detail: `crafted=${state.stats.crafted}; repairPack=${state.inventory.consumable_004 ?? 0}`
  });

  const firstSet = COLLECTION_SETS[0];
  for (const itemId of firstSet.itemIds) addItem(itemId, 1);
  activeTab = "collection";
  render();
  const rareBefore = robotStats().rareFind;
  clickQa(`[data-action="claim-set"][data-set="${firstSet.id}"]`, "点击领取收藏套装", results);
  const rareAfter = robotStats().rareFind;
  results.push({
    label: "收藏套装奖励提供永久加成",
    ok: state.claimedSets[firstSet.id] && state.stats.collectionSets >= 1 && rareAfter > rareBefore,
    detail: `sets=${state.stats.collectionSets}; rare ${rareBefore} -> ${rareAfter}`
  });

  activeTab = "log";
  render();
  const logEl = document.querySelector('.terminal-log[data-scroll-key="full-log"]');
  if (logEl) {
    logEl.scrollTop = 140;
    render();
  }
  const restoredLogEl = document.querySelector('.terminal-log[data-scroll-key="full-log"]');
  results.push({
    label: "运行日志滚动位置不会被刷新拉回顶部",
    ok: Boolean(restoredLogEl && restoredLogEl.scrollTop >= 100),
    detail: `scrollTop=${restoredLogEl?.scrollTop ?? "missing"}`
  });

  const panel = document.createElement("pre");
  panel.id = "qa-result";
  panel.textContent = JSON.stringify({
    ok: results.every((result) => result.ok),
    results
  }, null, 2);
  document.body.appendChild(panel);
}

async function boot() {
  await loadData();
  state = loadSave();
  applyOfflineProgress();
  bindEvents();
  render();
  if (new URLSearchParams(location.search).has("smoke")) {
    await runSmokeTest();
  }
  if (new URLSearchParams(location.search).has("qa")) {
    await runClickQaTest();
  }
  setInterval(tick, 1000);
}

boot();
