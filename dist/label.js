define(['snap', 'config'],
function(Snap,   Config) {
	return Snap.plugin(function(Snap, Element, Paper) {
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
			var outsideMinusRadius = (outsideEdge == "left") ? left + Config.LABEL_BORDER_RADIUS : left + width - Config.LABEL_BORDER_RADIUS;

			this.bottomInsideX = inside;
			this.bottomInsideY = bottom;

			this.bottomCurveStartX = outsideMinusRadius;
			this.bottomCurveStartY = bottom;

			this.bottomCurveEndX = outside;
			this.bottomCurveEndY = bottom - Config.LABEL_BORDER_RADIUS;

			this.topCurveStartX = outside;
			this.topCurveStartY = bottom - height + Config.LABEL_BORDER_RADIUS;

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

			var arrowPoints = new ArrowModel();
			arrowPoints.setPoint1(x, y);

			var mainBoxPoints;
			var secondaryBoxPoints;
			var boxToGroupWith;

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
					x + Config.LABEL_ARROW_WIDTH / 2,
					y - Config.LABEL_ARROW_LENGTH
				);

				arrowPoints.setPoint3(
					x - Config.LABEL_ARROW_WIDTH / 2,
	                y - Config.LABEL_ARROW_LENGTH
				);

				mainTextElement = this.text(x, y + Config.LABEL_FONT_SIZE / 2 - Config.LABEL_ARROW_LENGTH - Config.LABEL_PADDING * 2 + 1, text)
					.attr({
						"text-anchor": "middle",
						"font-family": Config.FONT_FAMILY
					});
				var mainTextBoundingBox = mainTextElement.getBBox();

				mainBoxElement = this.rect(
					mainTextBoundingBox.x - Config.LABEL_PADDING,
					mainTextBoundingBox.y - Config.LABEL_PADDING + 1,
					mainTextBoundingBox.width + Config.LABEL_PADDING * 2,
					mainTextBoundingBox.height + Config.LABEL_PADDING * 2,
					Config.LABEL_BORDER_RADIUS,
					Config.LABEL_BORDER_RADIUS
				);
			}.bind(this);

			var drawWithArrowOnLeft = function() {
				arrowPoints.setPoint2(
					x + Config.LABEL_ARROW_LENGTH,
					y - Config.LABEL_ARROW_WIDTH / 2
				);

				arrowPoints.setPoint3(
					x + Config.LABEL_ARROW_LENGTH,
	                y + Config.LABEL_ARROW_WIDTH / 2
				);

				mainTextElement = this.text(x + Config.LABEL_ARROW_LENGTH + Config.LABEL_PADDING - 1, y + Config.LABEL_FONT_SIZE / 2, text)
					.attr({
						"text-anchor": "start",
						"font-family": Config.FONT_FAMILY
					});
				var mainTextBoundingBox = mainTextElement.getBBox();

				secondaryTextElement = this.text(mainTextBoundingBox.x + mainTextBoundingBox.width + Config.LABEL_PADDING * 2, y + Config.LABEL_FONT_SIZE / 2, secondaryText)
					.attr({
						"text-anchor": "start",
						"font-family": Config.FONT_FAMILY
					});
				var secondaryTextBoundingBox = secondaryTextElement.getBBox();

				mainBoxPoints = new BoxModel(
					x + Config.LABEL_ARROW_LENGTH - 1,
					mainTextBoundingBox.y + mainTextBoundingBox.height + Config.LABEL_PADDING,
					mainTextBoundingBox.width + Config.LABEL_PADDING * 2,
					mainTextBoundingBox.height + Config.LABEL_PADDING * 2,
					"left"
				);

				secondaryBoxPoints = new BoxModel(
					x + Config.LABEL_ARROW_LENGTH + mainTextBoundingBox.width + Config.LABEL_PADDING * 2 - 1,
					mainTextBoundingBox.y + mainTextBoundingBox.height + Config.LABEL_PADDING,
					secondaryTextBoundingBox.width + Config.LABEL_PADDING * 2,
					secondaryTextBoundingBox.height + Config.LABEL_PADDING * 2,
					"right"
				);

				boxToGroupWith = 'main';
			}.bind(this);

			var drawWithArrowOnRight = function() {
				arrowPoints.setPoint2(
	                x - Config.LABEL_ARROW_LENGTH,
	                y - Config.LABEL_ARROW_WIDTH / 2
	            );

	            arrowPoints.setPoint3(
	                x - Config.LABEL_ARROW_LENGTH,
	                y + Config.LABEL_ARROW_WIDTH / 2
	            );

				secondaryTextElement = this.text(x - Config.LABEL_ARROW_LENGTH - Config.LABEL_PADDING, y + Config.LABEL_FONT_SIZE / 2, secondaryText)
					.attr({
						"text-anchor": "end",
						"font-family": Config.FONT_FAMILY
					});
				var secondaryTextBoundingBox = secondaryTextElement.getBBox();

				mainTextElement = this.text(secondaryTextBoundingBox.x - Config.LABEL_PADDING * 2 + 1, y + Config.LABEL_FONT_SIZE / 2, text)
					.attr({
						"text-anchor": "end",
						"font-family": Config.FONT_FAMILY
					});
				var mainTextBoundingBox = mainTextElement.getBBox();

				secondaryBoxPoints = new BoxModel(
					x + 1 - secondaryTextBoundingBox.width - Config.LABEL_ARROW_LENGTH - Config.LABEL_PADDING * 2,
					mainTextBoundingBox.y + mainTextBoundingBox.height + Config.LABEL_PADDING,
					secondaryTextBoundingBox.width + Config.LABEL_PADDING * 2,
					secondaryTextBoundingBox.height + Config.LABEL_PADDING * 2,
					"right"
				);

				mainBoxPoints = new BoxModel(
					x + 1 - Config.LABEL_ARROW_LENGTH - mainTextBoundingBox.width - Config.LABEL_PADDING * 2 - secondaryTextBoundingBox.width - Config.LABEL_PADDING * 2,
					mainTextBoundingBox.y + mainTextBoundingBox.height + Config.LABEL_PADDING,
					mainTextBoundingBox.width + Config.LABEL_PADDING * 2,
					mainTextBoundingBox.height + Config.LABEL_PADDING * 2,
					"left"
				);

				boxToGroupWith = 'secondary';
			}.bind(this);

			var drawWithArrowOnBottomLeft = function() {
				arrowPoints.setPoint2(
					x + Config.LABEL_ARROW_WIDTH / 2,
					y - Config.LABEL_ARROW_LENGTH
				);

				arrowPoints.setPoint3(
					x - Config.LABEL_ARROW_WIDTH / 2,
	                y - Config.LABEL_ARROW_LENGTH
				);

				mainTextElement = this.text(x, y + 1 - Config.LABEL_ARROW_LENGTH - Config.LABEL_PADDING - Config.LABEL_FONT_SIZE / 2, text)
					.attr({
						"text-anchor": "middle",
						"font-family": Config.FONT_FAMILY
					});
				var mainTextBoundingBox = mainTextElement.getBBox();

				secondaryTextElement = this.text(mainTextBoundingBox.x + mainTextBoundingBox.width + Config.LABEL_PADDING * 2, y + 1 - Config.LABEL_ARROW_LENGTH - Config.LABEL_PADDING - Config.LABEL_FONT_SIZE / 2, secondaryText)
					.attr({
						"text-anchor": "start",
						"font-family": Config.FONT_FAMILY
					});
				var secondaryTextBoundingBox = secondaryTextElement.getBBox();

				mainBoxPoints = new BoxModel(
					mainTextBoundingBox.x - Config.LABEL_PADDING,
					y + 1 - Config.LABEL_ARROW_LENGTH,
					mainTextBoundingBox.width + Config.LABEL_PADDING * 2,
					mainTextBoundingBox.height + Config.LABEL_PADDING * 2,
					"left"
				);
				secondaryBoxPoints = new BoxModel(
					secondaryTextBoundingBox.x - Config.LABEL_PADDING,
					y + 1 - Config.LABEL_ARROW_LENGTH,
					secondaryTextBoundingBox.width + Config.LABEL_PADDING * 2,
					secondaryTextBoundingBox.height + Config.LABEL_PADDING * 2,
					"right"
				);

				boxToGroupWith = 'main';
			}.bind(this);

			var drawWithArrowOnBottomRight = function() {
				arrowPoints.setPoint2(
					x + Config.LABEL_ARROW_WIDTH / 2,
					y - Config.LABEL_ARROW_LENGTH
				);

				arrowPoints.setPoint3(
					x - Config.LABEL_ARROW_WIDTH / 2,
	                y - Config.LABEL_ARROW_LENGTH
				);

				secondaryTextElement = this.text(x, y + 1 - Config.LABEL_ARROW_LENGTH - Config.LABEL_PADDING - Config.LABEL_FONT_SIZE / 2, secondaryText)
					.attr({
						"text-anchor": "middle",
						"font-family": Config.FONT_FAMILY
					});
				var secondaryTextBoundingBox = secondaryTextElement.getBBox();

				mainTextElement = this.text(secondaryTextBoundingBox.x - Config.LABEL_PADDING * 2, y + 1 - Config.LABEL_ARROW_LENGTH - Config.LABEL_PADDING - Config.LABEL_FONT_SIZE / 2, text)
					.attr({
						"text-anchor": "end",
						"font-family": Config.FONT_FAMILY
					});
				var mainTextBoundingBox = mainTextElement.getBBox();

				mainBoxPoints = new BoxModel(
					mainTextBoundingBox.x - Config.LABEL_PADDING,
					y + 1 - Config.LABEL_ARROW_LENGTH,
					mainTextBoundingBox.width + Config.LABEL_PADDING * 2,
					mainTextBoundingBox.height + Config.LABEL_PADDING * 2,
					"left"
				);
				secondaryBoxPoints = new BoxModel(
					secondaryTextBoundingBox.x - Config.LABEL_PADDING,
					y + 1 - Config.LABEL_ARROW_LENGTH,
					secondaryTextBoundingBox.width + Config.LABEL_PADDING * 2,
					secondaryTextBoundingBox.height + Config.LABEL_PADDING * 2,
					"right"
				);

				boxToGroupWith = 'secondary';
			}.bind(this);

			var drawWithArrowOnTopLeft = function() {
				arrowPoints.setPoint2(
					x + Config.LABEL_ARROW_WIDTH / 2,
					y + Config.LABEL_ARROW_LENGTH
				);

				arrowPoints.setPoint3(
					x - Config.LABEL_ARROW_WIDTH / 2,
	                y + Config.LABEL_ARROW_LENGTH
				);

				mainTextElement = this.text(x, y + Config.LABEL_ARROW_LENGTH + Config.LABEL_PADDING * 2 + Config.LABEL_FONT_SIZE / 2 - 1, text)
					.attr({
						"text-anchor": "middle",
						"font-family": Config.FONT_FAMILY
					});
				var mainTextBoundingBox = mainTextElement.getBBox();

				mainBoxPoints = new BoxModel(
					mainTextBoundingBox.x - Config.LABEL_PADDING,
					y - 1 + mainTextBoundingBox.height + Config.LABEL_PADDING * 2 + Config.LABEL_ARROW_LENGTH,
					mainTextBoundingBox.width + Config.LABEL_PADDING * 2,
					mainTextBoundingBox.height + Config.LABEL_PADDING * 2,
					"left"
				);

				secondaryTextElement = this.text(mainTextBoundingBox.x + mainTextBoundingBox.width + Config.LABEL_PADDING * 2, y + Config.LABEL_ARROW_LENGTH + Config.LABEL_PADDING * 2 + Config.LABEL_FONT_SIZE / 2 - 1, secondaryText)
					.attr({
						"text-anchor": "start",
						"font-family": Config.FONT_FAMILY
					});
				var secondaryTextBoundingBox = secondaryTextElement.getBBox();

				secondaryBoxPoints = new BoxModel(
					mainTextBoundingBox.x + mainTextBoundingBox.width + Config.LABEL_PADDING,
					y - 1 + mainTextBoundingBox.height + Config.LABEL_PADDING * 2 + Config.LABEL_FONT_SIZE,
					secondaryTextBoundingBox.width + Config.LABEL_PADDING * 2,
					secondaryTextBoundingBox.height + Config.LABEL_PADDING * 2,
					"right"
				);

				boxToGroupWith = 'main';
			}.bind(this);

			var drawWithArrowOnTopRight = function() {
				arrowPoints.setPoint2(
					x + Config.LABEL_ARROW_WIDTH / 2,
					y + Config.LABEL_ARROW_LENGTH
				);

				arrowPoints.setPoint3(
					x - Config.LABEL_ARROW_WIDTH / 2,
		            y + Config.LABEL_ARROW_LENGTH
				);

				secondaryTextElement = this.text(x, y + Config.LABEL_ARROW_LENGTH + Config.LABEL_PADDING * 2 + Config.LABEL_FONT_SIZE / 2 - 1, secondaryText)
					.attr({
						"text-anchor": "middle",
						"font-family": Config.FONT_FAMILY
					});
				var secondaryTextBoundingBox = secondaryTextElement.getBBox();

				mainTextElement = this.text(secondaryTextBoundingBox.x - Config.LABEL_PADDING * 2, y + Config.LABEL_ARROW_LENGTH + Config.LABEL_PADDING * 2 + Config.LABEL_FONT_SIZE / 2 - 1, text)
					.attr({
						"text-anchor": "end",
						"font-family": Config.FONT_FAMILY
					});
				var mainTextBoundingBox = mainTextElement.getBBox();

				mainBoxPoints = new BoxModel(
					mainTextBoundingBox.x - Config.LABEL_PADDING,
					y - 1 + mainTextBoundingBox.height + Config.LABEL_PADDING * 2 + Config.LABEL_ARROW_LENGTH,
					mainTextBoundingBox.width + Config.LABEL_PADDING * 2,
					mainTextBoundingBox.height + Config.LABEL_PADDING * 2,
					"left"
				);
				secondaryBoxPoints = new BoxModel(
					secondaryTextBoundingBox.x - Config.LABEL_PADDING,
					y - 1 + secondaryTextBoundingBox.height + Config.LABEL_PADDING * 2 + Config.LABEL_ARROW_LENGTH,
					secondaryTextBoundingBox.width + Config.LABEL_PADDING * 2,
					secondaryTextBoundingBox.height + Config.LABEL_PADDING * 2,
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
					borderRadius: Config.LABEL_BORDER_RADIUS,
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
					borderRadius: Config.LABEL_BORDER_RADIUS,
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
