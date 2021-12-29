const joi = require('joi')
const date = require('common/date')
const { DATE_FORMAT } = require('common/constants')
const { areasMap, getTargetAreas, countAlertsType: count } = require('common/data')
const { getAlerts } = require('../lib/ddb')
const { alertTypeTag } = require('../lib/filters')

module.exports = [
  {
    method: 'GET',
    path: '/area/{areaId}',
    handler: async (request, h) => {
      const areaId = request.params.areaId
      const area = areasMap.get(areaId)
      const alerts = await getAlerts(areaId)
      const targetAreas = getTargetAreas(areaId)
      const alertAreas = targetAreas.filter(a => !a.isWarningArea)
      const warningAreas = targetAreas.filter(a => a.isWarningArea)

      const alertRows = alerts.map(a => {
        const alertCode = a.code
        const targetArea = targetAreas.find(ta => ta.code === alertCode)

        return [
          {
            html: `<a href='/target-area/${alertCode}'>${alertCode}</a>
            <br/><span class="app-table-area-name">${targetArea.name}</span>`
          },
          { html: alertTypeTag(a.type.id) },
          { text: date(a.updated).format(DATE_FORMAT) }
        ]
      })

      return h.view('area', {
        area,
        areaId,
        faCount: count(alerts, 'fa'),
        fwCount: count(alerts, 'fw'),
        sfwCount: count(alerts, 'sfw'),
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
          areaId: joi.string().required().valid(...areasMap.keys())
        })
      }
    }
  }
]
