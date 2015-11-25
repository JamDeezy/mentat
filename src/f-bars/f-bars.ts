/// <reference path="../f-mentat.ts"/>
/// <reference path="../f-graph/f-graph.ts"/>
/// <reference path="../f-graph/f-tooltip.ts"/>

module flipp.mentat {
  class Bars extends Graph {
    constructor(private _barsElement: BarsElement) {
      super(_barsElement);
    }

    private _template = Handlebars.templates['f-bars'];
    private _tip: Tooltip;

    createdCallback() {
      if (!this._barsElement)
        Bars.call(this, this)

      this._barsElement.innerHTML = '';
      this._barsElement.appendChild(
        createDocumentFragment(this._template({})));

      /* overwrite hoverable+sum default to true */
      this.defaultHoverable = true;

      /**/
      this.hover((d: any) => {
        var html = "";
        for (var i = 0; i < d.sets.length; i++) {
          var set = d.sets[i]
          html +=
            "<strong style='color:" + set.color + "'>"
            + set.column + "</strong>" + ": <span style='color:red'>" +
            Math.round((set.y1 - set.y0) * 100) / 100 + "</span><br>";
        }
        return html;
      }).decode((d: any) => {
        return d;
      });

      if (this.src)
        this.load();
    }

    detachedCallback() {
      if (this._tip) this._tip.remove();
    }

    get normalized(): boolean {
      return this._barsElement.getAttribute('normalized') === 'true';
    }

    set normalized(newNormalized: boolean) {
      this._barsElement.setAttribute('normalized', newNormalized.toString());
    }

    get sorted(): boolean {
      return this._barsElement.getAttribute('sorted') === 'true';
    }

    set sorted(newSorted: boolean) {
      this._barsElement.setAttribute('sorted', newSorted.toString());
    }

    protected render() {
      // Render cycles should be independent of each other
      this._barsElement.innerHTML = '';

      var width     = this.innerWidth;
      var height    = this.innerHeight;
      var x         = d3.scale.ordinal().rangeRoundBands([0, width], .1);
      var y         = d3.scale.linear().rangeRound([height, 0]);
      var xAxis     = d3.svg.axis().scale(x).orient("bottom");
      var yAxis     = d3.svg.axis().scale(y).orient("left");

      var svg = d3.select(this._barsElement)
                  .append("svg")
                  .attr("width", this.width)
                  .attr("height", this.height)
                  .append("g")
                  .attr("transform", this.translate(
                    Graph.MARGIN.left, Graph.MARGIN.top));

      if (this.data) {
        var data = $.extend(true, [], this.data);
        var color = this.flatColor10().domain(this.columns);

        // TODO this isn't up to par with lines
        // Buckets are defined by primary key
        data.forEach((d: any) => {
          // data decoder
          d = this.decodeData(d);

          var y0 = 0;
          d.bucket = d[this.key];
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
            });
          } else {
            d.total = d.sets[d.sets.length - 1].y1;
          }
        });

        if (this.sorted) {
          data.sort((a: any, b: any) => {
            if (this.normalized) {
              return b.sets[0].y1 - a.sets[0].y1;
            } else {
              return b.total - a.total;
            }
          });
        }

        x.domain(data.map(function(d: any) { return d.bucket; }));
        if (!this.normalized) {
          y.domain([0, d3.max(data, function(d: any) { return d.total; })]);
        }

        svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);

        svg.append("g")
          .attr("class", "y axis")
          .call(yAxis);

        // Draw bars
        var bucket = svg.selectAll(".bucket")
          .data(data)
          .enter()
          .append("g")
          .attr("class", "bucket")
          .attr("transform", (d: any) => {
            return this.translate(x(d.bucket), 0)
          });

        bucket.selectAll("rect")
          .data(function(d: any) { return d.sets; })
          .enter()
          .append("rect")
          .attr("class", "set")
          .attr("width", x.rangeBand())
          .attr("y", function(d: any) { return y(d.y1); })
          .attr("height", function(d: any) { return y(d.y0) - y(d.y1); })
          .style("fill", function(d: any) { return d.color });

        // Hover functionality
        if (this.hoverable) {
          var tip = new Tooltip(svg)
            .offset([20, 5])
            .html((d: any) => { return this.hoverHtml(d); })

          // remove if it exists
          if (this._tip) this._tip.remove();
          this._tip = tip;

          // TODO position not quite right
          bucket.on("mouseenter", function(d) {
            var position = $(this).offset();
            tip.show([position.left, position.top], d);
          }).on("mouseleave", () => {
            tip.hide()
          });
        }
      }
    }
  }

  export interface BarsElement extends GraphElement {
    normalized: boolean;
    sorted: boolean;
  }

  export var BarsElement = registerElement('f-bars', HTMLElement, Bars);
}