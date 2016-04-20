/// <reference path="../f-mentat.ts"/>
/// <reference path="f-graph.ts"/>

declare module d3 {
  export module time {
    export function daysTotal(start: Date, stop: Date, step?: number): Date[];
  }
}

module flipp.mentat {
  function d3_time_range_greedy(floor, step, number) {
    return function(t0, t1, dt) {
      var time = floor(t0), times = [];
      if (dt > 1) {
        while (time < t1) {
          var date = new Date(+time);
          times.push(date);
          for (var i = dt; i > 0; step(time), i--);
        }
      } else {
        while (time < t1) times.push(new Date(+time)), step(time);
      }
      return times;
    };
  }

  d3.time.daysTotal = d3_time_range_greedy(
    d3.time.day,
    function(date) {
      date.setDate(date.getDate() + 1);
    },
    function(date) {
      return ~~(date / 86400000);
    });


  /*
   * TODO Pass in
   */
  export function d3SvgBase(el: HTMLElement,
    size: Graph.size, margin:Graph.margin): d3.Selection<any> {

    return d3.select(el)
      .append("svg")
      .attr("width", size.width)
      .attr("height", size.height)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
  }


  /*
   * TODO
   */
  export function d3Axis(orient: string, scale: any,
    meta?: any): d3.svg.Axis {

    var axis =
      d3.svg
        .axis()
        .orient(orient)
        .scale(scale)

    if (typeof meta !== 'undefined') {
      if (typeof meta.ticks !== 'undefined')
        axis.ticks(meta.ticks)

      if (typeof meta.tickFormat !== 'undefined')
        axis.tickFormat(meta.tickFormat);

      if (typeof meta.tickPadding !== 'undefined')
        axis.tickPadding(meta.tickPadding);

      if (typeof meta.tickSize !== 'undefined')
        axis.tickSize(meta.tickSize);
    }

    return axis
  }

  export function d3TimeScale(range, domain): d3.time.Scale<any, any> {
    return d3.time
      .scale()
      .range(range)
      .domain(domain)
  }

  export function d3LinearScale(range, domain): d3.scale.Linear<any, any> {
    return d3.scale
      .linear()
      .range(range)
      .domain(domain);
  }

  export function d3OrdinalScale(range, domain): d3.scale.Ordinal<any, any> {
    return d3.scale
      .ordinal()
      .rangeBands(range, 0.2)
      .domain(domain);
  }

  /* TODO Call back */
  export function d3TwoDExtend(dataArr: any[], key: string): any[] {
    return [
      d3.min(dataArr, function(d) {
        return d3.min(d, function(e) {
          return e[key];
        })
      }),
      d3.max(dataArr, function(d) {
        return d3.max(d, function(e) {
          return e[key];
        })
      }),
    ];
  }

  export function d3Normalize(dataArr: any[], key: string) {

  }


  export function d3FlippColors(domain: any): d3.scale.Ordinal <any, any> {
    var d = (domain instanceof Array) ? domain : [domain]
    return d3.scale
      .ordinal()
      .domain(d)
      .range([
        "#3498db", "#9b59b6"
      ]);
  }
  /*
   * TODO
   */
  export function d3FlatColor10(domain: any): d3.scale.Ordinal <any, any> {
    var d = (domain instanceof Array) ? domain : [domain]
    return d3.scale
      .ordinal()
      .domain(d)
      .range([
        "#3498db", "#1abc9c", "#2ecc71", "#f1c40f", "#e67e22",
        "#e74c3c", "#9b59b6", "#ecf0f1", "#95a5a6", "#34495e"
      ]);
  }


  /*
   * TODO
   */
  export function d3FallColor7(domain: any): d3.scale.Ordinal <any, any> {
    var d = (domain instanceof Array) ? domain : [domain]
    return d3.scale
      .ordinal()
      .domain(d)
      .range([
        "#98abc5", "#8a89a6", "#7b6888", "#6b486b",
        "#a05d56", "#d0743c", "#ff8c00"
      ]);
  }


  /*
   * D3 overlay
   */
  export function d3ZeroOverlay(svg: d3.Selection<any>) {
    var node: any = svg.node()
    svg.attr('invert-transform', svg.attr('transform'))
      .attr('transform', '')
    .append("rect")
      .attr("class", "overlay")
      .attr("width", node.parentNode.offsetWidth)
      .attr("height", node.parentNode.offsetHeight)
      .attr("fill", "#f7f7f7")

    svg.append('text')
      .text('No available data')
      .attr('class', 'zero-data')
      .attr('text-anchor', 'middle')
      .attr('x', '50%')
      .attr('y', '50%')
      .attr('font-size', '24px')
      .attr("fill", "#777777")
  }

  export function d3RemoveOverlay(svg: d3.Selection<any>) {
    svg
      .attr('transform', svg.attr('invert-transform'))
      .select('.overlay').remove()
      .select('.zer-data').remove();
  }


  /* Data interpolation for animations */
  export function timeInterpolation(data, func) {
    var interpolate =
      d3.scale
        .linear()
        .domain([0, 1])
        .range([1, data.length + 1]);

    var secondsInDay = 24 * 60 * 60;

    return function(d, i, a) {
      return function(t) {
        var flooredX = Math.floor(interpolate(t));
        var interpolatedLine = data.slice(0, flooredX);

        if (flooredX > 0 && flooredX < data.length) {
          var weight = interpolate(t) - flooredX;
          var weightedLineAverage =
            data[flooredX].y * weight +
            data[flooredX - 1].y * (1 - weight);
          var interpolatedDuration =
            Math.floor((interpolate(t) - 1) * secondsInDay)

          interpolatedLine.push({
            x: moment(data[0].x).add(interpolatedDuration, 'seconds').toDate(),
            y: weightedLineAverage
          });
        }
        return func(interpolatedLine);
      }
    }
  }
}