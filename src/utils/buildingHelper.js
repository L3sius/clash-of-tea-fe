export function getBuildingImagePath(buildingName, buildingLevel) {
  const normalizedName = buildingName.toLowerCase();
  
  let levelTier;
  if (buildingLevel >= 1 && buildingLevel <= 3) {
    levelTier = 'early_level';
  } else if (buildingLevel >= 4 && buildingLevel <= 6) {
    levelTier = 'mid_level';
  } else if (buildingLevel >= 7 && buildingLevel <= 9) {
    levelTier = 'max_level';
  } else {
    levelTier = 'early_level'; // fallback
  }
  
  return `/images/buildings/${normalizedName}/${normalizedName}_${levelTier}.png`;
}

export function parseBackendBuildings(teamsBuildings, buildingLocations) {
  // Parse new backend structure
  const allBuildings = [];
  
  teamsBuildings.forEach(team => {
    team.buildings.forEach(buildingData => {
      const location = buildingLocations.find(
        loc => loc.name.toLowerCase() === buildingData.building.toLowerCase()
      );
      
      if (!location) {
        console.warn(`Location not found for building: ${buildingData.building}`);
        return;
      }
      
      allBuildings.push({
        id: `${team.teamId}-${buildingData.building}`,
        teamId: team.teamId,
        name: buildingData.building,
        level: buildingData.buildingLevel,
        currentUpgrades: buildingData.currentUpgrades,
        nextUpgrade: buildingData.nextUpgrade,
        resourcesForNextUpgrade: buildingData.resourcesForNextUpgrade,
        x: location.x,
        y: location.y,
        icon: getBuildingImagePath(buildingData.building, buildingData.buildingLevel)
      });
    });
  });
  
  return allBuildings;
}