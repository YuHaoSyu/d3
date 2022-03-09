import data from '../../data/barchardata.js'
import Chart from './Chart.js'
export default class LineChart extends Chart {
  constructor(ds, args) {
    super(ds, args)
  }
  initVis(ds) {
    super.initVis(
      ds,
      () =>
        (this.line = this.view.append('path').attrs({
          class: 'line',
          fill: 'none',
          stroke: 'rgb(54, 162, 235)',
          'stroke-width': 3
        }))
    )
  }
  wrangleData(ds, curve) {
    const vis = this
    ds = vis.datasetConvert(ds).map(d => d3.sum(d))
    const [min, max] = d3.extent(ds)
    const scX = vis.categories
    const scY = [(min *= 0.8), (max *= 1.2)]
    vis.updateAxises({ scX, scY })
    vis.line.datum(ds)
    vis.updateVis(curve)
  }
  updateVis(curve = 'curveLinear') {
    const vis = this
    vis.line
      .transition()
      .duration(500)
      .attr(
        'd',
        d3
          .line()
          .x((d, i) => vis.scX(vis.categories[i]))
          .y(d => vis.scY(d))
          .curve(d3[curve])
      )
  }
}
// Math.between = (a, b) =>
//   Math.floor(Math.random() * (Math.max(a, b) - Math.min(a, b) + 1)) +
//   Math.min(a, b)
// let data = {}
// for (let i = 0; i < 10; i++) {
//   const categories = String.fromCharCode(97 + i)
//   data[categories] = {}
//   for (let j = 0; j < 10; j++) {
//     let legends = String.fromCharCode(65 + j)
//     data[categories][legends] = Math.between(10, 150)
//   }
// }

let linechart = new LineChart(data)
// let curves = document.getElementById('curves')
// curves.addEventListener('change', function(e) {
//   linechart.wrangleData(data, e.target.value)
// })

// function randomBarChartData(ds) {
//   let obj = {}
//   let len = Object.entries(ds).length
//   Object.entries(ds).map(([key], i) => {
//     if (i % Math.between(len, 0) === 0) {
//       return
//     }
//     obj[key] = {}
//     obj[key].A = Math.between(150, 0)
//     return obj
//   })
//   return obj
// }

// !(function updateData() {
//   setTimeout(() => {
//     linechart.wrangleData(randomBarChartData(data))
//     updateData()
//   }, 1000)
// })()
