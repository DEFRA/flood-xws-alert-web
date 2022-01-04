const joi = require('joi')
const { getAlerts } = require('../lib/ddb')
const { sortBy } = require('flood-xws-common/helpers')
const { areasMap, targetAreaTypesMap, targetAreas } = require('flood-xws-common/data')

const filter = (areaId, type) => ta => ta.area.id === areaId && ta.type.id === type
const mapper = alerts => ta => {
  const alert = alerts.find(a => a.code === ta.code)
  ta.alert = alert
  ta.sort = alert ? alert.updated : 0
  return ta
}

module.exports = [
  {
    method: 'GET',
    path: '/area/{areaId}/target-areas',
    handler: async (request, h) => {
      const { areaId } = request.params
      const { type } = request.query
      const alerts = await getAlerts(areaId)
      const area = areasMap.get(areaId)
      const targetAreaType = targetAreaTypesMap.get(type)
      const targetAreasList = targetAreas
        .filter(filter(areaId, type))
        .map(mapper(alerts))
        .sort(sortBy('-sort'))

      return h.view('target-areas', { alerts, type, targetAreaType, area, targetAreasList })
    },
    options: {
      auth: {
        mode: 'try'
      },
      validate: {
        params: joi.object().keys({
          areaId: joi.string().required().valid(...areasMap.keys())
        }).required(),
        query: joi.object().keys({
          type: joi.string().required().valid(...targetAreaTypesMap.keys())
        }).required()
      }
    }
  }
]
