class Title {
  constructor(chart) {
    this.chart = chart
    this.text = chart.view
      .append('text')
      .attrs({
        x: chart.width / 2,
        'font-size': 20
      })
      .text(chart.title)
  }
  overlapping() {
    const { chart } = this
    chart.view.attr('transform', `translate(${chart.marginLeft},${0})`)
    chart.height += chart.marginTop
    this.text.attr('y', chart.marginTop)
  }
}
