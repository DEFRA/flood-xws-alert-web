const { getAllAlerts } = require('../lib/ddb')
const { countAlertTypes: count } = require('../helpers')
const { groupedEAOwners, eaAreasMap } = require('../lib/data')

module.exports = [
  {
    method: 'GET',
    path: '/',
    handler: async (request, h) => {
      const alerts = await getAllAlerts()
      const rows = []

      Object.keys(groupedEAOwners).forEach(eaAreaId => {
        const ownerGroup = groupedEAOwners[eaAreaId]
        const eaArea = eaAreasMap.get(eaAreaId)

        if (ownerGroup.length === 1) {
          const eaOwner = ownerGroup[0]
          const areaAlerts = alerts.filter(a => a.eaArea.id === eaOwner.id)

          rows.push([
            { html: `<a href='/owner/${eaOwner.id}'>${eaArea.full_name}</a> <small>(${eaArea.id} ${eaOwner.id})</small>` },
            { text: count(areaAlerts, 'fa'), format: 'numeric' },
            { text: count(areaAlerts, 'fw'), format: 'numeric' },
            { text: count(areaAlerts, 'sfw'), format: 'numeric' }
          ])
        } else {
          const areaAlerts = alerts.filter(a => a.eaArea.id === eaAreaId)
          rows.push([
            { html: `${eaArea.full_name} <small>(${eaArea.id})</small>` },
            { text: count(areaAlerts, 'fa'), format: 'numeric' },
            { text: count(areaAlerts, 'fw'), format: 'numeric' },
            { text: count(areaAlerts, 'sfw'), format: 'numeric' }
          ])

          ownerGroup.forEach(owner => {
            const ownerAlerts = alerts.filter(a => a.eaOwner.id === owner.id)
            const shortName = owner.name.replace(`${eaArea.name} - `, '')
            rows.push([
              { html: `<a href='/owner/${owner.id}'>${shortName}</a> <small>(${owner.id})</small>`, classes: 'app-cell-indented' },
              { text: count(ownerAlerts, 'fa'), format: 'numeric', classes: 'app-cell-secondary' },
              { text: count(ownerAlerts, 'fw'), format: 'numeric', classes: 'app-cell-secondary' },
              { text: count(ownerAlerts, 'sfw'), format: 'numeric', classes: 'app-cell-secondary' }
            ])
          })
        }
      })

      return h.view('home', {
        faCount: count(alerts, 'fa'),
        fwCount: count(alerts, 'fw'),
        sfwCount: count(alerts, 'sfw'),
        rows
      })
    },
    options: {
      auth: {
        mode: 'try'
      }
    }
  }
]
