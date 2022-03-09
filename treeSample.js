!(function () {
  let margin = { top: 20, right: 0, bottom: 20, left: 0 }
  let width = 954
  const root = d3.hierarchy(data)

  let dx = 10
  let dy = width / (root.height + 1)
  let diagonal = d3
    .linkHorizontal()
    .x(d => d.y)
    .y(d => d.x)

  let tree = d3.tree().nodeSize([dx, dy])
  let chart = data => {
    root.x0 = dy / 2
    root.y0 = 0
    root.descendants().forEach((d, i) => {
      d.id = i
      d._children = d.children
      if (d.depth && d.data.name.length !== 7) d.children = null
    })

    const svg = d3
      .create('svg')
      // .attr('viewBox', [-margin.left, -margin.top, width, dx])
      .attr('font-size', 10)

    const gLink = svg.append('g').attr('fill', 'none').attr('stroke', '#555')

    const gNode = svg.append('g')

    function update(source) {
      const nodes = root.descendants()
      const links = root.links()

      tree(root)

      let x0 = root.x
      let x1 = root.x
      root.eachBefore(d => {
        if (d.x < x0) x0 = d.x
        if (d.x > x1) x1 = d.x
      })

      const height = x1 - x0 + margin.top + margin.bottom

      let offset = {
        x: dx - x0,
        y: dy / 3,
        get src0() {
          return this.ObjValStr({
            x: this.y + source.y0,
            y: this.x + source.x0
          })
        },
        get src() {
          return this.ObjValStr({
            x: this.y + source.y,
            y: this.x + source.x
          })
        },
        update({ x, y }) {
          return this.ObjValStr({
            x: this.y + y,
            y: this.x + x
          })
        },
        ObjValStr(obj) {
          return Object.values(obj).join(',')
        }
      }

      const transition = svg
        .transition()
        .duration(1000)
        .attr('viewBox', [-margin.left, dx - margin.top, width, height])
        .tween(
          'resize',
          window.ResizeObserver ? null : () => () => svg.dispatch('toggle')
        )

      gNode
        .selectAll('g')
        .data(nodes, d => d.id)
        .join(
          enter =>
            appendChild(
              enter
                .append('g')
                .attrs(() => {
                  return {
                    transform: `translate(${offset.src0})`,
                    class: 'enter'
                  }
                })
                .on('click', (event, d) => {
                  d.children = d.children ? null : d._children
                  update(d)
                })
            ),
          update => update,
          exit =>
            exit
              .transition(transition)
              .attrs(() => {
                return {
                  transform: `translate(${offset.src})`,
                  class: 'dur exit'
                }
              })
              .remove()
        )
        .transition(transition)
        .attrs(d => ({
          transform: `translate(${offset.update(d)})`,
          class: 'dur update'
        }))

      let transform = `translate(${offset.y},${offset.x})`
      const paths = gLink
        .selectAll('path')
        .data(links, d => d.target.id)
        .join(
          enter =>
            enter.append('path').attrs(() => {
              const o = { x: source.x0, y: source.y0 }
              return {
                d: diagonal({ source: o, target: o }),
                transform
              }
            }),
          update => update,
          exit =>
            exit
              .transition(transition)
              .attrs(() => {
                const o = { x: source.x, y: source.y }
                return {
                  d: diagonal({ source: o, target: o }),
                  transform
                }
              })
              .remove()
        )
        .transition(transition)
        .attrs(() => ({
          d: diagonal,
          transform
        }))

      root.eachBefore(d => {
        d.x0 = d.x
        d.y0 = d.y
      })
    }
    function appendChild(node) {
      node
        .append('circle')
        .attr('fill', d => (d._children ? '#555' : '#999'))
        .attr('r', 2.5)

      node
        .append('text')
        .attr('x', d => (d._children ? -6 : 6))
        .attr('text-anchor', d => (d._children ? 'end' : 'start'))
        .text(d => d.data.name)
      return node
    }
    update(root)
    return svg.node()
  }
  document.getElementById('chart_svg').appendChild(chart(data))
})()
// const pathEnter = paths
//   .enter()
//   .append('path')
//   .attr('d', (d) => {
//     const o = { x: source.x0, y: source.y0 }
//     return diagonal({ source: o, target: o })
//   })

// paths.merge(pathEnter).transition(transition).attr('d', diagonal)
// paths
//   .exit()
//   .transition(transition)
//   .remove()
//   .attr('d', (d) => {
//     const o = { x: source.x, y: source.y }
//     return diagonal({ source: o, target: o })
//   })
// const nodeExit = node
// .exit()
// .transition(transition)
// .remove()
// .attr('transform', (d) => `translate(${source.y},${source.x})`)
// .attr('fill-opacity', 0)
// .attr('stroke-opacity', 0)
// link
// .exit()
// .transition(transition)
// .remove()
// .attr('d', (d) => {
//   const o = { x: source.x, y: source.y }
//   return diagonal({ source: o, target: o })
// })

// const pointEnter = point
//   .enter()
//   .append('g')
//   .attr('transform', (d) => `translate(${source.y0},${source.x0})`)
//   .attr('fill-opacity', 0)
//   .attr('stroke-opacity', 0)
//   .on('click', (event, d) => {
//     d.children = d.children ? null : d._children
//     update(d)
//   })

// point
//   .append('circle')
//   .attr('fill', (d) => (d._children ? '#555' : '#999'))
//   .attr('r', 2.5)

// point
//   .append('text')
//   .attr('x', (d) => (d._children ? -6 : 6))
//   .attr('text-anchor', (d) => (d._children ? 'end' : 'start'))
//   .text((d) => d.data.name)

// point
//   .merge(pointEnter)
//   .transition(transition)
//   .attr('transform', (d) => `translate(${d.y},${d.x})`)
//   .attr('fill-opacity', 1)
//   .attr('stroke-opacity', 1)
