const { getAllAlerts } = require('../lib/ddb')
const { regionsMap, groupedAreas } = require('flood-xws-common/data')
const { countAlertTypes: count } = require('../helpers')

module.exports = [
  {
    method: 'GET',
    path: '/',
    handler: async (request, h) => {
      const alerts = await getAllAlerts()
      const rows = []

      Object.keys(groupedAreas).forEach(regionId => {
        const group = groupedAreas[regionId]
        const region = regionsMap.get(regionId)

        if (group.length === 1) {
          const area = group[0]
          const areaAlerts = alerts.filter(a => a.area.id === area.id)

          rows.push([
            { html: `<a href='/area/${area.id}'>${area.name}</a>` },
            { text: count(areaAlerts, 'fa'), format: 'numeric' },
            { text: count(areaAlerts, 'fw'), format: 'numeric' },
            { text: count(areaAlerts, 'sfw'), format: 'numeric' }
          ])
        } else {
          const regionAlerts = alerts.filter(a => a.region.id === regionId)
          rows.push([
            { html: region.name },
            { text: count(regionAlerts, 'fa'), format: 'numeric' },
            { text: count(regionAlerts, 'fw'), format: 'numeric' },
            { text: count(regionAlerts, 'sfw'), format: 'numeric' }
          ])

          group.forEach(area => {
            const areaAlerts = alerts.filter(a => a.area.id === area.id)

            rows.push([
              { html: `<a href='/area/${area.id}'>${area.name}</a>`, classes: 'app-cell-indented' },
              { text: count(areaAlerts, 'fa'), format: 'numeric', classes: 'app-cell-secondary' },
              { text: count(areaAlerts, 'fw'), format: 'numeric', classes: 'app-cell-secondary' },
              { text: count(areaAlerts, 'sfw'), format: 'numeric', classes: 'app-cell-secondary' }
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
