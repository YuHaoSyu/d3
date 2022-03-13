class Sunburst {
  constructor(ds, args) {
    const def = {
      el: '#chart_svg2',
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
    vis.radius = Math.min(width, height) / 6
    vis.createArc()
    vis.view = view
  }
  wrangleData(ds) {
    const root = this.generator(ds)
    root.each(d => (d.current = d))

    this.updateVis(root)
  }
  generator(ds) {
    const root = d3
      .hierarchy(ds)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value)
    return d3.partition().size([2 * Math.PI, root.height + 1])(root)
  }
  createArc() {
    const vis = this
    vis.arc = d3
      .arc()
      .startAngle(d => d.x0)
      .endAngle(d => d.x1)
      .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
      .padRadius(vis.radius * 1.5)
      .innerRadius(d => d.y0 * vis.radius)
      .outerRadius(d => Math.max(d.y0 * vis.radius, d.y1 * vis.radius - 1))

    vis.color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, 27))
  }
  arcVisible(d) {
    return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0
  }

  updateVis(datum) {
    const vis = this
    vis.groups = vis.view
      .append('g')
      .attr('transform', `translate(${d3.map([this.width, this.height], b => b / 2)})`)
    // console.log(datum)
    const path = vis.groups
      .selectAll('path')
      .data(datum.descendants().slice(1))
      .join('path')

      .attr('fill', d => {
        while (d.depth > 1) d = d.parent
        return color(d.data.name)
      })
      .attr(
        'fill-opacity',
        d => 0.5
        // vis.arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0
      )
      .attr('d', d => vis.arc(d.current))

    // console.log(path)
  }
}

// const sunburst = new Sunburst(data)

function gen(depth) {
  const children = []
  let times = 0
  const hasChild = d3.randomInt(0, 2)
  while (times++ < 2) {
    const obj = { value: 1, name: depth + '-' + times }
    if (depth < 4) {
      depth += 1
      obj.children = gen(depth)
    }
    children.push(obj)
  }

  return children
}

// https://jsfiddle.net/b9a3y98s/1/
//https://s.itho.me/modernweb/2015/slides/R2_0515_1330-1355_kuro%20hsu.pdf
const randomData = { name: '1-1', value: 1, children: gen(1) }

// console.log(JSON.stringify(randomData, null, 2))
const width = 800
const height = 600
const view = d3
  .select('#chart_svg2')
  .append('svg')
  .attrs({ width, height })
  .append('g')
  .attr('transform', 'translate(40,30)')
const theme = d3.schemeYlGn

const radius = d3.min([800, 600]) / 2
const root = d3
  .hierarchy(randomData)
  .sum(d => d.value)
  .sort((a, b) => b.value - a.value)
const partition = d3.partition().size([800, 500])(root)
const arc = d3
  .arc()
  .startAngle(d => d.x0)
  .endAngle(d => d.x1)
  .innerRadius(2)
  .outerRadius(20)

console.log(root)
view
  .selectAll('line')
  .data(partition)
  .enter()
  .append('line')
  .attrs((d, i) => {
    console.log()
    return {
      x0: d.x1,
      x1: d.x1,
      y0: d.y1,
      y1: d.y1,
      stroke: theme[9][d.depth % 9]
    }
  })

view
  .selectAll('text')
  .data(partition)
  .enter()
  .append('text')
  .attr('x', d => d.x1 - 15)
  .attr('y', d => d.y1 - 0)

  .text(d => d.data.name)
let px = 1
for (const color of theme[9]) {
  view
    .append('text')
    .attr('fill', color)
    .attr('x', 600 - px * 10)
    .text(px)
  px++
}
