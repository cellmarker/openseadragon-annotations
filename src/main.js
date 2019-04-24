import { Rect } from 'OpenSeadragon';
import { h, render } from 'preact';
import Overlay from './views/Overlay';
import { DrawControl, MoveControl, UndoControl, TrashControl, CircleControl, PointControl } from './views/Controls';
import createDispatcher from './model/createDispatcher';
import generalActions from './model/generalActions';
import createModel from './model/createModel';

const annotationsPrototype = {
  onOpen() {
    this.overlay = render(h(Overlay, { dispatch: this.dispatch, model: this.model }));
    const homeBounds = this.viewer.world.getHomeBounds();
    this.viewer.addOverlay(this.overlay, new Rect(0, 0, homeBounds.width, homeBounds.height));
    const zoom = this.viewer.viewport.getZoom();
    const { width, height } = this.overlay.getBoundingClientRect();
    this.dispatch({ type: 'INITIALIZE', zoom, width, height });
    this.controls = [
      new MoveControl({ dispatch: this.dispatch, model: this.model, viewer: this.viewer }),
      new DrawControl({ dispatch: this.dispatch, model: this.model, viewer: this.viewer }),
      // new CircleControl({ dispatch: this.dispatch, model: this.model, viewer: this.viewer}),
      new PointControl({ dispatch: this.dispatch, model: this.model, viewer: this.viewer}),
      new UndoControl({ dispatch: this.dispatch, model: this.model, viewer: this.viewer }),
      new TrashControl({ dispatch: this.dispatch, model: this.model, viewer: this.viewer})
      
    ];
  },

  onClose() {
    // TODO
  },

  getAnnotations() {
    return this.model.annotations;
  },

  setAnnotations(annotations) {
    this.dispatch({ type: 'ANNOTATIONS_RESET', annotations });
  },

  cleanAnnotations() {
    this.dispatch({ type: 'ANNOTATIONS_RESET' });
  },
  getId() {
    return this.model.id;
  },
  setId(id){
    this.model.id = id;
  },
  getMode() {
    return this.model.mode;
  },
  setColor(color){
    this.model.color = color;
  },
  getColor(){
    return this.model.color;
  },
  setMode(mode) {
    this.dispatch({ type: 'MODE_UPDATE', mode });
  },

  getStatus() {
    return { active: !!this.overlay };
  },
};

export default ({ viewer,id,database_path,oldAnnotations}) => {
  const model = createModel(id,database_path,oldAnnotations);
  const dispatch = createDispatcher(model, generalActions);
  const annotations = Object.create(annotationsPrototype);
  Object.assign(annotations, { viewer, model, dispatch });
  viewer.addHandler('open', () => annotations.onOpen());
  viewer.addHandler('zoom', ({ zoom }) => annotations.dispatch({ type: 'ZOOM_UPDATE', zoom }));
  if (viewer.isOpen()) { annotations.onOpen(); }
  return annotations;
};

