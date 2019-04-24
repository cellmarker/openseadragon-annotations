import { EventSource } from 'OpenSeadragon';

export default (id,database_path,annotations) =>
  Object.assign(Object.create(EventSource.prototype), {
    events: {},
    mode: 'MOVE',
    id: id,
    zoom: 1,
    database_path: database_path,
    width: 0,
    color: 'red',
    height: 0,
    activityInProgress: false,
    annotations: annotations,
  });
