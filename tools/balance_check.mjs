import fs from "node:fs";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const dataDir = path.join(root, "data");
const read = (name) => JSON.parse(fs.readFileSync(path.join(dataDir, name), "utf8"));

const items = read("items.json");
const facilities = read("facilities.json");
const planet = read("planet_rust_mother.json");
const loot = read("loot_tables.json");
const itemById = Object.fromEntries(items.map((item) => [item.id, item]));

function expectedRun(areaId) {
  const area = planet.areas.find((entry) => entry.id === areaId);
  const pool = loot.areaPools[areaId].itemIds.map((id) => itemById[id]);
  const totalWeight = Object.values(area.eventWeights).reduce((sum, weight) => sum + weight, 0);
  const events = Math.round((planet.initialExploreMinutes * 60) / ((planet.baseEventIntervalSeconds.min + planet.baseEventIntervalSeconds.max) / 2));
  const byCategory = Object.fromEntries(Object.entries(area.eventWeights).map(([key, weight]) => [key, events * weight / totalWeight]));
  const junkItems = pool.filter((item) => item.category === "junk");
  const materialItems = pool.filter((item) => item.category === "material");
  const avgJunkValue = junkItems.reduce((sum, item) => sum + item.value, 0) / junkItems.length;
  const junkMoney = byCategory.junk * 2.6 * avgJunkValue;
  const materialEvents = byCategory.material;
  return {
    areaId,
    events,
    junkMoney,
    materialEvents,
    materialKinds: materialItems.length,
    expectedPerSpecificMaterial: materialEvents * 1.6 / materialItems.length
  };
}

const early = expectedRun("rust_plain");
const levelOneCosts = facilities.map((facility) => {
  const level = facility.levels[0];
  const slowestMaterialRuns = Math.max(...level.cost.materials.map((cost) => cost.qty / early.expectedPerSpecificMaterial));
  return {
    id: facility.id,
    name: facility.name,
    moneyRuns: level.cost.money / early.junkMoney,
    materialRuns: slowestMaterialRuns
  };
});

const levelTwoCosts = facilities.map((facility) => {
  const level = facility.levels[1];
  const slowestMaterialRuns = Math.max(...level.cost.materials.map((cost) => cost.qty / early.expectedPerSpecificMaterial));
  return {
    id: facility.id,
    name: facility.name,
    moneyRuns: level.cost.money / early.junkMoney,
    materialRuns: slowestMaterialRuns
  };
});

const report = {
  assumptions: {
    runMinutes: planet.initialExploreMinutes,
    averageEventIntervalSeconds: (planet.baseEventIntervalSeconds.min + planet.baseEventIntervalSeconds.max) / 2,
    targetLevel1Runs: "1-3",
    targetLevel2Runs: "3-6"
  },
  earlyRunEstimate: {
    events: early.events,
    junkMoney: Math.round(early.junkMoney),
    materialEvents: Number(early.materialEvents.toFixed(1)),
    materialKinds: early.materialKinds,
    expectedPerSpecificMaterial: Number(early.expectedPerSpecificMaterial.toFixed(2))
  },
  levelOneRange: {
    moneyRuns: [
      Number(Math.min(...levelOneCosts.map((x) => x.moneyRuns)).toFixed(2)),
      Number(Math.max(...levelOneCosts.map((x) => x.moneyRuns)).toFixed(2))
    ],
    materialRuns: [
      Number(Math.min(...levelOneCosts.map((x) => x.materialRuns)).toFixed(2)),
      Number(Math.max(...levelOneCosts.map((x) => x.materialRuns)).toFixed(2))
    ]
  },
  levelTwoRange: {
    moneyRuns: [
      Number(Math.min(...levelTwoCosts.map((x) => x.moneyRuns)).toFixed(2)),
      Number(Math.max(...levelTwoCosts.map((x) => x.moneyRuns)).toFixed(2))
    ],
    materialRuns: [
      Number(Math.min(...levelTwoCosts.map((x) => x.materialRuns)).toFixed(2)),
      Number(Math.max(...levelTwoCosts.map((x) => x.materialRuns)).toFixed(2))
    ]
  },
  warnings: []
};

if (report.levelOneRange.materialRuns[1] > 3) report.warnings.push("Level 1 material costs may feel slow.");
if (report.levelTwoRange.materialRuns[1] > 6) report.warnings.push("Level 2 material costs may feel slow.");
if (report.earlyRunEstimate.junkMoney < 180) report.warnings.push("Early money income is too low.");
if (report.earlyRunEstimate.junkMoney > 1200) report.warnings.push("Early money income may be too high.");

console.log(JSON.stringify(report, null, 2));
process.exit(report.warnings.length ? 1 : 0);
