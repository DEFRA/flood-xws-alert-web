const joi = require('joi')
const BaseModel = require('common/view/model')
const date = require('../lib/date')
const { getArea, getAreaAlerts } = require('../lib/db')

class Model extends BaseModel {}

module.exports = [
  {
    method: 'GET',
    path: '/area/{code}',
    handler: async (request, h) => {
      const { code } = request.params
      const area = await getArea(code)
      const draftAreaAlerts = await getAreaAlerts(code, null, 'updated_at DESC', 20)
      const liveAreaAlerts = await getAreaAlerts(code, true, null, 1)
      const historicAreaAlerts = await getAreaAlerts(code, null, 'approved_at DESC', 20, true)

      const draftAreaRows = draftAreaAlerts
        .map(alert => {
          return [
            { text: alert.headline },
            { text: alert.body },
            { text: `${date(alert.updated_at).fromNow()} by ${alert.updated_by}` },
            { html: `<a href='/alert/${alert.id}'>View</a>` }
          ]
        })

      const liveAreaRows = liveAreaAlerts
        .map(alert => {
          return [
            { text: alert.headline },
            { text: alert.body },
            { text: `${date(alert.created_at).fromNow()} by ${alert.created_by}` },
            { html: `<a href='/alert/${alert.id}'>View</a>` }
          ]
        })

      const historicAreaRows = historicAreaAlerts
        .map(alert => {
          return [
            { text: alert.headline },
            { text: alert.body },
            { text: `${date(alert.approved_at).fromNow()} by ${alert.approved_by}` },
            { html: `<a href='/alert/${alert.id}'>View</a>` }
          ]
        })

      return h.view('area', new Model({
        area,
        draftAreaRows,
        liveAreaRows,
        historicAreaRows
      }))
    },
    options: {
      validate: {
        params: joi.object().keys({
          code: joi.string().required()
        }).required()
      }
    }
  }
]
