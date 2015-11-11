/// <reference path="../f-mentat.ts"/>
/// <reference path="../f-graph/f-graph.ts"/>

module flipp.mentat {
  class Lines extends Graph {
    constructor(private _linesElement: LinesElement) {
      super(_linesElement);
    }

    private _template = Handlebars.templates['f-lines'];
    private _data: string;

    createdCallback() {
      if (!this._linesElement)
        Lines.call(this, this);

      this._linesElement.innerHTML = '';
      this._linesElement.appendChild(
        createDocumentFragment(this._template({})));

      if (this.src) {
        this.load();
      }
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
      this._linesElement.innerHTML = '';

      var width     = this.innerWidth;
      var height    = this.innerHeight;
      var x         = d3.time.scale().range([0, width]);
      var y         = d3.scale.linear().range([height, 0]);
      var xAxis     = d3.svg.axis().scale(x).orient("bottom");
      var yAxis     = d3.svg.axis().scale(y).orient("left");

      var line = d3.svg.line()
        .x(function(d: any) { return x(d.date); })
        .y(function(d: any) { return y(d.value); });

      var svg = d3.select(this._linesElement)
        .append("svg")
        .attr("width", this.width)
        .attr("height", this.height)
        .append("g")
        .attr("transform", this.translate(
          Graph.MARGIN.left, Graph.MARGIN.top));

      if (this._data) {
        var data = d3.csv.parse(this._data)

        // Different lines are specified as cols
        var color = this.flatColor10().domain(this.cols);

        // For line graphs, our key is a time scale (y over time)
        // Parse time to a javascript acceptable time
        data.forEach((d: any) => {
          d.date = d3.time.format("%Y%m%d").parse(d[this.key]);
        });

        var sets = color.domain().map((col) => {
          return {
            col: col,
            values: data.map((d: any) => {
              return { date: d.date, value: +d[col] };
            })
          };
        });

        x.domain(d3.extent(data, (d: any) => { return d.date; }));
        y.domain([
          d3.min(sets, (c: any) => {
            return d3.min(c.values, (v: any) => { return v.value; }); }),
          d3.max(sets, (c: any) => {
            return d3.max(c.values, (v: any) => { return v.value; }); })
        ]);

        svg.append("g")
          .attr("class", "x axis")
          .attr("transform", this.translate(0, height))
          .call(xAxis);

        svg.append("g")
          .attr("class", "y axis")
          .call(yAxis);

        var set = svg.selectAll(".set")
          .data(sets)
          .enter().append("g")
          .attr("class", "set");

        set.append("path")
          .attr("class", "line")
          .attr("d", (d: any) => { return line(d.values); })
          .style("stroke", (d: any) => { return color(d.col); });

        set.append("text")
          .datum((d: any) => {
            return { col: d.col, value: d.values[d.values.length - 1] }; })
          .attr("transform", (d: any) => {
            return this.translate(x(d.value.date), y(d.value.value)); })
          .attr("x", 3)
          .attr("dy", ".35em")
          .text((d: any) => { return d.col; });
      }
    }
  }

  export interface LinesElement extends GraphElement { }

  export var LinesElement = registerElement('f-lines', HTMLElement, Lines);
}