const joi = require('joi')
const { areasMap, getTargetAreas } = require('../lib/data')
const { getAreaCounts, getAlerts } = require('../lib/ddb')

module.exports = [
  {
    method: 'GET',
    path: '/area/{id}',
    handler: async (request, h) => {
      const areaId = request.params.id
      const area = areasMap.get(areaId)
      const areaCounts = await getAreaCounts(areaId)
      const alerts = await getAlerts(areaId)
      const targetAreas = getTargetAreas(areaId)
      const alertAreas = targetAreas.filter(a => !a.isWarningArea)
      const warningAreas = targetAreas.filter(a => a.isWarningArea)

      const alertRows = alerts.map(a => ([
        { text: a.sk.substr(6) },
        { text: a.type },
        { text: a.updated }
      ]))

      return h.view('area', {
        area,
        areaId,
        faCount: areaCounts.fa,
        fwCount: areaCounts.fw,
        sfwCount: areaCounts.sfw,
        faaCount: alertAreas.length,
        fwaCount: warningAreas.length,
        alertRows
      })
    },
    options: {
      auth: {
        mode: 'try'
      },
      validate: {
        params: joi.object().keys({
          id: joi.string().required().valid(...areasMap.keys())
        })
      }
    }
  }
]
