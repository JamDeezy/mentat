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
            Graph.prototype.fallColor7 = function () {
                return d3.scale.ordinal().range(Graph.FALLPALLET);
            };
            Graph.prototype.flatColor10 = function () {
                return d3.scale.ordinal().range(Graph.FLATPALLET);
            };
            Graph.prototype.materialColor20 = function () {
                return d3.scale.ordinal().range(Graph.MATERIALPALLET);
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
                top: 20, right: 0, bottom: 70, left: 55
            };
            Graph.DIMENSIONS = {
                width: 960, height: 480
            };
            Graph.FLATPALLET = [
                "#3498db", "#1abc9c", "#2ecc71", "#f1c40f", "#e67e22",
                "#e74c3c", "#9b59b6", "#ecf0f1", "#95a5a6", "#34495e"
            ];
            Graph.FALLPALLET = [
                "#98abc5", "#8a89a6", "#7b6888", "#6b486b",
                "#a05d56", "#d0743c", "#ff8c00"
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
