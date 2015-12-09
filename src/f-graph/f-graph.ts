/// <reference path="../f-mentat.ts"/>
/// <reference path="f-d3-helper.ts"/>

module flipp.mentat {
  export abstract class Graph {
    constructor(protected _element: GraphElement) { }

    /**
     * CONSTANTS
     */
    protected static MARGIN = {
      top: 20, right: 0, bottom: 70, left: 55
    };
    protected static DIMENSIONS = {
      width: 960, height: 480
    };
    protected static FLATPALLET = [
      "#3498db", "#1abc9c", "#2ecc71", "#f1c40f", "#e67e22",
      "#e74c3c", "#9b59b6", "#ecf0f1", "#95a5a6", "#34495e"
    ];
    protected static FALLPALLET = [
      "#98abc5", "#8a89a6", "#7b6888", "#6b486b",
      "#a05d56", "#d0743c", "#ff8c00"
    ];
    protected static MATERIALPALLET = [
      "#f44336", "#e91e63", "#9c27b0", "#673ab7", "#3f51b5",
      "#2196f3", "#03a9f4", "#00bcd4", "#009688", "#4caf50",
      "#8bc34a", "#cddc39", "#ffeb3b", "#ffc107", "#ff9800",
      "#ff5722", "#795548", "#9e9e9e", "#607d8b", "#ffffff"
    ];

    /**
     * Class Properties
     */
    public hoverHtml           : ((d: any) => string);
    public decodeData          : ((d: any) => any);
    protected data             : { [key: string]: string }[];
    protected defaultHoverable = false;
    protected defaultSum       = false;
    private _skipCallback      = false;

    /**
     * Attributes
     */
    get width(): number {
      var width = this._element.getAttribute('width');
      return parseInt(width) || Graph.DIMENSIONS.width;
    }
    set width(newWidth: number) {
      this._element.setAttribute('width', newWidth.toString());
      this._element.style.width = newWidth + 'px';
    }

    get height(): number {
      var height = this._element.getAttribute('height');
      return parseInt(height) || Graph.DIMENSIONS.height;
    }
    set height(newHeight: number) {
      this._element.setAttribute('height', newHeight.toString());
      this._element.style.height = newHeight + 'px';
    }

    get src(): string {
      return this._element.getAttribute('src');
    }
    set src(newSrc: string) {
      this._element.setAttribute('src', newSrc);
    }

    get innerWidth(): number {
      return this.width - Graph.MARGIN.left - Graph.MARGIN.right;
    }

    get innerHeight(): number {
      return this.height - Graph.MARGIN.top - Graph.MARGIN.bottom;
    }

    get key(): string {
      return this._element.getAttribute('key');
    }
    set key(newKey: string) {
      this._element.setAttribute('key', newKey);
    }

    get columns(): Array<string> {
      return this._element.getAttribute('columns').split(',');
    }
    set columns(newCols: Array<string>) {
      this._element.setAttribute('columns', newCols.join(','));
    }

    get hoverable(): boolean {
      var hoverable = this._element.getAttribute('hoverable');
      return (hoverable) ? hoverable === 'true' : this.defaultHoverable;
    }
    set hoverable(newHoverable: boolean) {
      this._element.setAttribute('hoverable', newHoverable.toString());
    }

    get sum(): boolean {
      var sum = this._element.getAttribute('sum');
      return (sum) ? sum === 'true' : this.defaultSum;
    }
    set sum(newSum: boolean) {
      this._element.setAttribute('sum', newSum.toString());
    }

    attributeChangedCallback(attr: string, old: string, value: string) {
      if (!this._skipCallback) {
        if (attr == 'src') {
          this.load();
        } else {
          this.render();
        }
      }
    }

    /**
     * Helpers
     */
    protected translate(x, y): string {
      return "translate(" + x + "," + y + ")";
    }

    protected get(url: string): Promise<any> {
      return new Promise<any>((resolve, reject) => {
        $.ajax({
          url: url,
          complete: function(response) {
            if (response.responseJSON)
              resolve(response.responseJSON);
            else if (response.responseText)
              resolve(response.responseText);
            else
              console.error("Bad response!");
          },
          error: function(error) {
            reject(error);
          }
        });
      });
    }

    protected skipCallback(block: () => void): void {
      this._skipCallback = true;
      block();
      this._skipCallback = false;
    }

    protected fallColor7(): d3.scale.Ordinal<any, any> {
      return d3.scale.ordinal().range(Graph.FALLPALLET);
    }
    protected flatColor10(): d3.scale.Ordinal<any, any> {
      return d3.scale.ordinal().range(Graph.FLATPALLET);
    }
    protected materialColor20(): d3.scale.Ordinal<any, any> {
      return d3.scale.ordinal().range(Graph.MATERIALPALLET);
    }

    public hover(func: (d: any) => string): GraphElement {
      this.hoverHtml = func;
      return this._element;
    }

    public decode(func: (d: any) => any): GraphElement {
      this.decodeData = func;
      return this._element;
    }

    public update(hash: any): GraphElement {
      this.skipCallback(() => {
        for (var key in hash) {
          this._element.setAttribute(key, hash[key])
        }
        // if source was changed, load
        if (Object.keys(hash).indexOf('src') >= 0) {
          this.load();
        } else {
          this.render();
        }
      });
      return this._element;
    }

    public load(param?: any): GraphElement {
      // default is load from this.Src
      if ( typeof param === 'undefined' ) {
        this.get(this.src).then((d) => {
          if ( typeof d === 'string' ) {
            this.data = d3.csv.parse(d);
          } else {
            this.data = d;
          }
          this.render();
        });

      // load csv or from a url
      } else if ( typeof param === 'string' ) {
        if (/^(https?|ftp):\/\/[^\s\/$.?#].[^\s]*$/.test(param)) {
          this.get(param).then((d) => {
            this.data = d3.csv.parse(d);
            this.skipCallback(() => { this.src = param; });
            this.render();
          });
        } else {
          this.data = d3.csv.parse(param);
          this.render();
        }

      // assume json
      } else if ( typeof param === 'object' ) {
        this.data = param;
        this.render();
      } else {
        console.error("Invalid data type!");
      }
      return this._element;
    }

    public download(csv?: boolean): any {
      var csv = (typeof csv === 'undefined') ? true : csv;
      if (csv && typeof this.data !== 'string') {
        // collect headers with key as first column
        var headers = Object.keys(this.data[0]).filter((d) => {
          return (d !== this.key);
        });
        headers.unshift(this.key);
        // collect body
        var body = this.data.map(function(row) {
          return headers.map(function(header) {
            return '"' + (row[header] || '') + '"';
          });
        });
        body.unshift(headers);
        return body.join('\r\n');
      } else {
        return this.data;
      }
    }

    /*
     * Render cycle,
     */

    protected abstract render(): void;
  }

  export interface GraphElement extends HTMLElement {
    src                              : string;
    columns                          : Array<string>;
    key                              : string;
    height                           : number;
    width                            : number;
    innerHeight                      : number;
    innerWidth                       : number;
    hoverable                        : boolean;
    clickable                        : boolean;
    sum                              : boolean;
    download(csv?: boolean)          : any;
    update(hash: any)                : GraphElement;
    load(param?: any)                : GraphElement;
    hover(func: (d: any) => string)  : GraphElement;
    // click(func: (d: any) => string)  : GraphElement;
    decode(func: (d: any) => any)    : GraphElement;
  }

  export var GraphElement = registerElement('f-graph', HTMLElement, Graph);
}