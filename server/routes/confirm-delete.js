const joi = require('joi')
const boom = require('@hapi/boom')
const BaseModel = require('common/view/model')
const { deleteAlert, getAlert } = require('../lib/db')

class Model extends BaseModel {}

module.exports = [
  {
    method: 'GET',
    path: '/alert/{alertId}/confirm-delete',
    handler: async (request, h) => {
      const { alertId } = request.params
      const alert = await getAlert(alertId)

      if (!alert) {
        return boom.notFound()
      }

      if (alert.approved_at) {
        return h.redirect(`/alert/${alert.id}`)
      }

      return h.view('confirm-delete', new Model({ alert }))
    },
    options: {
      validate: {
        params: joi.object().keys({
          alertId: joi.string().guid().required()
        })
      }
    }
  },
  {
    method: 'POST',
    path: '/alert/{alertId}/confirm-delete',
    handler: async (request, h) => {
      const { alertId } = request.params

      await deleteAlert(alertId)

      return h.redirect('/alerts')
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
