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
        var Bars = (function (_super) {
            __extends(Bars, _super);
            function Bars(_barsElement) {
                _super.call(this, _barsElement);
                this._barsElement = _barsElement;
                this._template = Handlebars.templates['f-bars'];
            }
            Bars.prototype.createdCallback = function () {
                if (!this._barsElement)
                    Bars.call(this, this);
                this._barsElement.innerHTML = '';
                this._barsElement.appendChild(mentat.createDocumentFragment(this._template({})));
                if (this.src) {
                    this.load();
                }
            };
            Object.defineProperty(Bars.prototype, "normalized", {
                get: function () {
                    return this._barsElement.getAttribute('normalized') === 'true';
                },
                set: function (newNormalized) {
                    this._barsElement.setAttribute('normalized', newNormalized.toString());
                },
                enumerable: true,
                configurable: true
            });
            Bars.prototype.load = function () {
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
            Bars.prototype.render = function () {
                var _this = this;
                // Render cycles should be independent of each other
                this._barsElement.innerHTML = '';
                var width = this.innerWidth;
                var height = this.innerHeight;
                var x = d3.scale.ordinal().rangeRoundBands([0, width], .1);
                var y = d3.scale.linear().rangeRound([height, 0]);
                var xAxis = d3.svg.axis().scale(x).orient("bottom");
                var yAxis = d3.svg.axis().scale(y).orient("left");
                var svg = d3.select(this._barsElement)
                    .append("svg")
                    .attr("width", this.width)
                    .attr("height", this.height)
                    .append("g")
                    .attr("transform", this.translate(mentat.Graph.MARGIN.left, mentat.Graph.MARGIN.top));
                if (this._data) {
                    var data = d3.csv.parse(this._data);
                    // Different stacked bars are cols
                    var color = this.flatColor10().domain(this.cols);
                    // Buckets are defined by primary key
                    data.forEach(function (d) {
                        var y0 = 0;
                        d.bucket = d[_this.key];
                        d.groups = color.domain().map(function (col) {
                            return { col: col, y0: y0, y1: y0 += +d[col] };
                        });
                        if (_this.normalized) {
                            d.groups.forEach(function (d) { d.y0 /= y0; d.y1 /= y0; });
                        }
                        else {
                            d.total = d.groups[d.groups.length - 1].y1;
                        }
                    });
                    data.sort(function (a, b) {
                        if (_this.normalized) {
                            return b.groups[0].y1 - a.groups[0].y1;
                        }
                        else {
                            return b.total - a.total;
                        }
                    });
                    x.domain(data.map(function (d) { return d.bucket; }));
                    if (!this.normalized) {
                        y.domain([0, d3.max(data, function (d) { return d.total; })]);
                    }
                    svg.append("g")
                        .attr("class", "x axis")
                        .attr("transform", "translate(0," + height + ")")
                        .call(xAxis);
                    svg.append("g")
                        .attr("class", "y axis")
                        .call(yAxis);
                    var bucket = svg.selectAll(".bucket")
                        .data(data)
                        .enter().append("g")
                        .attr("class", "bucket")
                        .attr("transform", function (d) {
                        return _this.translate(x(d.bucket), 0);
                    });
                    bucket.selectAll("rect")
                        .data(function (d) { return d.groups; })
                        .enter().append("rect")
                        .attr("width", x.rangeBand())
                        .attr("y", function (d) { return y(d.y1); })
                        .attr("height", function (d) { return y(d.y0) - y(d.y1); })
                        .style("fill", function (d) { return color(d.col); });
                }
            };
            return Bars;
        })(mentat.Graph);
        mentat.BarsElement = mentat.registerElement('f-bars', HTMLElement, Bars);
    })(mentat = flipp.mentat || (flipp.mentat = {}));
})(flipp || (flipp = {}));
