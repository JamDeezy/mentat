/// <reference path="../f-mentat.ts"/>
/// <reference path="f-graph.ts"/>

module flipp.mentat {
  export class Tooltip {
    private _node      : HTMLDivElement;
    private _html      : (d: any) => string;
    private _offset    : Array<number> = [0, 0];
    private _direction : string = 'n';
    private _parent    : d3.Selection<any>;
    private _position  : Array<number> = [0, 0];

    constructor(parent: d3.Selection<any>) {
      this._parent = parent;
      this._appendTooltipNode();
      return this;
    }

    public show(v, d): Tooltip {
      if (!(this._position[0] === v[0] || this._position[1] === v[1])) {
        this._position = v;
        this._node.innerHTML = this._html(d);
        var offset = $(this._parent[0][0]).offset();
        var dimensions = [this._node.offsetWidth, this._node.offsetHeight];
        this._node.style.display = 'block';
        this._node.style.left = (v[0] + this._offset[0] +
          offset.left + 30) + 'px'
        this._node.style.top = (v[1] + this._offset[1] +
          offset.top - dimensions[1] / 2) + 'px';
      }
      return this;
    }

    public hide(): Tooltip {
      this._node.style.display = 'none';
      return this;
    }

    public offset(v): Tooltip {
      this._offset = v;
      return this;
    }

    public html(v: (d: any) => string): Tooltip {
      this._html = v;
      return this;
    }

    // TODO
    public direction(v): Tooltip {
      this._direction = v;
      return this;
    }

    private _appendTooltipNode(): void {
      this._node = document.createElement('div');
      this._node.className = 'tooltip';

      this._node.appendChild
      document.body.appendChild(this._node);
    }
  }
}
