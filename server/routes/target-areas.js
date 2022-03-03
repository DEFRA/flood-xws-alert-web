const joi = require('joi')
const { getAlerts } = require('../lib/ddb')
const { sortBy } = require('flood-xws-common/helpers')
const { eaOwnersMap, targetAreaCategoriesMap, targetAreas } = require('../lib/data')

const filter = (ownerId, categoryId) => ta => ta.ea_owner_id === ownerId && ta.category_id === categoryId
const mapper = alerts => ta => {
  const alert = alerts.find(a => a.code === ta.code)
  return { ...ta, alert, sort: alert ? alert.updated : 0 }
}

module.exports = [
  {
    method: 'GET',
    path: '/owner/{ownerId}/target-areas',
    handler: async (request, h) => {
      const { ownerId } = request.params
      const { categoryId } = request.query
      const alerts = await getAlerts(ownerId)
      const eaOwner = eaOwnersMap.get(ownerId)
      const targetAreaCategory = targetAreaCategoriesMap.get(categoryId)
      const targetAreasList = targetAreas
        .filter(filter(ownerId, categoryId))
        .map(mapper(alerts))
        .sort(sortBy('-sort'))

      const model = { alerts, targetAreaCategory, eaOwner, targetAreasList }

      return h.view('target-areas', model)
    },
    options: {
      auth: {
        mode: 'try'
      },
      validate: {
        params: joi.object().keys({
          ownerId: joi.string().required().valid(...eaOwnersMap.keys())
        }).required(),
        query: joi.object().keys({
          categoryId: joi.string().required().valid(...targetAreaCategoriesMap.keys())
        }).required()
      }
    }
  }
]
