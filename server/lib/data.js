const { groupBy } = require('./helpers')
const areas = require('../data/areas.json')
const regions = require('../data/regions.json')
const targetAreasData = require('../data/target-areas.json')
const isWarningArea = code => code.charAt(4).toUpperCase() === 'W'
const areasMap = new Map(areas.map(area => [area.id, area]))
const regionsMap = new Map(regions.map(region => [region.id, region]))
const groupedAreas = groupBy(areas, 'regionId')
const ownersMap = new Map(areas.map(area => {
  const group = groupedAreas[area.regionId]
  const region = regionsMap.get(area.regionId)
  const key = group.length === 1 ? area.name : `${region.name} - ${area.name}`
  return [key, { area, region }]
}))

// Filter out "Fujitsu" TA's and map data
const targetAreas = targetAreasData
  .filter(ta => ta.owner && ta.regionaloffice)
  .map(ta => {
    const owner = ownersMap.get(ta.owner)
    const { region, area } = owner

    return {
      id: ta.targetareaid,
      description: ta.description,
      region: region,
      area: area,
      code: ta.tacode,
      name: ta.name,
      quickDialNumber: ta.quickdial,
      riverOrSea: ta.riverOrSea,
      category: ta.category,
      type: ta.areatype,
      isWarningArea: isWarningArea(ta.tacode)
    }
  })

function getTargetAreas (areaId) {
  return targetAreas.filter(ta => ta.area.id === areaId)
}

// const categories = Object
//   .keys(groupBy(areas, 'category'))
//   .sort()

// const types = Object
//   .keys(groupBy(areas, 'type'))
//   .sort()

// const regions = Object
//   .keys(groupBy(operationalAreas, 'region'))
//   .sort()

module.exports = {
  areas,
  areasMap,
  regions,
  regionsMap,
  targetAreas,
  getTargetAreas,
  groupedAreas
}
