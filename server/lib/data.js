const { groupBy } = require('./helpers')
const areas = require('../data/areas.json')
const regions = require('../data/regions.json')
const alertTypes = require('../data/alert-types.json')
const targetAreasData = require('../data/target-areas.json')
const targetAreaTypes = require('../data/target-area-types.json')

const groupedAreas = groupBy(areas, 'regionId')
const areasMap = new Map(areas.map(area => [area.id, area]))
const regionsMap = new Map(regions.map(region => [region.id, region]))
const alertTypesMap = new Map(alertTypes.map(type => [type.id, type]))
const targetAreaTypesMap = new Map(targetAreaTypes.map(type => [type.id, type]))

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
    // Todo
    const type = ta.category.startsWith('Flood Warning') ? 'fwa' : 'faa'

    return {
      id: ta.targetareaid,
      description: ta.description,
      region: region,
      area: area,
      code: ta.tacode,
      name: ta.name,
      quickDialNumber: ta.quickdial,
      riverOrSea: ta.riverOrSea,
      category: ta.areatype,
      type: targetAreaTypesMap.get(type),
      isWarningArea: type === 'fwa'
    }
  })

const targetAreasMap = new Map(targetAreas.map(ta => [ta.code, ta]))

function getTargetAreas (areaId) {
  return targetAreas.filter(ta => ta.area.id === areaId)
}

module.exports = {
  areas,
  areasMap,
  regions,
  regionsMap,
  targetAreas,
  targetAreasMap,
  targetAreaTypes,
  getTargetAreas,
  groupedAreas,
  targetAreaTypesMap,
  alertTypes,
  alertTypesMap
}
