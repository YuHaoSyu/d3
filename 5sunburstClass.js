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
  wrangleData(ds) {
    const root = d3.hierarchy(ds).sum(d => d.value)
    const partition = d3.partition().size([2 * Math.PI, 6])
    const data = partition(root)
    console.log(data)
    this.updateVis(data)
  }
  generator(ds) {}
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
      .domain(['root', 'A', 'B', 'C', 'D', 'E'])
      .range(d3.schemePastel1)
  }

  updateVis(datum) {
    const vis = this
    // console.log(datum)
    const pathGroup = vis.view.selectAll('.root').data(datum.children)
    pathGroup
      .enter()
      .append('g')
      .attr('transform', `translate(${[vis.width, vis.height].map(d => d / 2)})`)
      .attr('class', d => 'root label-' + d.data.label)

    const paths = vis.view
      .selectAll('.root')
      .selectAll('path')
      .data(d => d)

    paths
      .enter()
      .append('path')
      .filter((d, el) => d.depth < vis.showDepth)
      .attrs((d, i) => {
        // console.log(d.data.label)
        const classlist = 'depth-' + d.depth + ' label-' + d.data.label

        if (d.depth > vis.showDepth) return { class: classlist }
        return {
          class: classlist,
          d: vis.arc(d),
          stroke: vis.color(d.data.label),
          fill: vis.color(d.data.label),
          'fill-opacity': ((10 - d.depth * 2) | 0) / 10
        }
      })

      .on('click', vis.clickHandler.bind(this))

    paths.attrs((d, i) => {
      // console.log(d, i)
      return {
        d: vis.arc(d),
        stroke: vis.color(d.data.label),
        fill: vis.color(d.data.label),
        'fill-opacity': ((10 - d.depth * 2) | 0) / 10
      }
    })
  }
  clickHandler(e, node) {
    console.log(node)
    const vis = this
    vis.showDepth = node.depth
    vis.wrangleData(node.data)
  }
}

const sunburst = new Sunburst(randomData)
