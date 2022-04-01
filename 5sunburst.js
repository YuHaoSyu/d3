;(function () {
  const width = 600
  const height = 600
  const radius = Math.min(width, height) / 6
  const turn = 2 * Math.PI
  const color = d3.scaleOrdinal(d3.schemePastel1)
  const format = d3.format(',d')
  function partition(data) {
    const hierarchyRoot = d3
      .hierarchy(data)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value)
    return d3.partition().size([2 * Math.PI, hierarchyRoot.height + 1])(hierarchyRoot)
  }
  const svg = d3
    .select('#chart_svg')
    .append('svg:svg')
    .attr('viewBox', [0, 0, width, height])
    .attr('width', width)
    .attr('height', height)
    .style('font', '8px sans-serif')

  const arc = d3
    .arc()
    .startAngle(d => d.x0)
    .endAngle(d => d.x1)
    .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
    .padRadius(radius * 1.5)
    .innerRadius(d => d.y0 * radius)
    .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 1))

  const g = svg.append('g').attr('transform', `translate(${width / 2},${height / 2})`)
  // Parses json to build and renders

  const root = partition(randomData)

  root.each(d => (d.current = d))

  const path = g
    .append('g')
    .selectAll('path')
    .data(root.descendants().slice(1))
    .join('path')
    .attr('fill', d => {
      if (d.depth > 1) d = d.parent
      return color(d.data.label)
    })
    .attr('fill-opacity', d => (arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0))
    .attr('d', d => arc(d.current))

  path
    .filter(d => d.children)
    .style('cursor', 'pointer')
    .on('click', clicked)

  path.append('title').text(d => `${d.ancestors().map(d => d.data.label)}`)

  const ctext = g.append('g')
  ctext
    .append('text')
    .attr('text-anchor', 'middle')
    .style('font', '14px sans-serif')
    .style('font-weight', 'bold')
    .text(root.current.data.name)

  const label = g
    .append('g')
    .attr('pointer-events', 'none')
    .attr('text-anchor', 'middle')
    .attr('user-select', 'none')
    .selectAll('text')
    .data(root.descendants().slice(1))
    .join('text')
    .attr('dy', '0.35em')
    .attr('fill-opacity', d => +labelVisible(d.current))
    .attr('transform', d => labelTransform(d.current))
    .text(d => d.data.label)

  const parent = g
    .append('circle')
    .datum(root)
    .attr('r', radius)
    .attr('fill', 'none')
    .attr('pointer-events', 'all')
    .on('click', clicked)

  function clicked(event, p) {
    parent.datum(p.parent || root)
    const { x0: p0, depth } = p
    const deltaX = p.x1 - p.x0

    root.each(d => {
      const { x0, x1, y0, y1 } = d
      return (d.target = {
        x0: Math.max(0, Math.min(1, (x0 - p0) / deltaX)) * turn,
        x1: Math.max(0, Math.min(1, (x1 - p0) / deltaX)) * turn,
        y0: Math.max(0, y0 - depth),
        y1: Math.max(0, y1 - depth)
      })
    })

    path
      .transition()
      .duration(750)
      .tween('data', d => {
        const i = d3.interpolate(d.current, d.target)
        return t => (d.current = i(t))
      })
      .filter(function (d) {
        return +this.getAttribute('fill-opacity') || arcVisible(d.target)
      })
      .attr('fill-opacity', d => (arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0))
      .attrTween('d', d => () => arc(d.current))

    label
      .filter(function (d) {
        return +this.getAttribute('fill-opacity') || labelVisible(d.target)
      })
      .transition()
      .duration(750)
      .attr('fill-opacity', d => +labelVisible(d.target))
      .attrTween('transform', d => () => labelTransform(d.current))

    ctext.selectAll('text').transition().duration(750).text(p.data.name)
  }

  function arcVisible({ x0, x1, y0, y1 }) {
    return y1 <= 3 && y0 >= 1 && x1 > x0
  }

  function labelVisible({ x0, x1, y0, y1 }) {
    return y1 <= 3 && y0 >= 1 && (y1 - y0) * (x1 - x0) > 0.03
  }

  function labelTransform({ x0, x1, y0, y1 }) {
    const x = ((x0 + x1) * 90) / Math.PI
    const y = ((y0 + y1) / 2) * radius
    return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`
  }
})()
