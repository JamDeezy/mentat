/// <reference path="../f-mentat.ts"/>
/// <reference path="../f-graph/f-graph.ts"/>
/// <reference path="../f-graph/f-tooltip.ts"/>

module flipp.mentat {
  class LineGraph extends Graph {
    constructor(private _element: LineGraphElement) {
      super(_element);
    }

    private _tip: Tooltip;

    createdCallback() {
      if (!this._el)
        LineGraph.call(this, this);

      /* default hover content */
      this.onHover((d: any) => {
        var html = moment(d.date).format('YYYY-MM-DD') + ': ';
        var tempy: any = this.axes.y
        if (typeof this.axes.y === 'string') {
          html += '<string>' + d[tempy] + '</string>';

        } else if (this.axes.y instanceof Array) {
          for (var i = 0; i < this.axes.y.length; i++) {
            var data = d[this.axes.y[i]]
            html += "<strong>" + this.axes.y[i] + "</strong>: " +
              "<span style='color:red'>" + data + "</span><br>";
          }
        }
        return html;
      }).onDecode((d: any) => {
        d.date =
          d3.time
            .format("%Y%m%d")
            .parse(d[this.axes.x]);
        return d;
      })

      this.render();
    }

    detachedCallback() {
      if (this._tip)
        this._tip.remove();
    }

    public render(): LineGraphElement {
      this._el.innerHTML = '';

      var width = this.size.width - this.margin.left - this.margin.right;
      var height = this.size.height - this.margin.top - this.margin.bottom;

      // typescript hack here, union types sucks
      var tempy: any = this.axes.y
      if (this.axes.y instanceof Array) {
        var color = this.flatColor10().domain(tempy);
      } else if (typeof this.axes.y === 'string') {
        var color = this.flatColor10().domain([tempy]);
      } else {
        throw "Invalid axes.y type!";
      }

      var line =
        d3.svg
          .line()
          .x(function(d: any)
            { return x(d.date); })
          .y(function(d: any)
            { return y(d.value); });

      var svg =
        d3.select(this._el)
          .append("svg")
          .attr("width", this.size.width)
          .attr("height", this.size.height)
        .append("g")
          .attr("transform",
            "translate(" + this.margin.left + "," + this.margin.top + ")");

      if (this.data && this.data.length > 0) {
        this.data.forEach((d: any) =>
          { this.decodeFunc(d); });

        this.data = this.data.sort((a: any, b: any) =>
          { return a.date - b.date; });

        var sets: any = color.domain().map((column) => {
          return {
            column: column,
            values: this.data.map((d: any) =>
              { return { date: d.date, value: +d[column], source: d }; })
          }
        });

        var x =
          d3.time
            .scale()
            .range([0, width])
            .domain(
              d3.extent(this.data, function(d: any)
                { return d.date; })
            );

        var y =
          d3.scale
            .linear()
            .range([height, 0])
            .domain([0, 1.2 *
              d3.max(sets, (c: any) => {
                return d3.max(c.values, function(v: any)
                  { return v.value; });
              })
            ]);

        var xAxis =
          d3.svg
            .axis()
            .scale(x)
            .orient("bottom")
            .ticks(d3.time.daysTotal, 6)
            .tickFormat(function(d): string {
              if (d.getDate() < 7) {
                return d3.time.format("%b")(d);
              } else {
                return d3.time.format("%d")(d)
              }
            })
            .tickSize(40);

        var yAxis =
          d3.svg
            .axis()
            .scale(y)
            .orient("left")
            .ticks(4)
            .tickFormat(d3.format("s"))
            .tickPadding(20)
            .tickSize(0 - width);

        svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0, " + height + ")")
          .call(xAxis);

        svg.append("g")
          .attr("class", "y axis")
          .call(yAxis);

        var set =
          svg.selectAll(".set")
            .data(sets)
            .enter()
            .append("g")
            .attr("class", "set");

        set.append("path")
          .attr("class", "line")
          .attr("d", function(d: any)
            { return line(d.values); })
          .style("stroke", function(d: any)
            { return color(d.column); });

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

          if (this._tip)
            this._tip.remove();

          var tip = new Tooltip(svg)
            .offset([20, 5])
            .html((d: any) =>
              { return this.hoverFunc(d.source); })
          this._tip = tip;

          svg.append("rect")
            .attr("class", "overlay")
            .attr("width", width + 10)
            .attr("height", height)
            .style("fill", "none")
            .style("pointer-events", "all")
            .on("mouseout", function() {
              scanner.style("display", "none");
              tip.hide();
            })
            .on("mousemove", function() {
              var date: any = x.invert(d3.mouse(this)[0]);
              var i =
                d3.bisector((d: any) => { return d.date; })
                  .left(sets[0].values, date, 1);
              var d0 = sets[0].values[i - 1];
              var d1 = sets[0].values[i];

              // find closest datapoint
              if (!d1) var d = d0
              else if (!d0) var d = d1
              else var d = date - d0.date > d1.date - date ? d1 : d0;

              scanner.style("display", null)
                .attr("transform", "translate(" + x(d.date) + ", 0)");
              point.attr("transform", "translate(0, " + y(d.value) + ")")

              var pointEl: any = point[0][0]
              var position = pointEl.getBoundingClientRect();
              tip.show([position.left, position.top], d);
            })
        }
      } else {
        d3.select(this._element)
          .select('svg')
          .append("rect")
          .attr("class", "overlay")
          .attr("width", this.size.width)
          .attr("height", this.size.height)
          .attr("fill", "#f7f7f7")

        d3.select(this._element)
          .select('svg')
          .append('text')
          .text('No available data')
          .attr('text-anchor', 'middle')
          .attr("transform", "translate(" +
            this.size.width / 2 + ", " + this.size.height / 2 + ")")
          .attr('font-size', '24px')
          .attr("fill", "#777777")
      }

      return this._el;
    }
  }

  export interface LineGraphElement extends GraphElement { }

  export var LineGraphElement =
    registerElement('f-line-graph', HTMLElement, LineGraph);
}