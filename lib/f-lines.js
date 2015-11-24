/// <reference path="dts/d3.d.ts"/>
/// <reference path="dts/handlebars.d.ts"/>
/// <reference path="dts/jquery.d.ts"/>
/// <reference path="dts/moment.d.ts"/>
/// <reference path="dts/webcomponents.d.ts"/>
/// <reference path="dts/velocity.d.ts"/>
var flipp;
(function (flipp) {
    var mentat;
    (function (mentat) {
        function getPropertyDescriptor(obj, prop) {
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
                map[prop] = getPropertyDescriptor(proto, prop);
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
        function getChild(parent, selector) {
            return $(parent).find(selector);
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
            function Graph(_element) {
                this._element = _element;
                this.defaultHoverable = false;
                this.defaultSum = false;
                this._skipCallback = false;
            }
            Object.defineProperty(Graph.prototype, "width", {
                /**
                 * Attributes
                 */
                get: function () {
                    var width = this._element.getAttribute('width');
                    return parseInt(width) || Graph.DIMENSIONS.width;
                },
                set: function (newWidth) {
                    this._element.setAttribute('width', newWidth.toString());
                    this._element.style.width = newWidth + 'px';
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Graph.prototype, "height", {
                get: function () {
                    var height = this._element.getAttribute('height');
                    return parseInt(height) || Graph.DIMENSIONS.height;
                },
                set: function (newHeight) {
                    this._element.setAttribute('height', newHeight.toString());
                    this._element.style.height = newHeight + 'px';
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Graph.prototype, "src", {
                get: function () {
                    return this._element.getAttribute('src');
                },
                set: function (newSrc) {
                    this._element.setAttribute('src', newSrc);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Graph.prototype, "innerWidth", {
                get: function () {
                    return this.width - Graph.MARGIN.left - Graph.MARGIN.right;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Graph.prototype, "innerHeight", {
                get: function () {
                    return this.height - Graph.MARGIN.top - Graph.MARGIN.bottom;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Graph.prototype, "key", {
                get: function () {
                    return this._element.getAttribute('key');
                },
                set: function (newKey) {
                    this._element.setAttribute('key', newKey);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Graph.prototype, "columns", {
                get: function () {
                    return this._element.getAttribute('columns').split(',');
                },
                set: function (newCols) {
                    this._element.setAttribute('columns', newCols.join(','));
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Graph.prototype, "hoverable", {
                get: function () {
                    var hoverable = this._element.getAttribute('hoverable');
                    return (hoverable) ? hoverable === 'true' : this.defaultHoverable;
                },
                set: function (newHoverable) {
                    this._element.setAttribute('hoverable', newHoverable.toString());
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Graph.prototype, "sum", {
                get: function () {
                    var sum = this._element.getAttribute('sum');
                    return (sum) ? sum === 'true' : this.defaultSum;
                },
                set: function (newSum) {
                    this._element.setAttribute('sum', newSum.toString());
                },
                enumerable: true,
                configurable: true
            });
            Graph.prototype.attributeChangedCallback = function (attr, old, value) {
                if (!this._skipCallback) {
                    if (attr == 'src') {
                        this.load();
                    }
                    else {
                        this.render();
                    }
                }
            };
            /**
             * Helpers
             */
            Graph.prototype.translate = function (x, y) {
                return "translate(" + x + "," + y + ")";
            };
            Graph.prototype.get = function (url) {
                return new Promise(function (resolve, reject) {
                    $.ajax({
                        url: url,
                        complete: function (response) {
                            if (response.responseJSON)
                                resolve(response.responseJSON);
                            else if (response.responseText)
                                resolve(response.responseText);
                            else
                                console.error("Bad response!");
                        },
                        error: function (error) {
                            reject(error);
                        }
                    });
                });
            };
            Graph.prototype.skipCallback = function (block) {
                this._skipCallback = true;
                block();
                this._skipCallback = false;
            };
            Graph.prototype.flatColor10 = function () {
                return d3.scale.ordinal().range(Graph.FLATPALLET);
            };
            Graph.prototype.materialColor20 = function () {
                return d3.scale.ordinal().range(Graph.MATERIALPALLET);
            };
            Graph.prototype.d3 = function () {
            };
            Graph.prototype.hover = function (func) {
                this.hoverHtml = func;
                return this._element;
            };
            Graph.prototype.decode = function (func) {
                this.decodeData = func;
                return this._element;
            };
            Graph.prototype.update = function (hash) {
                var _this = this;
                this.skipCallback(function () {
                    for (var key in hash) {
                        _this._element.setAttribute(key, hash[key]);
                    }
                    // if source was changed, load
                    if (Object.keys(hash).indexOf('src') >= 0) {
                        _this.load();
                    }
                    else {
                        _this.render();
                    }
                });
                return this._element;
            };
            Graph.prototype.load = function (param) {
                var _this = this;
                // default is load from this.Src
                if (typeof param === 'undefined') {
                    this.get(this.src).then(function (d) {
                        if (typeof d === 'string') {
                            _this.data = d3.csv.parse(d);
                        }
                        else {
                            _this.data = d;
                        }
                        _this.render();
                    });
                }
                else if (typeof param === 'string') {
                    if (/^(https?|ftp):\/\/[^\s\/$.?#].[^\s]*$/.test(param)) {
                        this.get(param).then(function (d) {
                            _this.data = d3.csv.parse(d);
                            _this.skipCallback(function () { _this.src = param; });
                            _this.render();
                        });
                    }
                    else {
                        this.data = d3.csv.parse(param);
                        this.render();
                    }
                }
                else if (typeof param === 'object') {
                    this.data = param;
                    this.render();
                }
                else {
                    console.error("Invalid data type!");
                }
                return this._element;
            };
            Graph.prototype.download = function (csv) {
                var _this = this;
                var csv = (typeof csv === 'undefined') ? true : csv;
                if (csv && typeof this.data !== 'string') {
                    // collect headers with key as first column
                    var headers = Object.keys(this.data[0]).filter(function (d) {
                        return (d !== _this.key);
                    });
                    headers.unshift(this.key);
                    // collect body
                    var body = this.data.map(function (row) {
                        return headers.map(function (header) {
                            return '"' + (row[header] || '') + '"';
                        });
                    });
                    body.unshift(headers);
                    return body.join('\r\n');
                }
                else {
                    return this.data;
                }
            };
            /**
             * CONSTANTS
             */
            Graph.MARGIN = {
                top: 20, right: 0, bottom: 70, left: 45
            };
            Graph.DIMENSIONS = {
                width: 960, height: 480
            };
            Graph.FLATPALLET = [
                "#3498db", "#1abc9c", "#2ecc71", "#f1c40f", "#e67e22",
                "#e74c3c", "#9b59b6", "#ecf0f1", "#95a5a6", "#34495e"
            ];
            Graph.MATERIALPALLET = [
                "#f44336", "#e91e63", "#9c27b0", "#673ab7", "#3f51b5",
                "#2196f3", "#03a9f4", "#00bcd4", "#009688", "#4caf50",
                "#8bc34a", "#cddc39", "#ffeb3b", "#ffc107", "#ff9800",
                "#ff5722", "#795548", "#9e9e9e", "#607d8b", "#ffffff"
            ];
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
                this._position = [0, 0];
                this._parent = parent;
                this._appendTooltipNode();
                return this;
            }
            Tooltip.prototype.show = function (v, d) {
                this._node.innerHTML = this._html(d);
                if (!(this._position[0] === v[0] && this._position[1] === v[1])) {
                    this._position = v;
                    this._node.style.left = (v[0] + this._offset[0]) + 'px';
                    this._node.style.top = (v[1] + this._offset[1]) + 'px';
                    this._node.style.opacity = '1';
                }
                return this;
            };
            Tooltip.prototype.hide = function () {
                this._node.style.opacity = '0';
                return this;
            };
            Tooltip.prototype.offset = function (v) {
                this._offset = v;
                return this;
            };
            Tooltip.prototype.html = function (v) {
                this._html = v;
                return this;
            };
            Tooltip.prototype.remove = function () {
                this._node.parentElement.removeChild(this._node);
                return this;
            };
            // TODO
            Tooltip.prototype.direction = function (v) {
                this._direction = v;
                return this;
            };
            Tooltip.prototype._appendTooltipNode = function () {
                this._node = document.createElement('div');
                this._node.className = 'tooltip';
                this._node.style.opacity = '0';
                this._node.appendChild;
                document.body.appendChild(this._node);
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
        var Lines = (function (_super) {
            __extends(Lines, _super);
            function Lines(_linesElement) {
                _super.call(this, _linesElement);
                this._linesElement = _linesElement;
                this._template = Handlebars.templates['f-lines'];
            }
            Lines.prototype.createdCallback = function () {
                var _this = this;
                if (!this._linesElement)
                    Lines.call(this, this);
                this._linesElement.innerHTML = '';
                this._linesElement.appendChild(mentat.createDocumentFragment(this._template({})));
                /* overwrite hoverable+sum default to true */
                this.defaultHoverable = true;
                this.defaultSum = true;
                /* default hover content */
                this.hover(function (d) {
                    var html = "<h4>" + moment(d.data.date).format("MMM Do YY") + "</h4>";
                    for (var i = 0; i < _this.columns.length; i++) {
                        var data = d.data[_this.columns[i]];
                        html += "<strong>" + _this.columns[i] + "</strong>: " +
                            "<span style='color:red'>" + data + "</span><br>";
                    }
                    return html;
                }).decode(function (d) {
                    d.date = d3.time.format("%Y-%m-%d").parse(d[_this.key]);
                    return d;
                });
                if (this.src)
                    this.load();
            };
            Lines.prototype.render = function () {
                var _this = this;
                this._linesElement.innerHTML = '';
                var width = this.innerWidth;
                var height = this.innerHeight;
                var line = d3.svg.line()
                    .x(function (d) { return x(d.date); })
                    .y(function (d) { return y(d.value); });
                var svg = d3.select(this._linesElement)
                    .append("svg")
                    .attr("width", this.width)
                    .attr("height", this.height)
                    .append("g")
                    .attr("transform", this.translate(mentat.Graph.MARGIN.left, mentat.Graph.MARGIN.top));
                if (this.data) {
                    var data = $.extend(true, [], this.data);
                    var color = this.flatColor10().domain((this.sum) ? ["sum"] : this.columns);
                    // Let decode our data
                    data.forEach(function (d) { d = _this.decodeData(d); });
                    // if we're summing, add all columns together under sum key
                    // otherwise each column has a key to its value
                    var sets = color.domain().map(function (column) {
                        return {
                            column: (_this.sum) ? "sum" : column,
                            values: data.map(function (d) {
                                if (_this.sum) {
                                    var sum = 0, i = 0;
                                    for (; i < _this.columns.length; sum += +d[_this.columns[i++]])
                                        ;
                                    return { date: d.date, value: d3.round(sum, 2), source: d };
                                }
                                else {
                                    return { date: d.date, value: +d[column], source: d };
                                }
                            })
                        };
                    });
                    var x = d3.time.scale().range([0, width])
                        .domain(d3.extent(data, function (d) { return d.date; }));
                    var y = d3.scale.linear().range([height, 0])
                        .domain([0,
                        1.2 * d3.max(sets, function (c) {
                            return d3.max(c.values, function (v) { return v.value; });
                        })
                    ]);
                    var xAxis = d3.svg.axis().scale(x).orient("bottom")
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
                    var yAxis = d3.svg.axis().scale(y).orient("left")
                        .ticks(4)
                        .tickFormat(d3.format("s"))
                        .tickPadding(20)
                        .tickSize(0 - width);
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
                        .attr("d", function (d) {
                        return line(d.values);
                    })
                        .style("stroke", function (d) { return color(d.column); });
                    if (this.hoverable) {
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
                        var tip = new mentat.Tooltip(svg)
                            .offset([20, 5])
                            .html(function (d) { return _this.hoverHtml(d.source); });
                        // remove if it exists
                        if (this._tip)
                            this._tip.remove();
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
                        }).on("mousemove", function () {
                            // find closes datapoint to our left
                            var date = x.invert(d3.mouse(this)[0]);
                            var i = d3.bisector(function (d) { return d.date; })
                                .left(sets[0].values, date, 1);
                            var d0 = sets[0].values[i - 1];
                            var d1 = sets[0].values[i];
                            var d = date - d0.date > d1.date - date ? d1 : d0;
                            scanner.style("display", null)
                                .attr("transform", "translate(" + x(d.date) + ", 0)");
                            point.attr("transform", "translate(0, " + y(d.value) + ")");
                            var position = $(point[0][0]).offset();
                            tip.show([position.left, position.top], d);
                        });
                    }
                }
            };
            return Lines;
        })(mentat.Graph);
        mentat.LinesElement = mentat.registerElement('f-lines', HTMLElement, Lines);
    })(mentat = flipp.mentat || (flipp.mentat = {}));
})(flipp || (flipp = {}));
