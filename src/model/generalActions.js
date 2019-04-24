import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import * as turf from 'turf';

const MARGIN_FOR_ERROR = 0.05;
const reactToGeneralAction = model => action => {
  switch (action.type) {
    case 'MODE_UPDATE':
      model.activityInProgress = false;
      if (action.mode === 'UNDO') {
        model.activityInProgress = true;
        //Strip away the last annotation
        model.annotations = model.annotations.slice(0, -1);
        var annotObj = { id: model.id };
        annotObj['annotations'] = model.annotations;
        //Update on the server
        var xhr = new XMLHttpRequest();
        console.log(model.database_path);
        var currentUser = JSON.parse(localStorage.getItem('currentUser'));
        annotObj['user_id'] = currentUser.id;
        xhr.open('PUT', model.database_path + '/annotations/' + model.id, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(annotObj));

        model.activityInProgress = false;
      } else if (model.mode !== action.mode) {
        model.mode = action.mode;
      }

      break;

    case 'ACTIVITY_UPDATE':
      model.activityInProgress = action.inProgress;
      break;

    case 'PRESS':
      if (model.mode === 'DRAW') {
        model.activityInProgress = true;
        model.annotations.push([
          'path',
          {
            fill: 'none',
            d: `M${action.x} ${action.y}`,
            points: [{ x: action.x, y: action.y }],
            stroke: model.color,
            'stroke-width': 3,
            'stroke-linejoin': 'round',
            'stroke-linecap': 'round',
            'vector-effect': 'non-scaling-stroke'
          }
        ]);
      } else if (model.mode === 'DELETE') {
        var x = action.x;
        var y = action.y;

        for (var i = 0; i < model.annotations.length; i++) {
          var points = model.annotations[i][1].points;
          var passesThrough = false;

          if (model.annotations[i][0] === 'path' && points.length >= 4) {
            // console.log([a[1].points.map(p => [p.x, p.y])]);
            var turfpoints = points.map(p => [p.x, p.y]);
            turfpoints.push(turfpoints[0]);
            var polygon = turf.polygon([turfpoints]);
            var point = turf.point([x, y]);

            passesThrough = booleanPointInPolygon(point, polygon);
          } else {
            points.forEach(p => {
              passesThrough =
                passesThrough ||
                (p.x - MARGIN_FOR_ERROR < x &&
                  x < p.x + MARGIN_FOR_ERROR &&
                  p.y - MARGIN_FOR_ERROR < y &&
                  y < p.y + MARGIN_FOR_ERROR);
            });
          }

          if (passesThrough) {
            model.activityInProgress = true;

            model.annotations.splice(i, 1);

            var annotObj = { id: model.id };
            annotObj['annotations'] = model.annotations;
            var currentUser = JSON.parse(localStorage.getItem('currentUser'));
            annotObj['user_id'] = currentUser.id;
            //Update on the server
            console.log(model.database_path);
            var xhr = new XMLHttpRequest();
            xhr.open(
              'PUT',
              model.database_path + '/annotations/' + model.id,
              true
            );
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify(annotObj));

            model.activityInProgress = false;
            //Exit the loop after finding the first one
            break;
          }
        }
      } else if (model.mode === 'POINT') {
        model.annotations.push([
          'circle',
          {
            fill: 'none',
            cx: action.x,
            cy: action.y,
            r: 0.01,
            points: [{ x: action.x, y: action.y }],
            stroke: model.color,
            'stroke-width': 5,
            'stroke-linejoin': 'round',
            'stroke-linecap': 'round',
            'vector-effect': 'non-scaling-stroke'
          }
        ]);
      } else if (model.mode === 'CIRCLE') {
        model.activityInProgress = true;
        model.annotations.push([
          'circle',
          {
            fill: 'none',
            cx: action.x,
            cy: action.y,
            r: 0.5,
            points: [{ x: action.x, y: action.y }],
            stroke: model.color,
            'stroke-width': 3,
            'stroke-linejoin': 'round',
            'stroke-linecap': 'round',
            'vector-effect': 'non-scaling-stroke'
          }
        ]);
      }
      break;

    case 'RELEASE':
      console.log('RELEASE');
      if (
        model.mode === 'DRAW' ||
        model.mode === 'POINT' ||
        model.mode === 'CIRCLE'
      ) {
        model.activityInProgress = false;
        //console.log("sent");
        //Add id
        var annotObj = { id: model.id };
        annotObj['annotations'] = model.annotations;
        var currentUser = JSON.parse(localStorage.getItem('currentUser'));
        annotObj['user_id'] = currentUser.id;
        var xhr = new XMLHttpRequest();
        console.log(model.database_path);
        xhr.open('PUT', model.database_path + '/annotations/' + model.id, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(annotObj));
        //console.log(annotObj);
        console.log('New Annotation Added to Server');
      }
      break;

    case 'MOVE':
      if (model.mode === 'DRAW' && model.activityInProgress === true) {
        const annotations = model.annotations;
        const lastAnnotation = annotations[annotations.length - 1];
        if (lastAnnotation && lastAnnotation[0] === 'path') {
          lastAnnotation[1].d += ` L${action.x} ${action.y}`;
          lastAnnotation[1].points.push({ x: action.x, y: action.y });
        }
      } else if (model.mode === 'CIRCLE' && model.activityInProgress === true) {
        const annotations = model.annotations;
        const lastAnnotation = annotations[annotations.length - 1];
        if (lastAnnotation && lastAnnotation[0] === 'circle') {
          lastAnnotation[1].r += 0.1;
        }
      } else if (model.mode === 'DELETE') {
        var x = action.x;
        var y = action.y;

        model.annotations.forEach(a => {
          var passesThrough = false;
          if (a[0] === 'path' && a[1].points.length >= 4) {
            // console.log([a[1].points.map(p => [p.x, p.y])]);
            var points = a[1].points.map(p => [p.x, p.y]);
            points.push(points[0]);
            var polygon = turf.polygon([points]);
            var point = turf.point([x, y]);

            var passesThrough = booleanPointInPolygon(point, polygon);
            // points.forEach(p => {
            //   passesThrough = passesThrough ||
            //     (p.x - MARGIN_FOR_ERROR < x && x < p.x + MARGIN_FOR_ERROR &&
            //       p.y - MARGIN_FOR_ERROR < y && y < p.y + MARGIN_FOR_ERROR)
            // });
          } else {
            a[1].points.forEach(p => {
              passesThrough =
                passesThrough ||
                (p.x - MARGIN_FOR_ERROR < x &&
                  x < p.x + MARGIN_FOR_ERROR &&
                  p.y - MARGIN_FOR_ERROR < y &&
                  y < p.y + MARGIN_FOR_ERROR);
            });
          }
          if (passesThrough) {
            a[1]['stroke-width'] = 6;
          } else {
            a[1]['stroke-width'] = 3;
          }
        });
      }
      break;

    case 'ANNOTATIONS_RESET':
      model.activityInProgress = false;
      model.annotations = action.annotations || [];
      break;
    case 'ANNOTATIONS_UNDO':
      // model.annotations = model.annotations.pop();
      break;
    case 'ZOOM_UPDATE':
      model.zoom = action.zoom;
      break;

    case 'LEAVE_CANVAS':
      if (model.mode === 'DRAW') {
        model.activityInProgress = false;
      }
      break;

    case 'INITIALIZE':
      model.zoom = action.zoom;
      model.width = action.width;
      model.height = action.height;
      break;

    default:
      break;
  }

  model.raiseEvent('CHANGE_EVENT');
};

export default reactToGeneralAction;
