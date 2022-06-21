class Sunburst {
  constructor(ds, args) {
    const def = {
      el: '#chart_svg',
      title: 'Sunburst Chart',
      marginTop: 50,
      marginBottom: 50,
      marginLeft: 50,
      marginRight: 50,

      turn: Math.PI * 2,
      dur: 1000,

      height: 650,
      showDepth: 3,
      format: d3.format(',d'),
      theme: ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff', '#ff9f40'],
      get width() {
        return d3.select(this.el).style('width').split('px')[0]
      }
    }
    const vis = this
    Object.assign(def, args)
    Object.assign(vis, def)
    vis.view = vis.initVis(vis)
    vis.arc = vis.createArc(vis)
    vis.root = vis.wrangleData(ds)
    d3.select('circle').dispatch('click')
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

  initVis(vis) {
    const { el: container, width, height } = vis
    const view = d3
      .select(container)
      .append('svg')
      .attrs({ width, height, 'text-anchor': 'middle' })
      .append('g')
      .attr('transform', `translate(${vis.center()})`)
    vis.width -= vis.marginX
    vis.height -= vis.marginY
    vis.radius = d3.min(vis.viewport) / (vis.showDepth * 2)
    return view
  }

  createArc({ radius }) {
    return d3
      .arc()
      .startAngle(d => d.x0)
      .endAngle(d => d.x1)
      .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
      .padRadius(radius * 1.5)
      .innerRadius(d => d.y0 * radius)
      .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 1))
  }

  wrangleData(ds) {
    const vis = this
    const root = d3
      .hierarchy(ds)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value)

    root.each(d => (d.current = { ...d, x0: 0, x1: 0, y0: d.depth, y1: d.depth + 1 }))

    const partition = d3.partition().size([vis.turn, root.height + 1])
    const data = partition(root)
    const labels = Object.values(ds.children).map(v => v.label)
    labels.unshift(ds.label)

    d3.schemePastel1.unshift('transparent')
    vis.color = d3.scaleOrdinal().domain(labels).range(d3.schemePastel1)
    return vis.updateVis(data)
  }

  updateVis(root) {
    const vis = this
    vis.path = vis.view
      .selectAll('path')
      .data(root.descendants().slice(1))
      .join('path')
      .attr('fill', d => vis.arcColorize(d))

    vis.path
      .filter(d => d.children)
      .style('cursor', 'pointer')
      .on('click', vis.clickHandler.bind(vis))

    vis.path.append('title').text(d => `${d.ancestors().map(d => d.data.label)}`)

    vis.label = vis.view
      .append('g')
      .attrs({
        'pointer-events': 'none',
        'font-size': '12',
        'user-select': 'none'
      })
      .selectAll('text')
      .data(root.descendants().slice(1))
      .join('text')
      .attr('fill-opacity', d => +vis.labelVisible(d.current))
      .text(d => d.data.label)

    vis.ctext = vis.view.append('text').datum(root).attr('font-weight', 'bold')

    vis.parent = vis.view
      .append('circle')
      .data(root)
      .style('cursor', 'pointer')
      .attrs({ r: vis.radius, fill: 'none', 'pointer-events': 'all' })
      .on('click', vis.clickHandler.bind(vis))

    return root
  }

  clickHandler(event, p) {
    const vis = this
    vis.parent.datum(p.parent || vis.root)
    const { x0: p0, depth } = p
    const deltaX = p.x1 - p.x0

    vis.root.each(d => {
      const { x0, x1, y0, y1 } = d
      d.target = {
        x0: Math.max(0, Math.min(1, (x0 - p0) / deltaX)) * vis.turn,
        x1: Math.max(0, Math.min(1, (x1 - p0) / deltaX)) * vis.turn,
        y0: Math.max(0, y0 - depth),
        y1: Math.max(0, y1 - depth)
      }
      return d.target
    })

    vis.path
      .filter((d, i, els) => vis.isVisible(els[i], d.target))
      .transition(vis.t)
      .tween('data', d => {
        const i = d3.interpolate(d.current, d.target)
        return t => (d.current = i(t))
      })
      .attr('fill-opacity', d =>
        vis.arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0
      )
      .attrTween('d', d => () => vis.arc(d.current))

    vis.label
      .filter((d, i, els) => vis.isVisible(els[i], d.target))
      .transition(vis.t)
      .attr('fill-opacity', d => +vis.labelVisible(d.target))
      .attrTween('transform', d => () => vis.labelTransform(d.current))

    vis.ctext.text(() => p.data.label)
  }
  arcColorize(d) {
    const {
      data: { label }
    } = d.depth > 1 ? d.parent : d
    return this.color(label)
  }
  isVisible(el, d) {
    const type = el.nodeName === 'text' ? 'labelVisible' : 'arcVisible'
    return +el.getAttribute('fill-opacity') || this[type](d)
  }
  arcVisible({ x0, x1, y0, y1 }) {
    return y1 <= this.showDepth && y0 >= 1 && x1 > x0
  }

  labelVisible({ x0, x1, y0, y1 }) {
    return y1 <= this.showDepth && y0 >= 1 && (y1 - y0) * (x1 - x0) > 0.07395
  }

  labelTransform({ x0, x1, y0, y1 }) {
    const x = ((x0 + x1) * 90) / Math.PI
    const y = ((y0 + y1) / 2) * this.radius
    return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`
  }
}

const sunburst = new Sunburst(randomData)
