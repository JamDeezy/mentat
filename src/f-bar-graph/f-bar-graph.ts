/// <reference path="../f-mentat.ts"/>
/// <reference path="../f-graph/f-graph.ts"/>
/// <reference path="../f-graph/f-tooltip.ts"/>

module flipp.mentat {
  class BarGraph extends Graph {
    constructor(private _element: BarGraphElement) {
      super(_element);
    }

    createdCallback() {
      if (!this._el)
        BarGraph.call(this, this)

      this.setup();
    }

    get normalized(): boolean {
      return this._el.getAttribute('normalized') === 'true';
    }
    get sorted(): boolean {
      return this._el.getAttribute('sorted') === 'true';
    }
    get vertical(): boolean {
      return this._el.getAttribute('vertical') === 'true';
    }

    set normalized(newNormalized: boolean) {
      this._el.setAttribute('normalized', newNormalized.toString());
    }
    set sorted(newSorted: boolean) {
      this._el.setAttribute('sorted', newSorted.toString());
    }
    set vertical(newVertical) {
      this._el.setAttribute('vertical', newVertical.toString());
    }

    public setup() {
      this._el.innerHTML = '';

      this.hoverFunc = function(data: any) {
        var key = Object.keys(data)[0]
        var html = key + ':<br>';
        for (var i = 0; i < data[key].length; i++) {
          var item = data[key][i]
          html +=
            "<strong>" + item.x + "</strong>: " +
            "<span>" + (item.y1 - item.y0) + "</span><br>";
        }
        return html;
      }

      this.decodeFunc = function(data: any[], axes: Graph.axes) {
        var dataSet = {}
        for (var i = 0; i < data.length; i++) {
          var set = [], y0 = 0;
          for (var j = 0; j < axes.y.length; j++) {
            var item: any = {}

            item.x = axes.y[j];
            item.y0 = y0;
            item.y1 = y0 + data[i][item.x];
            y0 = item.y1
            set.push(item);
          }
          dataSet[data[i][axes.x]] = set;
        }
        return dataSet;
      }

      /* Render cycle */
      this.render = (): BarGraphElement => {
        this._el.innerHTML = ''

        if (this.data && this.data.length > 0) {
          /* Find data critical points */
          var dataSets = this.decodeFunc(this.data, this.axes);
          var ext = Object.keys(dataSets).map((d) => { return dataSets[d] })
          var dataDomain = Object.keys(dataSets);
          if (this.sorted) {
            dataDomain = dataDomain.sort(function(a, b) {
              return dataSets[b][dataSets[b].length - 1].y1 -
                dataSets[a][dataSets[a].length - 1].y1
            });
          } else {
            dataDomain = Object.keys(dataSets).sort();
          }
          var dataRange = [0, d3TwoDExtend(ext, 'y1')[1]];

          /* TODO why */
          if (this.vertical) {
            /* height: 20px */
            this.size = {
              width: this.size.width,
              height: dataDomain.length * 24 + this.margin.top + this.margin.bottom
            };

            var width = this.size.height - this.margin.top - this.margin.bottom;
            var height = this.size.width - this.margin.left - this.margin.right;

          } else {
            var width = this.size.width - this.margin.left - this.margin.right;
            var height = this.size.height - this.margin.top - this.margin.bottom;
          }

          var colors = d3FlippColors(this.axes.y);
          var svg = d3SvgBase(this._el, this.size, this.margin);

          if (!this.tooltip) {
            var tip = new Tooltip(svg)
              .offset([20, 5])
              .html((d: any) => { return this.hoverFunc(d); })
            this.tooltip = tip;
          } else {
            tip = this.tooltip;
          }

          /* XY Scales */
          var x = d3OrdinalScale([0, width], dataDomain);
          var y = d3LinearScale(
            (this.vertical) ? [0, height] : [height, 0],
            (this.normalized) ? [0, 1] : dataRange
          );

          /* XY axes */
          svg.append("g")
            .attr("class", "x axis")
            .attr("transform", (this.vertical) ?
              "translate(0, 0)" : "translate(0," + height + ")")
            .call(
              d3Axis((this.vertical) ? 'left' : 'bottom', x, {
                tickFormat: function(d) {
                  return (d.length > 11) ? d.substring(0, 5) + '...' : d;
                }
              })
            );

          svg.append("g")
            .attr("class", "y axis")
            .call(
              d3Axis((this.vertical) ? 'top' : 'left', y, {
                ticks: 4,
                tickFormat: (this.normalized) ? d3.format("%") : d3.format("s"),
                tickSize: (this.vertical) ? 0 - width : 0
              })
            );

          /* Draw bars in order (incase sorted is true) */
          for (var i = 0; i < dataDomain.length; i++) {
            var key = dataDomain[i];

            if (this.normalized) {
              var index = dataSets[key].length - 1
              dataSets[key].forEach(function(d) {
                d.total = dataSets[key][index].y1
              })
            }

            var bar =
              svg.append("g")
                .attr("class", "bar")
                .attr("data-key", key)
                .attr("transform", (this.vertical) ?
                  "translate(0, " + x(key) + ")" :
                  "translate(" + x(key) + ",0)");

            bar.selectAll("rect")
              .data(dataSets[key])
              .enter()
              .append("rect")
              .attr("class", "set")
              .attr((this.vertical) ? "x" : "y", 0)
              .attr("width", (this.vertical) ? 0 : x.rangeBand())
              .attr("height", (this.vertical) ? x.rangeBand() : 0)
              .style("fill", function(d: any) { return colors(d.x); })
          }

          /* Call animation */
          svg.selectAll('.set')
            .call((selection) => {
              var barHeight: any = (d: any) => {
                if (this.normalized) {
                  return y(Math.abs(d.y1 - d.y0)/d.total);
                } else {
                  return y(Math.abs(d.y1 - d.y0));
                }
              };
              if (this.vertical) {
                selection.transition()
                  .duration(250)
                  .delay(function(d, i) { return i * 40 })
                  .attr("x", (d) => {
                    return (this.normalized) ? y(d.y0 / d.total) : y(d.y0); })
                  .attr("width", barHeight)
              } else {
                selection.transition()
                  .duration(250)
                  .delay(function(d, i) { return i * 40 })
                  .attr("y", (d) => {
                    return (this.normalized) ? y(d.y0 / d.total) : y(d.y0); })
                  .attr("height", barHeight)
              }
            });

          /* Hover functionality */
          if (this.hoverFunc) {
            /* Mouse events */
            svg.selectAll('.bar')
              .on("mouseenter", function() {
                var position = this.getBoundingClientRect();
                var key = this.getAttribute('data-key');
                var datapoint = {}
                datapoint[key] = dataSets[key]

                tip.show([
                  position.left + window.scrollX,
                  position.top + window.scrollY
                ], datapoint);
              }).on("mouseleave", function() {
                tip.hide()
              });
          }

        } else {
          /* TODO why */
          if (this.vertical) {
            var width = this.size.height - this.margin.top - this.margin.bottom;
            var height = this.size.width - this.margin.left - this.margin.right;

          } else {
            var width = this.size.width - this.margin.left - this.margin.right;
            var height = this.size.height - this.margin.top - this.margin.bottom;
          }

          var svg = d3SvgBase(this._el, this.size, this.margin);

          /* Zero data overlay */
          d3ZeroOverlay(svg);
        }

        return this._element;
      } /* Render cycle end */
    }

    /* Stub */
    public render(): BarGraphElement {
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