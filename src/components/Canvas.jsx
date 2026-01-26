import { Stage, Layer, Rect, Circle, Arrow, Line, Transformer, Image as KonvaImage, Text } from "react-konva";

export default function Canvas({
  stageRef,
  transformerRef,
  canvasWidth,
  canvasHeight,
  theme,
  rectangles,
  circles,
  arrows,
  scribbles,
  texts,
  images,
  isDraggable,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onClick,
  onBackgroundClick
}) {
  return (
    <Stage
      ref={stageRef}
      width={canvasWidth}
      height={canvasHeight}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      className="bg-base-100"
    >
      <Layer>
        <Rect
          x={0}
          y={0}
          height={canvasHeight}
          width={canvasWidth}
          fill={theme === 'dark' ? '#1f2937' : '#ffffff'}
          onClick={onBackgroundClick}
        />

        {rectangles.map((rect) => (
          <Rect
            key={rect.id}
            {...rect}
            stroke={rect.strokeColor}
            strokeWidth={2}
            draggable={isDraggable}
            onClick={(e) => onClick(e, rect.id)}
          />
        ))}

        {circles.map((circle) => (
          <Circle
            key={circle.id}
            {...circle}
            stroke={circle.strokeColor}
            strokeWidth={2}
            draggable={isDraggable}
            onClick={(e) => onClick(e, circle.id)}
          />
        ))}

        {arrows.map((arrow) => (
          <Arrow
            key={arrow.id}
            {...arrow}
            stroke={arrow.strokeColor}
            strokeWidth={2}
            fill={arrow.strokeColor}
            draggable={isDraggable}
            onClick={(e) => onClick(e, arrow.id)}
          />
        ))}

        {scribbles.map((scribble) => (
          <Line
            key={scribble.id}
            {...scribble}
            lineCap="round"
            lineJoin="round"
            stroke={scribble.strokeColor}
            strokeWidth={scribble.brushSize || 2}
            draggable={isDraggable}
            onClick={(e) => onClick(e, scribble.id)}
          />
        ))}

        {texts.map((text) => (
          <Text
            key={text.id}
            {...text}
            draggable={isDraggable}
            onClick={(e) => onClick(e, text.id)}
          />
        ))}

        {images.map((img) => (
          <KonvaImage
            key={img.id}
            {...img}
            draggable={isDraggable}
            onClick={(e) => onClick(e, img.id)}
          />
        ))}

        <Transformer ref={transformerRef} />
      </Layer>
    </Stage>
  );
}