class Grid {
  constructor(chart) {
    this.chart = chart
    this.style = {
      line: { 'stroke-opacity': 0.2 },
      '.domain': { 'stroke-opacity': 0.2 }
    }

    this.gridStyle = d3.select(chart.el + '>svg').insert('style')
    this.status = { xAxis: false, yAxis: false }
  }
  axisClass(axis) {
    const parent = this.chart[axis].attr('class')
    if (parent) return '.' + parent + ' '
  }
  convert(group) {
    const existContent = this.gridStyle.text()
    const replace = { ',': ';', '"': '' }

    let styleStr = Object.entries(this.style)
      .map(([selector, attr]) => {
        const el = group + selector
        const styles = JSON.stringify(attr)
        return el + styles
      })
      .join('')
      .replace(/,|"/g, $ => replace[$])

    if (!existContent.includes(styleStr)) styleStr += existContent
    return styleStr
  }
  async animate(lines, attr) {
    await lines
      .transition()
      .duration((d, i) => 2000 - i * 50)
      .delay((d, i) => i * 50)
      .attrs(attr)
      .end()
    if (!this.chart.updateGrid) {
      this.chart.updateGrid = this.updateGrid.bind(this)
    }
  }
  callAxis(dir) {
    const lines = this.chart[dir].selectAll('line')
    const group = this.axisClass(dir) || ''
    this.gridStyle.text(this.convert(group))
    this.status[dir] = true
    return lines
  }
  horizontal() {
    this.animate(this.callAxis('yAxis'), { x1: this.chart.width })
    return this
  }
  vertical() {
    this.animate(this.callAxis('xAxis'), { y1: -this.chart.height })
    return this
  }
  updateGrid() {
    this.checkStatus('xAxis', { y1: -this.chart.height })
    this.checkStatus('yAxis', { x1: this.chart.width })
  }
  checkStatus(axis, attr) {
    this.status[axis] && this.chart[axis].selectAll('line').attrs(attr)
  }
}
