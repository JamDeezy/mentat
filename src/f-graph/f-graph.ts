/// <reference path="../f-mentat.ts"/>

module flipp.mentat {
  export abstract class Graph {
    constructor(private _element: GraphElement) { }

    public onhoverhtml: ((d: any) => string);
    private _skipCallback = false;

    attributeChangedCallback(attr: string, old: string, value: string) {
      if (!this._skipCallback) {
        if (attr == 'src') {
          this.load();
        } else {
          this.render();
        }
      }
    }

    /************ CONSTANTS ************/
    protected static MARGIN = {
      top: 20, right: 100, bottom: 30, left: 50
    };
    protected static DIMENSIONS = {
      width: 960, height: 480
    };
    protected static FLATPALLET = [
      "#3498db", "#1abc9c", "#2ecc71", "#f1c40f", "#e67e22",
      "#e74c3c", "#9b59b6", "#ecf0f1", "#95a5a6", "#34495e"
    ];
    protected static MATERIALPALLET = [
      "#f44336", "#e91e63", "#9c27b0", "#673ab7", "#3f51b5",
      "#2196f3", "#03a9f4", "#00bcd4", "#009688", "#4caf50",
      "#8bc34a", "#cddc39", "#ffeb3b", "#ffc107", "#ff9800",
      "#ff5722", "#795548", "#9e9e9e", "#607d8b", "#ffffff"
    ];

    /************ SETTINGS ************/
    protected HOVERABLE = false;
    protected SUM = false;

    /************ Attributes ************/
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
      return (hoverable) ? hoverable === 'true' : this.HOVERABLE;
    }

    set hoverable(newHoverable: boolean) {
      this._element.setAttribute('hoverable', newHoverable.toString());
    }

    get sum(): boolean {
      var sum = this._element.getAttribute('sum');
      return (sum) ? sum === 'true' : this.SUM;
    }

    set sum(newSum: boolean) {
      this._element.setAttribute('sum', newSum.toString());
    }

    /************ Helpers ************/
    protected translate(x, y): string {
      return "translate(" + x + "," + y + ")";
    }

    public flatColor10(): d3.scale.Ordinal<any, any> {
      return d3.scale.ordinal().range(Graph.FLATPALLET);
    }

    public materialColor20(): d3.scale.Ordinal<any, any> {
      return d3.scale.ordinal().range(Graph.MATERIALPALLET);
    }

    public update(hash: any): void {
      // Turn off callback for update
      this._skipCallback = true;
      for(var key in hash) {
        this._element.setAttribute(key, hash[key])
      }
      // if source was changed, load
      if (Object.keys(hash).indexOf('src') >= 0) {
        this.load();
      } else {
        this.render();
      }
      this._skipCallback = false;
    }

    /*
     * Render cycle,
     */
    protected abstract render(): void;

    /*
     * Load cycle, overwrite
     */
    protected abstract load(): void;
  }

  export interface GraphElement extends HTMLElement {
    columns            : Array<string>;
    height             : number;
    hoverable          : boolean;
    innerWidth         : number;
    innerHeight        : number;
    key                : string;
    onhoverhtml        : ((d: any) => string);
    src                : string;
    sum                : boolean;
    width              : number;
    update(hash: any)  : void;
  }

  export var GraphElement = registerElement('f-graph', HTMLElement, Graph);
}