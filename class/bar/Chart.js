export default class Chart {
  constructor(ds, args) {
    const def = {
      el: '#chart_svg',
      xItem: 'val',
      title: 'Chart',
      xAxis: 'xAxis',
      yAxis: 'yAxis',
      ani: 500,
      margin: {
        top: 50,
        bottom: 30,
        left: 60,
        right: 30,
        get x() {
          return this.left + this.right
        },
        get y() {
          return this.top + this.bottom
        }
      },
      get width() {
        return d3.select(this.el).style('width').replace('px', '') - 30
      },
      height: 300,
      theme: ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff', '#ff9f40'],
      get background() {
        return d3.scaleOrdinal(this.theme.map(color => color + '33'))
      },
      get border() {
        return d3.scaleOrdinal(this.theme)
      }
    }
    const vis = this
    Object.assign(def, args)
    Object.assign(vis, def)
    vis.initVis(ds)
  }
  datasetConvert(ds) {
    const vis = this
    const categories = new Set()
    const legends = new Set()
    const dataset = []

    for (const [categorie, objVal] of Object.entries(ds)) {
      categories.add(categorie)
      const group = []
      for (const [legend, val] of Object.entries(objVal)) {
        group.push(val)
        legends.add(legend)
      }
      dataset.push(group)
    }
    vis.legends = Array.from(legends)
    vis.categories = Array.from(categories)

    return dataset
  }
  translate(el, x, y = x) {
    el.attr('transform', `translate(${x},${y})`)
  }
  rotate(el, deg) {
    el.attr('transform', `rotate(${deg})`)
  }
  group(x = 0, y = x) {
    return this.view.append('g').call(this.translate, x, y)
  }
  createScales() {
    const vis = this
    const { width, height } = vis
    vis.scX = d3.scaleBand().range([0, width]).padding(0.2)
    vis.scY = d3.scaleLinear().range([height, 0])
  }
  createAxises() {
    const vis = this
    const { view, width, height } = vis
    const { bottom: mb, left: ml } = vis.margin
    vis.axX = vis.group(0, height)
    vis.axY = vis.group()
    view
      .append('text')
      .attrs({
        x: -height / 2,
        y: -ml / 2,
        'font-size': 18,
        'text-anchor': 'middle'
      })
      .text(vis.yAxis)
      .call(vis.rotate, 270)
    view
      .append('text')
      .attrs({
        x: width / 2,
        y: height + mb,
        'font-size': 18,
        'text-anchor': 'middle'
      })
      .text(vis.xAxis)
  }
  initVis(ds, callback) {
    const vis = this
    const { x: mx, y: my, left: ml, top: mt } = vis.margin
    const el = d3.select(vis.el).append('svg')
    let { width, height } = vis
    vis.view = el.attrs({ width, height }).append('g').call(vis.translate, ml, mt)
    width -= mx
    height -= my
    Object.assign(this, { width, height })
    vis.view
      .append('text')
      .attrs({
        x: width / 2,
        y: 0,
        'font-size': 20,
        'text-anchor': 'middle'
      })
      .text(vis.title)
    callback && callback()
    vis.createScales()
    vis.createAxises()
    vis.wrangleData(ds)
  }
  updateAxises({ scX, scY }) {
    const vis = this
    vis.scX.domain(scX)
    vis.scY.domain(scY)
    d3.axisBottom(vis.scX)(vis.axX)
    d3.axisLeft(vis.scY)(vis.axY)
  }
}

function ascDataset(dsArr, key) {
  return dsArr.slice().sort((a, b) => d3.ascending(a[key], b[key]))
}
function desDataset(dsArr, key) {
  return dsArr.slice().sort((a, b) => d3.descending(a[key], b[key]))
}
