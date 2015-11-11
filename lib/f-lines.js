/// <reference path="dts/d3.d.ts"/>
/// <reference path="dts/handlebars.d.ts"/>
/// <reference path="dts/jquery.d.ts"/>
/// <reference path="dts/webcomponents.d.ts"/>
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
            var options = {
                prototype: Object.create(elBase.prototype, getFullPrototype(el.prototype))
            };
            if (elExtend)
                options.extends = elExtend;
            return document.registerElement(elName, options);
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
        var Graph = (function () {
            function Graph(_element) {
                this._element = _element;
                this._skipCallback = false;
            }
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
            Object.defineProperty(Graph.prototype, "width", {
                /************ Attributes ************/
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
            Object.defineProperty(Graph.prototype, "cols", {
                get: function () {
                    return this._element.getAttribute('cols').split(',');
                },
                set: function (newCols) {
                    this._element.setAttribute('cols', newCols.join(','));
                },
                enumerable: true,
                configurable: true
            });
            /************ Helpers ************/
            Graph.prototype.translate = function (x, y) {
                return "translate(" + x + "," + y + ")";
            };
            Graph.prototype.flatColor10 = function () {
                return d3.scale.ordinal().range(Graph.FLATPALLET);
            };
            Graph.prototype.materialColor20 = function () {
                return d3.scale.ordinal().range(Graph.MATERIALPALLET);
            };
            Graph.prototype.update = function (hash) {
                // Turn off callback for update
                this._skipCallback = true;
                for (var key in hash) {
                    this._element.setAttribute(key, hash[key]);
                }
                // if source was changed, load
                if (Object.keys(hash).indexOf('src') >= 0) {
                    this.load();
                }
                else {
                    this.render();
                }
                // Turn back on
                this._skipCallback = false;
            };
            /************ CONSTANTS ************/
            Graph.MARGIN = {
                top: 20, right: 100, bottom: 30, left: 50
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
/// <reference path="../f-graph/f-graph.ts"/>
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
                if (!this._linesElement)
                    Lines.call(this, this);
                this._linesElement.innerHTML = '';
                this._linesElement.appendChild(mentat.createDocumentFragment(this._template({})));
                if (this.src) {
                    this.load();
                }
            };
            Lines.prototype.load = function () {
                var _this = this;
                $.ajax({
                    url: this.src,
                    success: function (data) {
                        _this._data = data;
                        _this.render();
                    },
                    error: function (error) {
                        console.error("Error:" + error);
                    }
                });
            };
            Lines.prototype.render = function () {
                var _this = this;
                // Render cycles should be independent of each other
                this._linesElement.innerHTML = '';
                var width = this.innerWidth;
                var height = this.innerHeight;
                var x = d3.time.scale().range([0, width]);
                var y = d3.scale.linear().range([height, 0]);
                var xAxis = d3.svg.axis().scale(x).orient("bottom");
                var yAxis = d3.svg.axis().scale(y).orient("left");
                var line = d3.svg.line()
                    .x(function (d) { return x(d.date); })
                    .y(function (d) { return y(d.value); });
                var svg = d3.select(this._linesElement)
                    .append("svg")
                    .attr("width", this.width)
                    .attr("height", this.height)
                    .append("g")
                    .attr("transform", this.translate(mentat.Graph.MARGIN.left, mentat.Graph.MARGIN.top));
                if (this._data) {
                    var data = d3.csv.parse(this._data);
                    // Different lines are specified as cols
                    var color = this.flatColor10().domain(this.cols);
                    // For line graphs, our key is a time scale (y over time)
                    // Parse time to a javascript acceptable time
                    data.forEach(function (d) {
                        d.date = d3.time.format("%Y%m%d").parse(d[_this.key]);
                    });
                    var sets = color.domain().map(function (col) {
                        return {
                            col: col,
                            values: data.map(function (d) {
                                return { date: d.date, value: +d[col] };
                            })
                        };
                    });
                    x.domain(d3.extent(data, function (d) { return d.date; }));
                    y.domain([
                        d3.min(sets, function (c) {
                            return d3.min(c.values, function (v) { return v.value; });
                        }),
                        d3.max(sets, function (c) {
                            return d3.max(c.values, function (v) { return v.value; });
                        })
                    ]);
                    svg.append("g")
                        .attr("class", "x axis")
                        .attr("transform", this.translate(0, height))
                        .call(xAxis);
                    svg.append("g")
                        .attr("class", "y axis")
                        .call(yAxis);
                    var set = svg.selectAll(".set")
                        .data(sets)
                        .enter().append("g")
                        .attr("class", "set");
                    set.append("path")
                        .attr("class", "line")
                        .attr("d", function (d) { return line(d.values); })
                        .style("stroke", function (d) { return color(d.col); });
                    set.append("text")
                        .datum(function (d) {
                        return { col: d.col, value: d.values[d.values.length - 1] };
                    })
                        .attr("transform", function (d) {
                        return _this.translate(x(d.value.date), y(d.value.value));
                    })
                        .attr("x", 3)
                        .attr("dy", ".35em")
                        .text(function (d) { return d.col; });
                }
            };
            return Lines;
        })(mentat.Graph);
        mentat.LinesElement = mentat.registerElement('f-lines', HTMLElement, Lines);
    })(mentat = flipp.mentat || (flipp.mentat = {}));
})(flipp || (flipp = {}));
