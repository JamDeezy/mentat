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
            Graph.prototype.hover = function (h) {
                this.hoverHtml = h;
                return this._element;
            };
            Graph.prototype.decode = function (d) {
                this.decodeData = d;
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
            /**
             * CONSTANTS
             */
            Graph.MARGIN = {
                top: 20, right: 100, bottom: 30, left: 70
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
                /* overwrite hoverable+sum default to true */
                this.defaultHoverable = true;
                /**/
                this.hover(function (d) {
                    var html = "";
                    for (var i = 0; i < d.sets.length; i++) {
                        var set = d.sets[i];
                        html +=
                            "<strong style='color:" + set.color + "'>"
                                + set.column + "</strong>" + ": <span style='color:red'>" +
                                Math.round((set.y1 - set.y0) * 100) / 100 + "</span><br>";
                    }
                    return html;
                }).decode(function (d) {
                    return d;
                });
                if (this.src)
                    this.load();
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
                if (this.data) {
                    var data = this.data.slice();
                    var color = this.flatColor10().domain(this.columns);
                    // TODO this isn't up to par with lines
                    // Buckets are defined by primary key
                    data.forEach(function (d) {
                        // data decoder
                        d = _this.decodeData(d);
                        var y0 = 0;
                        d.bucket = d[_this.key];
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
                            });
                        }
                        else {
                            d.total = d.sets[d.sets.length - 1].y1;
                        }
                    });
                    data.sort(function (a, b) {
                        if (_this.normalized) {
                            return b.sets[0].y1 - a.sets[0].y1;
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
                    // Draw bars
                    var bucket = svg.selectAll(".bucket")
                        .data(data)
                        .enter()
                        .append("g")
                        .attr("class", "bucket")
                        .attr("transform", function (d) {
                        return _this.translate(x(d.bucket), 0);
                    });
                    bucket.selectAll("rect")
                        .data(function (d) { return d.sets; })
                        .enter()
                        .append("rect")
                        .attr("class", "set")
                        .attr("width", x.rangeBand())
                        .attr("y", function (d) { return y(d.y1); })
                        .attr("height", function (d) { return y(d.y0) - y(d.y1); })
                        .style("fill", function (d) { return d.color; });
                    // Hover functionality
                    if (this.hoverable) {
                        if (this._tip) {
                            this._tip.remove();
                            this._tip = new mentat.Tooltip(svg)
                                .html(function (d) { return _this.hoverHtml(d); });
                        }
                        // TODO position not quite right
                        bucket.on("mouseover", function (d) {
                            _this._tip.show(d3.mouse(svg[0][0]), d);
                        }).on("mouseout", function () {
                            _this._tip.hide();
                        });
                    }
                }
            };
            return Bars;
        })(mentat.Graph);
        mentat.BarsElement = mentat.registerElement('f-bars', HTMLElement, Bars);
    })(mentat = flipp.mentat || (flipp.mentat = {}));
})(flipp || (flipp = {}));
