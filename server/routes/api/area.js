const joi = require('joi')
const boom = require('@hapi/boom')
const { getFullArea } = require('../../lib/db')

module.exports = [
  {
    method: 'GET',
    path: '/area/{code}/polygon',
    handler: async (request, h) => {
      const { code } = request.params
      const area = await getFullArea(code)

      if (!area) {
        return boom.notFound()
      }

      return area.geom
    },
    options: {
      validate: {
        params: joi.object().keys({
          code: joi.string().required()
        })
      }
    }
  }
]
