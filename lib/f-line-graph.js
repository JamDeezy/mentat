/// <reference path="dts/handlebars.d.ts"/>
/// <reference path="dts/webcomponents.d.ts"/>
/// <reference path="dts/d3.d.ts"/>
/// <reference path="dts/moment.d.ts"/>
/// <reference path="dts/velocity.d.ts"/>
var flipp;
(function (flipp) {
    var mentat;
    (function (mentat) {
        function getPropertyDesc(obj, prop) {
            for (var proto = obj; proto; proto = Object.getPrototypeOf(proto)) {
                var desc = Object.getOwnPropertyDescriptor(proto, prop);
                if (desc)
                    return desc;
            }
            return undefined;
        }
        function getProperties(obj) {
            var properties = [];
            for (var proto = obj; proto; proto = Object.getPrototypeOf(proto)) {
                Object.getOwnPropertyNames(proto).forEach(function (property) {
                    if (properties.indexOf(property) === -1)
                        properties.push(property);
                });
            }
            return properties;
        }
        function getFullPrototype(proto) {
            return getProperties(proto).reduce(function (map, prop) {
                map[prop] = getPropertyDesc(proto, prop);
                return map;
            }, {});
        }
        function registerElement(elName, elBase, el, elExtend) {
            if (!registered(elName)) {
                var options = {
                    prototype: Object.create(elBase.prototype, getFullPrototype(el.prototype))
                };
                if (elExtend)
                    options.extends = elExtend;
                return document.registerElement(elName, options);
            }
        }
        mentat.registerElement = registerElement;
        function registered(elName) {
            switch (document.createElement(elName).constructor) {
                case HTMLElement: return false;
                case HTMLUnknownElement: return undefined;
            }
            return true;
        }
        mentat.registered = registered;
        function createDocumentFragment(html) {
            return document.createRange().createContextualFragment(html);
        }
        mentat.createDocumentFragment = createDocumentFragment;
        /* TODO: May want to split these helpers into another module */
        function getChild(parent, selector) {
            return parent.querySelector(selector);
        }
        mentat.getChild = getChild;
    })(mentat = flipp.mentat || (flipp.mentat = {}));
})(flipp || (flipp = {}));
/// <reference path="../f-mentat.ts"/>
var flipp;
(function (flipp) {
    var mentat;
    (function (mentat) {
        function d3_time_range_greedy(floor, step, number) {
            return function (t0, t1, dt) {
                var time = floor(t0), times = [];
                if (dt > 1) {
                    while (time < t1) {
                        var date = new Date(+time);
                        times.push(date);
                        for (var i = dt; i > 0; step(time), i--)
                            ;
                    }
                }
                else {
                    while (time < t1)
                        times.push(new Date(+time)), step(time);
                }
                return times;
            };
        }
        d3.time.daysTotal = d3_time_range_greedy(d3.time.day, function (date) {
            date.setDate(date.getDate() + 1);
        }, function (date) {
            return ~~(date / 86400000);
        });
    })(mentat = flipp.mentat || (flipp.mentat = {}));
})(flipp || (flipp = {}));
/// <reference path="../f-mentat.ts"/>
/// <reference path="f-d3-helper.ts"/>
var flipp;
(function (flipp) {
    var mentat;
    (function (mentat) {
        var Graph = (function () {
            function Graph(_el) {
                this._el = _el;
            }
            Object.defineProperty(Graph.prototype, "axes", {
                /* Attributes */
                get: function () {
                    return JSON.parse(this._el.getAttribute('axes')) || Graph.AXES;
                },
                set: function (val) {
                    this._el.setAttribute('axes', JSON.stringify(val));
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Graph.prototype, "margin", {
                get: function () {
                    return JSON.parse(this._el.getAttribute('margin')) || Graph.MARGIN;
                },
                set: function (val) {
                    this._el.setAttribute('margin', JSON.stringify(val));
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Graph.prototype, "size", {
                get: function () {
                    return JSON.parse(this._el.getAttribute('size')) || Graph.SIZE;
                },
                set: function (val) {
                    this._el.setAttribute('size', JSON.stringify(val));
                },
                enumerable: true,
                configurable: true
            });
            Graph.prototype.attr = function (attr, value) {
                if (typeof value === 'string')
                    this._el.setAttribute(attr, value);
                else
                    this._el.setAttribute(attr, JSON.stringify(value));
                return this._el;
            };
            Graph.prototype.load = function (data) {
                switch (typeof data) {
                    // pass of array of objects
                    case 'object':
                        this.data = data;
                        break;
                    // pass of url or csv string
                    case 'string':
                        this.data = d3.csv.parse(data);
                        break;
                    // not supported
                    default:
                        console.error("Invalid data type!");
                }
                return this._el;
            };
            Graph.prototype.onClick = function (func) {
                this.clickFunc = func;
                return this._el;
            };
            Graph.prototype.onDecode = function (func) {
                this.decodeFunc = func;
                return this._el;
            };
            Graph.prototype.onHover = function (func) {
                this.hoverFunc = func;
                return this._el;
            };
            Graph.prototype.update = function (hash) {
                for (var key in hash)
                    if (typeof hash[key] === 'string')
                        this._el.setAttribute(key, hash[key]);
                    else
                        this._el.setAttribute(key, JSON.stringify(hash[key]));
                return this._el;
            };
            Graph.prototype.flatColor10 = function () {
                return d3.scale.ordinal().range([
                    "#3498db", "#1abc9c", "#2ecc71", "#f1c40f", "#e67e22",
                    "#e74c3c", "#9b59b6", "#ecf0f1", "#95a5a6", "#34495e"
                ]);
            };
            Graph.prototype.fallColor7 = function () {
                return d3.scale.ordinal().range([
                    "#98abc5", "#8a89a6", "#7b6888", "#6b486b",
                    "#a05d56", "#d0743c", "#ff8c00"
                ]);
            };
            /* Protected */
            Graph.MARGIN = { top: 20, right: 0, bottom: 70, left: 55 };
            Graph.SIZE = { width: 960, height: 480 };
            Graph.AXES = { x: 'key', y: 'value' };
            return Graph;
        })();
        mentat.Graph = Graph;
        mentat.GraphElement = mentat.registerElement('f-graph', HTMLElement, Graph);
    })(mentat = flipp.mentat || (flipp.mentat = {}));
})(flipp || (flipp = {}));
/// <reference path="../f-mentat.ts"/>
/// <reference path="f-graph.ts"/>
var flipp;
(function (flipp) {
    var mentat;
    (function (mentat) {
        var Tooltip = (function () {
            function Tooltip(parent) {
                this._offset = [0, 0];
                this._direction = 'n';
                this._parent = parent;
                this._appendTooltip();
                return this;
            }
            Tooltip.prototype.show = function (v, d) {
                this._el.innerHTML = this._html(d);
                this._el.style.left = (v[0] + this._offset[0]) + 'px';
                this._el.style.top = (v[1] + this._offset[1]) + 'px';
                this._el.style.opacity = '1';
                return this;
            };
            Tooltip.prototype.hide = function () {
                this._el.style.opacity = '0';
                return this;
            };
            Tooltip.prototype.offset = function (v) {
                this._offset = v;
                return this;
            };
            Tooltip.prototype.style = function (a, v) {
                this._el.style[a] = v;
                return this;
            };
            Tooltip.prototype.attr = function (a, v) {
                this._el.setAttribute(a, v);
                return this;
            };
            Tooltip.prototype.html = function (v) {
                this._html = v;
                return this;
            };
            Tooltip.prototype.remove = function () {
                this._el.parentElement.removeChild(this._el);
                return this;
            };
            // TODO
            Tooltip.prototype.direction = function (v) {
                this._direction = v;
                return this;
            };
            Tooltip.prototype._appendTooltip = function () {
                this._el = document.createElement('div');
                this._el.className = 'tooltip';
                this._el.style.opacity = '0';
                this._el.appendChild;
                document.body.appendChild(this._el);
            };
            return Tooltip;
        })();
        mentat.Tooltip = Tooltip;
    })(mentat = flipp.mentat || (flipp.mentat = {}));
})(flipp || (flipp = {}));
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
        var LineGraph = (function (_super) {
            __extends(LineGraph, _super);
            function LineGraph(_element) {
                _super.call(this, _element);
                this._element = _element;
            }
            LineGraph.prototype.createdCallback = function () {
                var _this = this;
                if (!this._el)
                    LineGraph.call(this, this);
                /* default hover content */
                this.onHover(function (d) {
                    var html = moment(d.date).format('YYYY-MM-DD') + ': ';
                    var tempy = _this.axes.y;
                    if (typeof _this.axes.y === 'string') {
                        html += '<string>' + d[tempy] + '</string>';
                    }
                    else if (_this.axes.y instanceof Array) {
                        for (var i = 0; i < _this.axes.y.length; i++) {
                            var data = d[_this.axes.y[i]];
                            html += "<strong>" + _this.axes.y[i] + "</strong>: " +
                                "<span style='color:red'>" + data + "</span><br>";
                        }
                    }
                    return html;
                }).onDecode(function (d) {
                    d.date =
                        d3.time
                            .format("%Y%m%d")
                            .parse(d[_this.axes.x]);
                    return d;
                });
                this.render();
            };
            LineGraph.prototype.detachedCallback = function () {
                if (this._tip)
                    this._tip.remove();
            };
            LineGraph.prototype.render = function () {
                var _this = this;
                this._el.innerHTML = '';
                var width = this.size.width - this.margin.left - this.margin.right;
                var height = this.size.height - this.margin.top - this.margin.bottom;
                // typescript hack here, union types sucks
                var tempy = this.axes.y;
                if (this.axes.y instanceof Array) {
                    var color = this.flatColor10().domain(tempy);
                }
                else if (typeof this.axes.y === 'string') {
                    var color = this.flatColor10().domain([tempy]);
                }
                else {
                    throw "Invalid axes.y type!";
                }
                var line = d3.svg
                    .line()
                    .x(function (d) { return x(d.date); })
                    .y(function (d) { return y(d.value); });
                var svg = d3.select(this._el)
                    .append("svg")
                    .attr("width", this.size.width)
                    .attr("height", this.size.height)
                    .append("g")
                    .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
                if (this.data && this.data.length > 0) {
                    this.data.forEach(function (d) { _this.decodeFunc(d); });
                    this.data = this.data.sort(function (a, b) { return a.date - b.date; });
                    var sets = color.domain().map(function (column) {
                        return {
                            column: column,
                            values: _this.data.map(function (d) { return { date: d.date, value: +d[column], source: d }; })
                        };
                    });
                    var x = d3.time
                        .scale()
                        .range([0, width])
                        .domain(d3.extent(this.data, function (d) { return d.date; }));
                    var y = d3.scale
                        .linear()
                        .range([height, 0])
                        .domain([0, 1.2 *
                            d3.max(sets, function (c) {
                                return d3.max(c.values, function (v) { return v.value; });
                            })
                    ]);
                    var xAxis = d3.svg
                        .axis()
                        .scale(x)
                        .orient("bottom")
                        .ticks(d3.time.daysTotal, 6)
                        .tickFormat(function (d) {
                        if (d.getDate() < 7) {
                            return d3.time.format("%b")(d);
                        }
                        else {
                            return d3.time.format("%d")(d);
                        }
                    })
                        .tickSize(40);
                    var yAxis = d3.svg
                        .axis()
                        .scale(y)
                        .orient("left")
                        .ticks(4)
                        .tickFormat(d3.format("s"))
                        .tickPadding(20)
                        .tickSize(0 - width);
                    svg.append("g")
                        .attr("class", "x axis")
                        .attr("transform", "translate(0, " + height + ")")
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
                        .attr("d", function (d) { return line(d.values); })
                        .style("stroke", function (d) { return color(d.column); });
                    if (this.hoverFunc) {
                        var scanner = svg.append("g")
                            .attr("class", "scanner")
                            .style("display", "none");
                        scanner.append("line")
                            .style("stroke-dasharray", ("3, 3"))
                            .attr("y1", 0)
                            .attr("y2", height);
                        var point = scanner.append("circle")
                            .style("fill", "steelblue")
                            .attr("r", 4);
                        if (this._tip)
                            this._tip.remove();
                        var tip = new mentat.Tooltip(svg)
                            .offset([20, 5])
                            .html(function (d) { return _this.hoverFunc(d.source); });
                        this._tip = tip;
                        svg.append("rect")
                            .attr("class", "overlay")
                            .attr("width", width + 10)
                            .attr("height", height)
                            .style("fill", "none")
                            .style("pointer-events", "all")
                            .on("mouseout", function () {
                            scanner.style("display", "none");
                            tip.hide();
                        })
                            .on("mousemove", function () {
                            var date = x.invert(d3.mouse(this)[0]);
                            var i = d3.bisector(function (d) { return d.date; })
                                .left(sets[0].values, date, 1);
                            var d0 = sets[0].values[i - 1];
                            var d1 = sets[0].values[i];
                            // find closest datapoint
                            if (!d1)
                                var d = d0;
                            else if (!d0)
                                var d = d1;
                            else
                                var d = date - d0.date > d1.date - date ? d1 : d0;
                            scanner.style("display", null)
                                .attr("transform", "translate(" + x(d.date) + ", 0)");
                            point.attr("transform", "translate(0, " + y(d.value) + ")");
                            var pointEl = point[0][0];
                            var position = pointEl.getBoundingClientRect();
                            tip.show([position.left, position.top], d);
                        });
                    }
                }
                else {
                    d3.select(this._element)
                        .select('svg')
                        .append("rect")
                        .attr("class", "overlay")
                        .attr("width", this.size.width)
                        .attr("height", this.size.height)
                        .attr("fill", "#f7f7f7");
                    d3.select(this._element)
                        .select('svg')
                        .append('text')
                        .text('No available data')
                        .attr('text-anchor', 'middle')
                        .attr("transform", "translate(" +
                        this.size.width / 2 + ", " + this.size.height / 2 + ")")
                        .attr('font-size', '24px')
                        .attr("fill", "#777777");
                }
                return this._el;
            };
            return LineGraph;
        })(mentat.Graph);
        mentat.LineGraphElement = mentat.registerElement('f-line-graph', HTMLElement, LineGraph);
    })(mentat = flipp.mentat || (flipp.mentat = {}));
})(flipp || (flipp = {}));
