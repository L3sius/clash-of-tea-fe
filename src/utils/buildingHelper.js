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