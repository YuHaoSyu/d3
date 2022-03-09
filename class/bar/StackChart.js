import data from '../../data/barchardata.js'
import Chart from './Chart.js'
export default class StackChart extends Chart {
  constructor(ds, args) {
    super(ds, args)
  }
  wrangleData(ds, curve) {
    const vis = this
    ds = vis.datasetConvert(ds)
    const stack = d3.stack().keys(d3.range(vis.legends.length))(ds)
    const categoriesData = stack.map((d, l) => d.map(([y0, y1]) => [y0, y1, l]))
    vis.maxY = d3.max(ds, d => d3.sum(d)) * 1.1
    const scX = vis.categories
    const scY = [0, vis.maxY]
    vis.updateAxises({ scX, scY })
    vis.stack = vis.view.selectAll('.stack').data(categoriesData)
    // vis.line.datum(ds)
    vis.updateVis(curve)
  }
  updateVis(curve = 'curveLinear') {
    const vis = this
    const { scX, scY, maxY, categories, background, border } = vis
    const offset = scX.bandwidth() / categories.length
    const avgY = maxY / categories.length
    vis.stack
      .enter()
      .append('path')
      .attrs((dt, i) => ({
        stroke: 2,
        fill: background(i),
        stroke: border(i),
        d: d3
          .area()
          .x((d, j) => scX(categories[j]) + offset * j)
          .y0(scY(avgY * i))
          .y1(scY(avgY * (i + 1)))
      }))
      .transition()
      .duration(1000)
      .attrs((dt, i) => ({
        d: d3
          .area()
          .x((d, j) => scX(categories[j]) + offset * j)
          .y0(d => scY(d[0] + i * 3))
          .y1(d => scY(d[1] + i * 3))
      }))
  }
}
// Math.between = (a, b) =>
//   Math.floor(Math.random() * (Math.max(a, b) - Math.min(a, b) + 1)) +
//   Math.min(a, b)
// const data = {}
// for (let i = 0; i < 10; i++) {
//   const categories = String.fromCharCode(97 + i)
//   data[categories] = {}
//   for (let j = 0; j < 10; j++) {
//     let legends = String.fromCharCode(65 + j)
//     data[categories][legends] = Math.between(10, 150)
//   }
// }

const stackchart = new StackChart(data, { el: '#chart_svg2' })
