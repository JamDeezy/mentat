/// <reference path="../f-mentat.ts"/>
/// <reference path="f-d3-helper.ts"/>

module flipp.mentat {
  export declare module Graph {
    interface axes {
      x: string;
      y: string[]|string;
    }

    interface margin {
      top: number;
      right: number;
      bottom: number;
      left: number;
    }

    interface size {
      width: number;
      height: number;
    }
  }

  export abstract class Graph {
    constructor(protected _el: GraphElement) { }

  /* Attributes */
    get axes(): Graph.axes {
      return JSON.parse(this._el.getAttribute('axes')) || Graph.AXES;
    }
    get margin(): Graph.margin {
      return JSON.parse(this._el.getAttribute('margin')) || Graph.MARGIN;
    }
    get size(): Graph.size {
      return JSON.parse(this._el.getAttribute('size')) || Graph.SIZE;
    }

    set size(val: Graph.size) {
      this._el.setAttribute('size', JSON.stringify(val));
    }
    set axes(val: Graph.axes) {
      this._el.setAttribute('axes', JSON.stringify(val));
    }
    set margin(val: Graph.margin) {
      this._el.setAttribute('margin', JSON.stringify(val));
    }


  /* Public */
    public clickFunc: ((d: any) => string);
    public hoverFunc: ((d: any) => string);
    public decodeFunc: ((d: any) => any);
    public data: any;

    public attr(attr: string, value: any): GraphElement {
      if (typeof value === 'string')
        this._el.setAttribute(attr, value)
      else
        this._el.setAttribute(attr, JSON.stringify(value));
      return this._el;
    }

    public load(data: any): GraphElement {
      switch (typeof data) {
        // pass of array of objects
        case 'object':
          this.data = data;
          break;

        // pass of url or csv string
        case 'string':
          this.data = d3.csv.parse(data);
          break;

        // not supported
        default:
          console.error("Invalid data type!");
      }
      return this._el;
    }

    public onClick(func: (d: any) => string): GraphElement {
      this.clickFunc = func;
      return this._el;
    }

    public onDecode(func: (d: any) => any): GraphElement {
      this.decodeFunc = func;
      return this._el;
    }

    public onHover(func: (d: any) => string): GraphElement {
      this.hoverFunc = func;
      return this._el;
    }

    public abstract render(): GraphElement;

    public update(hash: any): GraphElement {
      for (var key in hash)
        if (typeof hash[key] === 'string')
          this._el.setAttribute(key, hash[key]);
        else
          this._el.setAttribute(key, JSON.stringify(hash[key]));
      return this._el;
    }


  /* Protected */
    protected static MARGIN = { top: 20, right: 0, bottom: 70, left: 55 };
    protected static SIZE = { width: 960, height: 480 };
    protected static AXES = { x: 'key', y: 'value' }

    protected flatColor10(): d3.scale.Ordinal<any, any> {
      return d3.scale.ordinal().range([
        "#3498db", "#1abc9c", "#2ecc71", "#f1c40f", "#e67e22",
        "#e74c3c", "#9b59b6", "#ecf0f1", "#95a5a6", "#34495e"
      ]);
    }

    protected fallColor7(): d3.scale.Ordinal<any, any> {
      return d3.scale.ordinal().range([
        "#98abc5", "#8a89a6", "#7b6888", "#6b486b",
        "#a05d56", "#d0743c", "#ff8c00"
      ]);
    }
  }

  export interface GraphElement extends HTMLElement {
    data                             : any;
    axes                             : Graph.axes;
    margin                           : Graph.margin;
    size                             : number[];
    attr(attr: string, value: any)   : GraphElement;
    load(data: any)                  : GraphElement;
    onClick(func: (d: any) => string): GraphElement;
    onDecode(func: (d: any) => any)  : GraphElement;
    onHover(func: (d: any) => string): GraphElement;
    render()                         : GraphElement;
    update(hash: any)                : GraphElement;
  }

  export var GraphElement = registerElement('f-graph', HTMLElement, Graph);
}