import BarChart from './class/BarChart.js'
import GroupedBarChart from './class/GroupedBarChart.js'
import StackedBarChart from './class/StackedBarChart.js'
// import BarChart from './BarChart.js'

// const groupData = [
//   {
//     categorie: 'group1',
//     group: [
//       { name: 'val-1', val: 60 },
//       { name: 'val-2', val: 40 },
//       { name: 'val-3', val: 40 },
//       { name: 'val-4', val: 40 },
//       { name: 'val-5', val: 40 },
//       { name: 'val-6', val: 40 },
//     ],
//   },
//   {
//     categorie: 'group2',
//     group: [
//       { name: 'val-1', val: 60 },
//       { name: 'val-2', val: 40 },
//       { name: 'val-3', val: 40 },
//       { name: 'val-4', val: 40 },
//       { name: 'val-5', val: 40 },
//       { name: 'val-6', val: 40 },
//     ],
//   },
// ]

// function renew() {
//   groupData.forEach(({ group }) => {
//     group.forEach((obj) => (obj.val = Math.between(5, 100)))
//   })
// }

// const to = 1000
// const gBarChart = new GroupedBarChart({ ds: groupData })

// function addArr() {
//   setTimeout(() => {
//     const len = groupData.length
//     const lenI = len + Math.between(3, 5)
//     for (let i = len + 1; i < lenI; i++) {
//       const a = {
//         categorie: 'group' + i,
//         group: [
//           { name: 'val-1', val: 60 },
//           { name: 'val-2', val: 40 },
//           { name: 'val-3', val: 40 },
//           { name: 'val-4', val: 40 },
//           { name: 'val-5', val: 40 },
//           { name: 'val-6', val: 40 },
//         ],
//       }
//       groupData.push(a)
//     }
//     renew()
//     gBarChart.wrangleData(groupData)
//     subArr()
//   }, to)
// }
// addArr()

// function subArr() {
//   const i = Math.between(0, groupData.length)
//   const len = groupData.length - i
//   const r = Math.between(i, len)
//   groupData.splice(i, r)
//   renew()
//   setTimeout(() => {
//     gBarChart.wrangleData(groupData)
//     addArr()
//   }, to)
// }

// const gradOrange = d3
//   .select('svg')
//   .append('defs')
//   .append('radialGradient')
//   .attrs({
//     id: 'grad-orange',
//     cx: 0.5,
//     cy: 0.5,
//     r: 0.5,
//     fx: 1 - 0.25,
//     fy: 0.25,
//   })
// gradOrange.append('stop').attrs({
//   'stop-color': 'hsla(35,100%,90%,1)',
//   offset: 0,
// })
// gradOrange.append('stop').attrs({
//   'stop-color': 'hsla(35,100%,60%,1)',
//   offset: 0.75,
// })
// gradOrange.append('stop').attrs({
//   'stop-color': 'hsla(35,80%,40%,1)',
//   offset: 0.85,
// })
// gradOrange.append('stop').attrs({
//   'stop-color': 'hsla(35,100%,100%,1)',
//   offset: 0.98,
// })
// gradOrange.append('stop').attrs({
//   'stop-color': 'hsla(35,60%,100%,.3)',
//   offset: 1,
// })

// d3.select('svg').append('circle').attrs({
//   cx: 100,
//   cy: 100,
//   r: 50,
//   fill: "url('#grad-orange')",
// })
const stackData = {
  a: { A: 150, B: 147, C: 144, D: 141, E: 138 },
  b: { A: 145, B: 142, C: 139, D: 136, E: 133 },
  c: { A: 140, B: 137, C: 134, D: 131, E: 128 },
  d: { A: 135, B: 132, C: 129, D: 126, E: 123 },
  e: { A: 130, B: 127, C: 124, D: 121, E: 118 },
  f: { A: 125, B: 122, C: 119, D: 116, E: 113 },
  g: { A: 120, B: 117, C: 114, D: 111, E: 108 },
  h: { A: 115, B: 112, C: 109, D: 106, E: 103 },
  i: { A: 110, B: 107, C: 104, D: 101, E: 98 },
  j: { A: 105, B: 102, C: 99, D: 96, E: 93 },
  k: { A: 100, B: 97, C: 94, D: 91, E: 88 },
  l: { A: 95, B: 92, C: 89, D: 86, E: 83 },
  m: { A: 90, B: 87, C: 84, D: 81, E: 78 },
  n: { A: 85, B: 82, C: 79, D: 76, E: 73 },
  o: { A: 80, B: 77, C: 74, D: 71, E: 68 },
  p: { A: 75, B: 72, C: 69, D: 66, E: 63 },
  q: { A: 70, B: 67, C: 64, D: 61, E: 58 }
}

function datasetConvert(obj) {
  const categories = new Set()
  const legends = new Set()
  const dataset = []
  for (const [categorie, objVal] of Object.entries(obj)) {
    categories.add(categorie)
    const group = []
    for (const [legend, val] of Object.entries(objVal)) {
      group.push(val)
      legends.add(legend)
    }
    dataset.push(group)
  }
  categories = Array.from(categories)
  legends = Array.from(legends)
  return { categories, legends, dataset }
}
// console.log(datasetConvert(stackData))

const convertDs = datasetConvert(stackData)

const stack = d3
  .stack()
  .keys(d3.range(convertDs.legends.length))(d3.transpose(convertDs.dataset))
  .map((d, i) => d.map(([y0, y1]) => [y0, y1, i]))
// console.log(stack)
// for (let i = 0; i < 26; i++) {
//   const d = { name: String.fromCharCode(97 + i) }
//   for (let j = 0; j < 5; j++) {
//     d[String.fromCharCode(97 + j)] = 150 - i * 5 - j * 3
//   }
//   stackData.push(d)
// }
// console.log(JSON.stringify(stackData))

// const sBarChart = new StackedBarChart({ ds: stackData })
// for (let i = 0; i < 15; i++) {
//   setTimeout(() => {
//     stackData = stackData.splice(1)
//     sBarChart.wrangleData(stackData)
//   }, 2000 * i)
// }
// Returns an array of m psuedorandom, smoothly-varying non-negative numbers.
// Inspired by Lee Byron’s test data generator.
// http://leebyron.com/streamgraph/

// console.log(dd)
