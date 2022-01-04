const joi = require('joi')
const { getAlert } = require('../lib/ddb')
const { targetAreasMap } = require('flood-xws-common/data')

module.exports = [
  {
    method: 'GET',
    path: '/target-area/{code}',
    handler: async (request, h) => {
      const { code } = request.params
      const targetArea = targetAreasMap.get(code)
      const area = targetArea.area
      const alert = await getAlert(area.id, code)

      return h.view('target-area', { code, targetArea, area, alert })
    },
    options: {
      validate: {
        params: joi.object().keys({
          code: joi.string().required().valid(...targetAreasMap.keys())
        }).required()
      }
    }
  }
]
