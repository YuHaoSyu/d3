import barcharUpdate from '../../data/barchardata.js'
import MultiBarChart from './BarChart.js'
export default class GroupedBarChart extends MultiBarChart {
  constructor(ds, args) {
    super(ds, args)
  }
  createLegend() {
    const vis = this
    vis.legendArea = vis.view.append('g').call(vis.translate, vis.width, 0)
    const legend = vis.legendArea.selectAll('rect').data(vis.legends)
    const legendLen = vis.legends.length - 1
    legend
      .enter()
      .append('rect')
      .attrs((d, i) => ({
        transform: `translate(${legendLen * -25 + i * 25},0)`,
        width: 20,
        height: 20,
        fill: vis.background(i),
        stroke: vis.border(i)
      }))

    legend
      .enter()
      .append('text')
      .attrs((d, i) => ({
        transform: `translate(${legendLen * -25 + i * 25 + 10},0)`,
        fill: vis.background(i),
        'text-anchor': 'middle'
      }))
      .text((d, i) => vis.legends[i])
  }
  wrangleData(ds) {
    const vis = this
    const { dsConvert } = super.wrangleData(ds)
    vis.updateAxises({
      scX: vis.categories,
      scY: [0, d3.max(dsConvert, d => d3.max(d)) * 1.2]
    })
    vis.updateVis()
    vis.legendArea || vis.createLegend()
  }
  updateVis() {
    const vis = this
    const { scX, scY, background, border, categories, legends } = vis
    const width = scX.bandwidth()
    const mx = d3.scaleBand().domain(Object.keys(legends)).range([0, width]).padding(0.2)
    vis.updateGroup()
    super.updateVis({
      init([, , l], i) {
        return {
          x: scX(categories[i]) + mx(l),
          width: mx.bandwidth(),
          y: scY(0),
          height: 0,
          fill: background(l),
          stroke: border(l)
        }
      },
      enter: ([y0, y1]) => ({
        y: scY(y1 - y0),
        height: scY(0) - scY(y1 - y0)
      }),
      update: ([y0, y1, l], i) => {
        console.log(mx(l))
        return {
          x: scX(categories[i]) + mx(l),
          width: mx.bandwidth(),
          y: scY(y1 - y0),
          height: scY(0) - scY(y1 - y0)
        }
      },
      exit: {
        y: scY(0),
        height: 0,
        fill: 'transparent',
        stroke: 'transparent'
      }
    })
  }
}

const groupedBarChart = new GroupedBarChart(barcharUpdate, {
  el: '#chart_svg3'
})
