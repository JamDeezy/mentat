// /// <reference path="mentat.ts"/>

// declare module mentat {
//   module Table {
//     interface config {
//       data: any[],
//       headers: string[],
//       keys: string[],
//       selector: string,
//       cols?: any,
//       rows?: any
//     }
//   }
// }

// module mentat {

//   /*
//    * Main constructor
//    *
//    * @param config<mentat.Table.config> - Main argument hash
//    * @return Table
//    */
//   export function table(config: mentat.Table.config): Table {
//     return new Table(config);
//   }

//   /**
//    * TABLLLLLLLLLLLLE
//    */
//   class Table {
//     private parent: HTMLElement;
//     private table: HTMLElement;
//     private thead: HTMLElement;
//     private tbody: HTMLElement;
//     private config: mentat.Table.config;

//     /*
//      *
//      */
//     constructor(config: mentat.Table.config) {
//       this.parent = <HTMLElement>document.querySelector(config.selector);
//       this.build(config);

//       return this;
//     }

//     /*
//      * lol
//      */
//     private build(config: mentat.Table.config) {
//       // process data
//       var data = this.buildDataSet(config);

//       // collect all headers from entire data set
//       // TODO: stress test this and see if it'll take too long
//       var headers = config.headers ||
//         data.map(function(d) { return Object.keys(d) })
//           .flatten()
//           .unique();

//       // save config
//       this.config = config;

//       // create table element
//       this.table = document.createElement('table');
//       this.table.className = 'mentat';

//       // generate sub-structures body and head
//       this.thead = this.buildTableHead(config);
//       this.tbody = this.buildTableBody(data, config);

//       // modify table based on user requests
//       this.customize(this.tbody, data, config);

//       // append everything together
//       this.table.appendChild(this.thead);
//       this.table.appendChild(this.tbody);
//       this.parent.appendChild(this.table);
//     }


//     /*
//      *
//      */
//     private buildDataSet(config: mentat.Table.config) {
//       var keys = config.keys;
//       var data = config.data;
//       var headers = config.headers;

//       // if keys are not defined, return data
//       if (typeof keys === 'undefined' || keys.length === 0) {
//         return data;
//       }

//       // iterate through data set and populate dataKeyHash
//       var dataKeyHash = {};
//       for (var i = 0; i < data.length; i++) {
//         // generate key in format of key1|key2...
//         var dataKey =
//           keys.map(function(d) { return data[i][d] })
//             .join("|");

//         // if dataKey does not exist yet in dataKeyHash
//         if (typeof dataKeyHash[dataKey] !== 'undefined') {
//           // for each key thats not part of the defined key set
//           for (var j = 0; j < headers.length; j++)
//             if (keys.indexOf(headers[j]) < 0) {
//               dataKeyHash[dataKey][headers[j]] += +data[i][headers[j]];
//             }

//         } else {
//           // else add dataKey in dataKeyHash
//           dataKeyHash[dataKey] = data[i];
//         }
//       }

//       // turn dataKeyHash values into array
//       var dataSet = [];
//       for (var key in dataKeyHash) {
//         dataSet.push(dataKeyHash[key]);
//       }

//       return dataSet
//     }



//     /*
//      *
//      */
//     private buildTableHead(config: mentat.Table.config) {
//       var headers = config.headers;
//       var tableHead = document.createElement('thead');
//       var tableHeaderRow = document.createElement('tr');

//       // iterate over each header
//       for (var i = 0; i < headers.length; i++) {
//         var tableHeading = document.createElement('th');
//         tableHeading.innerHTML = headers[i];
//         tableHeaderRow.appendChild(tableHeading)
//       }

//       tableHead.appendChild(tableHeaderRow);
//       return tableHead;
//     }


//     /*
//      *
//      */
//     private buildTableBody(data: any[], config: mentat.Table.config) {
//       var headers = config.headers;
//       var tableBody = document.createElement('tbody');

//       // iterate over all data rows
//       for (var i = 0; i < data.length; i++) {
//         var tableBodyRow = this.hashToRow(headers, data[i]);
//         tableBody.appendChild(tableBodyRow);
//       }

//       return tableBody;
//     }

//     /*
//      *
//      */
//     private customize(tbody: HTMLElement, data: any[], config: mentat.Table.config) {
//       // Custom columns
//       var rowNodes = tbody.childNodes;
//       for (var i = 0; i < rowNodes.length; i++) {

//         // iterate through cells on row for callbacks
//         var cellNodes = rowNodes[i].childNodes;
//         for (var j = 0; j < cellNodes.length; j++) {
//           if (typeof config.cols[j] === 'function') {
//             var value = config.cols[j](data[i][config.headers[j]]);

//             if (typeof value === 'string') {
//               (<HTMLElement>cellNodes[j]).innerHTML = value;
//             } else {
//               rowNodes[i].replaceChild(value, cellNodes[j]);
//             }
//           }
//         }
//       }

//       // Custom rows
//       // TODO: hash is orderless
//       // TODO: negatives
//       for (var rowNum in config.rows) {
//         var rowContent = config.rows[rowNum];
//         var row = document.createElement('tr');

//         // string could be special types or one long node
//         if (typeof rowContent === 'string') {
//           if (rowContent === 'total') {
//             var total = this.total();
//             row = this.hashToRow(config.headers, total);
//           } else {
//             var node = document.createElement('td');
//             node.colSpan = config.headers.length;
//             node.innerHTML = rowContent;

//             row.appendChild(node);
//           }

//           // function should return after getting all data
//           // NOTE: innerHTML is less efficient than documentfragment
//           // but for some reason <td> doesn't work in docfrag
//         } else if (typeof rowContent === 'function') {
//           row.innerHTML = rowContent(data);

//         } else {
//           warn("Row " + rowNum + " has a unknown type");
//         }

//         tbody.insertBefore(row, rowNodes[rowNum]);
//       }
//     }


//     /*
//      * Transform a hash into a row based on the table's headers
//      * Missing headers will be populated with a '-' string
//      *
//      * @param headers<string[]> - Table's headers
//      * @param hash<any?> - An object with key value pairs
//      * @return HTMLTableRowElement
//      */
//     private hashToRow(headers: string[], hash: any): HTMLTableRowElement {
//       var row = document.createElement('tr');

//       for (var i = 0; i < headers.length; i++) {
//         var node = document.createElement('td');
//         node.innerHTML =
//           (typeof hash[headers[i]] === 'undefined') ?
//             '-' : hash[headers[i]];

//         row.appendChild(node);
//       }

//       return row;
//     }

//     /*
//      * External API
//      */
//     public sort(colNum: number, desc: boolean) {
//       var tbody = this.tbody;
//       var config = this.config;
//       var order = desc ? -1 : 1;

//       // rowArray is the list of nodes that are static (i.e total),
//       //   the other indices will be filled with placeholders (-1)
//       // sortArray contains the list of nodes that aren't static
//       var rowArray = [].slice.call(tbody.childNodes), sortArray = [];
//       var customIndices = Object.keys(config.rows);
//       for (var i = 0; tbody.firstChild; i++) {
//         var child = tbody.removeChild(tbody.firstChild)

//         if (customIndices.indexOf(i.toString()) < 0) {
//           sortArray.push(child);
//           rowArray[i] = -1; // placeholder
//         }
//       }

//       // sortArray is to be sorted outside the static rows
//       sortArray.sort(function(a, b) {
//         return order * alphanumCompare(
//           a.childNodes[colNum].innerText,
//           b.childNodes[colNum].innerText
//         );
//       });

//       // merge the two arrays back together, replacing placeholder
//       // with the sorted values from sortArray
//       for (var i = 0, j = 0; j < sortArray.length; j++) {
//         for (; rowArray[i] != -1; i++);
//         rowArray[i] = sortArray[j];
//       }

//       // append the merged results back into table
//       for (var i = 0; i < rowArray.length; i++) {
//         tbody.appendChild(rowArray[i]);
//       }

//       return this;
//     }

//     /*
//      *
//      */
//     public total() {
//       var config = this.config;
//       var data = config.data;
//       var totalRow = {}

//       for (var i = 0; i < config.headers.length; i++) {
//         var sum = Math.round(100 * data.sum(config.headers[i])) / 100;
//         totalRow[config.headers[i]] = isNaN(sum) ? '' : '' + sum;
//       }

//       return totalRow;
//     }

//   }
// }