import fs from "node:fs";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const dataDir = path.join(root, "data");
const read = (name) => JSON.parse(fs.readFileSync(path.join(dataDir, name), "utf8"));

const items = read("items.json");
const enemies = read("enemies.json");
const facilities = read("facilities.json");
const planet = read("planet_rust_mother.json");
const loot = read("loot_tables.json");

const errors = [];
const ensure = (condition, message) => {
  if (!condition) errors.push(message);
};

const itemIds = new Set(items.map((x) => x.id));
const enemyIds = new Set(enemies.map((x) => x.id));
const facilityIds = new Set(facilities.map((x) => x.id));
const areaIds = new Set(planet.areas.map((x) => x.id));

ensure(items.length >= 300, `items count should be >= 300, got ${items.length}`);
ensure(itemIds.size === items.length, "item ids must be unique");
ensure(enemyIds.size === enemies.length, "enemy ids must be unique");
ensure(facilityIds.size === facilities.length, "facility ids must be unique");

for (const it of items) {
  ensure(Array.isArray(it.sourceAreas), `${it.id} sourceAreas must be array`);
  for (const areaId of it.sourceAreas) ensure(areaIds.has(areaId), `${it.id} references missing area ${areaId}`);
}

for (const enemy of enemies) {
  for (const drop of enemy.dropTable ?? []) ensure(itemIds.has(drop.itemId), `${enemy.id} drops missing item ${drop.itemId}`);
}

for (const facility of facilities) {
  for (const level of facility.levels ?? []) {
    for (const cost of level.cost?.materials ?? []) ensure(itemIds.has(cost.itemId), `${facility.id} level ${level.level} costs missing item ${cost.itemId}`);
    for (const blueprint of level.cost?.blueprints ?? []) ensure(itemIds.has(blueprint), `${facility.id} level ${level.level} requires missing blueprint ${blueprint}`);
  }
}

for (const area of planet.areas) {
  const condition = area.unlockCondition ?? {};
  if (condition.type === "bossDefeated") ensure(enemyIds.has(condition.enemyId), `${area.id} unlock references missing boss ${condition.enemyId}`);
  if (condition.type === "facilityLevel") ensure(facilityIds.has(condition.facilityId), `${area.id} unlock references missing facility ${condition.facilityId}`);
}

for (const condition of planet.unlockNextPlanet.conditions ?? []) {
  if (condition.type === "facilityLevel") ensure(facilityIds.has(condition.facilityId), `next planet references missing facility ${condition.facilityId}`);
  if (condition.type === "itemOwned") ensure(itemIds.has(condition.itemId), `next planet references missing item ${condition.itemId}`);
}

for (const [areaId, pool] of Object.entries(loot.areaPools ?? {})) {
  ensure(areaIds.has(areaId), `loot references missing area ${areaId}`);
  for (const id of pool.itemIds ?? []) ensure(itemIds.has(id), `loot ${areaId} references missing item ${id}`);
  for (const id of pool.enemies ?? []) ensure(enemyIds.has(id), `loot ${areaId} references missing enemy ${id}`);
  if (pool.boss) ensure(enemyIds.has(pool.boss), `loot ${areaId} references missing boss ${pool.boss}`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  counts: {
    items: items.length,
    enemies: enemies.length,
    facilities: facilities.length,
    areas: planet.areas.length
  }
}, null, 2));
