/// <reference path="dts/d3.d.ts"/>
/// <reference path="dts/mentat.d.ts"/>
var mentat;
(function (mentat) {
    /**
     * Helpers
     */
    function createDocumentFragment(html) {
        return document.createRange().createContextualFragment(html);
    }
    mentat.createDocumentFragment = createDocumentFragment;
    /*
     * http://stackoverflow.com/questions/4340227
     */
    function alphanumCompare(a, b) {
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
    mentat.alphanumCompare = alphanumCompare;
    function naturalCompare(a, b) {
        var ax = [], bx = [];
        a.replace(/(\d+)|(\D+)/g, function (_, $1, $2) {
            ax.push([$1 || Infinity, $2 || ""]);
        });
        b.replace(/(\d+)|(\D+)/g, function (_, $1, $2) {
            bx.push([$1 || Infinity, $2 || ""]);
        });
        while (ax.length && bx.length) {
            var an = ax.shift();
            var bn = bx.shift();
            var nn = (an[0] - bn[0]) || an[1].localeCompare(bn[1]);
            if (nn)
                return nn;
        }
        return ax.length - bx.length;
    }
    mentat.naturalCompare = naturalCompare;
    function warn(str) {
        console.warn("MENTAT: " + str);
    }
    mentat.warn = warn;
    function error(str) {
        throw "MENTAT: " + str;
    }
    mentat.error = error;
})(mentat || (mentat = {}));
/**
 * http://codereview.stackexchange.com/questions/83717
 */
Array.prototype.unique = function () {
    var seen = {};
    return this.filter(function (x) {
        if (seen[x])
            return;
        seen[x] = true;
        return x;
    });
};
/**
 * http://stackoverflow.com/questions/27266550
 */
Array.prototype.flatten = function () {
    var toString = Object.prototype.toString;
    var arrayTypeStr = '[object Array]';
    var result = [];
    var nodes = this.slice();
    var node;
    if (!this.length) {
        return result;
    }
    node = nodes.pop();
    do {
        if (toString.call(node) === arrayTypeStr) {
            nodes.push.apply(nodes, node);
        }
        else {
            result.push(node);
        }
    } while (nodes.length && (node = nodes.pop()) !== undefined);
    result.reverse();
    return result;
};
Array.prototype.sum = function (prop) {
    var total = 0;
    for (var i = 0, _len = this.length; i < _len; i++) {
        total += this[i][prop];
    }
    return total;
};
// TODO
// API + documentation
// pagnation
// TODO dashboard
// deep linking state
// - move all of the required hash params into a single structure
// - find a way to convert that hash data into a string and then into a
//   hash id
// - perform auto start up query (+ loader) if hashid is legit, otherwise clear 
/// <reference path="mentat.ts"/>
var mentat;
(function (mentat) {
    function chart(config) {
        return new Chart(config);
    }
    mentat.chart = chart;
    var Chart = (function () {
        function Chart(config) {
            this.build(config);
            this.config = config;
            return this;
        }
        Chart.prototype.build = function (config) {
            var parent = d3.select(config.selector);
            this.buildAxes(config);
            this.parent = parent;
        };
        Chart.prototype.buildAxes = function (config) {
            if (typeof config.axis.x === 'string') {
                var domain = d3.extent(config.data, function (d) { return d[config.axis.x]; });
                var scale = Chart.scale({
                    type: 'linear',
                    range: [0, 100],
                    domain: domain,
                });
                var x = Chart.axis({
                    orient: 'bottom',
                    scale: scale
                });
            }
            else {
                // set important variables
                Chart.axis(config.axis.x);
            }
            if (typeof config.axis.x === 'string') {
                var range = d3.extent(config.data, function (d) { return d[config.axis.y]; });
                var scale = Chart.scale({
                    type: 'linear',
                    range: range,
                    domain: [0, 1],
                });
                var y = Chart.axis({
                    orient: 'bottom',
                    scale: scale
                });
            }
            else {
                Chart.axis(config.axis.x);
            }
        };
        return Chart;
    })();
    var Chart;
    (function (Chart) {
        function body(config) {
            return new Body(config);
        }
        Chart.body = body;
        var Body = (function () {
            function Body(config) {
                this.build(config);
                this.config = config;
                return this;
            }
            Body.prototype.build = function (config) {
                var body;
            };
            return Body;
        })();
        function axis(config) {
            return new Axis(config);
        }
        Chart.axis = axis;
        var Axis = (function () {
            function Axis(config) {
                this.build(config);
                this.config = config;
                return this;
            }
            Axis.prototype.build = function (config) {
                var axis;
                // Create svg axis
                axis = d3.svg
                    .axis()
                    .orient(config.orient)
                    .scale(config.scale.origin);
                for (var key in config.format) {
                    axis[key](config.format[key]);
                }
                this.origin = axis;
            };
            return Axis;
        })();
        function scale(config) {
            return new Scale(config);
        }
        Chart.scale = scale;
        var Scale = (function () {
            function Scale(config) {
                this.build(config);
                this.config = config;
                return this;
            }
            Scale.prototype.build = function (config) {
                var scale;
                // Look through types and build the corresponding scale
                switch (config.type) {
                    case 'date':
                        scale = d3.time.scale();
                        break;
                    case 'linear':
                        scale = d3.scale.linear();
                        break;
                    case 'ordinal':
                        scale = d3.scale.ordinal();
                        break;
                    default:
                        mentat.error('Unknown scale type ' + config.type + '!');
                }
                scale
                    .domain(config.domain)
                    .range(config.range);
                for (var key in config.format) {
                    scale[key](config.format[key]);
                }
                this.origin = scale;
            };
            return Scale;
        })();
    })(Chart || (Chart = {}));
})(mentat || (mentat = {}));
/// <reference path="mentat.ts"/>
var mentat;
(function (mentat) {
    /*
     * Main constructor
     *
     * @param config<mentat.Table.config> - Main argument hash
     * @return Table
     */
    function table(config) {
        return new Table(config);
    }
    mentat.table = table;
    /**
     * TABLLLLLLLLLLLLE
     */
    var Table = (function () {
        /*
         *
         */
        function Table(config) {
            this.parent = document.querySelector(config.selector);
            this.build(config);
            return this;
        }
        /*
         * lol
         */
        Table.prototype.build = function (config) {
            // process data
            var data = this.buildDataSet(config);
            // collect all headers from entire data set
            // TODO: stress test this and see if it'll take too long
            var headers = config.headers ||
                data.map(function (d) { return Object.keys(d); })
                    .flatten()
                    .unique();
            // save config
            this.config = config;
            // create table element
            this.table = document.createElement('table');
            this.table.className = 'mentat';
            // generate sub-structures body and head
            this.thead = this.buildTableHead(config);
            this.tbody = this.buildTableBody(data, config);
            // modify table based on user requests
            this.customize(this.tbody, data, config);
            // append everything together
            this.table.appendChild(this.thead);
            this.table.appendChild(this.tbody);
            this.parent.appendChild(this.table);
        };
        /*
         *
         */
        Table.prototype.buildDataSet = function (config) {
            var keys = config.keys;
            var data = config.data;
            var headers = config.headers;
            // if keys are not defined, return data
            if (typeof keys === 'undefined' || keys.length === 0) {
                return data;
            }
            // iterate through data set and populate dataKeyHash
            var dataKeyHash = {};
            for (var i = 0; i < data.length; i++) {
                // generate key in format of key1|key2...
                var dataKey = keys.map(function (d) { return data[i][d]; })
                    .join("|");
                // if dataKey does not exist yet in dataKeyHash
                if (typeof dataKeyHash[dataKey] !== 'undefined') {
                    // for each key thats not part of the defined key set
                    for (var j = 0; j < headers.length; j++)
                        if (keys.indexOf(headers[j]) < 0) {
                            dataKeyHash[dataKey][headers[j]] += +data[i][headers[j]];
                        }
                }
                else {
                    // else add dataKey in dataKeyHash
                    dataKeyHash[dataKey] = data[i];
                }
            }
            // turn dataKeyHash values into array
            var dataSet = [];
            for (var key in dataKeyHash) {
                dataSet.push(dataKeyHash[key]);
            }
            return dataSet;
        };
        /*
         *
         */
        Table.prototype.buildTableHead = function (config) {
            var headers = config.headers;
            var tableHead = document.createElement('thead');
            var tableHeaderRow = document.createElement('tr');
            // iterate over each header
            for (var i = 0; i < headers.length; i++) {
                var tableHeading = document.createElement('th');
                tableHeading.innerHTML = headers[i];
                tableHeaderRow.appendChild(tableHeading);
            }
            tableHead.appendChild(tableHeaderRow);
            return tableHead;
        };
        /*
         *
         */
        Table.prototype.buildTableBody = function (data, config) {
            var headers = config.headers;
            var tableBody = document.createElement('tbody');
            // iterate over all data rows
            for (var i = 0; i < data.length; i++) {
                var tableBodyRow = this.hashToRow(headers, data[i]);
                tableBody.appendChild(tableBodyRow);
            }
            return tableBody;
        };
        /*
         *
         */
        Table.prototype.customize = function (tbody, data, config) {
            // Custom columns
            var rowNodes = tbody.childNodes;
            for (var i = 0; i < rowNodes.length; i++) {
                // iterate through cells on row for callbacks
                var cellNodes = rowNodes[i].childNodes;
                for (var j = 0; j < cellNodes.length; j++) {
                    if (typeof config.cols[j] === 'function') {
                        var value = config.cols[j](data[i][config.headers[j]]);
                        if (typeof value === 'string') {
                            cellNodes[j].innerHTML = value;
                        }
                        else {
                            rowNodes[i].replaceChild(value, cellNodes[j]);
                        }
                    }
                }
            }
            // Custom rows
            // TODO: hash is orderless
            // TODO: negatives
            for (var rowNum in config.rows) {
                var rowContent = config.rows[rowNum];
                var row = document.createElement('tr');
                // string could be special types or one long node
                if (typeof rowContent === 'string') {
                    if (rowContent === 'total') {
                        var total = this.total();
                        row = this.hashToRow(config.headers, total);
                    }
                    else {
                        var node = document.createElement('td');
                        node.colSpan = config.headers.length;
                        node.innerHTML = rowContent;
                        row.appendChild(node);
                    }
                }
                else if (typeof rowContent === 'function') {
                    row.innerHTML = rowContent(data);
                }
                else {
                    mentat.warn("Row " + rowNum + " has a unknown type");
                }
                tbody.insertBefore(row, rowNodes[rowNum]);
            }
        };
        /*
         * Transform a hash into a row based on the table's headers
         * Missing headers will be populated with a '-' string
         *
         * @param headers<string[]> - Table's headers
         * @param hash<any?> - An object with key value pairs
         * @return HTMLTableRowElement
         */
        Table.prototype.hashToRow = function (headers, hash) {
            var row = document.createElement('tr');
            for (var i = 0; i < headers.length; i++) {
                var node = document.createElement('td');
                node.innerHTML =
                    (typeof hash[headers[i]] === 'undefined') ?
                        '-' : hash[headers[i]];
                row.appendChild(node);
            }
            return row;
        };
        /*
         * External API
         */
        Table.prototype.sort = function (colNum, desc) {
            var tbody = this.tbody;
            var config = this.config;
            var order = desc ? -1 : 1;
            // rowArray is the list of nodes that are static (i.e total),
            //   the other indices will be filled with placeholders (-1)
            // sortArray contains the list of nodes that aren't static
            var rowArray = [].slice.call(tbody.childNodes), sortArray = [];
            var customIndices = Object.keys(config.rows);
            for (var i = 0; tbody.firstChild; i++) {
                var child = tbody.removeChild(tbody.firstChild);
                if (customIndices.indexOf(i.toString()) < 0) {
                    sortArray.push(child);
                    rowArray[i] = -1; // placeholder
                }
            }
            // sortArray is to be sorted outside the static rows
            sortArray.sort(function (a, b) {
                return order * mentat.alphanumCompare(a.childNodes[colNum].innerText, b.childNodes[colNum].innerText);
            });
            // merge the two arrays back together, replacing placeholder
            // with the sorted values from sortArray
            for (var i = 0, j = 0; j < sortArray.length; j++) {
                for (; rowArray[i] != -1; i++)
                    ;
                rowArray[i] = sortArray[j];
            }
            // append the merged results back into table
            for (var i = 0; i < rowArray.length; i++) {
                tbody.appendChild(rowArray[i]);
            }
            return this;
        };
        /*
         *
         */
        Table.prototype.total = function () {
            var config = this.config;
            var data = config.data;
            var totalRow = {};
            for (var i = 0; i < config.headers.length; i++) {
                var sum = Math.round(100 * data.sum(config.headers[i])) / 100;
                totalRow[config.headers[i]] = isNaN(sum) ? '' : '' + sum;
            }
            return totalRow;
        };
        return Table;
    })();
})(mentat || (mentat = {}));
