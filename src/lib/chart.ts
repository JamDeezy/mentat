// /// <reference path="mentat.ts"/>

// module mentat {

//   export function chart(config: mentat.Chart.config) {
//     return new Chart(config);
//   }

//   class Chart {
//     private parent: d3.Selection<any>;
//     private config: mentat.Chart.config;

//     constructor(config: mentat.Chart.config) {
//       this.build(config);

//       this.config = config;
//       return this;
//     }

//     private build(config: mentat.Chart.config) {
//       var parent = d3.select(config.selector);

//       this.buildAxes(config)

//       this.parent = parent;
//     }

//     private buildAxes(config: any) {

//       if (typeof config.axis.x === 'string') {

//         var domain = d3.extent(
//           config.data,
//           function(d) { return d[config.axis.x] }
//         );

//         var scale = Chart.scale({
//           type: 'linear',
//           range: [0, 100],
//           domain: domain,
//         })

//         var x = Chart.axis({
//           orient: 'bottom',
//           scale: scale
//         });

//       } else {

//         // set important variables
//         Chart.axis(config.axis.x);

//       }

//       if (typeof config.axis.x === 'string') {

//         var range = d3.extent(
//           config.data,
//           function(d) { return d[config.axis.y] }
//         );

//         var scale = Chart.scale({
//           type: 'linear',
//           range: range,
//           domain: [0, 1],
//         })

//         var y = Chart.axis({
//           orient: 'bottom',
//           scale: scale
//         });

//       } else {

//         Chart.axis(config.axis.x);

//       }
//     }
//   }








//   module Chart {
//     export function body(config) {
//       return new Body(config)
//     }

//     class Body {
//       public origin: any;
//       private config: mentat.Chart.Body.config;

//       constructor(config: mentat.Chart.Body.config) {
//         this.build(config);

//         this.config = config;
//         return this;
//       }

//       private build(config: mentat.Chart.Body.config) {
//         var body;


//       }
//     }




//     export function axis(config: mentat.Chart.Axis.config) {
//       return new Axis(config);
//     }

//     class Axis {
//       public origin: any;
//       private config: mentat.Chart.Axis.config;

//       constructor(config: mentat.Chart.Axis.config) {
//         this.build(config);

//         this.config = config;
//         return this;
//       }

//       private build(config: mentat.Chart.Axis.config) {
//         var axis;

//         // Create svg axis
//         axis = d3.svg
//             .axis()
//             .orient(config.orient)
//             .scale(config.scale.origin)

//         for (var key in config.format) {
//           axis[key](config.format[key])
//         }

//         this.origin = axis;
//       }
//     }




//     export function scale(config: mentat.Chart.Scale.config) {
//       return new Scale(config);
//     }

//     class Scale {
//       public origin: any;
//       private config: mentat.Chart.Scale.config;

//       constructor(config: mentat.Chart.Scale.config) {
//         this.build(config);

//         this.config = config;
//         return this;
//       }

//       private build(config: mentat.Chart.Scale.config) {
//         var scale;

//         // Look through types and build the corresponding scale
//         switch(config.type) {
//           case 'date':    scale = d3.time.scale(); break;
//           case 'linear':  scale = d3.scale.linear(); break;
//           case 'ordinal': scale = d3.scale.ordinal(); break;
//           default:
//             mentat.error('Unknown scale type ' + config.type + '!');
//         }

//         scale
//           .domain(config.domain)
//           .range(config.range);

//         for (var key in config.format) {
//           scale[key](config.format[key]);
//         }

//         this.origin = scale;
//       }
//     }
//   }

// }