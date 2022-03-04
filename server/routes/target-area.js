const joi = require('joi')
const { getAlert } = require('../lib/ddb')
const { targetAreasMap, targetAreaCategoriesMap } = require('../lib/data')

module.exports = [
  {
    method: 'GET',
    path: '/target-area/{code}',
    handler: async (request, h) => {
      const { code } = request.params
      const targetArea = targetAreasMap.get(code)
      const targetAreaCategory = targetAreaCategoriesMap.get(targetArea.category_id)
      const alert = await getAlert(targetArea.ea_owner_id, code)
      const pageHeading = `${targetArea.name} ${targetAreaCategory.name.toLowerCase()}`

      return h.view('target-area', {
        pageHeading,
        pageTitle: pageHeading,
        targetArea,
        alert
      })
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
