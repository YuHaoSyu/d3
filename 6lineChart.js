class LineChart {
  constructor(ds, args) {
    const def = {
      el: '#chart_svg',
      title: 'Line Chart',
      marginTop: 50,
      marginBottom: 65,
      marginLeft: 60,
      marginRight: 30,
      xLabel: 'xLabel',
      yLebel: 'yLabel',
      paddingX: 0.5,
      dur: 80,
      curve: 'curveLinear',
      height: 400,
      theme: ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff', '#ff9f40'],
      get width() {
        return d3.select(this.el).style('width').split('px')[0] - 30
      }
    }
    const vis = this
    Object.assign(def, args)
    Object.assign(vis, def)
    vis.yAxisAnimation = 1000
    vis.initVis(vis)
    vis.dataset = vis.wrangleData(ds)

    vis.interactive(vis, ds)
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

  initVis(vis) {
    const { el: container, width, height, marginLeft: ml, marginTop: mt } = vis
    const svg = d3
      .select(container)
      .append('svg')
      .attrs({
        viewBox: `0 0 ${width} ${height}`,
        width,
        height,
        'text-anchor': 'middle'
      })

    vis.defs = svg.append('defs')
    const view = svg.append('g').attrs({ transform: `translate(${ml},${mt})` })
    this.view = view
    vis.width -= vis.marginX
    vis.height -= vis.marginY

    vis.createTicks(view, vis)
  }
  get generateLine() {
    const vis = this
    return d3
      .line()
      .x(d => vis.xScale(d.x))
      .y(d => vis.yScale(d.y))
      .curve(d3[vis.curve])
  }

  createTicks(view, { width, height }) {
    const vis = this
    vis.xScale = d3.scaleTime().range([0, width])

    vis.yScale = d3.scaleLinear().range([height, 0])
    vis.color = d3.scaleOrdinal().range(this.theme)
    vis.xAxis = view
      .append('g')
      .attrs({ transform: `translate(${0},${height})`, class: 'x-axis' })

    vis.yAxis = view.append('g').attrs({ class: 'y-axis' })
  }

  updateTicks(xTicks) {
    const vis = this
    vis.xScale.domain(xTicks) //[timestamp]
    vis.yScale.domain(vis.yTicks)

    const dayFiltered = d3.timeDay.filter(d => [1, 15].includes(d.getDate()))
    d3.axisBottom(vis.xScale)(
      /* .ticks(null, '%Y / %m / %d') */ vis.xAxis.transition(vis.t)
    )
    vis.yAxis.transition(vis.t).call(d3.axisLeft(vis.yScale))

    if (vis.updateGrid) {
      vis.updateGrid()
    }
  }

  wrangleData(ds) {
    const vis = this

    vis.xTicks = Object.keys(ds).map(d => +d) // [timestamp]
    vis.legends = Object.keys(ds[vis.xTicks[0]]) //['A', 'B', 'C', 'D', 'E']

    const dataset = d3.map(vis.legends, legend => ({
      legend,
      val: d3.map(vis.xTicks, tick => ({ x: tick, y: ds[tick][legend] }))
    }))

    vis.yTicks = d3
      .extent(d3.merge(dataset.map(({ val }) => val.map(({ y }) => y))))
      .map(d => d * 1.1)

    const timeExtent = d3.extent(vis.xTicks)
    vis.updateTicks(timeExtent)

    return vis.updateVis(dataset)
  }

  strokePath() {
    const length = this.getTotalLength()
    return d3.interpolate(`0,${length}`, `${length},${length}`)
  }
  updateVis(dataset) {
    const vis = this
    vis.paths = vis.view.selectAll('.line').data(dataset)

    vis.paths
      .datum(d => d.val)
      // .transition()
      // .duration(1500)
      .attr('d', vis.generateLine)

    vis.paths
      .enter()
      .append('path')
      .attrs(d => ({
        class: 'line',
        stroke: vis.color(d.legend),
        fill: 'none'
      }))
      .datum(d => d.val)
      .attr('d', vis.generateLine)

      .transition()
      .duration(3000)
      .attrTween('stroke-dasharray', vis.strokePath)
    return dataset
  }
  createCross(view, width, height) {
    const vis = this
    vis.crossline = view.append('polyline').attrs({
      fill: 'none',
      'stroke-dasharray': 10,
      class: 'cross',
      stroke: '#888'
    })

    vis.defs.append('clipPath').attrs({ id: 'clip' }).append('rect').attrs({
      width,
      height,
      x: vis.marginLeft,
      y: vis.marginTop
    })

    vis.interacter = view.append('rect').attrs({
      class: 'zoom',
      'pointer-events': 'all',
      'clip-path': 'url(#clip)',
      fill: 'none',
      width,
      height
    })
  }
  updateCross(x, y) {
    const vis = this
    const x0 = new Date(vis.xScale.invert(x)).getTime()
    const i = vis.bisectTime(vis.xTicks, x0)
    const date = vis.xTicks[i]
    const x1 = vis.xScale(+date)

    vis.crossline.attrs({ points: `0,${y} ${x1},${y} ${x1},${vis.height}` })
    return { date, x1 }
  }
  createPoints() {
    const vis = this
    vis.points = vis.view.selectAll('.point').data(vis.legends)
    return vis.points
      .enter()
      .append('circle')
      .attrs(d => ({
        class: `point`,
        r: 6,
        stroke: vis.color(d),
        'stroke-width': 3,
        fill: '#fff',
        opacity: 0,
        cursor: 'pointer'
      }))
  }
  toggleCross(attrs) {
    const vis = this
    vis.crossline.attrs(attrs)
    vis.view.selectAll('.point').attrs(attrs)
  }
  toggleTargetLine(attrs) {
    const vis = this
    vis.view.selectAll('.point').attrs(attrs)
    vis.view.selectAll('.line').attrs(attrs)
  }
  interactive({ view, width, height }, ds) {
    const vis = this
    vis.bisectTime = d3.bisector(d => new Date(d).getTime()).center
    vis.createCross(view, width, height)
    vis.interacter
      .on('mousemove', function (e) {
        const [x, y] = d3.pointer(e, this)
        const { date, x1 } = vis.updateCross(x, y)
        view.selectAll('.point').attrs(d => ({
          cx: x1,
          cy: vis.yScale(ds[date][d])
        }))
      })
      .on('mouseover', () => vis.toggleCross({ opacity: 1 }))
      .on('mouseout', () => vis.toggleCross({ opacity: 0 }))

    vis
      .createPoints()
      .on('mouseover', function (e) {
        const [x, y] = [this.cx, this.cy].map(coor => coor.baseVal.value)

        vis.crossline.attrs({ opacity: 1 })

        const hoverColor = e.target.getAttribute('stroke')
        vis.toggleTargetLine(function () {
          return { opacity: hoverColor === this.getAttribute('stroke') ? 1 : 0.3 }
        })

        vis.updateCross(x, y)
      })
      .on('mouseout', () => {
        vis.toggleTargetLine({ opacity: 1 })
      })
  }
}
