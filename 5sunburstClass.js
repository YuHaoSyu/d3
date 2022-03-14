class Sunburst {
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
      height: 650,
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
  wrangleData(ds) {
    const root = this.generator(ds)

    this.updateVis(root)
  }
  generator(ds) {
    const root = d3.hierarchy(randomData).sum(d => d.value)
    return d3.partition().size([2 * Math.PI, root.height + 1])(root)
  }
  createArc() {
    const vis = this
    vis.arc = d3
      .arc()
      .startAngle(d => d.x0)
      .endAngle(d => d.x1)
      .innerRadius(d => (d.y0 * vis.radius) / 3)
      .outerRadius(d => {
        return Math.max(d.y0 * vis.radius, d.y1 * vis.radius - 10) / 3
      })
    d3.schemePastel1.unshift('transparent')
    vis.color = d3
      .scaleOrdinal()
      .domain([undefined, 'A', 'B', 'C', 'D', 'E'])
      .range(d3.schemePastel1)
  }

  updateVis(datum) {
    const vis = this

    vis.view
      .append('g')
      .attr('transform', `translate(${[vis.width, vis.height].map(d => d / 2)})`)
      .selectAll('path')
      .data(datum)
      .enter()
      .append('path')
      .attrs((d, i) => {
        return {
          d: vis.arc(d),
          stroke: vis.color(d.data.label),
          fill: vis.color(d.data.label),
          'fill-opacity': (((1 - d.depth / 5) * 10) | 0) / 10
        }
      })
  }
}

const sunburst = new Sunburst(randomData)
