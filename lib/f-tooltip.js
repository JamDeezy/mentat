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
