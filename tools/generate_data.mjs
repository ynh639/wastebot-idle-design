import fs from "node:fs";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const dataDir = path.join(root, "data");
fs.mkdirSync(dataDir, { recursive: true });

const rarities = {
  junk: "common",
  material: "common",
  uncommon: "uncommon",
  rare: "rare",
  epic: "epic",
  legendary: "legendary",
  anomaly: "anomaly"
};

const areas = [
  { id: "station_outskirts", name: "补给站外围", tier: 1 },
  { id: "rust_plain", name: "锈蚀平原", tier: 1 },
  { id: "solar_farm", name: "废弃太阳能农场", tier: 2 },
  { id: "collapsed_mech_city", name: "坍塌机械城", tier: 3 },
  { id: "underground_maintenance", name: "地下维修通道", tier: 4 },
  { id: "old_launch_site", name: "旧时代发射场", tier: 5 }
];

const item = (id, name, category, extra = {}) => ({
  id,
  name,
  category,
  rarity: extra.rarity ?? "common",
  value: extra.value ?? 1,
  stackable: extra.stackable ?? category !== "equipment",
  weight: extra.weight ?? 1,
  collectionPoints: extra.collectionPoints ?? 1,
  planet: "rust_mother",
  sourceAreas: extra.sourceAreas ?? areas.map((a) => a.id),
  tags: extra.tags ?? [],
  description: extra.description ?? "",
  effects: extra.effects ?? {}
});

const allItems = [];
const add = (entry) => allItems.push(entry);

const junkNames = [
  "弯曲钛合金叉", "过期太空牙膏", "烧焦驾驶员手册", "裂纹隔热杯", "半截机械手指",
  "报废清洁机器人眼球", "磨损履带齿", "静电吸附袜", "变形广告牌字母A", "变形广告牌字母B",
  "打不开的午餐罐头", "空白身份牌", "起泡密封胶管", "失效彩票", "宇航员合影残片",
  "不明口味营养膏", "断裂信号旗", "报废电梯按钮", "写着别按的红按钮", "旧时代会员卡",
  "干瘪冷却液袋", "压扁饮料罐", "三只脚的椅子", "裂开的观察窗玻璃", "报废安全帽",
  "变形扳手", "被咬过的金属饭盒", "过热风扇叶片", "褪色危险标识", "失灵倒计时器",
  "儿童尺寸宇航靴", "发霉滤芯", "空的润滑油瓶", "报废磁带", "只剩封面的维修指南",
  "弯折门禁卡", "焦黑无人机螺旋桨", "干涸培养皿", "无法读取的黑匣子外壳", "碎裂键帽",
  "旧世界咖啡杯", "粘住的保险丝盒", "漏气救生球", "褪色星图海报", "断线耳机",
  "破损仿生鱼鳞", "过期氧气罐", "空白警告贴纸", "压坏的玩具火箭", "嚼过的电缆皮",
  "报废温控旋钮", "失真语音芯片", "生锈瓶盖", "假黄金螺母", "旧报纸塑封页",
  "无法充电的电池", "冻裂食物托盘", "爆裂压力表", "粘尘毛刷", "塌陷工具箱",
  "坏掉的好运挂件", "断裂机械昆虫翅", "旧式键盘空格键", "永久卡住的拉链", "手写求救便签",
  "被太阳晒脆的胶管", "报废导航罗盘", "弯曲采样勺", "空药板", "变色防护镜",
  "发硬密封圈", "旧能源账单", "碎裂舱门铭牌", "没电的生日蜡烛", "异味布条",
  "被压扁的玩偶头", "失灵磁吸鞋扣", "掉漆纪念币", "空香料瓶", "未知宠物粮",
  "裂纹水杯盖", "报废微波炉门", "坏掉的天气球", "无主钥匙串", "起皱包装膜",
  "掉线通信耳麦", "焦化电路贴片", "半块隔音棉", "发酸蛋白棒", "被踩扁的路标",
  "打不开的保险箱门", "错版徽章", "断掉的自拍杆", "破裂药剂瓶", "空冷冻胶囊",
  "报废巡逻灯", "失效灭火贴", "报废小型推进器喷嘴", "龟裂显示屏", "旧款机器人名牌",
  "走调电子口琴", "压弯的餐盘", "没墨的记录笔", "永久亮着的红灯泡", "无法解释的塑料勺",
  "散架折叠床", "碎掉的纪念水晶", "报废重力靴", "旧电影票根", "写满涂鸦的面板",
  "脱落隔热瓦", "报废语音门铃", "被酸雨蚀穿的伞", "漏沙沙漏", "空白数据卡",
  "过期镇静贴", "磨平齿轮", "报废水循环滤网", "裂开的太空花盆", "走样玩具机器人",
  "褪色欢迎横幅", "坏掉的抽奖机摇杆", "断裂充电枪", "变脆塑料徽章", "弯折仓库标签",
  "烧熔插头", "漏电夜灯", "坏掉的电子骰子", "没有指针的表盘", "报废门锁舌",
  "空急救盒", "断裂天线头", "旧式纸质地图", "黏糊糊样本袋", "失效防辐射贴",
  "变形货架钩", "熄灭警示棒", "磨损编号牌", "发黑水壶", "凹陷能源罐",
  "旧派对彩带", "无法识别的遥控器", "破洞手套", "歪斜螺丝刀", "冻住的饮水阀",
  "低温裂纹管", "碎裂镜片", "报废投币口", "空罐装空气", "过时宣传册",
  "焦黑计步器", "没有脚的桌子", "损坏呼吸阀", "断裂皮带扣", "错印星球贴纸",
  "报废胶片盒", "松动铆钉袋", "烧坏节日灯串", "掉毛清洁刷", "旧版安全守则",
  "卡住的录音按钮", "起鼓舱壁贴片", "失效安眠胶囊", "碎裂透明面罩", "报废热水阀",
  "奇怪口味糖纸", "过期矿物水", "变形餐叉二号", "压扁盲盒", "旧导航员胸针",
  "断裂机械尾巴", "无信号寻呼机", "龟裂电热毯", "未寄出的明信片", "坏掉的合影框",
  "报废喷漆罐", "一袋旧灰尘", "空的纪念胶囊", "变形维修夹", "断裂迷你太阳帆",
  "报废计数器", "裂开的假牙盒", "永久打结的线缆", "旧时代瓶中信", "破损训练靶",
  "生锈快递柜门", "断裂扭矩杆", "熔化软糖盒", "报废语音玩偶", "空的电池展示盒"
];

junkNames.forEach((name, index) => {
  const collectibleNames = new Set([
    "失效彩票", "宇航员合影残片", "写着别按的红按钮", "旧时代会员卡", "儿童尺寸宇航靴",
    "旧世界咖啡杯", "褪色星图海报", "手写求救便签", "旧能源账单", "没电的生日蜡烛",
    "被压扁的玩偶头", "掉漆纪念币", "未知宠物粮", "旧款机器人名牌", "走调电子口琴",
    "旧电影票根", "写满涂鸦的面板", "裂开的太空花盆", "走样玩具机器人", "褪色欢迎横幅",
    "旧式纸质地图", "旧派对彩带", "错印星球贴纸", "未寄出的明信片", "坏掉的合影框",
    "空的纪念胶囊", "旧时代瓶中信", "熔化软糖盒", "报废语音玩偶", "旧导航员胸针"
  ]);
  const tier = 1 + Math.floor(index / 38);
  const isCollectible = collectibleNames.has(name);
  add(item(`junk_${String(index + 1).padStart(3, "0")}`, name, isCollectible ? "collectible" : "junk", {
    rarity: isCollectible ? (tier >= 4 ? "rare" : "uncommon") : index % 37 === 0 ? "uncommon" : "common",
    value: isCollectible ? 35 + tier * 12 + (index % 11) : 2 + tier * 2 + (index % 7),
    weight: 1,
    collectionPoints: isCollectible ? 1 : 0.2,
    sourceAreas: areas.filter((a) => a.tier <= Math.min(5, tier + 1)).map((a) => a.id),
    tags: isCollectible ? ["collectible", "set_piece", `tier_${tier}`] : ["sell_only", `tier_${tier}`],
    description: isCollectible ? "看起来像废品，但属于收藏套装或彩蛋线索，默认不会被批量出售。" : "纯废品，可以放心批量出售换废币。"
  }));
});

const materials = [
  ["mat_scrap_iron", "废铁", 4], ["mat_copper_wire", "铜线", 6], ["mat_polymer_shard", "聚合物碎片", 7],
  ["mat_broken_chip", "破损芯片", 8], ["mat_rubber_pad", "老化橡胶垫", 5], ["mat_filter_fiber", "滤芯纤维", 5],
  ["mat_low_grade_battery", "低阶电池芯", 12], ["mat_rust_plate", "锈蚀装甲片", 9], ["mat_micro_gear", "微型齿轮", 10],
  ["mat_ceramic_piece", "隔热陶瓷片", 11], ["mat_solar_fragment", "太阳能板碎片", 14], ["mat_signal_copper", "信号铜箔", 13],
  ["mat_hardened_bolt", "硬化螺栓", 8], ["mat_clean_lens", "可用透镜", 16], ["mat_coolant_salt", "冷却盐晶", 18],
  ["mat_data_pin", "数据针脚", 20], ["mat_magnetic_bearing", "磁悬浮轴承", 24], ["mat_flexible_joint", "柔性关节环", 22],
  ["mat_power_cable", "高压电缆段", 26], ["mat_servo_core", "伺服核心", 30], ["mat_alloy_frame", "轻质合金框", 32],
  ["mat_rad_shield", "辐射屏蔽片", 34], ["mat_memory_foam", "记忆泡棉", 28], ["mat_optic_fiber", "光纤束", 25],
  ["mat_plasma_contact", "等离子触点", 42], ["mat_pure_silicon", "纯化硅片", 36], ["mat_fusion_slag", "聚变炉渣", 38],
  ["mat_drone_eye", "无人机视觉模组", 44], ["mat_industrial_spring", "工业弹簧", 27], ["mat_navigation_pin", "导航针", 48],
  ["mat_pressure_valve", "压力阀", 31], ["mat_sensor_mesh", "传感网格", 45], ["mat_lubricant_gel", "润滑凝胶", 19],
  ["mat_bio_plastic", "生物塑料", 33], ["mat_rare_earth_dust", "稀土粉尘", 55], ["mat_old_world_battery", "旧世界电池芯", 65],
  ["mat_quantum_residue", "量子残渣", 88], ["mat_adaptive_alloy", "自适应合金", 76], ["mat_clean_reactor_shard", "洁净反应炉残片", 92],
  ["mat_ai_memory_chip", "AI记忆芯片", 85], ["mat_stabilized_crystal", "稳定能晶", 110], ["mat_star_chart_bit", "星图碎片", 120],
  ["mat_black_box_core", "黑匣子核心", 130], ["mat_boss_servo", "精英伺服组", 140], ["mat_launch_code_strip", "发射代码条", 160],
  ["mat_gravity_coil", "重力线圈", 150], ["mat_ion_capacitor", "离子电容", 95], ["mat_dustproof_fabric", "防尘织物", 21],
  ["mat_acid_resin", "防腐树脂", 70], ["mat_old_fuel_cell", "旧燃料电池", 72], ["mat_machine_bone", "机械骨片", 52],
  ["mat_titanium_powder", "钛粉", 58], ["mat_nanite_clump", "纳米群落块", 125], ["mat_core_cooler", "核心冷却器", 115],
  ["mat_laser_prism", "激光棱镜", 98], ["mat_emergency_beacon", "应急信标", 62], ["mat_thermal_paste", "导热膏", 23],
  ["mat_electro_muscle", "电活性肌束", 82], ["mat_radar_fin", "雷达鳍片", 60], ["mat_exo_shell", "外骨骼壳", 78],
  ["mat_high_density_cell", "高密度电芯", 118], ["mat_command_key", "指挥密钥", 145], ["mat_phase_screw", "相位螺丝", 132],
  ["mat_silent_motor", "静音马达", 74], ["mat_dust_glass", "尘化玻璃", 29], ["mat_storage_crystal", "存储晶粒", 66],
  ["mat_ancient_wire", "古旧银线", 54], ["mat_station_relay", "补给站继电器", 46]
];

materials.forEach(([id, name, value], index) => {
  const tier = 1 + Math.floor(index / 14);
  add(item(id, name, "material", {
    rarity: tier >= 5 ? "rare" : tier >= 3 ? "uncommon" : "common",
    value,
    collectionPoints: 0.5,
    sourceAreas: areas.filter((a) => a.tier >= Math.max(1, tier - 1) && a.tier <= Math.min(5, tier + 1)).map((a) => a.id),
    tags: ["upgrade", "crafting", `tier_${tier}`],
    description: "用于升级设施、装备模块或合成蓝图。"
  }));
});

const slots = [
  ["weapon", "武器"], ["shell", "外壳"], ["battery", "电池"], ["radar", "雷达"],
  ["arm", "采集臂"], ["chip", "芯片"], ["cargo", "货舱"], ["special", "特殊模块"]
];
const equipmentNames = [
  ["weapon", "裂齿切割器", { attack: 6 }], ["weapon", "电弧针枪", { attack: 9, crit: 0.02 }],
  ["weapon", "废铁冲击锤", { attack: 12 }], ["weapon", "太阳能灼烧枪", { attack: 15, rareFind: 0.01 }],
  ["weapon", "维修站军规电锯", { attack: 18, crit: 0.05 }], ["weapon", "离子钉发射器", { attack: 22 }],
  ["weapon", "旧时代守卫长矛", { attack: 28, defense: 2 }], ["weapon", "发射场等离子刃", { attack: 36, crit: 0.08 }],
  ["shell", "薄铁皮外壳", { maxHp: 20, defense: 2 }], ["shell", "双层废钢外壳", { maxHp: 35, defense: 4 }],
  ["shell", "防沙密封壳", { maxHp: 45, defense: 5, eventSafety: 0.02 }], ["shell", "太阳农场隔热壳", { maxHp: 55, defense: 7 }],
  ["shell", "坍塌城重装甲", { maxHp: 80, defense: 10, speed: -0.02 }], ["shell", "地下维修抗压壳", { maxHp: 95, defense: 12 }],
  ["shell", "旧时代卫兵外壳", { maxHp: 120, defense: 15 }], ["battery", "拼接电池包", { maxExploreMinutes: 10 }],
  ["battery", "旧太阳能电池", { maxExploreMinutes: 18 }], ["battery", "高密度电池组", { maxExploreMinutes: 30 }],
  ["battery", "自热式电池核心", { maxExploreMinutes: 45 }], ["battery", "发射场燃料电芯", { maxExploreMinutes: 70 }],
  ["battery", "饥饿电池", { maxExploreMinutes: 100, lootLossRisk: 0.03 }],
  ["radar", "短杆雷达", { rareFind: 0.02 }], ["radar", "补给站旧天线", { rareFind: 0.03, hiddenEvent: 0.01 }],
  ["radar", "三频搜索雷达", { rareFind: 0.05, hiddenEvent: 0.02 }], ["radar", "星图残片定位器", { rareFind: 0.08, hiddenEvent: 0.04 }],
  ["radar", "异常物嗅探器", { anomalyFind: 0.03, enemyRate: 0.02 }], ["arm", "单爪采集臂", { gatherYield: 0.05 }],
  ["arm", "磁吸采集臂", { gatherYield: 0.08, junkValue: 0.03 }], ["arm", "精密拆解臂", { gatherYield: 0.12, materialFind: 0.03 }],
  ["arm", "工业液压臂", { gatherYield: 0.18, attack: 3 }], ["arm", "纳米分拣臂", { gatherYield: 0.25, rareFind: 0.02 }],
  ["chip", "低温运算芯片", { xpGain: 0.05 }], ["chip", "战斗日志芯片", { xpGain: 0.08, attack: 2 }],
  ["chip", "拾荒路径芯片", { eventSpeed: 0.04, gatherYield: 0.05 }], ["chip", "旧AI碎片芯片", { xpGain: 0.15, hiddenEvent: 0.03 }],
  ["chip", "异常兼容芯片", { anomalyFind: 0.02, defense: -1 }], ["cargo", "帆布货袋", { cargoSlots: 8 }],
  ["cargo", "折叠货舱", { cargoSlots: 14 }], ["cargo", "压缩货柜", { cargoSlots: 22 }],
  ["cargo", "自动分格货舱", { cargoSlots: 30, junkValue: 0.05 }], ["cargo", "重力折叠货舱", { cargoSlots: 45 }],
  ["special", "损伤预警灯", { eventSafety: 0.03 }], ["special", "废品估价器", { junkValue: 0.08 }],
  ["special", "备用返航信标", { escapeChance: 0.2 }], ["special", "战利品压缩器", { cargoSlots: 10, gatherYield: 0.06 }],
  ["special", "彩蛋探针", { hiddenEvent: 0.05 }], ["special", "破损幸运硬币", { rareFind: 0.04, crit: 0.02 }],
  ["special", "旧发射场权限环", { hiddenEvent: 0.06, maxExploreMinutes: 20 }],
  ["weapon", "自言自语扳手", { attack: 16, hiddenEvent: 0.03 }],
  ["radar", "会唱歌的接收器", { rareFind: 0.04, anomalyFind: 0.01 }],
  ["chip", "最终版本测试芯片", { xpGain: 0.2, eventSafety: -0.02 }],
  ["arm", "不讲道理的抓钩", { gatherYield: 0.3, enemyRate: 0.03 }],
  ["shell", "纪念款金色外壳", { maxHp: 60, junkValue: 0.15 }],
  ["battery", "永不承认没电电池", { maxExploreMinutes: 55, escapeChance: 0.08 }]
];

equipmentNames.forEach(([slot, name, effects], index) => {
  const tier = 1 + Math.floor(index / 11);
  add(item(`eq_${slot}_${String(index + 1).padStart(3, "0")}`, name, "equipment", {
    rarity: tier >= 5 ? "epic" : tier >= 4 ? "rare" : tier >= 2 ? "uncommon" : "common",
    value: 60 + tier * 55 + index * 3,
    weight: slot === "shell" || slot === "cargo" ? 3 : 1,
    collectionPoints: 1,
    sourceAreas: areas.filter((a) => a.tier >= Math.max(1, tier - 1)).map((a) => a.id),
    tags: ["equipable", slot, `tier_${tier}`],
    description: `${slots.find((s) => s[0] === slot)?.[1] ?? "模块"}装备，可提升机器人能力。`,
    effects
  }));
});

const consumables = [
  ["临时电池包", { maxExploreMinutes: 20 }, "本次探索时间增加。"],
  ["浓缩润滑油", { defensePct: 0.1 }, "本次探索战斗受到伤害降低。"],
  ["信号增强器", { rareFind: 0.08 }, "本次探索稀有发现率提高。"],
  ["简易修补胶", { repairHp: 30 }, "返航后恢复耐久。"],
  ["压缩货舱袋", { cargoSlots: 10 }, "本次探索货舱临时扩容。"],
  ["防沙涂层", { eventSafety: 0.08 }, "降低危险事件概率。"],
  ["战斗模拟磁带", { attackPct: 0.12 }, "本次探索攻击提高。"],
  ["废土地图碎片", { hiddenEvent: 0.08 }, "提高隐藏事件概率。"],
  ["自动分拣标签", { gatherYield: 0.1 }, "提高材料获取量。"],
  ["紧急返航信标", { escapeChance: 0.5 }, "失败时更容易保住拾荒成果。"],
  ["旧世界能量饮料", { eventSpeed: 0.08 }, "事件间隔略微缩短。"],
  ["磁吸地垫", { junkValue: 0.1 }, "废品出售价值临时提高。"],
  ["低噪音履带套", { enemyRate: -0.05 }, "降低遇敌概率。"],
  ["挑衅喇叭", { enemyRate: 0.12, xpGain: 0.18 }, "提高遇敌概率和经验。"],
  ["异常稳定针", { anomalyFind: 0.05 }, "略微提高异常物发现率。"],
  ["太阳能折叠板", { maxExploreMinutes: 35 }, "适合长线挂机的补给。"],
  ["维修无人机券", { repairHp: 80 }, "返航时提供一次大修。"],
  ["高级探测脉冲", { rareFind: 0.12, hiddenEvent: 0.05 }, "寻找稀有物和彩蛋。"],
  ["防静电泡沫", { materialFind: 0.08 }, "提高芯片类材料获取。"],
  ["旧时代幸运贴", { rareFind: 0.05, crit: 0.04 }, "一点玄学，但机器人相信。"],
  ["拾荒者便当", { maxExploreMinutes: 15, xpGain: 0.05 }, "不知道机器人为什么要带。"],
  ["雷达校准卡", { hiddenEvent: 0.12 }, "更容易扫到隐藏点。"],
  ["护甲临时焊片", { defensePct: 0.16 }, "硬一点，总是好的。"],
  ["电机兴奋剂", { eventSpeed: 0.12, eventSafety: -0.03 }, "跑得更勤，也更吵。"],
  ["防火花披风", { defensePct: 0.08, hiddenEvent: 0.02 }, "看起来很有仪式感。"],
  ["旧世界音乐包", { enemyRate: -0.03, hiddenEvent: 0.03 }, "荒原里的背景音乐。"],
  ["载荷平衡器", { cargoSlots: 18 }, "临时增加更多容量。"],
  ["材料识别贴片", { materialFind: 0.12 }, "更容易把有用材料挑出来。"],
  ["战斗黑匣子", { xpGain: 0.25 }, "记录战斗细节，提升经验收益。"],
  ["全频好运喷雾", { rareFind: 0.08, anomalyFind: 0.02 }, "说明书称不要喷进处理器。"]
];

consumables.forEach(([name, effects, description], index) => {
  add(item(`consumable_${String(index + 1).padStart(3, "0")}`, name, "consumable", {
    rarity: index >= 24 ? "rare" : index >= 10 ? "uncommon" : "common",
    value: 35 + index * 6,
    collectionPoints: 0.8,
    sourceAreas: areas.filter((a) => a.tier <= 2 + Math.floor(index / 8)).map((a) => a.id),
    tags: ["buff", "single_run"],
    description,
    effects
  }));
});

const relics = [
  "第一批殖民者徽章", "破损家庭投影仪", "没有寄出的求救信", "旧AI的记忆核心",
  "补给站站长名牌", "儿童画星球地图", "最后一次晨会录音", "发射失败纪念章",
  "第七仓库钥匙", "沉默婚戒", "裂开的培养舱编号牌", "守卫机器人悼词",
  "旧世界诗集残页", "被擦除的公司合同", "星际航线半张票", "无人认领的生日礼物",
  "维修班合照", "写给机器人的感谢信", "断掉的队长袖标", "轨道电梯纪念模型",
  "地下通道禁止通行令", "被封存的撤离名单", "崩坏前的天气记录", "旧发射场通行章",
  "匿名工程师日记", "黑匣子里的摇篮曲", "一枚干净的螺丝", "永远在线的留言灯",
  "废星第一枚硬币", "太阳农场开业剪彩带", "殖民船菜单", "旧时代宠物芯片",
  "机器人同伴的备用眼睛", "发射井最后坐标", "母星核心沉默报告"
];

relics.forEach((name, index) => {
  add(item(`relic_${String(index + 1).padStart(3, "0")}`, name, "relic", {
    rarity: index >= 30 ? "legendary" : index >= 20 ? "epic" : index >= 10 ? "rare" : "uncommon",
    value: 200 + index * 28,
    collectionPoints: 2,
    sourceAreas: [areas[Math.min(areas.length - 1, Math.floor(index / 6))].id],
    tags: ["lore", "unique"],
    description: "带有废星历史线索的遗物，可用于图鉴、任务和永久奖励。"
  }));
});

const blueprints = [
  ["bp_recycler_2", "二级回收机蓝图", "facility.recycler.2"],
  ["bp_charger_2", "二级充电桩蓝图", "facility.charger.2"],
  ["bp_cargo_2", "二级货舱扩容蓝图", "facility.warehouse.2"],
  ["bp_radar_2", "二级雷达塔蓝图", "facility.radar_tower.2"],
  ["bp_workbench_2", "二级工作台蓝图", "facility.workbench.2"],
  ["bp_auto_sorter", "自动分拣机蓝图", "facility.auto_sorter.1"],
  ["bp_repair_bay", "维修仓蓝图", "facility.repair_bay.1"],
  ["bp_trade_beacon", "交易信标蓝图", "facility.trade_beacon.1"],
  ["bp_navigation", "星际导航仪蓝图", "facility.navigation.1"],
  ["bp_weapon_socket", "武器接口蓝图", "equip.weapon_socket"],
  ["bp_heat_shell", "隔热外壳蓝图", "equip.shell_heat"],
  ["bp_solar_battery", "太阳能电池组蓝图", "equip.battery_solar"],
  ["bp_precision_arm", "精密拆解臂蓝图", "equip.arm_precision"],
  ["bp_three_freq_radar", "三频搜索雷达蓝图", "equip.radar_three_freq"],
  ["bp_compressed_cargo", "压缩货柜蓝图", "equip.cargo_compressed"],
  ["bp_combat_chip", "战斗日志芯片蓝图", "equip.chip_combat"],
  ["bp_launch_key", "旧发射场密钥蓝图", "quest.launch_key"],
  ["bp_star_drive", "短程星际推进器蓝图", "quest.star_drive"],
  ["bp_anomaly_container", "异常物收纳箱蓝图", "facility.anomaly_box.1"],
  ["bp_offline_dispatch", "自动派遣台蓝图", "facility.dispatch.1"]
];

blueprints.forEach(([id, name, unlock], index) => {
  add(item(id, name, "blueprint", {
    rarity: index >= 16 ? "epic" : index >= 8 ? "rare" : "uncommon",
    value: 120 + index * 35,
    collectionPoints: 1.5,
    sourceAreas: [areas[Math.min(areas.length - 1, Math.floor(index / 4))].id],
    tags: ["unlock", "unique"],
    description: "拾取后解锁对应设施、装备或主线制作项。",
    effects: { unlock }
  }));
});

const anomalyItems = [
  ["anomaly_countdown_hourglass", "倒计时沙漏", { eventSpeed: 0.2, enemyRate: 0.1 }],
  ["anomaly_copy_screw", "复制螺丝", { dailyMaterialCopy: 1 }],
  ["anomaly_hungry_battery", "饥饿电池核", { maxExploreMinutes: 120, lootLossRisk: 0.08 }],
  ["anomaly_bottomless_bag", "装不满的废品袋", { cargoSlots: 60, junkFind: 0.1 }],
  ["anomaly_screaming_wrench", "会尖叫的扳手", { attack: 24, enemyRate: 0.08 }],
  ["anomaly_final_hard_drive", "写着最终版本的硬盘", { xpGain: 0.3, hiddenEvent: 0.05 }],
  ["anomaly_dev_mug", "神秘开发者咖啡杯", { rareFind: 0.12 }],
  ["anomaly_red_button", "认真写着别按的按钮", { randomEventChaos: 1 }],
  ["anomaly_silent_bell", "不会响的警铃", { enemyRate: -0.12, hiddenEvent: -0.02 }],
  ["anomaly_polite_magnet", "过分礼貌的磁铁", { materialFind: 0.14, eventSafety: 0.03 }]
];

anomalyItems.forEach(([id, name, effects], index) => {
  add(item(id, name, "anomaly", {
    rarity: "anomaly",
    value: 800 + index * 120,
    collectionPoints: 3,
    sourceAreas: areas.filter((a) => a.tier >= 3).map((a) => a.id),
    tags: ["rule_changer", "unique"],
    description: "会改变部分规则的异常物，强力但可能附带副作用。",
    effects
  }));
});

const enemies = [
  ["enemy_dust_tick", "沙尘寄生虫", 1, 28, 5, 1, 8, ["mat_filter_fiber", "mat_rubber_pad"]],
  ["enemy_scrap_mouse", "废铁啃食鼠", 1, 35, 6, 2, 10, ["mat_scrap_iron", "mat_micro_gear"]],
  ["enemy_broken_cleaner", "失控清洁机器人", 1, 42, 7, 2, 12, ["mat_broken_chip", "mat_copper_wire"]],
  ["enemy_power_leech", "盗电小无人机", 2, 58, 10, 3, 18, ["mat_low_grade_battery", "mat_signal_copper"]],
  ["enemy_rust_hound", "锈皮机械犬", 2, 72, 12, 4, 24, ["mat_rust_plate", "mat_flexible_joint"]],
  ["enemy_solar_mite", "太阳能啃蚀虫", 2, 65, 14, 2, 22, ["mat_solar_fragment", "mat_clean_lens"]],
  ["enemy_heat_mirror", "过热反光镜阵列", 2, 80, 13, 6, 28, ["mat_ceramic_piece", "mat_coolant_salt"]],
  ["enemy_junk_nomad", "荒原拾荒者", 3, 95, 17, 5, 36, ["mat_power_cable", "mat_servo_core"]],
  ["enemy_security_turret", "旧安保炮塔", 3, 110, 20, 7, 42, ["mat_plasma_contact", "mat_sensor_mesh"]],
  ["enemy_collapsed_arm", "坍塌机械臂", 3, 130, 22, 9, 48, ["mat_alloy_frame", "mat_industrial_spring"]],
  ["enemy_repair_spider", "维修蜘蛛群", 3, 105, 19, 4, 45, ["mat_optic_fiber", "mat_data_pin"]],
  ["enemy_pipe_serpent", "管道缠绕蛇", 4, 150, 25, 10, 58, ["mat_pressure_valve", "mat_lubricant_gel"]],
  ["enemy_maintenance_warden", "地下维修看守", 4, 180, 29, 12, 70, ["mat_drone_eye", "mat_ion_capacitor"]],
  ["enemy_memory_ghost", "记忆噪声体", 4, 135, 33, 3, 68, ["mat_ai_memory_chip", "mat_storage_crystal"]],
  ["enemy_nanite_swarm", "纳米尘群", 4, 160, 28, 8, 75, ["mat_nanite_clump", "mat_phase_screw"]],
  ["enemy_launch_guard", "旧时代守卫", 5, 240, 38, 16, 110, ["mat_boss_servo", "mat_command_key"]],
  ["enemy_fuel_wraith", "燃料井幽影", 5, 210, 42, 9, 105, ["mat_old_fuel_cell", "mat_gravity_coil"]],
  ["enemy_orbit_dog", "轨道猎犬残机", 5, 230, 40, 13, 115, ["mat_laser_prism", "mat_exo_shell"]],
  ["enemy_signal_choir", "合唱信号塔", 5, 260, 35, 18, 125, ["mat_star_chart_bit", "mat_black_box_core"]],
  ["boss_station_gate", "补给站门禁主机", 1, 160, 18, 8, 80, ["bp_recycler_2", "mat_station_relay"]],
  ["boss_solar_overseer", "太阳农场监察机", 2, 260, 28, 12, 150, ["bp_solar_battery", "mat_clean_reactor_shard"]],
  ["boss_city_colossus", "坍塌城巨构臂", 3, 380, 40, 18, 240, ["bp_compressed_cargo", "mat_adaptive_alloy"]],
  ["boss_tunnel_core", "地下维修中枢", 4, 520, 52, 24, 360, ["bp_navigation", "mat_core_cooler"]],
  ["boss_launch_sentinel", "旧发射场哨兵", 5, 760, 70, 34, 600, ["bp_star_drive", "mat_launch_code_strip"]]
].map(([id, name, tier, hp, attack, defense, xp, drops], index) => ({
  id,
  name,
  planet: "rust_mother",
  tier,
  hp,
  attack,
  defense,
  accuracy: 0.82 + Math.min(0.1, tier * 0.02),
  dodge: 0.02 + tier * 0.01,
  crit: 0.03 + tier * 0.01,
  xp: Math.ceil(xp * 1.35),
  tags: id.startsWith("boss") ? ["boss", `tier_${tier}`] : ["normal", `tier_${tier}`],
  battleText: {
    intro: `${name}从废墟里启动，自动战斗开始。`,
    attack: `${name}发动了一次机械化攻击。`,
    defeat: `${name}散落成可回收零件。`
  },
  dropTable: drops.map((itemId, dropIndex) => ({
    itemId,
    chance: id.startsWith("boss") ? 1 : 0.35 + dropIndex * 0.15,
    min: 1,
    max: id.startsWith("boss") ? 2 : 1 + tier
  })),
  collectionPoints: id.startsWith("boss") ? 5 : 1
}));

const blueprintByFacility = {
  recycler: "bp_recycler_2",
  charger: "bp_charger_2",
  warehouse: "bp_cargo_2",
  workbench: "bp_workbench_2",
  radar_tower: "bp_radar_2",
  repair_bay: "bp_repair_bay",
  trade_beacon: "bp_trade_beacon",
  dispatch: "bp_offline_dispatch",
  navigation: "bp_navigation"
};

const materialIdsByTier = (tier) => allItems
  .filter((x) => x.category === "material" && x.tags.includes(`tier_${tier}`))
  .map((x) => x.id);
const materialTierPools = {
  1: materialIdsByTier(1),
  2: [...materialIdsByTier(1), ...materialIdsByTier(2)],
  3: [...materialIdsByTier(2), ...materialIdsByTier(3)],
  4: [...materialIdsByTier(3), ...materialIdsByTier(4)],
  5: [...materialIdsByTier(4), ...materialIdsByTier(5)]
};
const pickCostMaterial = (level, seed) => {
  const pool = materialTierPools[level] ?? materialTierPools[1];
  return pool[seed % pool.length];
};

const facilities = [
  ["recycler", "回收机", "提高废品售价，并解锁批量出售。", "junkValue"],
  ["charger", "充电桩", "提高基础外出时长和离线结算上限。", "exploreMinutes"],
  ["warehouse", "仓库", "提高仓库存储和货舱整理效率。", "storage"],
  ["workbench", "工作台", "解锁装备制作、材料合成和蓝图制作。", "crafting"],
  ["radar_tower", "雷达塔", "提高稀有物、隐藏事件和彩蛋发现率。", "rareFind"],
  ["repair_bay", "维修仓", "降低战斗损耗，提高失败保留率。", "repair"],
  ["research_terminal", "研究终端", "解析遗物，解锁永久加成。", "research"],
  ["trade_beacon", "交易信标", "刷新特殊订单和流浪商人。", "trade"],
  ["dispatch", "自动派遣台", "开启离线收益和重复探索。", "offline"],
  ["navigation", "星际导航仪", "解锁新区域和下一颗星球。", "planetUnlock"]
].map(([id, name, description, stat], fIndex) => ({
  id,
  name,
  description,
  maxLevel: 5,
  levels: Array.from({ length: 5 }, (_, i) => {
    const level = i + 1;
    return {
      level,
      effects: {
        [stat]: id === "charger" ? 20 + level * 15 : level * 0.08,
        ...(id === "charger" ? { offlineCapHours: 4 + level * 2 } : {}),
        ...(id === "dispatch" ? { offlineCapHours: 4 + level * 4, offlineEfficiency: 0.35 + level * 0.1 } : {}),
        ...(id === "warehouse" ? { storageSlots: 80 + level * 60 } : {}),
        ...(id === "radar_tower" ? { hiddenEvent: level * 0.04 } : {})
      },
      cost: {
        money: 80 * level * level + fIndex * 25,
        materials: [
          { itemId: pickCostMaterial(level, fIndex * 3 + i), qty: level === 1 ? 3 : 2 + level * 2 },
          { itemId: pickCostMaterial(level, fIndex * 5 + i + 8), qty: level === 1 ? 2 : 2 + level }
        ],
        blueprints: level >= 3 ? [blueprintByFacility[id]].filter(Boolean) : []
      }
    };
  })
}));

const planet = {
  id: "rust_mother",
  name: "锈蚀母星",
  theme: "第一颗废弃殖民星，覆盖锈蚀荒原、坍塌工业区和旧时代发射场。",
  initialExploreMinutes: 20,
  baseEventIntervalSeconds: { min: 5, max: 20 },
  completionRules: {
    itemFirstDiscovery: { junk: 0.2, material: 0.5, equipment: 1, consumable: 0.8, relic: 2, blueprint: 1.5, anomaly: 3 },
    enemyFirstDefeat: 1,
    bossFirstDefeat: 5,
    areaMilestone: 3
  },
  unlockNextPlanet: {
    targetPlanetId: "acid_rain_mine",
    displayName: "酸雨矿星",
    conditions: [
      { type: "planetCompletion", value: 75 },
      { type: "facilityLevel", facilityId: "navigation", level: 3 },
      { type: "itemOwned", itemId: "bp_star_drive" }
    ]
  },
  areas: areas.map((a) => ({
    ...a,
    recommendedPower: [0, 0, 120, 260, 480, 760][a.tier],
    unlockCondition:
      a.id === "station_outskirts"
        ? { type: "default" }
        : a.id === "rust_plain"
          ? { type: "facilityLevel", facilityId: "recycler", level: 1 }
        : a.id === "solar_farm"
          ? { type: "areaRuns", areaId: "rust_plain", count: 1 }
          : a.id === "collapsed_mech_city"
            ? { type: "bossDefeated", enemyId: "boss_station_gate" }
            : a.id === "underground_maintenance"
              ? { type: "planetCompletion", value: 42 }
              : { type: "facilityLevel", facilityId: "navigation", level: 2 },
    eventWeights: {
      junk: 38 - a.tier * 2,
      material: 25 + a.tier,
      enemy: 14 + a.tier * 2,
      equipment: 5 + a.tier,
      consumable: 6,
      relic: 3 + a.tier,
      blueprint: a.tier >= 2 ? 3 : 1,
      anomaly: a.tier >= 3 ? 2 : 0,
      hazard: 3 + a.tier
    }
  }))
};

const byCategory = (category) => allItems.filter((x) => x.category === category).map((x) => x.id);
const lootTables = {
  planetId: "rust_mother",
  note: "第一版采用按区域过滤 sourceAreas + category 权重的方式抽取。rareBonus、探测和设施加成在运行时调整。",
  globalPools: {
    junk: byCategory("junk"),
    material: byCategory("material"),
    equipment: byCategory("equipment"),
    consumable: byCategory("consumable"),
    collectible: byCategory("collectible"),
    relic: byCategory("relic"),
    blueprint: byCategory("blueprint"),
    anomaly: byCategory("anomaly")
  },
  areaPools: Object.fromEntries(areas.map((a) => [
    a.id,
    {
      categories: planet.areas.find((pa) => pa.id === a.id).eventWeights,
      itemIds: allItems.filter((it) => it.sourceAreas.includes(a.id)).map((it) => it.id),
      enemies: enemies.filter((e) => e.tier <= a.tier && (e.tier >= a.tier - 1 || e.tags.includes("boss"))).map((e) => e.id),
      boss: enemies.find((e) => e.tags.includes("boss") && e.tier === a.tier)?.id ?? null
    }
  ]))
};

const schema = {
  saveVersion: 1,
  coreLoop: ["prepare", "explore", "event", "combat_or_loot", "return", "sell_upgrade_collect"],
  playerSaveShape: {
    money: "number",
    robot: {
      level: "number",
      exp: "number",
      hp: "number",
      maxHp: "number",
      baseExploreMinutes: "number",
      cargoSlots: "number",
      stats: "Record<string, number>"
    },
    inventory: [{ itemId: "string", qty: "number" }],
    equipped: Object.fromEntries(slots.map(([slot]) => [slot, "itemId|null"])),
    facilities: "Record<facilityId, level>",
    collection: {
      items: "Record<itemId, firstFoundTimestamp>",
      enemies: "Record<enemyId, firstDefeatedTimestamp>",
      planets: "Record<planetId, completionPercent>"
    },
    unlockedAreas: ["station_outskirts", "rust_plain"],
    lastSaveTime: "epochMs"
  },
  itemShape: Object.keys(allItems[0]).reduce((acc, key) => ({ ...acc, [key]: typeof allItems[0][key] }), {}),
  combatFormula: {
    damage: "max(1, attacker.attack - defender.defense * 0.5) * random(0.85, 1.15)",
    turnOrder: "robot -> enemy -> status -> victoryCheck",
    defeatPenalty: "force_return, keep 70% loot by default, repair cost optional"
  }
};

const write = (name, value) => {
  fs.writeFileSync(path.join(dataDir, name), `${JSON.stringify(value, null, 2)}\n`, "utf8");
};

write("items.json", allItems);
write("enemies.json", enemies);
write("facilities.json", facilities);
write("planet_rust_mother.json", planet);
write("loot_tables.json", lootTables);
write("game_schema.json", schema);

const summary = {
  generatedAt: new Date().toISOString(),
  counts: {
    items: allItems.length,
    junk: byCategory("junk").length,
    materials: byCategory("material").length,
    equipment: byCategory("equipment").length,
    consumables: byCategory("consumable").length,
    collectibles: byCategory("collectible").length,
    relics: byCategory("relic").length,
    blueprints: byCategory("blueprint").length,
    anomalies: byCategory("anomaly").length,
    enemies: enemies.length,
    facilities: facilities.length,
    areas: areas.length
  }
};

write("summary.json", summary);
console.log(JSON.stringify(summary, null, 2));
