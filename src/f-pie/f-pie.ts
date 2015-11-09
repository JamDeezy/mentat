/// <reference path="../f-mentat.ts"/>

module flipp.mentat {
  class Pie {
    constructor(private _element: PieElement) { }

    private _template = Handlebars.templates['f-pie'];

    createdCallback() {
      if (!this._element)
        Pie.call(this, this);

      this._element.innerHTML = '';
      this._element.appendChild(
        createDocumentFragment(this._template({})));
    }
  }

  export interface PieElement extends HTMLElement {
  }

  export var PieElement = registerElement('f-pie', HTMLElement, Pie);
}