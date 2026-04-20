import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import "@testing-library/jest-dom";
import DrawingCanvas from "../DrawingCanvas";

// Mock react-konva with forwardRef
jest.mock("react-konva", () => {
	const mockReact = require("react");
	const MockRect = mockReact.forwardRef(
		({ x = 0, y = 0, width = 100, height = 100, ...props }, ref) => (
			<rect
				ref={ref}
				data-testid="mock-rect"
				x={x}
				y={y}
				width={width}
				height={height}
				{...props}
			/>
		),
	);
	const MockLine = mockReact.forwardRef(({ points, ...props }, ref) => (
		<line
			ref={ref}
			data-testid="mock-line"
			points={points?.join(",")}
			{...props}
		/>
	));
	const MockText = mockReact.forwardRef(
		({ text, x = 0, y = 0, ...props }, ref) => (
			<text
				ref={ref}
				data-testid="mock-text"
				x={x}
				y={y}
				text={text}
				{...props}
			/>
		),
	);
	const MockImage = mockReact.forwardRef(({ image, ...props }, ref) => (
		<image ref={ref} data-testid="mock-image" {...props} />
	));
	const MockGroup = mockReact.forwardRef(({ children, ...props }, ref) => (
		<g ref={ref} data-testid="mock-group" {...props}>
			{children}
		</g>
	));
	const MockTransformer = mockReact.forwardRef(({ ...props }, ref) => {
		const mockTransformer = mockReact.useRef({
			nodes: jest.fn(),
			...props,
		});
		mockReact.useImperativeHandle(ref, () => mockTransformer.current);
		return <g ref={ref} data-testid="mock-transformer" {...props} />;
	});
	const MockLayer = mockReact.forwardRef(({ children, ...props }, ref) => (
		<div ref={ref} data-testid="mock-layer" {...props}>
			{children}
		</div>
	));
	const MockStage = mockReact.forwardRef(
		({ children, width = 800, height = 600, ...props }, ref) => (
			<div
				ref={ref}
				data-testid="mock-stage"
				width={width}
				height={height}
				{...props}
			>
				{children}
			</div>
		),
	);

	return {
		Stage: MockStage,
		Layer: MockLayer,
		Rect: MockRect,
		Line: MockLine,
		Text: MockText,
		Image: MockImage,
		Group: MockGroup,
		Transformer: MockTransformer,
	};
});

describe("DrawingCanvas", () => {
	const mockOnSelectAnnotation = jest.fn();
	const mockOnUpdateAnnotation = jest.fn();
	const mockOnStageMouseDown = jest.fn();
	const mockOnStageMouseMove = jest.fn();
	const mockOnStageMouseUp = jest.fn();

	const defaultProps = {
		imageObj: { width: 800, height: 600 },
		selectedImage: { id: "img-1", width: 800, height: 600 },
		scale: 1,
		offset: { x: 0, y: 0 },
		labels: [
			{ id: "label-1", name: "cat", color: "#ff0000" },
			{ id: "label-2", name: "dog", color: "#00ff00" },
		],
		annotations: [],
		drawingPoints: [],
		projectType: "object_detection",
		selectedAnnotationId: null,
		onSelectAnnotation: mockOnSelectAnnotation,
		onUpdateAnnotation: mockOnUpdateAnnotation,
		onStageMouseDown: mockOnStageMouseDown,
		onStageMouseMove: mockOnStageMouseMove,
		onStageMouseUp: mockOnStageMouseUp,
		stageRef: { current: null },
		project: { annotation_type: "object_detection", type: "object_detection" },
		containerRef: { current: { offsetWidth: 800, offsetHeight: 600 } },
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	test("renders empty state when no selectedImage", () => {
		const { container } = render(
			<DrawingCanvas {...defaultProps} selectedImage={null} />,
		);
		expect(
			container.querySelector('[class*="empty-state"]'),
		).toBeInTheDocument();
	});

	test("renders empty state with correct title", () => {
		const { container } = render(
			<DrawingCanvas {...defaultProps} selectedImage={null} />,
		);
		expect(
			container.querySelector('[class*="empty-state-title"]'),
		).toHaveTextContent("Select an image");
	});

	test("renders empty state with correct description", () => {
		const { container } = render(
			<DrawingCanvas {...defaultProps} selectedImage={null} />,
		);
		expect(
			container.querySelector('[class*="empty-state-desc"]'),
		).toHaveTextContent("Choose an image from the sidebar to start annotating");
	});

	test("renders Konva Stage when image is selected", () => {
		const { container } = render(<DrawingCanvas {...defaultProps} />);
		expect(
			container.querySelector('[data-testid="mock-stage"]'),
		).toBeInTheDocument();
	});

	test("renders Konva Layer inside Stage", () => {
		const { container } = render(<DrawingCanvas {...defaultProps} />);
		expect(
			container.querySelector('[data-testid="mock-layer"]'),
		).toBeInTheDocument();
	});

	test("renders image when imageObj is provided", () => {
		const { container } = render(<DrawingCanvas {...defaultProps} />);
		expect(
			container.querySelector('[data-testid="mock-image"]'),
		).toBeInTheDocument();
	});

	test("does not render image when imageObj is null", () => {
		const { container } = render(
			<DrawingCanvas {...defaultProps} imageObj={null} />,
		);
		expect(
			container.querySelector('[data-testid="mock-image"]'),
		).not.toBeInTheDocument();
	});

	test("renders bounding box for object_detection annotation", () => {
		const annotations = [
			{
				id: "ann-1",
				image_id: "img-1",
				label_id: "label-1",
				data: [
					[0, 0],
					[100, 0],
					[100, 100],
					[0, 100],
				],
			},
		];
		const { container } = render(
			<DrawingCanvas {...defaultProps} annotations={annotations} />,
		);
		expect(
			container.querySelector('[data-testid="mock-rect"]'),
		).toBeInTheDocument();
	});

	test("renders label text for object_detection annotation", () => {
		const annotations = [
			{
				id: "ann-1",
				image_id: "img-1",
				label_id: "label-1",
				data: [
					[0, 0],
					[100, 0],
					[100, 100],
					[0, 100],
				],
			},
		];
		const { container } = render(
			<DrawingCanvas {...defaultProps} annotations={annotations} />,
		);
		expect(
			container.querySelector('[data-testid="mock-text"]'),
		).toBeInTheDocument();
		expect(
			container.querySelector('[data-testid="mock-text"]'),
		).toHaveAttribute("text", "cat");
	});

	test("renders polygon for instance_segmentation annotation", () => {
		const annotations = [
			{
				id: "ann-1",
				image_id: "img-1",
				label_id: "label-1",
				data: [
					[0, 0],
					[100, 0],
					[100, 100],
					[0, 100],
				],
			},
		];
		const { container } = render(
			<DrawingCanvas
				{...defaultProps}
				annotations={annotations}
				projectType="instance_segmentation"
				project={{
					annotation_type: "instance_segmentation",
					type: "instance_segmentation",
				}}
			/>,
		);
		expect(
			container.querySelector('[data-testid="mock-line"]'),
		).toBeInTheDocument();
	});

	test("renders contrastive learning points", () => {
		const annotations = [
			{
				id: "ann-1",
				image_id: "img-1",
				type: "contrastive_learning",
				metadata: { contrastivePoints: [{ x: 50, y: 50 }] },
			},
		];
		const { container } = render(
			<DrawingCanvas
				{...defaultProps}
				annotations={annotations}
				projectType="contrastive_learning"
				project={{
					annotation_type: "contrastive_learning",
					type: "contrastive_learning",
				}}
			/>,
		);
		expect(
			container.querySelector('[data-testid="mock-rect"]'),
		).toBeInTheDocument();
	});

	test("calls onSelectAnnotation when annotation is clicked", () => {
		const annotations = [
			{
				id: "ann-1",
				image_id: "img-1",
				label_id: "label-1",
				data: [
					[0, 0],
					[100, 0],
					[100, 100],
					[0, 100],
				],
			},
		];
		const { container } = render(
			<DrawingCanvas {...defaultProps} annotations={annotations} />,
		);
		const group = container.querySelector('[data-testid="mock-group"]');
		fireEvent.click(group, { cancelBubble: true });
		expect(mockOnSelectAnnotation).toHaveBeenCalledWith("ann-1");
	});

	test("calls onSelectAnnotation when annotation is double-clicked", () => {
		const annotations = [
			{
				id: "ann-1",
				image_id: "img-1",
				label_id: "label-1",
				data: [
					[0, 0],
					[100, 0],
					[100, 100],
					[0, 100],
				],
			},
		];
		const { container } = render(
			<DrawingCanvas {...defaultProps} annotations={annotations} />,
		);
		const group = container.querySelector('[data-testid="mock-group"]');
		// Both onClick and onDblClick call handleAnnotationClick
		fireEvent.click(group, { cancelBubble: true });
		expect(mockOnSelectAnnotation).toHaveBeenCalledWith("ann-1");
	});

	test("calls onStageMouseDown when stage is clicked", () => {
		const { container } = render(<DrawingCanvas {...defaultProps} />);
		const stage = container.querySelector('[data-testid="mock-stage"]');
		fireEvent.mouseDown(stage);
		expect(mockOnStageMouseDown).toHaveBeenCalled();
	});

	test("calls onStageMouseMove when stage mouse moves", () => {
		const { container } = render(<DrawingCanvas {...defaultProps} />);
		const stage = container.querySelector('[data-testid="mock-stage"]');
		fireEvent.mouseMove(stage);
		expect(mockOnStageMouseMove).toHaveBeenCalled();
	});

	test("calls onStageMouseUp when stage mouse is released", () => {
		const { container } = render(<DrawingCanvas {...defaultProps} />);
		const stage = container.querySelector('[data-testid="mock-stage"]');
		fireEvent.mouseUp(stage);
		expect(mockOnStageMouseUp).toHaveBeenCalled();
	});

	test("renders drawing preview for object_detection with 2 points", () => {
		const drawingPoints = [
			{ x: 0, y: 0 },
			{ x: 100, y: 100 },
		];
		const { container } = render(
			<DrawingCanvas
				{...defaultProps}
				drawingPoints={drawingPoints}
				projectType="object_detection"
			/>,
		);
		expect(
			container.querySelector('[data-testid="mock-rect"]'),
		).toBeInTheDocument();
	});

	test("renders drawing preview for instance_segmentation with 3+ points", () => {
		const drawingPoints = [
			{ x: 0, y: 0 },
			{ x: 100, y: 0 },
			{ x: 50, y: 100 },
		];
		const { container } = render(
			<DrawingCanvas
				{...defaultProps}
				drawingPoints={drawingPoints}
				projectType="instance_segmentation"
			/>,
		);
		expect(
			container.querySelector('[data-testid="mock-line"]'),
		).toBeInTheDocument();
	});

	test("renders drawing preview for contrastive_learning", () => {
		const drawingPoints = [{ x: 50, y: 50 }];
		const { container } = render(
			<DrawingCanvas
				{...defaultProps}
				drawingPoints={drawingPoints}
				projectType="contrastive_learning"
			/>,
		);
		expect(
			container.querySelector('[data-testid="mock-rect"]'),
		).toBeInTheDocument();
	});

	test("does not render drawing preview when drawingPoints is empty", () => {
		const { container } = render(
			<DrawingCanvas {...defaultProps} drawingPoints={[]} />,
		);
		const rects = container.querySelectorAll('[data-testid="mock-rect"]');
		const lines = container.querySelectorAll('[data-testid="mock-line"]');
		expect(rects.length).toBe(0);
		expect(lines.length).toBe(0);
	});

	test("renders selected annotation with different color", () => {
		const annotations = [
			{
				id: "ann-1",
				image_id: "img-1",
				label_id: "label-1",
				data: [
					[0, 0],
					[100, 0],
					[100, 100],
					[0, 100],
				],
			},
		];
		render(
			<DrawingCanvas
				{...defaultProps}
				annotations={annotations}
				selectedAnnotationId="ann-1"
			/>,
		);
		expect(screen.getByTestId("mock-rect")).toBeInTheDocument();
	});

	test("renders Transformer when annotation is selected", () => {
		const annotations = [
			{
				id: "ann-1",
				image_id: "img-1",
				label_id: "label-1",
				data: [
					[0, 0],
					[100, 0],
					[100, 100],
					[0, 100],
				],
			},
		];
		const { container } = render(
			<DrawingCanvas
				{...defaultProps}
				annotations={annotations}
				selectedAnnotationId="ann-1"
			/>,
		);
		expect(
			container.querySelector('[data-testid="mock-transformer"]'),
		).toBeInTheDocument();
	});

	test("does not render Transformer when no annotation is selected", () => {
		const annotations = [
			{
				id: "ann-1",
				image_id: "img-1",
				label_id: "label-1",
				data: [
					[0, 0],
					[100, 0],
					[100, 100],
					[0, 100],
				],
			},
		];
		const { container } = render(
			<DrawingCanvas
				{...defaultProps}
				annotations={annotations}
				selectedAnnotationId={null}
			/>,
		);
		expect(
			container.querySelector('[data-testid="mock-transformer"]'),
		).not.toBeInTheDocument();
	});

	test("renders correct number of annotations", () => {
		const annotations = [
			{
				id: "ann-1",
				image_id: "img-1",
				label_id: "label-1",
				data: [
					[0, 0],
					[100, 0],
					[100, 100],
					[0, 100],
				],
			},
			{
				id: "ann-2",
				image_id: "img-1",
				label_id: "label-2",
				data: [
					[50, 50],
					[150, 50],
					[150, 150],
					[50, 150],
				],
			},
		];
		const { container } = render(
			<DrawingCanvas {...defaultProps} annotations={annotations} />,
		);
		const groups = container.querySelectorAll('[data-testid="mock-group"]');
		expect(groups.length).toBe(2);
	});

	test("renders label name from labels array", () => {
		const annotations = [
			{
				id: "ann-1",
				image_id: "img-1",
				label_id: "label-2",
				data: [
					[0, 0],
					[100, 0],
					[100, 100],
					[0, 100],
				],
			},
		];
		const { container } = render(
			<DrawingCanvas {...defaultProps} annotations={annotations} />,
		);
		const text = container.querySelector('[data-testid="mock-text"]');
		expect(text).toHaveAttribute("text", "dog");
	});

	test('renders "object" when label not found', () => {
		const annotations = [
			{
				id: "ann-1",
				image_id: "img-1",
				label_id: "nonexistent",
				data: [
					[0, 0],
					[100, 0],
					[100, 100],
					[0, 100],
				],
			},
		];
		const { container } = render(
			<DrawingCanvas {...defaultProps} annotations={annotations} />,
		);
		const text = container.querySelector('[data-testid="mock-text"]');
		expect(text).toHaveAttribute("text", "object");
	});

	test('renders "segment" for instance_segmentation when no label', () => {
		const annotations = [
			{
				id: "ann-1",
				image_id: "img-1",
				label_id: "nonexistent",
				data: [
					[0, 0],
					[100, 0],
					[100, 100],
					[0, 100],
				],
			},
		];
		const { container } = render(
			<DrawingCanvas
				{...defaultProps}
				annotations={annotations}
				projectType="instance_segmentation"
				project={{
					annotation_type: "instance_segmentation",
					type: "instance_segmentation",
				}}
			/>,
		);
		const text = container.querySelector('[data-testid="mock-text"]');
		expect(text).toHaveAttribute("text", "segment");
	});

	test("renders correct Stage dimensions from containerRef", () => {
		const containerRef = { current: { offsetWidth: 1024, offsetHeight: 768 } };
		const { container } = render(
			<DrawingCanvas {...defaultProps} containerRef={containerRef} />,
		);
		const stage = container.querySelector('[data-testid="mock-stage"]');
		expect(stage).toHaveAttribute("width", "1024");
		expect(stage).toHaveAttribute("height", "768");
	});

	test("renders Stage with default dimensions when containerRef is null", () => {
		const { container } = render(
			<DrawingCanvas {...defaultProps} containerRef={null} />,
		);
		const stage = container.querySelector('[data-testid="mock-stage"]');
		expect(stage).toHaveAttribute("width", "800");
		expect(stage).toHaveAttribute("height", "600");
	});

	test("renders Stage with correct scale and offset", () => {
		const { container } = render(
			<DrawingCanvas {...defaultProps} scale={2} offset={{ x: 10, y: 20 }} />,
		);
		const stage = container.querySelector('[data-testid="mock-stage"]');
		expect(stage).toHaveAttribute("width", "800");
		expect(stage).toHaveAttribute("height", "600");
	});

	test("renders contrastive point labels with index", () => {
		const annotations = [
			{
				id: "ann-1",
				image_id: "img-1",
				type: "contrastive_learning",
				metadata: {
					contrastivePoints: [
						{ x: 50, y: 50 },
						{ x: 100, y: 100 },
					],
				},
			},
		];
		const { container } = render(
			<DrawingCanvas
				{...defaultProps}
				annotations={annotations}
				projectType="contrastive_learning"
				project={{
					annotation_type: "contrastive_learning",
					type: "contrastive_learning",
				}}
			/>,
		);
		const texts = container.querySelectorAll('[data-testid="mock-text"]');
		expect(texts.length).toBe(2);
	});

	test("renders drawing preview with contrastive count label", () => {
		const annotations = [
			{
				id: "ann-1",
				image_id: "img-1",
				type: "contrastive_learning",
				metadata: { contrastivePoints: [{ x: 50, y: 50 }] },
			},
		];
		const drawingPoints = [{ x: 75, y: 75 }];
		const { container } = render(
			<DrawingCanvas
				{...defaultProps}
				annotations={annotations}
				drawingPoints={drawingPoints}
				projectType="contrastive_learning"
				project={{
					annotation_type: "contrastive_learning",
					type: "contrastive_learning",
				}}
			/>,
		);
		expect(
			container.querySelector('[data-testid="mock-rect"]'),
		).toBeInTheDocument();
	});

	test("does not render annotation when data has wrong number of points for bbox", () => {
		const annotations = [
			{
				id: "ann-1",
				image_id: "img-1",
				label_id: "label-1",
				data: [
					[0, 0],
					[100, 0],
					[100, 100],
				],
			},
		];
		const { container } = render(
			<DrawingCanvas {...defaultProps} annotations={annotations} />,
		);
		const rects = container.querySelectorAll('[data-testid="mock-rect"]');
		expect(rects.length).toBe(0);
	});

	test("does not render polygon when less than 3 points", () => {
		const annotations = [
			{
				id: "ann-1",
				image_id: "img-1",
				label_id: "label-1",
				data: [
					[0, 0],
					[100, 0],
				],
			},
		];
		const { container } = render(
			<DrawingCanvas
				{...defaultProps}
				annotations={annotations}
				projectType="instance_segmentation"
				project={{
					annotation_type: "instance_segmentation",
					type: "instance_segmentation",
				}}
			/>,
		);
		const lines = container.querySelectorAll('[data-testid="mock-line"]');
		expect(lines.length).toBe(0);
	});

	test("renders image with correct dimensions", () => {
		const { container } = render(<DrawingCanvas {...defaultProps} />);
		const image = container.querySelector('[data-testid="mock-image"]');
		expect(image).toHaveAttribute("width", "800");
		expect(image).toHaveAttribute("height", "600");
	});

	test("renders multiple contrastive points with correct indices", () => {
		const annotations = [
			{
				id: "ann-1",
				image_id: "img-1",
				type: "contrastive_learning",
				metadata: {
					contrastivePoints: [
						{ x: 10, y: 10 },
						{ x: 20, y: 20 },
						{ x: 30, y: 30 },
					],
				},
			},
		];
		const { container } = render(
			<DrawingCanvas
				{...defaultProps}
				annotations={annotations}
				projectType="contrastive_learning"
				project={{
					annotation_type: "contrastive_learning",
					type: "contrastive_learning",
				}}
			/>,
		);
		const rects = container.querySelectorAll('[data-testid="mock-rect"]');
		expect(rects.length).toBe(3);
	});
});
