define(['snap'],
function(Snap) {
	return Snap.plugin(function(Snap, Element, Paper) {
		var BORDER_RADIUS = 5;

		var ARROW_LENGTH = 10;
		var ARROW_WIDTH = 9;

		var PADDING = 10;
		var FONT_SIZE = 10;

		var BOX_PATH = "M {x1} {y1}L{x2} {y2}A{borderRadius} {borderRadius} 0 0 {sweep} {x3} {y3}L {x4} {y4} A{borderRadius} {borderRadius} 0 0 {sweep} {x5} {y5}L {x6} {y6}Z";

		var ArrowModel = function() {
			this.x1;
			this.y1;

			this.x2;
			this.y2;

			this.x3;
			this.y3;

			this.setPoint1 = function(x, y) {
				this.x1 = x;
				this.y1 = y;
			}

			this.setPoint2 = function(x, y) {
				this.x2 = x;
				this.y2 = y;
			}

			this.setPoint3 = function(x, y) {
				this.x3 = x;
				this.y3 = y;
			}
		}

		var BoxModel = function(left, bottom, width, height, outsideEdge) {

			if (outsideEdge != "left" && outsideEdge != "right") {
				throw "the \"outsideEdge\" parameter must be \"left\" or \"right\"";
			}

			var inside = (outsideEdge == "left") ? left + width : left;
			var outside = (outsideEdge == "left") ? left : left + width;
			var outsideMinusRadius = (outsideEdge == "left") ? left + BORDER_RADIUS : left + width - BORDER_RADIUS;

			this.bottomInsideX = inside;
			this.bottomInsideY = bottom;

			this.bottomCurveStartX = outsideMinusRadius;
			this.bottomCurveStartY = bottom;

			this.bottomCurveEndX = outside;
			this.bottomCurveEndY = bottom - BORDER_RADIUS;

			this.topCurveStartX = outside;
			this.topCurveStartY = bottom - height + BORDER_RADIUS;

			this.topCurveEndX = outsideMinusRadius;
			this.topCurveEndY = bottom - height;
			
			this.topInsideX = inside;
			this.topInsideY = bottom - height;
		}


		Paper.prototype.label = function(x, y, arrowPosition, text, secondaryText) {

			var mainTextElement;
			var secondaryTextElement;
			var arrowElement;
			var mainBoxElement;
			var secondaryBoxElement;

			var fontFamily = "'Lato', sans-serif";

			var arrowPoints = new ArrowModel();
			arrowPoints.setPoint1(x, y);

			var mainBoxPoints;

			var secondaryBoxExists = true;

			var groupArrowWithBox = function(boxToGroupWith, mainBoxElement, arrowElement, secondaryBoxElement, mainTextElement, secondaryTextElement) {
				if (boxToGroupWith === "main") {
					var arrowBoxGroup = this.g(mainBoxElement, arrowElement);
					arrowBoxGroup.addClass('fm-label-main');
					secondaryBoxElement.addClass('fm-label-secondary');

					return this.g(arrowBoxGroup, secondaryBoxElement, mainTextElement, secondaryTextElement);
				} else {
					var arrowBoxGroup = this.g(secondaryBoxElement, arrowElement);
					mainBoxElement.addClass('fm-label-main');
					arrowBoxGroup.addClass('fm-label-secondary');

					return this.g(mainBoxElement, arrowBoxGroup, mainTextElement, secondaryTextElement);
				}
			}.bind(this);

			var drawOverflowLabel = function() {
				secondaryBoxExists = false;

				arrowPoints.setPoint2(
					x + ARROW_WIDTH / 2,
					y - ARROW_LENGTH
				);

				arrowPoints.setPoint3(
					x - ARROW_WIDTH / 2,
	                y - ARROW_LENGTH
				);

				mainTextElement = this.text(x, y + FONT_SIZE / 2 - ARROW_LENGTH - PADDING * 2 + 1, text)
					.attr({
						"text-anchor": "middle",
						"font-family": fontFamily
					});
				var mainTextBoundingBox = mainTextElement.getBBox();

				mainBoxElement = this.rect(
					mainTextBoundingBox.x - PADDING,
					mainTextBoundingBox.y - PADDING + 1,
					mainTextBoundingBox.width + PADDING * 2,
					mainTextBoundingBox.height + PADDING * 2,
					BORDER_RADIUS,
					BORDER_RADIUS
				);
			}.bind(this);

			var drawWithArrowOnLeft = function() {
				arrowPoints.setPoint2(
					x + ARROW_LENGTH,
					y - ARROW_WIDTH / 2
				);

				arrowPoints.setPoint3(
					x + ARROW_LENGTH,
	                y + ARROW_WIDTH / 2
				);

				mainTextElement = this.text(x + ARROW_LENGTH + PADDING - 1, y + FONT_SIZE / 2, text)
					.attr({
						"text-anchor": "start",
						"font-family": fontFamily
					});
				var mainTextBoundingBox = mainTextElement.getBBox();

				secondaryTextElement = this.text(mainTextBoundingBox.x + mainTextBoundingBox.width + PADDING * 2, y + FONT_SIZE / 2, secondaryText)
					.attr({
						"text-anchor": "start",
						"font-family": fontFamily
					});
				var secondaryTextBoundingBox = secondaryTextElement.getBBox();

				mainBoxPoints = new BoxModel(
					x + ARROW_LENGTH - 1,
					mainTextBoundingBox.y + mainTextBoundingBox.height + PADDING,
					mainTextBoundingBox.width + PADDING * 2,
					mainTextBoundingBox.height + PADDING * 2,
					"left"
				);

				secondaryBoxPoints = new BoxModel(
					x + ARROW_LENGTH + mainTextBoundingBox.width + PADDING * 2 - 1,
					mainTextBoundingBox.y + mainTextBoundingBox.height + PADDING,
					secondaryTextBoundingBox.width + PADDING * 2,
					secondaryTextBoundingBox.height + PADDING * 2,
					"right"
				);

				boxToGroupWith = 'main';
			}.bind(this);

			var drawWithArrowOnRight = function() {
				arrowPoints.setPoint2(
	                x - ARROW_LENGTH,
	                y - ARROW_WIDTH / 2
	            );

	            arrowPoints.setPoint3(
	                x - ARROW_LENGTH,
	                y + ARROW_WIDTH / 2
	            );

				secondaryTextElement = this.text(x - ARROW_LENGTH - PADDING, y + FONT_SIZE / 2, secondaryText)
					.attr({
						"text-anchor": "end",
						"font-family": fontFamily
					});
				var secondaryTextBoundingBox = secondaryTextElement.getBBox();

				mainTextElement = this.text(secondaryTextBoundingBox.x - PADDING * 2 + 1, y + FONT_SIZE / 2, text)
					.attr({
						"text-anchor": "end",
						"font-family": fontFamily
					});
				var mainTextBoundingBox = mainTextElement.getBBox();

				secondaryBoxPoints = new BoxModel(
					x + 1 - secondaryTextBoundingBox.width - ARROW_LENGTH - PADDING * 2,
					mainTextBoundingBox.y + mainTextBoundingBox.height + PADDING,
					secondaryTextBoundingBox.width + PADDING * 2,
					secondaryTextBoundingBox.height + PADDING * 2,
					"right"
				);

				mainBoxPoints = new BoxModel(
					x + 1 - ARROW_LENGTH - mainTextBoundingBox.width - PADDING * 2 - secondaryTextBoundingBox.width - PADDING * 2,
					mainTextBoundingBox.y + mainTextBoundingBox.height + PADDING,
					mainTextBoundingBox.width + PADDING * 2,
					mainTextBoundingBox.height + PADDING * 2,
					"left"
				);

				boxToGroupWith = 'secondary';
			}.bind(this);

			var drawWithArrowOnBottomLeft = function() {
				arrowPoints.setPoint2(
					x + ARROW_WIDTH / 2,
					y - ARROW_LENGTH
				);

				arrowPoints.setPoint3(
					x - ARROW_WIDTH / 2,
	                y - ARROW_LENGTH
				);

				mainTextElement = this.text(x, y + 1 - ARROW_LENGTH - PADDING - FONT_SIZE / 2, text)
					.attr({
						"text-anchor": "middle",
						"font-family": fontFamily
					});
				var mainTextBoundingBox = mainTextElement.getBBox();

				secondaryTextElement = this.text(mainTextBoundingBox.x + mainTextBoundingBox.width + PADDING * 2, y + 1 - ARROW_LENGTH - PADDING - FONT_SIZE / 2, secondaryText)
					.attr({
						"text-anchor": "start",
						"font-family": fontFamily
					});
				var secondaryTextBoundingBox = secondaryTextElement.getBBox();

				mainBoxPoints = new BoxModel(
					mainTextBoundingBox.x - PADDING,
					y + 1 - ARROW_LENGTH,
					mainTextBoundingBox.width + PADDING * 2,
					mainTextBoundingBox.height + PADDING * 2,
					"left"
				);
				secondaryBoxPoints = new BoxModel(
					secondaryTextBoundingBox.x - PADDING,
					y + 1 - ARROW_LENGTH,
					secondaryTextBoundingBox.width + PADDING * 2,
					secondaryTextBoundingBox.height + PADDING * 2,
					"right"
				);

				boxToGroupWith = 'main';
			}.bind(this);

			var drawWithArrowOnBottomRight = function() {
				arrowPoints.setPoint2(
					x + ARROW_WIDTH / 2,
					y - ARROW_LENGTH
				);

				arrowPoints.setPoint3(
					x - ARROW_WIDTH / 2,
	                y - ARROW_LENGTH
				);

				secondaryTextElement = this.text(x, y + 1 - ARROW_LENGTH - PADDING - FONT_SIZE / 2, secondaryText)
					.attr({
						"text-anchor": "middle",
						"font-family": fontFamily
					});
				var secondaryTextBoundingBox = secondaryTextElement.getBBox();

				mainTextElement = this.text(secondaryTextBoundingBox.x - PADDING * 2, y + 1 - ARROW_LENGTH - PADDING - FONT_SIZE / 2, text)
					.attr({
						"text-anchor": "end",
						"font-family": fontFamily
					});
				var mainTextBoundingBox = mainTextElement.getBBox();

				mainBoxPoints = new BoxModel(
					mainTextBoundingBox.x - PADDING,
					y + 1 - ARROW_LENGTH,
					mainTextBoundingBox.width + PADDING * 2,
					mainTextBoundingBox.height + PADDING * 2,
					"left"
				);
				secondaryBoxPoints = new BoxModel(
					secondaryTextBoundingBox.x - PADDING,
					y + 1 - ARROW_LENGTH,
					secondaryTextBoundingBox.width + PADDING * 2,
					secondaryTextBoundingBox.height + PADDING * 2,
					"right"
				);

				boxToGroupWith = 'secondary';
			}.bind(this);

			var drawWithArrowOnTopLeft = function() {
				arrowPoints.setPoint2(
					x + ARROW_WIDTH / 2,
					y + ARROW_LENGTH
				);

				arrowPoints.setPoint3(
					x - ARROW_WIDTH / 2,
	                y + ARROW_LENGTH
				);

				mainTextElement = this.text(x, y + ARROW_LENGTH + PADDING * 2 + FONT_SIZE / 2 - 1, text)
					.attr({
						"text-anchor": "middle",
						"font-family": fontFamily
					});
				var mainTextBoundingBox = mainTextElement.getBBox();

				mainBoxPoints = new BoxModel(
					mainTextBoundingBox.x - PADDING,
					y - 1 + mainTextBoundingBox.height + PADDING * 2 + ARROW_LENGTH,
					mainTextBoundingBox.width + PADDING * 2,
					mainTextBoundingBox.height + PADDING * 2,
					"left"
				);

				secondaryTextElement = this.text(mainTextBoundingBox.x + mainTextBoundingBox.width + PADDING * 2, y + ARROW_LENGTH + PADDING * 2 + FONT_SIZE / 2 - 1, secondaryText)
					.attr({
						"text-anchor": "start",
						"font-family": fontFamily
					});
				var secondaryTextBoundingBox = secondaryTextElement.getBBox();

				secondaryBoxPoints = new BoxModel(
					mainTextBoundingBox.x + mainTextBoundingBox.width + PADDING,
					y - 1 + mainTextBoundingBox.height + PADDING * 2 + FONT_SIZE,
					secondaryTextBoundingBox.width + PADDING * 2,
					secondaryTextBoundingBox.height + PADDING * 2,
					"right"
				);

				boxToGroupWith = 'main';
			}.bind(this);

			var drawWithArrowOnTopRight = function() {
				arrowPoints.setPoint2(
					x + ARROW_WIDTH / 2,
					y + ARROW_LENGTH
				);

				arrowPoints.setPoint3(
					x - ARROW_WIDTH / 2,
		            y + ARROW_LENGTH
				);

				secondaryTextElement = this.text(x, y + ARROW_LENGTH + PADDING * 2 + FONT_SIZE / 2 - 1, secondaryText)
					.attr({
						"text-anchor": "middle",
						"font-family": fontFamily
					});
				var secondaryTextBoundingBox = secondaryTextElement.getBBox();

				mainTextElement = this.text(secondaryTextBoundingBox.x - PADDING * 2, y + ARROW_LENGTH + PADDING * 2 + FONT_SIZE / 2 - 1, text)
					.attr({
						"text-anchor": "end",
						"font-family": fontFamily
					});
				var mainTextBoundingBox = mainTextElement.getBBox();

				mainBoxPoints = new BoxModel(
					mainTextBoundingBox.x - PADDING,
					y - 1 + mainTextBoundingBox.height + PADDING * 2 + ARROW_LENGTH,
					mainTextBoundingBox.width + PADDING * 2,
					mainTextBoundingBox.height + PADDING * 2,
					"left"
				);
				secondaryBoxPoints = new BoxModel(
					secondaryTextBoundingBox.x - PADDING,
					y - 1 + secondaryTextBoundingBox.height + PADDING * 2 + ARROW_LENGTH,
					secondaryTextBoundingBox.width + PADDING * 2,
					secondaryTextBoundingBox.height + PADDING * 2,
					"right"
				);

				boxToGroupWith = 'secondary';
			}.bind(this);

			if (typeof secondaryText === 'undefined') {
				drawOverflowLabel();
			} else {
				switch (arrowPosition) {
					case 'left':
						drawWithArrowOnLeft();
						break;
					case 'right':
						drawWithArrowOnRight();
						break;
					case 'bottomLeft':
						drawWithArrowOnBottomLeft();
						break;
					case 'bottomRight':
						drawWithArrowOnBottomRight();
						break;
					case 'topLeft':
						drawWithArrowOnTopLeft();
						break;
					case 'topRight':
						drawWithArrowOnTopRight();
						break;
				}
			}


			arrowElement = this.polyline(arrowPoints.x1, arrowPoints.y1, arrowPoints.x2, arrowPoints.y2, arrowPoints.x3, arrowPoints.y3);

			var label;
			if(secondaryBoxExists) {
				mainBoxElement = this.path(Snap.format(BOX_PATH, {
					x1: mainBoxPoints.bottomInsideX,
					y1: mainBoxPoints.bottomInsideY,
					x2: mainBoxPoints.bottomCurveStartX,
					y2: mainBoxPoints.bottomCurveStartY,
					x3: mainBoxPoints.bottomCurveEndX,
					y3: mainBoxPoints.bottomCurveEndY,
					x4: mainBoxPoints.topCurveStartX,
					y4: mainBoxPoints.topCurveStartY,
					x5: mainBoxPoints.topCurveEndX,
					y5: mainBoxPoints.topCurveEndY,
					x6: mainBoxPoints.topInsideX,
					y6: mainBoxPoints.topInsideY,
					borderRadius: BORDER_RADIUS,
					sweep: 1
				})).attr({
					stroke: 'white',
					strokeWidth: 1,
					shapeRendering: "crispEdges"
				});

				secondaryBoxElement = this.path(Snap.format(BOX_PATH, {
					x1: secondaryBoxPoints.bottomInsideX,
					y1: secondaryBoxPoints.bottomInsideY,
					x2: secondaryBoxPoints.bottomCurveStartX,
					y2: secondaryBoxPoints.bottomCurveStartY,
					x3: secondaryBoxPoints.bottomCurveEndX,
					y3: secondaryBoxPoints.bottomCurveEndY,
					x4: secondaryBoxPoints.topCurveStartX,
					y4: secondaryBoxPoints.topCurveStartY,
					x5: secondaryBoxPoints.topCurveEndX,
					y5: secondaryBoxPoints.topCurveEndY,
					x6: secondaryBoxPoints.topInsideX,
					y6: secondaryBoxPoints.topInsideY,
					borderRadius: BORDER_RADIUS,
					sweep: 0
				})).attr({
					stroke: 'white',
					strokeWidth: 1,
					shapeRendering: "crispEdges"
				});
		
				label = groupArrowWithBox(boxToGroupWith, mainBoxElement, arrowElement, secondaryBoxElement, mainTextElement, secondaryTextElement);


			} else {
				label = this.g(mainBoxElement, arrowElement, mainTextElement)
					.addClass('fm-label-main');
			}



			return label;

		};
	});
});