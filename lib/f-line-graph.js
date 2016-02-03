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
        function sortAlphaNum(a, b) {
            var reA = /[^a-zA-Z]/g;
            var reN = /[^0-9]/g;
            var aA = a.replace(reA, "");
            var bA = b.replace(reA, "");
            if (aA === bA) {
                var aN = parseInt(a.replace(reN, ""), 10);
                var bN = parseInt(b.replace(reN, ""), 10);
                return aN === bN ? 0 : aN > bN ? 1 : -1;
            }
            else {
                return aA > bA ? 1 : -1;
            }
        }
        mentat.sortAlphaNum = sortAlphaNum;
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
                if (document.body)
                    document.body.appendChild(this._el);
            };
            return Tooltip;
        })();
        mentat.Tooltip = Tooltip;
    })(mentat = flipp.mentat || (flipp.mentat = {}));
})(flipp || (flipp = {}));
/// <reference path="../f-mentat.ts"/>
/// <reference path="f-graph.ts"/>
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
        /*
         * TODO Pass in
         */
        function d3SvgBase(el, size, margin) {
            return d3.select(el)
                .append("svg")
                .attr("width", size.width)
                .attr("height", size.height)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        }
        mentat.d3SvgBase = d3SvgBase;
        /*
         * TODO
         */
        function d3Axis(orient, scale, meta) {
            var axis = d3.svg
                .axis()
                .orient(orient)
                .scale(scale);
            if (typeof meta !== 'undefined') {
                if (typeof meta.ticks !== 'undefined')
                    axis.ticks(meta.ticks);
                if (typeof meta.tickFormat !== 'undefined')
                    axis.tickFormat(meta.tickFormat);
                if (typeof meta.tickPadding !== 'undefined')
                    axis.tickPadding(meta.tickPadding);
                if (typeof meta.tickSize !== 'undefined')
                    axis.tickSize(meta.tickSize);
            }
            return axis;
        }
        mentat.d3Axis = d3Axis;
        function d3TimeScale(range, domain) {
            return d3.time
                .scale()
                .range(range)
                .domain(domain);
        }
        mentat.d3TimeScale = d3TimeScale;
        function d3LinearScale(range, domain) {
            return d3.scale
                .linear()
                .range(range)
                .domain(domain);
        }
        mentat.d3LinearScale = d3LinearScale;
        function d3OrdinalScale(range, domain) {
            return d3.scale
                .ordinal()
                .rangeBands(range, 0.2)
                .domain(domain);
        }
        mentat.d3OrdinalScale = d3OrdinalScale;
        /* TODO Call back */
        function d3TwoDExtend(dataArr, key) {
            return [
                d3.min(dataArr, function (d) {
                    return d3.min(d, function (e) {
                        return e[key];
                    });
                }),
                d3.max(dataArr, function (d) {
                    return d3.max(d, function (e) {
                        return e[key];
                    });
                }),
            ];
        }
        mentat.d3TwoDExtend = d3TwoDExtend;
        function d3Normalize(dataArr, key) {
        }
        mentat.d3Normalize = d3Normalize;
        function d3FlippColors(domain) {
            var d = (domain instanceof Array) ? domain : [domain];
            return d3.scale
                .ordinal()
                .domain(d)
                .range([
                "#3498db", "#9b59b6"
            ]);
        }
        mentat.d3FlippColors = d3FlippColors;
        /*
         * TODO
         */
        function d3FlatColor10(domain) {
            var d = (domain instanceof Array) ? domain : [domain];
            return d3.scale
                .ordinal()
                .domain(d)
                .range([
                "#3498db", "#1abc9c", "#2ecc71", "#f1c40f", "#e67e22",
                "#e74c3c", "#9b59b6", "#ecf0f1", "#95a5a6", "#34495e"
            ]);
        }
        mentat.d3FlatColor10 = d3FlatColor10;
        /*
         * TODO
         */
        function d3FallColor7(domain) {
            var d = (domain instanceof Array) ? domain : [domain];
            return d3.scale
                .ordinal()
                .domain(d)
                .range([
                "#98abc5", "#8a89a6", "#7b6888", "#6b486b",
                "#a05d56", "#d0743c", "#ff8c00"
            ]);
        }
        mentat.d3FallColor7 = d3FallColor7;
        /*
         * D3 overlay
         */
        function d3ZeroOverlay(svg) {
            var node = svg.node();
            svg.attr('invert-transform', svg.attr('transform'))
                .attr('transform', '')
                .append("rect")
                .attr("class", "overlay")
                .attr("width", node.parentNode.offsetWidth)
                .attr("height", node.parentNode.offsetHeight)
                .attr("fill", "#f7f7f7");
            svg.append('text')
                .text('No available data')
                .attr('class', 'zero-data')
                .attr('text-anchor', 'middle')
                .attr('x', '50%')
                .attr('y', '50%')
                .attr('font-size', '24px')
                .attr("fill", "#777777");
        }
        mentat.d3ZeroOverlay = d3ZeroOverlay;
        function d3RemoveOverlay(svg) {
            svg
                .attr('transform', svg.attr('invert-transform'))
                .select('.overlay').remove()
                .select('.zer-data').remove();
        }
        mentat.d3RemoveOverlay = d3RemoveOverlay;
        /* Data interpolation for animations */
        function timeInterpolation(data, func) {
            var interpolate = d3.scale
                .linear()
                .domain([0, 1])
                .range([1, data.length + 1]);
            var secondsInDay = 24 * 60 * 60;
            return function (d, i, a) {
                return function (t) {
                    var flooredX = Math.floor(interpolate(t));
                    var interpolatedLine = data.slice(0, flooredX);
                    if (flooredX > 0 && flooredX < data.length) {
                        var weight = interpolate(t) - flooredX;
                        var weightedLineAverage = data[flooredX].y * weight +
                            data[flooredX - 1].y * (1 - weight);
                        var interpolatedDuration = Math.floor((interpolate(t) - 1) * secondsInDay);
                        interpolatedLine.push({
                            x: moment(data[0].x).add(interpolatedDuration, 'seconds').toDate(),
                            y: weightedLineAverage
                        });
                    }
                    return func(interpolatedLine);
                };
            };
        }
        mentat.timeInterpolation = timeInterpolation;
    })(mentat = flipp.mentat || (flipp.mentat = {}));
})(flipp || (flipp = {}));
/// <reference path="../f-mentat.ts"/>
/// <reference path="f-tooltip.ts"/>
/// <reference path="f-d3-helper.ts"/>
var flipp;
(function (flipp) {
    var mentat;
    (function (mentat) {
        var Graph = (function () {
            function Graph(_el) {
                this._el = _el;
            }
            Graph.prototype.detachedCallback = function () { if (this.tooltip)
                this.tooltip.remove(); };
            Object.defineProperty(Graph.prototype, "axes", {
                /* Attributes */
                get: function () {
                    // XXX - this may require some rework
                    var axes = JSON.parse(this._el.getAttribute('axes')) || Graph.AXES;
                    if (typeof axes.y === 'string')
                        return { x: axes.x, y: [axes.y] };
                    else
                        return axes;
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
                this.data = data;
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
            /* Protected */
            Graph.MARGIN = { top: 20, right: 10, bottom: 70, left: 55 };
            Graph.SIZE = { width: 960, height: 480 };
            Graph.AXES = { x: 'key', y: 'value' };
            return Graph;
        })();
        mentat.Graph = Graph;
        mentat.GraphElement = mentat.registerElement('f-graph', HTMLElement, Graph);
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
                if (!this._el)
                    LineGraph.call(this, this);
                this.setup();
            };
            LineGraph.prototype.setup = function () {
                var _this = this;
                this._el.innerHTML = '';
                this.hoverFunc = function (data, axes) {
                    var html = moment(data[axes.x]).format('YYYY-MM-DD') + ':<br>';
                    for (var i = 0; i < axes.y.length; i++)
                        html += "<strong>" + axes.y[i] + "</strong>: " +
                            "<span>" + data[axes.y[i]].y + "</span><br>";
                    return html;
                };
                this.decodeFunc = function (data, axes) {
                    var dataSet = {};
                    for (var i = 0; i < axes.y.length; i++) {
                        var set = [];
                        for (var j = 0; j < data.length; j++) {
                            var item = {};
                            item.x = d3.time.format("%Y%m%d").parse(data[j][axes.x]);
                            item.y = data[j][axes.y[i]];
                            set.push(item);
                        }
                        dataSet[axes.y[i]] = set;
                    }
                    return dataSet;
                };
                var width = this.size.width - this.margin.left - this.margin.right;
                var height = this.size.height - this.margin.top - this.margin.bottom;
                var colors = mentat.d3FlippColors(this.axes.y);
                var svg = mentat.d3SvgBase(this._el, this.size, this.margin);
                var tip = new mentat.Tooltip(svg)
                    .offset([20, 5])
                    .html(function (d) { return _this.hoverFunc(d, _this.axes); });
                this.tooltip = tip;
                /* Render cycle */
                this.render = function () {
                    if (_this.data && _this.data.length > 0) {
                        /* Remove data overlay */
                        mentat.d3RemoveOverlay(svg);
                        svg.selectAll('*').remove();
                        /* Run through decode for each data point */
                        var dataSets = _this.decodeFunc(_this.data, _this.axes);
                        var ext = Object.keys(dataSets).map(function (d) { return dataSets[d]; });
                        var dataDomain = mentat.d3TwoDExtend(ext, 'x');
                        var dataRange = [0, mentat.d3TwoDExtend(ext, 'y')[1]];
                        /* XY scales */
                        var x = mentat.d3TimeScale([0, width], dataDomain);
                        var y = mentat.d3LinearScale([height, 0], dataRange);
                        var customTimeFormat = d3.time.format.multi([
                            [".%L", function (d) { return d.getMilliseconds(); }],
                            [":%S", function (d) { return d.getSeconds(); }],
                            ["%I:%M", function (d) { return d.getMinutes(); }],
                            ["%I %p", function (d) { return d.getHours(); }],
                            ["%a %d", function (d) { return d.getDay() && d.getDate() != 1; }],
                            ["%b %d", function (d) { return d.getDate() != 1; }],
                            ["%B", function (d) { return d.getMonth(); }],
                            ["%Y", function () { return true; }]
                        ]);
                        /* XY axes */
                        svg.append("g")
                            .attr("class", "x axis")
                            .attr("transform", "translate(0, " + height + ")")
                            .call(mentat.d3Axis("bottom", x, {
                            ticks: 6,
                            tickSize: 40,
                            tickFormat: customTimeFormat
                        }));
                        svg.append("g")
                            .attr("class", "y axis")
                            .call(mentat.d3Axis("left", y, {
                            ticks: 4,
                            tickFormat: d3.format("s"),
                            tickPadding: 20,
                            tickSize: 0 - width
                        }));
                        /* Line plotting function */
                        var line = d3.svg
                            .line()
                            .x(function (d) { return x(d.x); })
                            .y(function (d) { return y(d.y); });
                        /* Create sets of lines */
                        for (var key in dataSets) {
                            svg.append("g")
                                .attr("class", "set")
                                .append("path")
                                .attr("class", "line")
                                .style("stroke", colors(key))
                                .transition()
                                .duration(1000)
                                .attrTween("d", mentat.timeInterpolation(dataSets[key], line));
                        }
                        /* Hover functionality */
                        if (_this.hoverFunc) {
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
                            var requiredData = _this.axes.y;
                            svg.append("rect")
                                .attr("class", "overlay")
                                .attr("width", width)
                                .attr("height", height)
                                .style("fill", "none")
                                .style("pointer-events", "all")
                                .on("mouseout", function () {
                                scanner.style("display", "none");
                                tip.hide();
                            })
                                .on("mousemove", function () {
                                var datapoint = {};
                                var val = x.invert(d3.mouse(this)[0]);
                                // construct data point on where our mouse is hovering
                                for (var i = 0; i < requiredData.length; i++) {
                                    var curSet = dataSets[requiredData[i]];
                                    var index = d3.bisector(function (d) { return d.x; })
                                        .left(curSet, val, 1);
                                    var d0 = curSet[index - 1];
                                    var d1 = curSet[index];
                                    // find closest datapoint
                                    datapoint[requiredData[i]] =
                                        val - d0.x > d1.x - val ? d1 : d0;
                                }
                                scanner.style("display", null)
                                    .attr("transform", "translate(" +
                                    x(datapoint[requiredData[0]].x) + ", 0)");
                                point.attr("transform", "translate(0, " +
                                    y(datapoint[requiredData[0]].y) + ")");
                                var pointEl = point[0][0];
                                var position = pointEl.getBoundingClientRect();
                                tip.show([
                                    position.left + window.scrollX,
                                    position.top + window.scrollY
                                ], datapoint);
                            });
                        }
                    }
                    else {
                        /* Data overlay */
                        mentat.d3ZeroOverlay(svg);
                    }
                    return _this._el;
                }; /* Render cycle end */
            };
            ;
            /* Stub */
            LineGraph.prototype.render = function () {
                return this._el;
            };
            return LineGraph;
        })(mentat.Graph);
        mentat.LineGraphElement = mentat.registerElement('f-line-graph', HTMLElement, LineGraph);
    })(mentat = flipp.mentat || (flipp.mentat = {}));
})(flipp || (flipp = {}));
