class Sunburst {
  constructor(ds, args) {
    const def = {
      el: '#chart_svg',
      title: 'Pie Chart',
      marginTop: 50,
      marginBottom: 50,
      marginLeft: 30,
      marginRight: 30,
      innerRadius: 0,
      outerRadius: 100,
      dur: 1000,
      type: 'pie',
      height: 650,
      showDepth: 3,
      format: d3.format(',d'),
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
    vis.radius = d3.min([width, height]) / 2

    vis.createArc()
    vis.view = view
  }
  createArc() {
    const vis = this
    vis.arc = d3
      .arc()
      .startAngle(d => d.x0)
      .endAngle(d => d.x1)
      .innerRadius(d => (d.y0 * vis.radius) / 3)
      .outerRadius(d => Math.max(d.y0 * vis.radius, d.y1 * vis.radius - 10) / 3)
  }
  wrangleData(ds) {
    const root = d3.hierarchy(ds).sum(d => d.value)
    const partition = d3.partition().size([2 * Math.PI, 6])
    const data = partition(root)
    const labels = [ds.label]

    Object.values(ds.children).forEach(v => labels.push(v.label))
    d3.schemePastel1.unshift('transparent')
    this.color = d3.scaleOrdinal().domain(labels).range(d3.schemePastel1)
    this.updateVis(data)
  }

  updateVis(datum) {
    const root = partition(datum)

    root.each(d => (d.current = d))

    const path = g
      .append('g')
      .selectAll('path')
      .data(root.descendants().slice(1))
      .join('path')
      .attr('fill', d => {
        if (d.depth > 1) d = d.parent
        return color(d.data.label)
      })
      .attr('fill-opacity', d => (arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0))
      .attr('d', d => arc(d.current))

    path
      .filter(d => d.children)
      .style('cursor', 'pointer')
      .on('click', clicked)

    path.append('title').text(d => `${d.ancestors().map(d => d.data.label)}`)

    const ctext = g.append('g')
    ctext
      .append('text')
      .attr('text-anchor', 'middle')
      .style('font', '14px sans-serif')
      .style('font-weight', 'bold')
      .text(root.current.data.name)

    const label = g
      .append('g')
      .attr('pointer-events', 'none')
      .attr('text-anchor', 'middle')
      .attr('user-select', 'none')
      .selectAll('text')
      .data(root.descendants().slice(1))
      .join('text')
      .attr('dy', '0.35em')
      .attr('fill-opacity', d => +labelVisible(d.current))
      .attr('transform', d => labelTransform(d.current))
      .text(d => d.data.label)

    const parent = g
      .append('circle')
      .datum(root)
      .attr('r', radius)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('click', clicked)
  }

  clickHandler(event, p) {
    parent.datum(p.parent || root)
    const { x0: p0, depth } = p
    const deltaX = p.x1 - p.x0

    root.each(d => {
      const { x0, x1, y0, y1 } = d
      return (d.target = {
        x0: Math.max(0, Math.min(1, (x0 - p0) / deltaX)) * turn,
        x1: Math.max(0, Math.min(1, (x1 - p0) / deltaX)) * turn,
        y0: Math.max(0, y0 - depth),
        y1: Math.max(0, y1 - depth)
      })
    })

    path
      .transition()
      .duration(750)
      .tween('data', d => {
        const i = d3.interpolate(d.current, d.target)
        return t => (d.current = i(t))
      })
      .filter(function (d) {
        return +this.getAttribute('fill-opacity') || arcVisible(d.target)
      })
      .attr('fill-opacity', d => (arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0))
      .attrTween('d', d => () => arc(d.current))

    label
      .filter(function (d) {
        return +this.getAttribute('fill-opacity') || labelVisible(d.target)
      })
      .transition()
      .duration(750)
      .attr('fill-opacity', d => +labelVisible(d.target))
      .attrTween('transform', d => () => labelTransform(d.current))

    ctext.selectAll('text').transition().duration(750).text(p.data.name)
  }

  arcVisible({ x0, x1, y0, y1 }) {
    return y1 <= 3 && y0 >= 1 && x1 > x0
  }

  labelVisible({ x0, x1, y0, y1 }) {
    return y1 <= 3 && y0 >= 1 && (y1 - y0) * (x1 - x0) > 0.03
  }

  labelTransform({ x0, x1, y0, y1 }) {
    const x = ((x0 + x1) * 90) / Math.PI
    const y = ((y0 + y1) / 2) * radius
    return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`
  }
}

// const sunburst = new Sunburst(randomData)
