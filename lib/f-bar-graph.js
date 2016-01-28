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
                            dataDomain = Object.keys(dataSets).sort();
                        }
                        var dataRange = [0, mentat.d3TwoDExtend(ext, 'y1')[1]];
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
                        var colors = mentat.d3FlippColors(_this.axes.y);
                        var svg = mentat.d3SvgBase(_this._el, _this.size, _this.margin);
                        if (!_this.tooltip) {
                            var tip = new mentat.Tooltip(svg)
                                .offset([20, 5])
                                .html(function (d) { return _this.hoverFunc(d); });
                            _this.tooltip = tip;
                        }
                        else {
                            tip = _this.tooltip;
                        }
                        /* XY Scales */
                        var x = mentat.d3OrdinalScale([0, width], dataDomain);
                        var y = mentat.d3LinearScale((_this.vertical) ? [0, height] : [height, 0], (_this.normalized) ? [0, 1] : dataRange);
                        /* XY axes */
                        svg.append("g")
                            .attr("class", "x axis")
                            .attr("transform", (_this.vertical) ?
                            "translate(0, 0)" : "translate(0," + height + ")")
                            .call(mentat.d3Axis((_this.vertical) ? 'left' : 'bottom', x, {
                            tickFormat: function (d) {
                                return (d.length > 11) ? d.substring(0, 5) + '...' : d;
                            }
                        }));
                        svg.append("g")
                            .attr("class", "y axis")
                            .call(mentat.d3Axis((_this.vertical) ? 'top' : 'left', y, {
                            ticks: 4,
                            tickFormat: (_this.normalized) ? d3.format("%") : d3.format("s"),
                            ticketSize: 0 - width
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
                    }
                    else {
                        /* TODO why */
                        if (_this.vertical) {
                            var width = _this.size.height - _this.margin.top - _this.margin.bottom;
                            var height = _this.size.width - _this.margin.left - _this.margin.right;
                        }
                        else {
                            var width = _this.size.width - _this.margin.left - _this.margin.right;
                            var height = _this.size.height - _this.margin.top - _this.margin.bottom;
                        }
                        var svg = mentat.d3SvgBase(_this._el, _this.size, _this.margin);
                        /* Zero data overlay */
                        mentat.d3ZeroOverlay(svg);
                    }
                    return _this._element;
                }; /* Render cycle end */
            };
            /* Stub */
            BarGraph.prototype.render = function () {
                return this._element;
            };
            return BarGraph;
        })(mentat.Graph);
        mentat.BarGraphElement = mentat.registerElement('f-bar-graph', HTMLElement, BarGraph);
    })(mentat = flipp.mentat || (flipp.mentat = {}));
})(flipp || (flipp = {}));
