import { extend, Button, ControlAnchor } from 'OpenSeadragon';

import drawPressed from '../../img/draw_pressed.png';
import drawUnpressed from '../../img/draw_unpressed.png';
import undo from '../../img/undo.png'

import movePressed from '../../img/move_pressed.png';
import moveUnpressed from '../../img/move_unpressed.png';

import trashPressed from '../../img/trash_pressed.png'
import trashUnpressed from '../../img/trash_unpressed.png'

import pointPressed from '../../img/point_pressed.png'
import pointUnpressed from '../../img/point_unpressed.png'

import circlePressed from '../../img/circle_pressed.png'
import circleUnpressed from '../../img/circle_unpressed.png'


export class Control {
  constructor(options) {
    this.dispatch = options.dispatch;
    this.model = options.model;
    this.viewer = options.viewer;
    this.mode = options.Tooltip.toUpperCase();
    this.btn = new Button(extend({
      onClick: (e) => { this.onClick(e); },
    }, options));
    this.viewer.addControl(this.btn.element, {
      anchor: ControlAnchor.BOTTOM_LEFT,
    });
    if (this.model.mode === this.mode) {
      this.activate();
    }
    this.model.addHandler('CHANGE_EVENT', () => {
      if (this.model.mode === this.mode) {
        this.activate();
      } else {
        this.deactivate();
      }
    });
  }

  activate() {
    this.btn.imgDown.style.visibility = 'visible';
  }

  deactivate() {
    this.btn.imgDown.style.visibility = 'hidden';
  }

  onClick({ eventSource }) {
    if (eventSource.Tooltip) {
      const mode = eventSource.Tooltip.toUpperCase();
      this.dispatch({ type: 'MODE_UPDATE', mode });
    }
  }
}

export class DrawControl extends Control {
  constructor(options) {
    super({
      Tooltip: 'Draw',
      srcRest: drawUnpressed,
      srcGroup: drawUnpressed,
      srcHover: drawPressed,
      srcDown: drawPressed,
      ...options,
    });
  }
}

export class UndoControl extends Control {
  constructor(options) {
    super({
      Tooltip: 'Undo',
      srcRest: undo,
      srcGroup: undo,
      srcHover: undo,
      srcDown: undo,
      ...options,
    });
  }
}
export class TrashControl extends Control {
  constructor(options) {
    super({
      Tooltip: 'Delete',
      srcRest: trashUnpressed,
      srcGroup: trashUnpressed,
      srcHover: trashPressed,
      srcDown: trashPressed,
      ...options,
    });
  }
}

export class MoveControl extends Control {
  constructor(options) {
    super({
      Tooltip: 'Move',
      srcRest: moveUnpressed,
      srcGroup: moveUnpressed,
      srcHover: movePressed,
      srcDown: movePressed,
      ...options,
    });
  }
}
export class PointControl extends Control {
  constructor(options) {
    super({
      Tooltip: 'Point',
      srcRest: pointUnpressed,
      srcGroup: pointUnpressed,
      srcHover: pointPressed,
      srcDown: pointPressed,
      ...options,
    });
  }
}
export class CircleControl extends Control {
  constructor(options) {
    super({
      Tooltip: 'Circle',
      srcRest: circleUnpressed,
      srcGroup: circleUnpressed,
      srcHover: circlePressed,
      srcDown: circlePressed,
      ...options,
    });
  }
}
