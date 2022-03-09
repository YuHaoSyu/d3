class Tree {
  constructor(ds, args) {
    const def = {
      el: d3.select('#chart_svg'),
      margin: { top: 10, right: 10, bottom: 10, left: 50 },
      dx: 20,
      dur: 1500,
      get width() {
        return this.el.style('width').replace('px', '')
      },
      get dy() {
        return this.width / 5
      }
    }
    const vis = this
    Object.assign(def, args)
    Object.assign(vis, def)
    vis.init(ds)
  }

  init(ds) {
    this.root = d3.hierarchy(ds)
    this.tree = d3.tree().nodeSize([this.dx, this.dy])
    this.diagonal = d3
      .linkHorizontal()
      .x(d => d.y)
      .y(d => d.x)
    this.root.x0 = this.dy / 2
    this.root.y0 = 0
    this.root.descendants().forEach((d, i) => {
      d.id = i
      d._children = d.children
      d.path = '#555'
      d.point = d._children ? '#fff' : '#ccc'
      d.children = null
    })

    this.svg = this.el
      .append('svg')
      .attr('viewBox', [
        -this.margin.left,
        -this.margin.top,
        this.width,
        this.dx
      ])
    this.gLink = this.svg.append('g').attr('class', 'gLink')
    this.gNode = this.svg.append('g').attr('class', 'gNode')

    this.wangleVis(this.root)
  }
  wangleVis(root) {
    this.tree(this.root)
    this.links = this.root.links()
    this.updateVis(root)
  }
  updateVis({ x0, y0, x, y }) {
    const { diagonal, svg, dur } = this
    const source = { x: x0, y: y0 }
    const target = { x, y }
    const d0 = diagonal({ source, target: source })
    const d1 = diagonal({ source: target, target })
    const left = this.root
    const right = this.root
    this.root.eachBefore(node => {
      node.x < left.x && (left = node)
      node.x > right.x && (right = node)
    })

    const height = right.x - left.x + this.margin.top + this.margin.bottom

    svg
      .transition()
      .duration(dur)
      .attr('viewBox', [
        -this.margin.left,
        left.x - this.margin.top,
        this.width,
        height
      ])
      .tween('resize', window.ResizeObserver ? null : svg.dispatch('toggle'))
    this.dataVis('circle', {
      enterAtt: { cx: y0, cy: x0 },
      updateAtt: ({ x, y, point }) => ({
        cx: y,
        cy: x,
        class: 'update',
        fill: point
      }),
      exitAtt: () => ({ class: 'exit', cx: y, cy: x })
    })
      .on('click', (event, node) => {
        this.clickHandler(event, node)
      })
      .on('mouseenter', (event, node) => {
        this.mouseEnterHandler(event, node)
      })
      .on('mouseleave', (event, node) => {
        this.mouseLeaveHandler(event, node)
      })

    this.dataVis('text', {
      enterAtt: { x: y0, y: x0 },
      updateAtt: ({ x, y, _children }) => ({
        class: _children ? 'update hasChildren' : 'update',
        x: _children ? -8 + y : 8 + y,
        y: x
      }),
      exitAtt: ({ _children }) => ({
        class: _children ? 'exit  hasChildren' : 'exit',
        x: y,
        y: x
      })
    }).text(d => d.data.name)

    const link = this.gLink
      .selectAll('path')
      .data(this.links, ({ target: { id } }) => id)
    const linkEnter = link.enter().append('path').attr('d', d0)
    link
      .merge(linkEnter)
      .attrs(d => ({ stroke: d.target.path }))
      .transition()
      .duration(dur)
      .attrs(d => ({ d: this.diagonal }))

    link.exit().transition().duration(dur).remove().attr('d', d1)

    this.root.eachBefore(d => {
      d.x0 = d.x
      d.y0 = d.y
    })
  }
  dataVis(el, { enterAtt, updateAtt, exitAtt }) {
    const n = this.gNode.selectAll(el).data(this.root, d => d.id)
    const enterEl = n
      .enter()
      .append(el)
      .attr('class', 'enter')
      .attrs(() => enterAtt)
    n.merge(enterEl).transition().duration(this.dur).attrs(updateAtt)
    n.exit().transition().duration(this.dur).attrs(exitAtt).remove()
    return enterEl
  }
  clickHandler(event, node) {
    node.children = node.children ? null : node._children
    this.wangleVis(node)
  }
  mouseEnterHandler(event, node) {
    node.descendants().forEach(n => {
      n.path = '#55f'
    })
    node.ancestors().forEach(n => {
      n.path = '#f55'
    })
    this.wangleVis(node)
  }
  mouseLeaveHandler(event, node) {
    node.ancestors().forEach(n => {
      n.path = '#555'
    })
    node.descendants().forEach(n => {
      n.path = '#555'
    })

    this.wangleVis(node)
  }
}

const tree = new Tree(data)
