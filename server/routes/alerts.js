const BaseModel = require('common/view/model')
const date = require('../lib/date')
const { getAllAlertsReadyForApproval, getLiveAlerts } = require('../lib/db')

class Model extends BaseModel {}

module.exports = [
  {
    method: 'GET',
    path: '/alerts',
    handler: async (request, h) => {
      const readyForApprovalAlerts = await getAllAlertsReadyForApproval()
      const liveAlerts = await getLiveAlerts()

      const readyForApprovalRows = readyForApprovalAlerts
        .map(alert => {
          return [
            { html: `<strong><a href='/area/${alert.code}'>${alert.code}</a></strong><br>${alert.name}` },
            { text: alert.headline },
            { text: alert.body },
            { text: `${date(alert.created_at).fromNow()} by ${alert.created_by}` },
            { html: `<a href='/alert/${alert.id}'>View</a>` }
          ]
        })

      const liveRows = liveAlerts
        .map(alert => {
          return [
            { html: `<strong><a href='/area/${alert.code}'>${alert.code}</a></strong><br>${alert.name}` },
            { text: alert.headline },
            { text: alert.body },
            { text: `${date(alert.approved_at).fromNow()} by ${alert.approved_by}` },
            { html: `<a href='/alert/${alert.id}'>View</a>` }
          ]
        })

      return h.view('alerts', new Model({
        readyForApprovalRows,
        liveRows
      }))
    }
  }
]
