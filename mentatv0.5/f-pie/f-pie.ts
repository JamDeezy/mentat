// /// <reference path="../f-mentat.ts"/>
// /// <reference path="../f-graph/f-graph.ts"/>
// /// <reference path="../f-graph/f-tooltip.ts"/>

// module flipp.mentat {
//   class Pie extends Graph {
//       constructor() { super(null); debugger;}

//     private _template = Handlebars.templates['f-pie'];

//     createdCallback() {
//       if (!this._element)
//         Graph.call(this, this);

//       this._element.innerHTML = '';
//       this._element.appendChild(
//         createDocumentFragment(this._template({})));
//     }

//     protected render() {
//       var width = this.innerWidth;
//       var height = this.innerHeight;
//       var radius = Math.min(width, height) / 2;
//       var color = this.fallColor7();

//       var arc = d3.svg.arc()
//           .outerRadius(radius - 10)
//           .innerRadius(0);

//       var labelArc = d3.svg.arc()
//           .outerRadius(radius - 40)
//           .innerRadius(radius - 40);

//       var pie = d3.layout.pie()
//           .sort(null)
//           .value(function(d) { return d.population; });

//       var svg = d3.select("body").append("svg")
//           .attr("width", width)
//           .attr("height", height)
//           .append("g")
//           .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

//       d3.csv("data.csv", type, function(error, data) {
//           if (error) throw error;

//           var g = svg.selectAll(".arc")
//               .data(pie(data))
//               .enter().append("g")
//               .attr("class", "arc");

//           g.append("path")
//               .attr("d", arc)
//               .style("fill", function(d) { return color(d.data.age); });

//           g.append("text")
//               .attr("transform", function(d) { return "translate(" + labelArc.centroid(d) + ")"; })
//               .attr("dy", ".35em")
//               .text(function(d) { return d.data.age; });
//       });

//       function type(d) {
//           d.population = +d.population;
//           return d;
//       }
//     }
//   }

//   export interface PieElement extends HTMLElement {
//   }

//   export var PieElement = registerElement('f-pie', HTMLElement, Pie);
// }