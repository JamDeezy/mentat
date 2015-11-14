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
                this._skipCallback = false;
                /************ SETTINGS ************/
                this.HOVERABLE = false;
                this.SUM = false;
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
                    return (hoverable) ? hoverable === 'true' : this.HOVERABLE;
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
                    return (sum) ? sum === 'true' : this.SUM;
                },
                set: function (newSum) {
                    this._element.setAttribute('sum', newSum.toString());
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
                if (!(this._position[0] === v[0] || this._position[1] === v[1])) {
                    this._position = v;
                    this._node.innerHTML = this._html(d);
                    var offset = $(this._parent[0][0]).offset();
                    var dimensions = [this._node.offsetWidth, this._node.offsetHeight];
                    this._node.style.display = 'block';
                    this._node.style.left = (v[0] + this._offset[0] +
                        offset.left + 30) + 'px';
                    this._node.style.top = (v[1] + this._offset[1] +
                        offset.top - dimensions[1] / 2) + 'px';
                }
                return this;
            };
            Tooltip.prototype.hide = function () {
                this._node.style.display = 'none';
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
            // TODO
            Tooltip.prototype.direction = function (v) {
                this._direction = v;
                return this;
            };
            Tooltip.prototype._appendTooltipNode = function () {
                this._node = document.createElement('div');
                this._node.className = 'tooltip';
                this._node.appendChild;
                document.body.appendChild(this._node);
            };
            return Tooltip;
        })();
        mentat.Tooltip = Tooltip;
    })(mentat = flipp.mentat || (flipp.mentat = {}));
})(flipp || (flipp = {}));
