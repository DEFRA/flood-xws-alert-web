const joi = require('joi')
const date = require('flood-xws-common/date')
const { DATE_FORMAT } = require('flood-xws-common/constants')
const { eaOwnersMap, targetAreas } = require('../lib/data')
const { countAlertTypes: count } = require('../helpers')
const { getAlerts } = require('../lib/ddb')
const { alertTypeTag } = require('../lib/filters')

module.exports = [
  {
    method: 'GET',
    path: '/owner/{ownerId}',
    handler: async (request, h) => {
      const eaOwnerId = request.params.ownerId
      const eaOwner = eaOwnersMap.get(eaOwnerId)
      const alerts = await getAlerts(eaOwnerId)
      const ownerTargetAreas = targetAreas.filter(ta => ta.ea_owner_id === eaOwnerId)
      const alertAreas = ownerTargetAreas.filter(a => !a.is_warning_area)
      const warningAreas = ownerTargetAreas.filter(a => a.is_warning_area)
      const pageHeading = `${eaOwner.name} overview`

      const alertRows = alerts.map(a => {
        const alertCode = a.code
        const targetArea = ownerTargetAreas.find(ta => ta.code === alertCode)

        return [
          {
            html: `<a href='/target-area/${alertCode}'>${alertCode}</a>
            <br/><span class="app-table-area-name">${targetArea.name}</span>`
          },
          { html: alertTypeTag(a.type.id) },
          { text: date(a.updated).format(DATE_FORMAT) }
        ]
      })

      return h.view('owner', {
        pageHeading,
        pageTitle: pageHeading,
        eaOwner,
        eaOwnerId,
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
          ownerId: joi.string().required().valid(...eaOwnersMap.keys())
        })
      }
    }
  }
]
