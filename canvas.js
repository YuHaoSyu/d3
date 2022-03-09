!(function () {
  let margin = { left: 100, right: 50, top: 50, bottom: 150 };
  Object.assign(margin, {
    x: margin.left + margin.right,
    y: margin.top + margin.bottom,
  });

  let width = window.innerWidth / 2 - margin.x;
  let height = window.innerHeight - 4 - margin.y;
  var canvas = d3
    .select("#chart_canvas")
    .append("canvas")
    .attr("width", width + margin.x)
    .attr("height", height + margin.y);

  let context = canvas.node().getContext("2d");
  var x = d3.scaleBand().rangeRound([0, width]).padding(0.1);
  var y = d3.scaleLinear().rangeRound([height, 0]);
  context.translate(margin.left, margin.top);

  d3.json("./data.json").then((data) => {
    function freq(d) {
      d.frequency = +d.frequency;
      return d;
    }
    freq(data);
    draw(false, data);
    function draw(error, data) {
      if (error) throw error;

      x.domain(
        data.map(function (d) {
          return d.name;
        })
      );
      y.domain([
        0,
        d3.max(data, function (d) {
          return d.height;
        }),
      ]);

      var yTickCount = 10,
        yTicks = y.ticks(yTickCount),
        yTickFormat = y.tickFormat(yTickCount, "%");

      context.beginPath();
      x.domain().forEach(function (d) {
        context.moveTo(x(d) + x.bandwidth() / 2, height);
        context.lineTo(x(d) + x.bandwidth() / 2, height + 6);
      });
      context.strokeStyle = "black";
      context.stroke();

      context.textAlign = "center";
      context.textBaseline = "middle";
      x.domain().forEach(function (d) {
        context.fillText(d, x(d) + x.bandwidth() / 2, height + 6);
      });

      context.beginPath();
      yTicks.forEach(function (d) {
        context.moveTo(0, y(d) + 0.5);
        context.lineTo(-6, y(d) + 0.5);
      });
      context.strokeStyle = "black";
      context.stroke();

      context.textAlign = "right";
      context.textBaseline = "middle";
      yTicks.forEach(function (d) {
        context.fillText(yTickFormat(d), -9, y(d));
      });

      context.beginPath();
      context.moveTo(-6.5, 0 + 0.5);
      context.lineTo(0.5, 0 + 0.5);
      context.lineTo(0.5, height + 0.5);
      context.lineTo(-6.5, height + 0.5);
      context.strokeStyle = "black";
      context.stroke();

      context.save();
      context.rotate(-Math.PI / 2);
      context.textAlign = "right";
      context.textBaseline = "top";
      context.font = "bold 10px sans-serif";
      context.fillText("Frequency", -10, 10);
      context.restore();

      context.fillStyle = "steelblue";
      data.forEach(function (d) {
        context.fillRect(
          x(d.name),
          y(d.height),
          x.bandwidth(),
          height - y(d.height)
        );
      });
    }
  });
})();
