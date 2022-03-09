import barcharUpdate from '../../data/barchardata.js'
import Chart from './Chart.js'
class BarChart extends Chart {
  constructor(ds, args) {
    super(ds, args)
  }
  wrangleData(ds) {
    const vis = this
    ds = vis.datasetConvert(ds).map(d => d3.sum(d))

    const scX = vis.categories
    const scY = [0, d3.max(ds) * 1.1]
    vis.updateAxises({ scX, scY })

    vis.bars = vis.view.selectAll('rect').data(ds)
    vis.updateVis()
  }
  updateVis(config = {}) {
    const vis = this
    const { ani, scX, scY, height, background, border, categories } = vis
    const { update, init, enter, exit } = config
    vis.bars
      .transition()
      .duration(ani)
      .attrs(
        update ||
          ((d, i) => ({
            x: scX(categories[i]),
            y: scY(d),
            width: scX.bandwidth(),
            height: height - scY(d)
          }))
      )
    vis.bars
      .exit()
      .transition()
      .duration(ani)
      .attrs(exit || { fill: `transparent` })
      .remove()

    vis.bars
      .enter()
      .append('rect')
      .attrs(
        init ||
          ((d, i) => ({
            x: scX(categories[i]),
            y: height,
            width: scX.bandwidth(),
            fill: background(categories[i]),
            stroke: border(categories[i])
          }))
      )
      .transition()
      .duration(ani)
      .delay((d, i) => i * 20)
      .attrs(
        enter ||
          (d => ({
            y: scY(d),
            height: height - scY(d)
          }))
      )
  }
}

const barchart = new BarChart(barcharUpdate, {
  el: '#chart_svg'
})

export default class MultiBarChart extends BarChart {
  constructor(ds, args) {
    super(ds, args)
  }
  createLegends(el, vis, keys) {
    // const vis = this
    console.log(vis, keys, el)
    const legend = el
      .selectAll('.legend')
      .data(keys)
      .enter()
      .append('g')
      .attrs((d, i) => ({
        class: 'lengend',
        transform: `translate(${vis.width - 45 * i},0)`
      }))

    legend.append('rect').attrs(d => ({
      width: 40,
      height: 10,
      fill: vis.background(d),
      stroke: vis.border(d)
    }))
    legend
      .append('text')
      .text(d => d)
      .attrs(d => ({
        x: 20,
        y: 25,
        fill: vis.border(d),
        'text-anchor': 'middle'
      }))
  }
  wrangleData(ds) {
    const vis = this
    const dsConvert = vis.datasetConvert(ds)
    const stack = d3.stack().keys(d3.range(vis.legends.length))(dsConvert)

    console.log(vis)
    const categoriesData = stack.map((d, l) => d.map(([y0, y1]) => [y0, y1, l]))
    vis.groups = vis.view.selectAll('.categories').data(categoriesData)
    console.log(categoriesData)
    return { dsConvert, categoriesData }
  }
  updateGroup() {
    const vis = this
    vis.groups
      .enter()
      .append('g')
      .attrs(() => ({
        class: 'categories'
      }))

    vis.bars = vis.view
      .selectAll('.categories')
      .selectAll('rect')
      .data(d => d)
  }
}
