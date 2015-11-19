/// <reference path="../f-mentat.ts"/>
/// <reference path="../f-graph/f-graph.ts"/>
/// <reference path="../f-graph/f-tooltip.ts"/>

module flipp.mentat {
  class BarGraph extends Graph {
    constructor(private _element: BarGraphElement) {
      super(_element);
    }

    private _tip: Tooltip;

    createdCallback() {
      if (!this._el)
        BarGraph.call(this, this)

      /* default hover content */
      this.onHover((d: any) => {
        var html = d[this.axes.x];
        for (var i = 0; i < d.sets.length; i++) {
          var set = d.sets[i]
          html +=
            "<strong style='color:" + set.color + "'>"
            + set.column + "</strong>" + ": <span style='color:red'>" +
            Math.round((set.y1 - set.y0) * 100) / 100 + "</span><br>";
        }
        return html;
      }).onDecode((d: any) => {
        return d;
      });

      this.render();
    }

    detachedCallback() {
      if (this._tip) this._tip.remove();
    }

    get normalized(): boolean {
      return this._el.getAttribute('normalized') === 'true'; }
    get sorted(): boolean {
      return this._el.getAttribute('sorted') === 'true'; }
    get vertical(): boolean {
      return this._el.getAttribute('vertical') === 'true'; }

    set normalized(newNormalized: boolean) {
      this._el.setAttribute('normalized', newNormalized.toString()); }
    set sorted(newSorted: boolean) {
      this._el.setAttribute('sorted', newSorted.toString()); }
    set vertical(newVertical) {
      this._el.setAttribute('vertical', newVertical.toString()); }

    public render(): BarGraphElement {
      this._el.innerHTML = '';

      if (this.vertical) {
        var width = this.size.height - this.margin.top - this.margin.bottom;
        var height = this.size.width - this.margin.left - this.margin.right;
      } else {
        var width = this.size.width - this.margin.left - this.margin.right;
        var height = this.size.height - this.margin.top - this.margin.bottom;
      }

      var x         = d3.scale.ordinal().rangeRoundBands([0, width], .1);
      var y         = d3.scale.linear().rangeRound([height, 0]);
      var xAxis     = d3.svg.axis().scale(x).orient("bottom");
      var yAxis     = d3.svg.axis().scale(y).orient("left");

      // typescript hack here, union types sucks
      var tempy: any = this.axes.y
      if (this.axes.y instanceof Array) {
          var color = this.flatColor10().domain(tempy);
      } else if (typeof this.axes.y === 'string') {
          var color = this.flatColor10().domain([tempy]);
      } else {
          throw "Invalid axes.y type!";
      }

      if (this.vertical) {
        xAxis = d3.svg.axis().scale(x).orient("left");
        yAxis = d3.svg.axis().scale(y).orient("top");
      }

      var svg =
        d3.select(this._el)
          .append("svg")
          .attr("width", this.size.width)
          .attr("height", this.size.height)
          .append("g")
          .attr("transform",
            "translate(" + this.margin.left + "," + this.margin.top + ")");

      if (this.data && this.data.length > 0) {
        // TODO this isn't up to par with lines
        // Buckets are defined by primary key
        this.data.forEach((d: any) => {
          // data decoder
          d = this.decodeFunc(d);

          var y0 = 0;
          d.bucket = d[this.axes.x];
          d.sets = color.domain().map(function(column) {
            return {
              column: column,
              y0: y0,
              y1: y0 += +d[column],
              color: color(column)
            };
          });
          if (this.normalized) {
            d.sets.forEach(function(d) {
              d.y0 /= y0;
              d.y1 /= y0;
              if (isNaN(d.y0)) d.y0 = 0;
              if (isNaN(d.y1)) d.y1 = 0;
            });
          } else {
            d.total = d.sets[d.sets.length - 1].y1;
          }
        });

        if (this.sorted) {
          this.data.sort((a: any, b: any) => {
            if (this.normalized) {
              return b.sets[0].y1 - a.sets[0].y1;
            } else {
              return b.total - a.total;
            }
          });
        }

        x.domain(this.data.map(function(d: any) { return d.bucket; }));
        if (!this.normalized ) {
          if (this.vertical) {
            y.domain(
              [d3.max(this.data, function(d: any) { return d.total; }), 0]);
          } else {
            y.domain(
              [0, d3.max(this.data, function(d: any) { return d.total; })]);
          }
        } else {
          if (this.vertical) {
            y.domain([1, 0]);
          }
        }

        if (this.vertical) {
          svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0, 0)")
            .call(xAxis)
            .selectAll(".tick text")
            .text(function(d) {
              return (d.length > 11) ? d.substring(0, 5) + '...' : d;
            });
        } else {
          svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);
        }

        svg.append("g")
          .attr("class", "y axis")
          .call(yAxis);

        if (this.vertical) {
          var bucket = svg.selectAll(".bucket")
            .data(this.data)
            .enter()
            .append("g")
            .attr("class", "bucket")
            .attr("transform", function(d: any)
              { return "translate(0, " + x(d.bucket) + ")" });

          bucket.selectAll("rect")
            .data(function(d: any) { return d.sets; })
            .enter()
            .append("rect")
            .attr("class", "set")
            .attr("height", x.rangeBand())
            .attr("x", function(d: any) { return y(d.y0); })
            .attr("width", function(d: any) { return y(d.y1) - y(d.y0); })
            .style("fill", function(d: any) { return d.color });
        } else {
          var bucket = svg.selectAll(".bucket")
            .data(this.data)
            .enter()
            .append("g")
            .attr("class", "bucket")
            .attr("transform", function(d: any)
              { return "translate(" + x(d.bucket) + ", 0)" });

          bucket.selectAll("rect")
            .data(function(d: any) { return d.sets; })
            .enter()
            .append("rect")
            .attr("class", "set")
            .attr("width", x.rangeBand())
            .attr("y", function(d: any) { return y(d.y1); })
            .attr("height", function(d: any) { return y(d.y0) - y(d.y1); })
            .style("fill", function(d: any) { return d.color });
        }

        // Hover functionality
        if (this.hoverFunc) {
          var tip = new Tooltip(svg)
            .offset([20, 5])
            .html((d: any) => { return this.hoverFunc(d); })

          // remove if it exists
          if (this._tip) this._tip.remove();
          this._tip = tip;

          bucket.on("mouseenter", function(d) {
            var position = this.getBoundingClientRect();
            tip.show([position.left, position.top], d);
          }).on("mouseleave", () => {
            tip.hide()
          });
        }
      } else {
        d3.select(this._el).select('svg')
          .append("rect")
          .attr("class", "overlay")
          .attr("width", this.size.width)
          .attr("height", this.size.height)
          .attr("fill", "#f7f7f7")

        d3.select(this._el).select('svg')
          .append('text')
          .text('No available data')
          .attr('text-anchor', 'middle')
          .attr("transform",
            "translate(" + this.size.width / 2 + ", " + this.size.height / 2 + ")")
          .attr('font-size', '24px')
          .attr("fill", "#777777")
      }

      return this._element;
    }
  }

  export interface BarGraphElement extends GraphElement {
    normalized: boolean;
    sorted: boolean;
    vertical: boolean;
  }

  export var BarGraphElement =
    registerElement('f-bar-graph', HTMLElement, BarGraph);
}