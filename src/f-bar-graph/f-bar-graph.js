/// <reference path="../f-mentat.ts"/>
/// <reference path="../f-graph/f-graph.ts"/>
/// <reference path="../f-graph/f-tooltip.ts"/>
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var flipp;
(function (flipp) {
    var mentat;
    (function (mentat) {
        var BarGraph = (function (_super) {
            __extends(BarGraph, _super);
            function BarGraph(_element) {
                _super.call(this, _element);
                this._element = _element;
            }
            BarGraph.prototype.createdCallback = function () {
                if (!this._el)
                    BarGraph.call(this, this);
                this.setup();
            };
            Object.defineProperty(BarGraph.prototype, "normalized", {
                get: function () {
                    return this._el.getAttribute('normalized') === 'true';
                },
                set: function (newNormalized) {
                    this._el.setAttribute('normalized', newNormalized.toString());
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(BarGraph.prototype, "sorted", {
                get: function () {
                    return this._el.getAttribute('sorted') === 'true';
                },
                set: function (newSorted) {
                    this._el.setAttribute('sorted', newSorted.toString());
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(BarGraph.prototype, "vertical", {
                get: function () {
                    return this._el.getAttribute('vertical') === 'true';
                },
                set: function (newVertical) {
                    this._el.setAttribute('vertical', newVertical.toString());
                },
                enumerable: true,
                configurable: true
            });
            BarGraph.prototype.setup = function () {
                var _this = this;
                this._el.innerHTML = '';
                this.hoverFunc = function (data) {
                    var key = Object.keys(data)[0];
                    var html = key + ':<br>';
                    for (var i = 0; i < data[key].length; i++) {
                        var item = data[key][i];
                        html +=
                            "<strong>" + item.x + "</strong>: " +
                                "<span>" + (item.y1 - item.y0) + "</span><br>";
                    }
                    return html;
                };
                this.decodeFunc = function (data, axes) {
                    var dataSet = {};
                    for (var i = 0; i < data.length; i++) {
                        var set = [], y0 = 0;
                        for (var j = 0; j < axes.y.length; j++) {
                            var item = {};
                            item.x = axes.y[j];
                            item.y0 = y0;
                            item.y1 = y0 + data[i][item.x];
                            y0 = item.y1;
                            set.push(item);
                        }
                        dataSet[data[i][axes.x]] = set;
                    }
                    return dataSet;
                };
                /* Render cycle */
                this.render = function () {
                    _this._el.innerHTML = '';
                    if (_this.data && _this.data.length > 0) {
                        /* Find data critical points */
                        var dataSets = _this.decodeFunc(_this.data, _this.axes);
                        var ext = Object.keys(dataSets).map(function (d) { return dataSets[d]; });
                        var dataDomain = Object.keys(dataSets);
                        if (_this.sorted) {
                            dataDomain = dataDomain.sort(function (a, b) {
                                return dataSets[b][dataSets[b].length - 1].y1 -
                                    dataSets[a][dataSets[a].length - 1].y1;
                            });
                        }
                        else {
                            if (Object.keys(dataSets)[0].match(/^\w+\s\w+\s\d+$/))
                                dataDomain = Object.keys(dataSets).sort(function (a, b) {
                                    return Date.parse(a) - Date.parse(b);
                                });
                        }
                        {
                            dataDomain = Object.keys(dataSets).sort();
                        }
                    }
                    var dataRange = [0, d3TwoDExtend(ext, 'y1')[1]];
                    /* TODO why */
                    if (_this.vertical) {
                        /* height: 20px */
                        _this.size = {
                            width: _this.size.width,
                            height: dataDomain.length * 24 + _this.margin.top + _this.margin.bottom
                        };
                        var width = _this.size.height - _this.margin.top - _this.margin.bottom;
                        var height = _this.size.width - _this.margin.left - _this.margin.right;
                    }
                    else {
                        var width = _this.size.width - _this.margin.left - _this.margin.right;
                        var height = _this.size.height - _this.margin.top - _this.margin.bottom;
                    }
                    var colors = d3FlippColors(_this.axes.y);
                    var svg = d3SvgBase(_this._el, _this.size, _this.margin);
                    if (!_this.tooltip) {
                        var tip = new Tooltip(svg)
                            .offset([20, 5])
                            .html(function (d) { return _this.hoverFunc(d); });
                        _this.tooltip = tip;
                    }
                    else {
                        tip = _this.tooltip;
                    }
                    /* XY Scales */
                    var x = d3OrdinalScale([0, width], dataDomain);
                    var y = d3LinearScale((_this.vertical) ? [0, height] : [height, 0], (_this.normalized) ? [0, 1] : dataRange);
                    /* XY axes */
                    svg.append("g")
                        .attr("class", "x axis")
                        .attr("transform", (_this.vertical) ?
                        "translate(0, 0)" : "translate(0," + height + ")")
                        .call(d3Axis((_this.vertical) ? 'left' : 'bottom', x, {
                        tickFormat: function (d) {
                            return (d.length > 11) ? d.substring(0, 5) + '...' : d;
                        }
                    }));
                    svg.append("g")
                        .attr("class", "y axis")
                        .call(d3Axis((_this.vertical) ? 'top' : 'left', y, {
                        ticks: 4,
                        tickFormat: (_this.normalized) ? d3.format("%") : d3.format("s"),
                        tickSize: (_this.vertical) ? 0 - width : 0
                    }));
                    /* Draw bars in order (incase sorted is true) */
                    for (var i = 0; i < dataDomain.length; i++) {
                        var key = dataDomain[i];
                        if (_this.normalized) {
                            var index = dataSets[key].length - 1;
                            dataSets[key].forEach(function (d) {
                                d.total = dataSets[key][index].y1;
                            });
                        }
                        var bar = svg.append("g")
                            .attr("class", "bar")
                            .attr("data-key", key)
                            .attr("transform", (_this.vertical) ?
                            "translate(0, " + x(key) + ")" :
                            "translate(" + x(key) + ",0)");
                        bar.selectAll("rect")
                            .data(dataSets[key])
                            .enter()
                            .append("rect")
                            .attr("class", "set")
                            .attr((_this.vertical) ? "x" : "y", 0)
                            .attr("width", (_this.vertical) ? 0 : x.rangeBand())
                            .attr("height", (_this.vertical) ? x.rangeBand() : 0)
                            .style("fill", function (d) { return colors(d.x); });
                    }
                    /* Call animation */
                    svg.selectAll('.set')
                        .call(function (selection) {
                        var barHeight = function (d) {
                            if (_this.normalized) {
                                return y(Math.abs(d.y1 - d.y0) / d.total);
                            }
                            else {
                                return y(Math.abs(d.y1 - d.y0));
                            }
                        };
                        if (_this.vertical) {
                            selection.transition()
                                .duration(250)
                                .delay(function (d, i) { return i * 40; })
                                .attr("x", function (d) {
                                return (_this.normalized) ? y(d.y0 / d.total) : y(d.y0);
                            })
                                .attr("width", barHeight);
                        }
                        else {
                            selection.transition()
                                .duration(250)
                                .delay(function (d, i) { return i * 40; })
                                .attr("y", function (d) {
                                return (_this.normalized) ? y(d.y0 / d.total) : y(d.y0);
                            })
                                .attr("height", barHeight);
                        }
                    });
                    /* Hover functionality */
                    if (_this.hoverFunc) {
                        /* Mouse events */
                        svg.selectAll('.bar')
                            .on("mouseenter", function () {
                            var position = this.getBoundingClientRect();
                            var key = this.getAttribute('data-key');
                            var datapoint = {};
                            datapoint[key] = dataSets[key];
                            tip.show([
                                position.left + window.scrollX,
                                position.top + window.scrollY
                            ], datapoint);
                        }).on("mouseleave", function () {
                            tip.hide();
                        });
                    }
                };
                {
                    /* TODO why */
                    if (this.vertical) {
                        var width = this.size.height - this.margin.top - this.margin.bottom;
                        var height = this.size.width - this.margin.left - this.margin.right;
                    }
                    else {
                        var width = this.size.width - this.margin.left - this.margin.right;
                        var height = this.size.height - this.margin.top - this.margin.bottom;
                    }
                    var svg = d3SvgBase(this._el, this.size, this.margin);
                    /* Zero data overlay */
                    d3ZeroOverlay(svg);
                }
                return this._element;
            }; /* Render cycle end */
            return BarGraph;
        })(Graph);
        render();
        exports.BarGraphElement;
        {
            return this._element;
        }
    })(mentat = flipp.mentat || (flipp.mentat = {}));
})(flipp || (flipp = {}));
exports.BarGraphElement = registerElement('f-bar-graph', HTMLElement, BarGraph);
