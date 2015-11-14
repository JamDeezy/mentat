/// <reference path="../f-mentat.ts"/>
/// <reference path="../f-graph/f-graph.ts"/>
/// <reference path="../f-graph/f-tooltip.ts"/>

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

      /* overwrite hoverable+sum default to true */
      this.HOVERABLE = true;
      this.SUM = true;

      /* default hover content */
      this.onhoverhtml = (d: any) => {
        // TODO behavior between sum and no sum
        var html = "<h4>" + moment(d.data.date).format("MMM Do YY") + "</h4>";
        for (var i = 0; i < this.columns.length; i++) {
          var data = d.data[this.columns[i]]
          html += "<strong>" + this.columns[i] + "</strong>: " +
            "<span style='color:red'>" + data + "</span><br>";
        }
        return html;
      };

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
      this._linesElement.innerHTML = '';

      var width     = this.innerWidth;
      var height    = this.innerHeight;
      var x         = d3.time.scale().range([0, width]);
      var y         = d3.scale.linear().range([height, 0]);
      var xAxis     = d3.svg.axis().scale(x).orient("bottom");
      var yAxis     = d3.svg.axis().scale(y).orient("left")
                        .tickSize(0 - width)
                        .tickPadding(8);
      var line      = d3.svg.line()
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
        var color = this.flatColor10().domain(
          (this.sum) ? ["sum"] : this.columns);

        // For line graphs, our key is a time scale (y over time)
        // Parse time to a javascript acceptable time
        data.forEach((d: any) => {
          d.date = d3.time.format("%Y%m%d").parse(d[this.key]);
        });

        var sets: any = color.domain().map((column) => {
          return {
            column: (this.sum) ? "sum" : column,
            values: data.map((d: any) => {
              if (this.sum) {
                var sum = 0, i = 0;
                for (;i < this.columns.length; sum += +d[this.columns[i++]]);
                return { date: d.date, value: sum, data: d };
              } else {
                return { date: d.date, value: +d[column] };
              }
            })
          }
        });

        x.domain(d3.extent(data, (d: any) => { return d.date; }));
        y.domain([0,
          1.5 * d3.max(sets, (c: any) => {
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
          .enter()
          .append("g")
          .attr("class", "set");

        set.append("path")
          .attr("class", "line")
          .attr("d", (d: any) => { return line(d.values); })
          .style("stroke", (d: any) => { return color(d.column); });

        if (this.hoverable) {
          var scanner = svg.append("g")
            .attr("class", "scanner")
            .style("display", "none");

          scanner.append("line")
            .style("stroke-dasharray", ("3, 3"))
            .attr("y1", 0)
            .attr("y2", height);
          scanner.append("circle")
            .style("fill", "steelblue")
            .attr("r", 4);

          var tip = new Tooltip(svg)
            .offset([5, 0])
            .html((d: any) => {
              return this.onhoverhtml(d);
            })

          svg.append("rect")
            .attr("class", "overlay")
            .attr("width", width)
            .attr("height", height)
            .style("fill", "none")
            .style("pointer-events", "all")
            .on("mouseout", function() {
              scanner.style("display", "none");
              tip.hide()
            }).on("mousemove", function() {
              var date   = x.invert(d3.mouse(this)[0]);
              var i      = d3.bisector((d: any) => { return d.date; })
                             .left(sets[0].values, date, 1);
              var d: any = sets[0].values[i - 1];

              scanner.style("display", null)
                .attr("transform", "translate(" + x(d.date) + ", 0)");
              scanner.select('circle')
                .attr("transform", "translate(0, " + y(d.value)+ ")")
              tip.show([x(d.date), y(d.value)], d);
            });
        }
      }
    }
  }

  export interface LinesElement extends GraphElement { }

  export var LinesElement = registerElement('f-lines', HTMLElement, Lines);
}