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