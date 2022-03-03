const { groupBy } = require('flood-xws-common/helpers')
const alertTypes = require('../data/alert-type.json')
const targetAreaTypes = require('../data/target-area-type.json')
const targetAreas = require('../data/target-area.json')
const eaAreas = require('../data/ea-area.json')
const eaOwners = require('../data/ea-owner.json')
const targetAreaCategories = require('../data/target-area-category.json')

const groupedEAOwners = groupBy(eaOwners, 'ea_area_id')
const eaAreasMap = new Map(eaAreas.map(area => [area.id, area]))
const eaOwnersMap = new Map(eaOwners.map(owner => [owner.id, owner]))
const alertTypesMap = new Map(alertTypes.map(type => [type.id, type]))
const targetAreaTypesMap = new Map(targetAreaTypes.map(type => [type.id, type]))
const targetAreaCategoriesMap = new Map(targetAreaCategories.map(category => [category.id, category]))

// Resolve some objects and add
// properties to each TA for convenience
targetAreas.forEach(ta => {
  const eaOwner = eaOwnersMap.get(ta.ea_owner_id)
  ta.ea_owner = eaOwner
  ta.ea_area = eaAreasMap.get(eaOwner.ea_area_id)
  ta.type = targetAreaTypesMap.get(ta.type_id)
  ta.category = targetAreaCategoriesMap.get(ta.category_id)
  ta.is_warning_area = ta.category_id === 'fwa'
})

const targetAreasMap = new Map(targetAreas.map(ta => [ta.code, ta]))

module.exports = {
  alertTypes,
  alertTypesMap,
  targetAreaTypesMap,
  targetAreaTypes,
  targetAreas,
  targetAreasMap,
  eaAreas,
  eaAreasMap,
  eaOwners,
  eaOwnersMap,
  groupedEAOwners,
  targetAreaCategories,
  targetAreaCategoriesMap
}
