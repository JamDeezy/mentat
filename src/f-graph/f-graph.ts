/// <reference path="../f-mentat.ts"/>
/// <reference path="f-tooltip.ts"/>
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


  export interface GraphElement extends HTMLElement {
    data: any;
    axes: Graph.axes;
    margin: Graph.margin;
    size: number[];
    attr(attr: string, value: any): GraphElement;
    load(data: any): GraphElement;
    onClick(func: (data: any, axes?: Graph.axes) => string): GraphElement;
    onDecode(func: (data: any, axes?: Graph.axes) => any): GraphElement;
    onHover(func: (data: any, axes?: Graph.axes) => string): GraphElement;
    render(): GraphElement;
    update(hash: any): GraphElement;
  }


  export abstract class Graph {
    constructor(protected _el: GraphElement) { }
    detachedCallback() { if (this.tooltip) this.tooltip.remove() }

  /* Attributes */
    get axes(): Graph.axes {
      // XXX - this may require some rework
      var axes = JSON.parse(this._el.getAttribute('axes')) || Graph.AXES;
      if (typeof axes.y === 'string')
        return {x: axes.x, y: [axes.y]}
      else
        return axes
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
    public clickFunc: ((data: any, axes?: Graph.axes) => string);
    public hoverFunc: ((data: any, axes?: Graph.axes) => string);
    public decodeFunc: ((data: any, axes?: Graph.axes) => any);
    public tooltip: Tooltip;
    public data: any;

    public attr(attr: string, value: any): GraphElement {
      if (typeof value === 'string')
        this._el.setAttribute(attr, value)
      else
        this._el.setAttribute(attr, JSON.stringify(value));
      return this._el;
    }

    public load(data: any[]): GraphElement {
      this.data = data;
      return this._el;
    }

    public onClick(
      func: (data: any, axes?: Graph.axes) => string): GraphElement {

      this.clickFunc = func;
      return this._el;
    }

    public onDecode(
      func: (data: any, axes?: Graph.axes) => any): GraphElement {

      this.decodeFunc = func;
      return this._el;
    }

    public onHover(
      func: (data: any, axes?: Graph.axes) => string): GraphElement {

      this.hoverFunc = func;
      return this._el;
    }

    public update(hash: any): GraphElement {
      for (var key in hash)
        if (typeof hash[key] === 'string')
          this._el.setAttribute(key, hash[key]);
        else
          this._el.setAttribute(key, JSON.stringify(hash[key]));
      return this._el;
    }

    public abstract render(): GraphElement;


  /* Protected */
    protected static MARGIN = { top: 20, right: 10, bottom: 70, left: 55 };
    protected static SIZE = { width: 960, height: 480 };
    protected static AXES = { x: 'key', y: 'value' }
  }

  export var GraphElement = registerElement('f-graph', HTMLElement, Graph);
}