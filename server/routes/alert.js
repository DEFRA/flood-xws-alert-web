const joi = require('joi')
const boom = require('@hapi/boom')
const BaseModel = require('common/view/model')
const date = require('../lib/date')
const { getAlert } = require('../lib/db')

class Model extends BaseModel {}

module.exports = [
  {
    method: 'GET',
    path: '/alert/{alertId}',
    handler: async (request, h) => {
      const { alertId } = request.params
      const alert = await getAlert(alertId)

      if (!alert) {
        return boom.notFound()
      }

      const created = date(alert.created_at)
      const updated = date(alert.updated_at)
      const approved = alert.approved_at && date(alert.approved_at)

      const rows = [
        [{ text: 'Code' }, { text: alert.code }],
        [{ text: 'Region' }, { text: alert.region }],
        [{ text: 'Name' }, { text: alert.name }],
        [{ text: 'Description' }, { text: alert.description }],
        [{ text: 'Headline' }, { text: alert.headline }],
        [{ text: 'Body' }, { text: alert.body }],
        [{ text: 'Created at' }, { text: `${created.format('HH:mma dddd D MMMM YYYY')} (${created.fromNow()})` }],
        [{ text: 'Created by' }, { text: alert.created_by }],
        [{ text: 'Updated at' }, { text: `${updated.format('HH:mma dddd D MMMM YYYY')} (${updated.fromNow()})` }],
        [{ text: 'Updated by' }, { text: alert.updated_by }],
        [{ text: 'Approved at' }, { text: approved ? `${approved.format('HH:mma dddd D MMMM YYYY')} (${approved.fromNow()})` : '' }],
        [{ text: 'Approved by' }, { text: alert.approved_by }]
      ]

      return h.view('alert', new Model({ alert, rows }))
    },
    options: {
      validate: {
        params: joi.object().keys({
          alertId: joi.string().guid().required()
        })
      }
    }
  }
]
