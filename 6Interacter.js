class Interacter {
  constructor(chart, ds, option) {
    const def = { height: 150, marginTop: 30, marginBottom: 0 }
    Object.assign(def, option)
    Object.assign(this, def)
    this.acting = {
      brush: '',
      zoom: ''
    }
    try {
      const view = this.syncMinorView(chart)
      this.connect(chart, view, ds)
    } catch (err) {
      console.log(err)
      throw new Error('brush is not Enabled, import _throttle.js.')
    }
  }

  syncMinorView(vis) {
    const { marginLeft: ml } = vis
    const context = this
    const xScaleOffset = -20 - context.marginBottom
    const svg = d3.select(vis.el + '>svg')
    const height = context.marginTop + context.height + +svg.attr('height')
    svg
      .attrs({
        height,
        viewBox: `0 0 ${+svg.attr('width')} ${height}`
      })
      .style('max-width', '100%')
    const view = svg.append('g').attrs({
      transform: `translate(${ml},${
        vis.marginY + vis.height + context.marginTop + xScaleOffset
      })`
    })

    const yScale = d3.scaleLinear().domain(vis.yScale.domain()).range([context.height, 0])
    const xScale = d3.scaleTime().domain(vis.xScale.domain()).range([0, vis.width])

    context.xScale = xScale

    const xAxis = view.append('g').attr('transform', `translate(0,${context.height})`)

    d3.axisBottom(vis.xScale).ticks(null, '%m/%d')(xAxis)

    const path = view.selectAll('.line').data(vis.dataset)
    const generateLine = vis.generateLine.y(d => yScale(d.y))

    path.datum(d => d.val).attr('d', generateLine)

    path
      .enter()
      .append('path')
      .attrs(d => ({
        class: 'line',
        stroke: vis.color(d.legend),
        fill: 'none'
      }))
      .datum(d => d.val)
      .attr('d', generateLine)
    context.brushGroup = view.append('g').attrs({ class: 'brush' })
    return view
  }
  connect(vis, view, ds) {
    const context = this

    context.brush = d3.brushX().extent([
      [0, 0],
      [vis.width, context.height]
    ])

    const maxRange = [vis.width, vis.height]
    context.zoom = d3
      .zoom()
      .scaleExtent([1, 30])
      .translateExtent([[0, 0], maxRange])
      .extent([[0, 0], maxRange])

    context.transmission(vis, view, ds)
  }

  transmission(vis, view, ds) {
    const context = this
    context.brush.on(
      'brush',
      throttle(
        e => {
          context.acting.brush = e.sourceEvent
          const { brush, zoom } = context.acting
          if (!(brush || zoom)) return
          const extent = e.selection || vis.xScale.range()

          //for brush
          view.call(
            context.zoom.transform,
            d3.zoomIdentity
              .scale(vis.width / (extent[1] - extent[0]))
              .translate(-extent[0], 0)
          )

          if (e.sourceEvent) return
          //for zoom
          const timeExtent = extent.map(d => new Date(context.xScale.invert(d)).getTime())
          context.update(vis, ds, timeExtent)
        },
        vis.dur,
        { leading: false }
      )
    )(context.brushGroup)

    context.zoom.on(
      'zoom',
      throttle(
        e => {
          context.acting.zoom = e.sourceEvent
          const { brush, zoom } = context.acting
          if (!(brush || zoom)) return
          const extent = e.transform

          //for zoom
          context.brushGroup.call(
            context.brush.move,
            vis.xScale.range().map(x => extent.invertX(x))
          )

          if (e.sourceEvent) return
          //for brush
          const zoomedDomain = extent.rescaleX(context.xScale).domain()
          const timeExtent = zoomedDomain.map(d => new Date(d).getTime())
          context.update(vis, ds, timeExtent)
        },
        vis.dur,
        { leading: false }
      )
    )(vis.interacter)
  }

  update(vis, ds, [min, max]) {
    const selectedDS = Object.fromEntries(
      Object.entries(ds).filter(([timestamp]) => timestamp >= min && timestamp <= max)
    )

    if (Object.keys(selectedDS).length) {
      vis.wrangleData(selectedDS)
    }
  }
}
