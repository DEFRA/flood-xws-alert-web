const { regionsMap, groupedAreas } = require('../lib/data')
const { getAllCounts, findCount } = require('../lib/ddb')

function sum (counts, type) {
  return counts.reduce((acc, item) => acc + item[type], 0)
}

module.exports = [
  {
    method: 'GET',
    path: '/',
    handler: async (request, h) => {
      const counts = await getAllCounts()
      const nationalCounts = {
        fa: sum(counts, 'fa'),
        fw: sum(counts, 'fw'),
        sfw: sum(counts, 'sfw')
      }

      const rows = []

      Object.keys(groupedAreas).forEach(regionId => {
        const group = groupedAreas[regionId]
        const region = regionsMap.get(regionId)

        if (group.length === 1) {
          const area = group[0]
          const areaCounts = findCount(counts, area.id)
          rows.push([
            { html: `<a href='/area/${area.id}'>${area.name}</a>` },
            { text: areaCounts.fa, format: 'numeric' },
            { text: areaCounts.fw, format: 'numeric' },
            { text: areaCounts.sfw, format: 'numeric' }
          ])
        } else {
          const totalAreaCounts = group.map(area => findCount(counts, area.id))
          rows.push([
            { html: region.name },
            { text: sum(totalAreaCounts, 'fa'), format: 'numeric' },
            { text: sum(totalAreaCounts, 'fw'), format: 'numeric' },
            { text: sum(totalAreaCounts, 'sfw'), format: 'numeric' }
          ])

          group.forEach(area => {
            const opCounts = findCount(counts, area.id)

            rows.push([
              { html: `<a href='/area/${area.id}'>${area.name}</a>`, classes: 'app-cell-indented' },
              { text: opCounts.fa, format: 'numeric', classes: 'app-cell-secondary' },
              { text: opCounts.fw, format: 'numeric', classes: 'app-cell-secondary' },
              { text: opCounts.sfw, format: 'numeric', classes: 'app-cell-secondary' }
            ])
          })
        }
      })

      return h.view('home', {
        faCount: nationalCounts.fa,
        fwCount: nationalCounts.fw,
        sfwCount: nationalCounts.sfw,
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
