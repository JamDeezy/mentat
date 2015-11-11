/// <reference path="../f-mentat.ts"/>
/// <reference path="../f-graph/f-graph.ts"/>

module flipp.mentat {
  class Bars extends Graph {
    constructor(private _barsElement: BarsElement) {
      super(_barsElement);
    }

    private _template = Handlebars.templates['f-bars'];
    private _data: string;

    createdCallback() {
      if (!this._barsElement)
        Bars.call(this, this)

      this._barsElement.innerHTML = '';
      this._barsElement.appendChild(
        createDocumentFragment(this._template({})));

      if (this.src) {
        this.load();
      }
    }

    get normalized(): boolean {
      return this._barsElement.getAttribute('normalized') === 'true';
    }

    set normalized(newNormalized: boolean) {
      this._barsElement.setAttribute('normalized', newNormalized.toString());
    }

    protected load() {
      $.ajax({
        url: this.src,
        success: (data) => {
          this._data = data;
          this.render();
        },
        error: (error) => {
          console.error("Error:" + error);
        }
      });
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

      if (this._data) {
        var data = d3.csv.parse(this._data);

        // Different stacked bars are cols
        var color = this.flatColor10().domain(this.cols);
        // Buckets are defined by primary key
        data.forEach((d: any) => {
          var y0 = 0;
          d.bucket = d[this.key];
          d.groups = color.domain().map(function(col) {
            return { col: col, y0: y0, y1: y0 += +d[col] }; });
          if (this.normalized) {
            d.groups.forEach(function(d) { d.y0 /= y0; d.y1 /= y0; });
          } else {
            d.total = d.groups[d.groups.length - 1].y1;
          }
        });

        data.sort((a: any, b: any) => {
          if (this.normalized) {
            return b.groups[0].y1 - a.groups[0].y1;
          } else {
            return b.total - a.total;
          }
        });

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

        var bucket = svg.selectAll(".bucket")
          .data(data)
          .enter().append("g")
          .attr("class", "bucket")
          .attr("transform", (d: any) => {
            return this.translate(x(d.bucket), 0) });

        bucket.selectAll("rect")
          .data(function(d: any) { return d.groups; })
          .enter().append("rect")
          .attr("width", x.rangeBand())
          .attr("y", function(d: any) { return y(d.y1); })
          .attr("height", function(d: any) { return y(d.y0) - y(d.y1); })
          .style("fill", function(d: any) { return color(d.col); });
      }
    }
  }

  export interface BarsElement extends GraphElement {
    normalized: boolean
  }

  export var BarsElement = registerElement('f-bars', HTMLElement, Bars);
}