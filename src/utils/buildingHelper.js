// Short "category" codes used by the SSE streams (getBuildingUpgradeStream,
// getResourcesChangeStream) don't match the display names used everywhere else
// in the frontend (from /getBuildings and /getTeamsResources) - e.g. "cox" vs
// "Chambers of Xeric", "gwd" vs "God Wars". This is a separate key system from
// buildingLocations.json's snake_case keys, not derivable from it.
const CATEGORY_TO_DISPLAY_NAME = {
  slayer: 'Slayer Tower',
  cox: 'Chambers of Xeric',
  tob: 'Theatre',
  toa: 'Tombs',
  minigames: 'Minigames',
  misc: 'Misc',
  dt2: 'DT2',
  gwd: 'God Wars',
  classics: 'Classics',
  fortis: 'Fortis',
  noob: 'Noob-Friendly',
  favourites: 'Fan Favourites',
  wilderness: 'Wilderness',
  skilling: 'Skilling',
  generic: 'Town Hall',
};

// Resolves a name that may be either a short category code (from an SSE stream)
// or already a display name (from a REST response) to the display name used
// throughout the frontend. Falls back to the input unchanged if unrecognized.
export function resolveDisplayName(value) {
  if (!value) return value;
  return CATEGORY_TO_DISPLAY_NAME[value.toLowerCase()] || value;
}

// Collapses consecutive tiers sharing the same multiplier into ranges
// (e.g. T1-T4 x4, T5-T6 x2, T7-T9 x1) instead of one chip per tier.
// Shared by TeamStats.vue's Buildings tab and BuildingDetailsModal.vue.
export function multiplierRanges(tierMultipliers) {
  if (!tierMultipliers || !tierMultipliers.length) return [];
  const ranges = [];
  tierMultipliers.forEach(({ tier, multiplier }) => {
    const last = ranges[ranges.length - 1];
    if (last && last.multiplier === multiplier) {
      last.to = tier;
    } else {
      ranges.push({ from: tier, to: tier, multiplier });
    }
  });
  return ranges;
}

// A range spans multiple tiers, so it can't honestly carry one tier's color -
// bucket by the multiplier's own value instead ("how boosted" rather than
// "which tier", which the label text already shows).
export function multiplierClass(value) {
  if (value <= 1) return 'mult-x1';
  if (value === 2) return 'mult-x2';
  if (value === 4) return 'mult-x4';
  return 'mult-xhigh';
}

export function getBuildingImagePath(buildingName, buildingLevel) {
  const normalizedName = buildingName.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_');
  
  let levelTier;
  if (buildingLevel >= 1 && buildingLevel <= 3) {
    levelTier = 'early_level';
  } else if (buildingLevel >= 4 && buildingLevel <= 6) {
    levelTier = 'mid_level';
  } else if (buildingLevel >= 7 && buildingLevel <= 9) {
    levelTier = 'max_level';
  } else {
    levelTier = 'start'; // fallback for level 0
  }
  
  return `/images/buildings/${normalizedName}/${normalizedName}_${levelTier}.png`;
}

export function parseBackendBuildings(teamsBuildings, buildingLocations) {
  const allBuildings = [];
  let buildingId = 1;
  
  teamsBuildings.forEach(teamData => {
    teamData.buildings.forEach(buildingData => {
      // Normalize building names for comparison
      const normalizedBuildingName = buildingData.building.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_');
      
      const location = buildingLocations.find(
        loc => loc.name.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_') === normalizedBuildingName
      );
      
      if (!location) {
        console.warn(`Location not found for building: ${buildingData.building}`);
        return;
      }
      
      allBuildings.push({
        id: buildingId++,
        teamId: teamData.teamId,
        teamName: teamData.teamName,
        name: buildingData.building,
        // Stable internal name (e.g. "cox") - a different vocabulary than the
        // SSE streams' category codes (e.g. "cox" vs "slayer"/"tob"/"toa"/etc.
        // don't all match), but the same one /getMultipliers joins on.
        internalName: buildingData.name,
        group: buildingData.group || '',
        groupDisplayName: buildingData.groupDisplayName || '',
        level: buildingData.buildingLevel,
        upgradable: buildingData.upgradable,
        allowedSources: buildingData.allowedSources || [],
        upgradeOptions: buildingData.upgradeOptions || [],
        x: location.x,
        y: location.y,
        icon: getBuildingImagePath(buildingData.building, buildingData.buildingLevel)
      });
    });
  });
  
  return allBuildings;
}