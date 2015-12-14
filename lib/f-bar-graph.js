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
        var BarGraph = (function (_super) {
            __extends(BarGraph, _super);
            function BarGraph(_element) {
                _super.call(this, _element);
                this._element = _element;
            }
            BarGraph.prototype.createdCallback = function () {
                var _this = this;
                if (!this._el)
                    BarGraph.call(this, this);
                /* default hover content */
                this.onHover(function (d) {
                    var html = d[_this.axes.x];
                    for (var i = 0; i < d.sets.length; i++) {
                        var set = d.sets[i];
                        html +=
                            "<strong style='color:" + set.color + "'>"
                                + set.column + "</strong>" + ": <span style='color:red'>" +
                                Math.round((set.y1 - set.y0) * 100) / 100 + "</span><br>";
                    }
                    return html;
                }).onDecode(function (d) {
                    return d;
                });
                this.render();
            };
            BarGraph.prototype.detachedCallback = function () {
                if (this._tip)
                    this._tip.remove();
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
            BarGraph.prototype.render = function () {
                var _this = this;
                this._el.innerHTML = '';
                if (this.vertical) {
                    var width = this.size.height - this.margin.top - this.margin.bottom;
                    var height = this.size.width - this.margin.left - this.margin.right;
                }
                else {
                    var width = this.size.width - this.margin.left - this.margin.right;
                    var height = this.size.height - this.margin.top - this.margin.bottom;
                }
                var x = d3.scale.ordinal().rangeRoundBands([0, width], .1);
                var y = d3.scale.linear().rangeRound([height, 0]);
                var xAxis = d3.svg.axis().scale(x).orient("bottom");
                var yAxis = d3.svg.axis().scale(y).orient("left");
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
                if (this.vertical) {
                    xAxis = d3.svg.axis().scale(x).orient("left");
                    yAxis = d3.svg.axis().scale(y).orient("top");
                }
                var svg = d3.select(this._el)
                    .append("svg")
                    .attr("width", this.size.width)
                    .attr("height", this.size.height)
                    .append("g")
                    .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
                if (this.data && this.data.length > 0) {
                    // TODO this isn't up to par with lines
                    // Buckets are defined by primary key
                    this.data.forEach(function (d) {
                        // data decoder
                        d = _this.decodeFunc(d);
                        var y0 = 0;
                        d.bucket = d[_this.axes.x];
                        d.sets = color.domain().map(function (column) {
                            return {
                                column: column,
                                y0: y0,
                                y1: y0 += +d[column],
                                color: color(column)
                            };
                        });
                        if (_this.normalized) {
                            d.sets.forEach(function (d) {
                                d.y0 /= y0;
                                d.y1 /= y0;
                                if (isNaN(d.y0))
                                    d.y0 = 0;
                                if (isNaN(d.y1))
                                    d.y1 = 0;
                            });
                        }
                        else {
                            d.total = d.sets[d.sets.length - 1].y1;
                        }
                    });
                    if (this.sorted) {
                        this.data.sort(function (a, b) {
                            if (_this.normalized) {
                                return b.sets[0].y1 - a.sets[0].y1;
                            }
                            else {
                                return b.total - a.total;
                            }
                        });
                    }
                    x.domain(this.data.map(function (d) { return d.bucket; }));
                    if (!this.normalized) {
                        if (this.vertical) {
                            y.domain([d3.max(this.data, function (d) { return d.total; }), 0]);
                        }
                        else {
                            y.domain([0, d3.max(this.data, function (d) { return d.total; })]);
                        }
                    }
                    else {
                        if (this.vertical) {
                            y.domain([1, 0]);
                        }
                    }
                    if (this.vertical) {
                        svg.append("g")
                            .attr("class", "x axis")
                            .attr("transform", "translate(0, 0)")
                            .call(xAxis)
                            .selectAll(".tick text")
                            .text(function (d) {
                            return (d.length > 11) ? d.substring(0, 5) + '...' : d;
                        });
                    }
                    else {
                        svg.append("g")
                            .attr("class", "x axis")
                            .attr("transform", "translate(0," + height + ")")
                            .call(xAxis);
                    }
                    svg.append("g")
                        .attr("class", "y axis")
                        .call(yAxis);
                    if (this.vertical) {
                        var bucket = svg.selectAll(".bucket")
                            .data(this.data)
                            .enter()
                            .append("g")
                            .attr("class", "bucket")
                            .attr("transform", function (d) { return "translate(0, " + x(d.bucket) + ")"; });
                        bucket.selectAll("rect")
                            .data(function (d) { return d.sets; })
                            .enter()
                            .append("rect")
                            .attr("class", "set")
                            .attr("height", x.rangeBand())
                            .attr("x", function (d) { return y(d.y0); })
                            .attr("width", function (d) { return y(d.y1) - y(d.y0); })
                            .style("fill", function (d) { return d.color; });
                    }
                    else {
                        var bucket = svg.selectAll(".bucket")
                            .data(this.data)
                            .enter()
                            .append("g")
                            .attr("class", "bucket")
                            .attr("transform", function (d) { return "translate(" + x(d.bucket) + ", 0)"; });
                        bucket.selectAll("rect")
                            .data(function (d) { return d.sets; })
                            .enter()
                            .append("rect")
                            .attr("class", "set")
                            .attr("width", x.rangeBand())
                            .attr("y", function (d) { return y(d.y1); })
                            .attr("height", function (d) { return y(d.y0) - y(d.y1); })
                            .style("fill", function (d) { return d.color; });
                    }
                    // Hover functionality
                    if (this.hoverFunc) {
                        var tip = new mentat.Tooltip(svg)
                            .offset([20, 5])
                            .html(function (d) { return _this.hoverFunc(d); });
                        // remove if it exists
                        if (this._tip)
                            this._tip.remove();
                        this._tip = tip;
                        bucket.on("mouseenter", function (d) {
                            var position = this.getBoundingClientRect();
                            tip.show([position.left, position.top], d);
                        }).on("mouseleave", function () {
                            tip.hide();
                        });
                    }
                }
                else {
                    d3.select(this._el).select('svg')
                        .append("rect")
                        .attr("class", "overlay")
                        .attr("width", this.size.width)
                        .attr("height", this.size.height)
                        .attr("fill", "#f7f7f7");
                    d3.select(this._el).select('svg')
                        .append('text')
                        .text('No available data')
                        .attr('text-anchor', 'middle')
                        .attr("transform", "translate(" + this.size.width / 2 + ", " + this.size.height / 2 + ")")
                        .attr('font-size', '24px')
                        .attr("fill", "#777777");
                }
                return this._element;
            };
            return BarGraph;
        })(mentat.Graph);
        mentat.BarGraphElement = mentat.registerElement('f-bar-graph', HTMLElement, BarGraph);
    })(mentat = flipp.mentat || (flipp.mentat = {}));
})(flipp || (flipp = {}));
