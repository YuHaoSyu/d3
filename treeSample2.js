!(function () {
  let width = 954

  const root = d3.hierarchy(data)
  let dx = 10
  let dy = width / (root.height + 1)
  let diagonal = d3
    .linkHorizontal()
    .x((d) => d.y)
    .y((d) => d.x)

  let tree = (data) => {
    return d3.tree().nodeSize([dx, dy])(root)
  }

  let chart = (data) => {
    tree(data)
    let x0 = Infinity
    let x1 = -x0
    root.each((d) => {
      if (d.x < x0) x0 = d.x
      if (d.x > x1) x1 = d.x
    })
    let nodes = root.descendants()

    let links = root.links()
    const svg = d3
      .create('svg')
      .attr('viewBox', [0, 0, width, x1 - x0 + dx * 2])
      .attr('font-size', 10)
    const gNode = svg
      .append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('transform', (d) => `translate(${dy / 3 + d.y},${dx - x0 + d.x})`)
    gNode
      .append('circle')
      .attr('fill', (d) => (d.children ? '#555' : '#999'))
      .attr('r', 2.5)
    gNode
      .append('text')
      .attr('x', (d) => (d.children ? -6 : 6))
      .attr('text-anchor', (d) => (d.children ? 'end' : 'start'))
      .text((d) => d.data.name)
    const gLink = svg
      .append('g')
      .attr('fill', 'none')
      .attr('stroke', '#555')
      .attr('transform', `translate(${dy / 3},${dx - x0})`)
    gLink.selectAll('path').data(links).join('path').attr('d', diagonal)

    return svg.node()
  }
  document.getElementById('chart_svg2').appendChild(chart(data))
})()
