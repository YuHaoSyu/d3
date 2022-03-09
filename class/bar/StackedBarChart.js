import data from '../../data/barchardata.js'
import MultiBarChart from './BarChart.js'
export default class StackedBarChart extends MultiBarChart {
  constructor(ds, args) {
    super(ds, args)
  }
  createLegend() {
    const vis = this
    vis.legendArea = vis.view.append('g').call(vis.translate, vis.width + vis.margin.right, 0)
    const legend = vis.legendArea.selectAll('rect').data(vis.legends)
    const legendLen = vis.legends.length - 1
    legend
      .enter()
      .append('rect')
      .attrs((d, i) => ({
        transform: `translate(-35,${i * 25})`,
        width: 20,
        height: 20,
        fill: vis.background(legendLen - i),
        stroke: vis.border(legendLen - i)
      }))

    legend
      .enter()
      .append('text')
      .attrs((d, i) => ({
        transform: `translate(-10,${i * 25 + 15})`,
        fill: vis.background(legendLen - i),
        'text-anchor': 'middle'
      }))
      .text((d, i) => vis.legends[legendLen - i])
  }
  wrangleData(ds) {
    const vis = this
    const { dsConvert } = super.wrangleData(ds)
    vis.updateAxises({
      scX: vis.categories,
      scY: [0, d3.max(dsConvert, d => d3.sum(d)) * 1.2]
    })
    vis.updateVis()
    vis.legendArea || vis.createLegend()
  }
  updateVis() {
    const vis = this
    const { scX, scY, background, border, categories } = vis
    vis.updateGroup()

    super.updateVis({
      init: ([, , l], i) => ({
        x: scX(categories[i]),
        width: scX.bandwidth(),
        y: scY(0),
        height: 0,
        fill: background(l),
        stroke: border(l)
      }),
      enter: ([y0, y1]) => ({
        y: scY(y1),
        height: scY(0) - scY(y1 - y0)
      }),
      update: ([y0, y1], i) => ({
        x: scX(categories[i]),
        width: scX.bandwidth(),
        y: scY(y1),
        height: scY(0) - scY(y1 - y0)
      }),
      exit: {
        y: scY(0),
        height: 0,
        fill: 'transparent',
        stroke: 'transparent'
      }
    })
  }
}

const stackBarChart = new StackedBarChart(data, {
  el: '#chart_svg2'
})
