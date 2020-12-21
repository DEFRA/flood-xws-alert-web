const { getAreas } = require('./db')

async function getTemplateAreas (templateRef, areaCode) {
  const areas = await getAreas()
  const mapper = item => ({
    text: `${item.code} - ${item.name}`,
    value: item.code,
    selected: item.code === areaCode
  })

  const empty = [{
    text: 'Select an area'
  }]

  // Todo: template to area type join
  if (templateRef === 'fa') {
    return empty.concat(areas
      .filter(item => item.area_type_ref === 'faa')
      .map(mapper))
  } else {
    return empty.concat(areas
      .filter(item => item.area_type_ref === 'fwa')
      .map(mapper))
  }
}

module.exports = getTemplateAreas
