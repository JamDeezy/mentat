var d3 = require('d3');

function BaseSVG(selector, klass) {
  // private state variable
  var state     = 0;

  // public variables
  this.container = selector instanceof HTMLElement ?
                   selector : document.querySelector(selector);
  this.width     = this.container.offsetWidth;
  this.height    = this.container.offsetHeight;

  // Create svg container
  this.svg = d3.select(this.container)
      .classed("mentat", true)
      .classed(klass, true)
    .append("svg")
      .attr("width", this.width)
      .attr("height", this.height);

  // getter
  this.getState = function() {
    return state;
  }

  // setter
  this.setState = function(newState) {
    switch(newState) {
      // Dump everything out of svg container if empty is set
      case BaseSVG.stateENUM.EMPTY:
        this.svg.selectAll("*").remove();
        break;

      // Load a spinner
      case BaseSVG.stateENUM.LOADING:
        var g = this.svg.append("g")
                  .classed("loading-overlay", true)

        g.append("rect")
            .attr("class", "overlay")
            .attr("width", this.width)
            .attr("height", this.height)
            .attr("fill", "#ffffff")

        g.append("circle")
          .attr("cx", this.width/2)
          .attr("cy", this.height/2)
          .attr("r", "40")
          .attr("stroke", "#00C6D7")
          .attr("fill", "none")
          .attr("stroke-width", "5")
          .attr("stroke-linecap", "round")
          .html(
            '<animate attributeName="stroke-dashoffset" dur="3s" repeatCount'+
            '="indefinite" from="0" to="502"></animate><animate attributeName'+
            '="stroke-dasharray" dur="3s" repeatCount="indefinite" values="'+
            '150.6 100.4;1 250;150.6 100.4"></animate>'
          )
        break;

      // Remove the spinner
      case BaseSVG.stateENUM.READY:
        this.svg.select(".loading-overlay")
          .transition()
          .duration(400)
          .style("opacity", 0)
          .each("end", function(d) { this.remove()} )
        break;

      default:
        console.error("Invalid state");
        return nil;
    }

    state = newState;
  }
}

BaseSVG.stateENUM = {
  EMPTY  : 0,
  LOADING: 1,
  READY  : 2
};
module.exports = BaseSVG