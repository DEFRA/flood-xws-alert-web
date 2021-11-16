const { groupBy } = require('./helpers')
const { items } = require('../data/areas.json')
const isWarningArea = code => code.charAt(4).toUpperCase() === 'W'

const areas = items.map(item => ({
  id: item.fwdCode,
  county: item.county,
  description: item.description,
  region: item.eaAreaName,
  code: item.fwdCode,
  name: item.label,
  lat: item.lat,
  long: item.long,
  floodWatchArea: item.floodWatchArea,
  polygon: item.polygon,
  quickDialNumber: item.quickDialNumber,
  riverOrSea: item.riverOrSea,
  isWarningArea: isWarningArea(item.fwdCode)
}))

const regions = Object
  .keys(groupBy(areas, 'region'))
  .sort()

const regionAreaFilter = region => a => a.region === region

function getRegionAreas (region) {
  return areas.filter(regionAreaFilter(region))
}

module.exports = {
  areas,
  regions,
  getRegionAreas,
  regionAreaFilter,
  isWarningArea
}
