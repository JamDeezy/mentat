/// <reference path="../f-mentat.ts"/>
/// <reference path="../f-graph/f-graph.ts"/>
/// <reference path="../f-graph/f-tooltip.ts"/>

module flipp.mentat {
  class LineGraph extends Graph {
    constructor(private _element: LineGraphElement) {
      super(_element);
    }

    createdCallback() {
      if (!this._el)
        LineGraph.call(this, this);

      this.setup();
    }

    private setup() {
      this._el.innerHTML = '';

      this.hoverFunc = function(data: any, axes: Graph.axes) {
        var html = moment(data[axes.x]).format('YYYY-MM-DD') + ':<br>';
        for (var i = 0; i < axes.y.length; i++)
          html += "<strong>" + axes.y[i] + "</strong>: " +
            "<span>" + data[axes.y[i]].y + "</span><br>";

        return html;
      }

      this.decodeFunc = function(data: any, axes: Graph.axes) {
        var dataSet = {}
        for (var i = 0; i < axes.y.length; i++) {
          var set = [];
          for (var j = 0; j < data.length; j++) {
            var item: any = {};
            item.x = d3.time.format("%Y%m%d").parse(data[j][axes.x])
            item.y = data[j][axes.y[i]];
            set.push(item);
          }
          dataSet[axes.y[i]] = set;
        }
        return dataSet;
      }

      var width = this.size.width - this.margin.left - this.margin.right;
      var height = this.size.height - this.margin.top - this.margin.bottom;
      var colors = d3FlippColors(this.axes.y);
      var svg = d3SvgBase(this._el, this.size, this.margin);
      var tip = new Tooltip(svg)
        .offset([20, 5])
        .html((d: any) => { return this.hoverFunc(d, this.axes); })
      this.tooltip = tip;

      /* Render cycle */
      this.render = (): LineGraphElement =>  {
        if (this.data && this.data.length > 0) {
          /* Remove data overlay */
          d3RemoveOverlay(svg);
          svg.selectAll('*').remove();

          /* Run through decode for each data point */
          var dataSets = this.decodeFunc(this.data, this.axes);
          var ext = Object.keys(dataSets).map((d) => { return dataSets[d] })
          var dataDomain = d3TwoDExtend(ext, 'x')
          var dataRange = [0, d3TwoDExtend(ext, 'y')[1]]

          /* XY scales */
          var x = d3TimeScale([0, width], dataDomain)
          var y = d3LinearScale([height, 0], dataRange)

          var customTimeFormat = d3.time.format.multi([
            [".%L", function(d) { return d.getMilliseconds(); }],
            [":%S", function(d) { return d.getSeconds(); }],
            ["%I:%M", function(d) { return d.getMinutes(); }],
            ["%I %p", function(d) { return d.getHours(); }],
            ["%a %d", function(d) { return d.getDay() && d.getDate() != 1; }],
            ["%b %d", function(d) { return d.getDate() != 1; }],
            ["%B", function(d) { return d.getMonth(); }],
            ["%Y", function() { return true; }]
          ]);

          /* XY axes */
          svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0, " + height + ")")
            .call(
              d3Axis("bottom", x, {
                ticks: 6,
                tickSize: 40,
                tickFormat: customTimeFormat
              })
            );

          svg.append("g")
            .attr("class", "y axis")
            .call(
              d3Axis("left", y, {
                ticks: 4,
                tickFormat: d3.format("s"),
                tickPadding: 20,
                tickSize: 0 - width
              })
            );

          /* Line plotting function */
          var line =
            d3.svg
              .line()
              .x(function(d: any) { return x(d.x); })
              .y(function(d: any) { return y(d.y); });

          /* Create sets of lines */
          for (var key in dataSets) {
            svg.append("g")
              .attr("class", "set")
              .append("path")
              .attr("class", "line")
              .style("stroke", colors(key))
              .transition()
              .duration(1000)
              .attrTween("d", timeInterpolation(dataSets[key], line));
          }

          /* Hover functionality */
          if (this.hoverFunc) {
            var scanner =
              svg.append("g")
                .attr("class", "scanner")
                .style("display", "none");

            scanner.append("line")
              .style("stroke-dasharray", ("3, 3"))
              .attr("y1", 0)
              .attr("y2", height);

            var point =
              scanner.append("circle")
                .style("fill", "steelblue")
                .attr("r", 4);

            var requiredData = this.axes.y

            svg.append("rect")
                .attr("class", "overlay")
                .attr("width", width)
                .attr("height", height)
                .style("fill", "none")
                .style("pointer-events", "all")
                .on("mouseout", function() {
                    scanner.style("display", "none");
                    tip.hide();
                })
                .on("mousemove", function() {
                  var datapoint = {}
                  var val: any = x.invert(d3.mouse(this)[0]);

                  // construct data point on where our mouse is hovering
                  for (var i = 0; i < requiredData.length; i++) {
                    var curSet = dataSets[requiredData[i]]
                    var index =
                      d3.bisector((d: any) => { return d.x; })
                        .left(curSet, val, 1);
                    var d0 = curSet[index-1];
                    var d1 = curSet[index];

                    // find closest datapoint
                    datapoint[requiredData[i]] =
                      val - d0.x > d1.x - val ? d1 : d0;
                  }

                  scanner.style("display", null)
                    .attr("transform", "translate(" +
                      x(datapoint[requiredData[0]].x) + ", 0)");
                  point.attr("transform", "translate(0, " +
                    y(datapoint[requiredData[0]].y) + ")")

                  var pointEl: any = point[0][0]
                  var position = pointEl.getBoundingClientRect();
                  tip.show([
                    position.left + window.scrollX,
                    position.top + window.scrollY
                  ], datapoint);
                })
          }

        } else {
          /* Data overlay */
          d3ZeroOverlay(svg)
        }

        return this._el;
      } /* Render cycle end */
    };

    /* Stub */
    public render(): LineGraphElement {
      return this._el;
    }
  }

  export interface LineGraphElement extends GraphElement { }

  export var LineGraphElement =
    registerElement('f-line-graph', HTMLElement, LineGraph);
}