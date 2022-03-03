const joi = require('joi')
const { getAlert } = require('../lib/ddb')
const { targetAreasMap } = require('../lib/data')

module.exports = [
  {
    method: 'GET',
    path: '/target-area/{code}',
    handler: async (request, h) => {
      const { code } = request.params
      const targetArea = targetAreasMap.get(code)
      const alert = await getAlert(targetArea.ea_owner_id, code)

      return h.view('target-area', { targetArea, alert })
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
