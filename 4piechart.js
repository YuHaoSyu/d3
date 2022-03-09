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
      dur: 1000,
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

  center(offset = [0, 0]) {
    return d3.map(this.viewport, (b, i) => b / 2 + offset[i])
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
    vis.view = view
  }
  createArc() {
    const vis = this
    vis.arc = d3.arc().padAngle((Math.PI * 3) / 180)
    vis.pie = d3
      .pie()
      .sort(null)
      .sort((a, b) => b - a)
    vis.color = d3.scaleOrdinal(vis.theme)
  }

  wrangleData(ds) {
    const vis = this
    const values = Object.values(ds)
    const generator = d3.map(values, data => vis.pie(Object.values(data)))

    const viewBoxMin = d3.min(vis.viewport)
    const layers = generator.length
    const radius = viewBoxMin / 2 / layers

    d3.map(generator, (data, index) => {
      const tatal = d3.sum(data, d => d.value)
      d3.map(data, d => {
        d.percentage = Math.round((d.value / tatal) * 10000) / 100 + '%'
        d.layer = index
        d.innerRadius = radius * index + (index && +20)
        d.outerRadius = radius + index * radius
        return d
      })
    })

    vis.updateVis(values, generator).then(() => {
      d3.selectAll('.enterPath')
        .on('mouseenter', e => vis.hover(e, vis.arc, 1.1))
        .on('mouseleave', e => vis.hover(e, vis.arc, 1))
        .attr('class', '')
    })
  }

  updateGroup(datum) {
    const vis = this
    vis.groups = vis.view
      .selectAll('.enter')
      .data(datum)
      .join(
        enter => enter.append('g').attrs(() => ({ class: 'enter' })),
        update => update,
        exit =>
          exit
            .attrs({ opacity: 1, class: 'exit' })
            .transition(vis.t)
            .attrs({ opacity: 0 })
            .remove()
      )
  }

  updateRadius({ innerRadius, outerRadius }) {
    const vis = this
    return vis.arc
      .padRadius(innerRadius)
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
  }

  storeArc(el, transArc) {
    const lerp = d3.interpolate({ ...el.__oldData__ }, transArc)
    el.__oldData__ = transArc
    return lerp
  }

  async updateVis(datum, pieGenerators) {
    const vis = this

    vis.updateGroup(pieGenerators)

    const enterPath = vis.view
      .selectAll('.enter')
      .selectAll('path')
      .data(d => d)

    await enterPath
      .enter()
      .append('path')
      .attrs((d, i) => ({
        class: 'enterPath',
        transform: `translate(${this.center()})`,
        fill: this.color(i) + '33',
        stroke: this.color(i)
      }))
      .each(function () {
        this.__oldData__ = { startAngle: 0, endAngle: 0 }
      })
      .merge(enterPath)
      .transition(vis.t)
      .attrTween('d', function (arc, i) {
        const lerpAngle = vis.storeArc(this, arc)
        return t => vis.updateRadius(arc)(lerpAngle(t))
      })
      .end()

    const enterText = vis.view
      .selectAll('.enter')
      .selectAll('text')
      .data(d => d)

    enterText
      .enter()
      .append('text')
      .merge(enterText)
      .text(d => d.percentage)
      .attrs({
        fill: (d, i) => vis.color(i),
        transform: d => `translate(${vis.center(vis.updateRadius(d).centroid(d))})`
      })
  }

  hover({ target: path, target: { __data__: d } }, arc, tween) {
    const vis = this
    d3.select(path)
      .transition(vis.t)
      .attr(
        'd',
        arc
          .padRadius(d.innerRadius * tween)
          .innerRadius(d.innerRadius * tween)
          .outerRadius(d.outerRadius * tween)
      )
  }
}
let data = barcharUpdate()
const pieChart = new PieChart(data)

setInterval(() => {
  data = barcharUpdate()
  pieChart.wrangleData(data)
}, 3000)

function barcharUpdate(freq = 10, offset = 2) {
  const data = {}
  const k = 3
  const l = 3
  let i = k
  while (i--) {
    const d = {}
    let j = i + 2
    while (j--) {
      d[String.fromCharCode(64 + j)] = d3.randomInt(1, 5)()
    }
    data[String.fromCharCode(97 + i)] = d
  }

  return data
}
