Math.between = (a, b) =>
  Math.floor(Math.random() * (Math.max(a, b) - Math.min(a, b) + 1)) + Math.min(a, b)

// d[String.fromCharCode(65 + l)] = Math.between(10, 150)
// function barcharUpdate(m) {
//   const data = {}
//   for (let k = 0; k < 4; k++) {
//     const d = {}
//     for (let l = 0; l < m; l++) {
//       d[String.fromCharCode(65 + l)] = 0.1 + 0.1 * Math.random()
//     }
//     for (let j = 0; j < 5; ++j) {
//       let x = 1 / (0.1 + Math.random())
//       let y = 2 * Math.random() - 0.5
//       let z = 10 / (0.1 + Math.random())
//       for (let i = 0; i < m; i++) {
//         let w = (i / m - y) * z
//         // console.log(w)
//         d[String.fromCharCode(65 + i)] += x * Math.exp(-w * w)
//       }
//     }
//     // Ensure all values are positive.
//     for (let i = 0; i < m; ++i) {
//       d[String.fromCharCode(65 + i)] = Math.max(0, d[String.fromCharCode(65 + i)])
//     }

//     data[String.fromCharCode(97 + k)] = d
//   }
//   return data
// }

function barcharUpdate(offset = 2) {
  const data = {}
  let i = 60
  while (i--) {
    const d = {}
    let j = 4
    while (j--) {
      d[String.fromCharCode(65 + j)] = Math.abs(
        Math.cos((Math.PI / 60) * i + Math.PI / (j + offset)) * 10 + 10
      )
    }
    data[String.fromCharCode(12373 + i)] = d
  }
  return data
}
const d = barcharUpdate(58)
console.log(d)
// const keys = Object.keys(d)[0]
// console.log()
// const stack = d3.stack().keys(Object.keys(d[keys]))
// const series = stack(Object.values(d))
// console.table(series)
export default d
export { barcharUpdate }

// console.log(bumps(58))

// function randomBarChartData(ds) {
//   const obj = {}
//   const len = Object.entries(ds).length
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
//     barchart.wrangleData(randomBarChartData(barchartData))
//     updateData()
//   }, 1000)
// })()

// function randomGroupedBarChartData(ds) {
//   const obj = {}
//   const len = Object.entries(ds).length
//   Object.entries(ds).forEach(([key], i) => {
//     // if (i == Math.between(len, 0)) return

//     obj[key] = {}
//     Object.keys(ds[key]).forEach(bar => (obj[key][bar] = Math.between(150, 0)))
//   })
//   return obj
// }
// !(function updateData() {
//   setTimeout(() => {
//     for (let i = 0; i < 3; i++) {
//       const categories = String.fromCharCode(97 + i)
//       data[categories] = {}
//       for (let j = 0; j < 3; j++) {
//         const legends = String.fromCharCode(65 + j)
//         data[categories][legends] = Math.between(10, 150)
//       }
//     }
//     groupedBarChart.wrangleData(randomGroupedBarChartData(data))
//     updateData()
//   }, 2000)
// })()

// function randomStackedBarChartData(ds) {
//   const obj = {}
//   const len = Object.entries(ds).length
//   Object.entries(ds).forEach(([key], i) => {
//     // if (i == Math.between(len, 0)) return

//     obj[key] = {}
//     Object.keys(ds[key]).forEach(bar => (obj[key][bar] = Math.between(150, 0)))
//   })
//   return obj
// }

// !(function updateData() {
//   setTimeout(() => {
//     for (let i = 0; i < 3; i++) {
//       const categories = String.fromCharCode(97 + i)
//       data[categories] = {}
//       for (let j = 0; j < 3; j++) {
//         const legends = String.fromCharCode(65 + j)
//         data[categories][legends] = Math.between(10, 150)
//       }
//     }
//     stackBarChart.wrangleData(randomStackedBarChartData(data))
//     updateData()
//   }, 3000)
// })()
