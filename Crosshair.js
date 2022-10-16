class Crosshair {
  constructor(chart) {
    this.crossline = chart.view.append('polyline').attrs({
      fill: 'none',
      'stroke-dasharray': 10,
      class: 'cross',
      stroke: '#888'
    })
    d3.select(chart.el + '>svg')
      .insert('defs')
      .append(this.clipPath(chart))
  }
  clipPath({ width, height, marginLeft: x, marginTop: y }) {
    const c = d3.create('clipPath')
    c.append('rect').attrs({ width, height, x, y })
    return () => c.node()
  }
}
