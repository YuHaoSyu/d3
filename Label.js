class Label {
  constructor(chart) {
    const size = { 'font-size': 18 }
    this.view = chart.view
    this.topPos = {
      x: chart.width / 2,
      y: chart.height + chart.marginBottom,
      ...size
    }
    this.leftPos = {
      x: -chart.height / 2,
      y: -chart.marginLeft / 2,
      ...size,
      transform: 'rotate(270)'
    }
    chart.xLabel && this.top(chart)
    chart.yLebel && this.left(chart)
  }
  top(chart) {
    this.view.append('text').attrs(this.topPos).text(chart.xLabel)
  }
  left(chart) {
    this.view.append('text').attrs(this.leftPos).text(chart.yLebel)
  }
}
