class PieChart {
  constructor(ds, args) {
    const def = {
      el: '#chart_svg',
      title: 'Pie Chart',
      marginTop: 50,
      marginBottom: 30,
      marginLeft: 60,
      marginRight: 30,
      innerRadius: 0,
      outerRadius: 100,
      dur: 500,
      type: 'pie',
      height: 600,
      theme: ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff', '#ff9f40'],
      get width() {
        return d3.select(this.el).style('width').split('px')[0] - 30
      }
    }
    const vis = this
    Object.assign(def, args)
    Object.assign(vis, def)
    vis.initVis(vis.el, vis.width, vis.height, vis.marginLeft, vis.marginTop)
    vis.wrangleData(ds)
  }

  get t() {
    return d3.transition().duration(this.dur)
  }

  get marginX() {
    return this.marginLeft + this.marginRight
  }

  get marginY() {
    return this.marginTop + this.marginBottom
  }

  get viewport() {
    return [this.width, this.height]
  }

  initVis(container, width, height, ml, mt) {
    const vis = this
    const view = d3
      .select(container)
      .append('svg')
      .attrs({ width, height, 'text-anchor': 'middle' })
      .append('g')
      .attr('transform', `translate(${ml},${mt})`)
    vis.width -= vis.marginX
    vis.height -= vis.marginY
    vis.createArc()
    this.view = view
  }
  createArc() {
    this.arc = d3.arc() //.padAngle((Math.PI * 3) / 180)
    this.pie = d3.pie().sort(null)
    this.color = d3.scaleOrdinal(this.theme)
  }
  wrangleData(ds) {
    let sorted = d3.map(Object.values(ds), data =>
      d3.sort(Object.entries(data), (a, b) => d3.descending(a[1], b[1]))
    )
    sorted = d3.map(sorted, arr => Object.fromEntries(new Map([...arr])))

    this.updateVis(Object.values(sorted))
  }
  get center() {
    return d3.map(this.viewport, b => b / 2)
  }
  updateGroup(datum) {
    const vis = this
    d3.map(datum, (data, index) =>
      d3.map(data, d => {
        d.layer = index
        return d
      })
    )
    vis.groups = vis.view.selectAll('.enter').data(datum)
    vis.groups
      .enter()
      .append('g')
      .attrs(() => ({ class: 'enter' }))

    vis.groups
      .exit()
      .attrs({ opacity: 1, class: 'exit' })
      .transition(vis.t)
      .attrs({ opacity: 0 })
      .remove()
  }
  updateVis(datum) {
    const vis = this
    const viewBoxMin = d3.min(this.viewport)
    const layers = datum.length
    const radius = viewBoxMin / (2 * layers)
    const pieGenerators = d3.map(datum, data => vis.pie(Object.values(data)))
    vis.updateGroup(pieGenerators)
    const angleInterpolation = d3.map(pieGenerators, d =>
      d3.interpolate(vis.pie.startAngle, vis.pie.endAngle)
    )
    console.log(angleInterpolation)
    const enterGroup = vis.view
      .selectAll('.enter')
      .selectAll('path')
      .data(d => d)

    enterGroup
      .enter()
      .append('path')
      .attrs((d, i) => {
        return {
          transform: `translate(${this.center})`,
          fill: this.color(i) + '33',
          stroke: this.color(i)
        }
      })
      .transition()
      .ease(d3.easeLinear)
      .duration(500)
      .attrTween('d', (pieData, i) => {
        const originalEnd = pieData.endAngle

        return t => {
          let currentAng = angleInterpolation[i](t)
          if (currentAng < pieData.startAngle) {
            return ''
          }
          pieData.endAngle = d3.min([currentAng, originalEnd])
          vis.arc.innerRadius(pieData.layer * radius).outerRadius(pieData.layer * radius + radius)
          vis.arc(pieData)

          return ''
        }
        // d: vis.arc.innerRadius(d.layer * 20).outerRadius(d.layer * 20 + 20)(d),
      })
  }
}
const data = barcharUpdate()
const pieChart = new PieChart(data)

function barcharUpdate(freq = 10, offset = 2) {
  const data = {}
  const k = 2
  const l = 5
  let i = k
  while (i--) {
    const d = {}
    let j = l
    while (j--) {
      d[String.fromCharCode(64 + j)] = Math.abs(
        Math.cos((1 / k) * (i + freq) + (1 * j) / l) * Math.PI * 10 + 10
      )
    }
    data[String.fromCharCode(97 + i)] = d
  }

  return data
}

const b = { a: 5, b: 10, c: 0 }
const bbb = d3
  .sort(Object.entries(b), (a, b) => d3.descending(a[1], b[1]))
  .map(a => Object.fromEntries(new Map([a])))

// this.pie(Object.values(ds)).map((e, blockIndex) => {
//   console.log(pieIndex, vis.pie.startAngle()(), vis.pie.endAngle()())
//   const lerp = d3.interpolate(vis.pie.startAngle()(), vis.pie.endAngle()())

//   const path = this.view.append('path')
//   path
//     .attrs({
//       d: this.arc.padRadius(pieIndex * radius)({
//         innerRadius: pieIndex * radius,
//         outerRadius: pieIndex * radius + radius - 5,

//         startAngle: e.startAngle,
//         endAngle: e.endAngle
//       }),
//       fill: this.color(blockIndex) + '33',
//       stroke: this.color(blockIndex)
//     })

//     .attr('transform', `translate(${this.center})`)
// })
