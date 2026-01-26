import { v4 as uuidv4 } from "uuid";
import { ACTIONS } from "../constants/actions";

export function handlePointerDown(
  action,
  stageRef,
  currentShapeId,
  isPainting,
  fillColor,
  strokeColor,
  brushSize,
  fontSize,
  fontFamily,
  setters
) {
  if (action === ACTIONS.SELECT) return;

  const stage = stageRef.current;
  const { x, y } = stage.getPointerPosition();
  const id = uuidv4();

  currentShapeId.current = id;
  isPainting.current = true;

  switch (action) {
    case ACTIONS.RECTANGLE:
      setters.setRectangles((prev) => [...prev, { id, x, y, height: 20, width: 20, fillColor, strokeColor }]);
      break;
    case ACTIONS.CIRCLE:
      setters.setCircles((prev) => [...prev, { id, x, y, radius: 20, fillColor, strokeColor }]);
      break;
    case ACTIONS.ARROW:
      setters.setArrows((prev) => [...prev, { id, points: [x, y, x + 20, y + 20], strokeColor }]);
      break;
    case ACTIONS.SCRIBBLE:
    case ACTIONS.BRUSH:
      setters.setScribbles((prev) => [...prev, { id, points: [x, y], strokeColor, brushSize }]);
      break;
    case ACTIONS.TEXT:
      setters.setTexts((prev) => [...prev, { id, x, y, text: "Double click to edit", fillColor, fontSize, fontFamily }]);
      setters.setAction(ACTIONS.SELECT);
      break;
  }
}

export function handlePointerMove(
  action,
  stageRef,
  isPainting,
  currentShapeId,
  setters
) {
  if (action === ACTIONS.SELECT || !isPainting.current) return;

  const stage = stageRef.current;
  const { x, y } = stage.getPointerPosition();

  switch (action) {
    case ACTIONS.RECTANGLE:
      setters.setRectangles((prev) =>
        prev.map((rect) =>
          rect.id === currentShapeId.current
            ? { ...rect, width: x - rect.x, height: y - rect.y }
            : rect
        )
      );
      break;
    case ACTIONS.CIRCLE:
      setters.setCircles((prev) =>
        prev.map((circle) =>
          circle.id === currentShapeId.current
            ? { ...circle, radius: Math.sqrt((y - circle.y) ** 2 + (x - circle.x) ** 2) }
            : circle
        )
      );
      break;
    case ACTIONS.ARROW:
      setters.setArrows((prev) =>
        prev.map((arrow) =>
          arrow.id === currentShapeId.current
            ? { ...arrow, points: [arrow.points[0], arrow.points[1], x, y] }
            : arrow
        )
      );
      break;
    case ACTIONS.SCRIBBLE:
    case ACTIONS.BRUSH:
      setters.setScribbles((prev) =>
        prev.map((scribble) =>
          scribble.id === currentShapeId.current
            ? { ...scribble, points: [...scribble.points, x, y] }
            : scribble
        )
      );
      break;
    case ACTIONS.ERASER:
      { const threshold = 20;
      setters.setScribbles((prev) => prev.filter(s => {
        const distance = Math.sqrt((s.points[0] - x) ** 2 + (s.points[1] - y) ** 2);
        return distance > threshold;
      }));
      break; }
  }
}