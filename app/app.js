'use strict';
var myApp = angular.module('myApp',[]);
var x = 0;
var y = 0;
myApp.service('userControls', [function() {
	return {
		keyPress: function(keyEvent) {
			console.log(keyEvent);
		},
	}
}]);

myApp.controller("appController", ["$scope", "userControls",
function($scope, userControls) {
	$scope.keyListener = function(keyEvent) {
		$scope.splashScreen = true;
		if (!$scope.splashScreen) {
			$scope.splashScreen = true;
			console.log('splash off');
			//return;
		}
		userControls.keyPress(keyEvent);
	}
}]);
myApp.directive("aspGame", ["userControls", function(userControls) {

	return {
		restrict: 'A',
		template: '<canvas id="gameCanvas" width="1200" height="800" style="border:1px solid #000000;"></canvas>',

		link: function(scope, element) {
			var stage = new createjs.Stage("gameCanvas");
			var w = stage.canvas.width;
			var h = stage.canvas.height;
			var tileW = 64;
			var tileH = 64;
			var imgsrc = new Image();
			var dirtLand = [];
			var imgcount = 36;
			var update = true;

			var manifest = [];
			for (var i = 1; i <= 36; i++) {
				imgsrc = [{src: "Land_DirtGrass (" + i + ").png", id: "dirtLand" + i}];
				manifest = manifest.concat(imgsrc);
			}

			console.log(manifest);
			var loader = new createjs.LoadQueue(false);
			loader.addEventListener("complete", handleComplete);
			loader.loadManifest(manifest, true, "img/topDown/");

			function handleComplete(event) {
				gridLoop(12, 3, null, function(x, y) {
					var bitmap = new createjs.Bitmap(loader.getResult("dirtLand" + (x + ((y - 1) * 12))));
					var border = new createjs.Shape();
					var container = new createjs.Container();

					border.graphics.beginStroke("#000").setStrokeStyle(1).drawRect(-1, -1, 130, 130);
					container.addChild(border, bitmap);
					container.x = (x - 1) * 65 + (2 * x);
					container.y = 65 * (y - 1) + (2 * y);
					container.scaleX = container.scaleY = .5;
					//console.log(container);
					stage.addChild(container);
					bitmap.addEventListener("mousedown", function (evt) {
						var o = evt.target;
						var border = new createjs.Shape();
						border.graphics.beginStroke("red").setStrokeStyle(1).drawRect(-1, -1, 130, 130);
						scope.selected = o;
						console.log(o);
						o.parent.removeChild(o.parent.children[0]);
						o.parent.addChildAt(border, 0);
						update = true;
					});
					bitmap.addEventListener("rollover", function (evt) {
						var o = evt.target;
						o.scaleX = o.scaleY = o.scale * 1.2;
						update = true;
					});

					bitmap.addEventListener("rollout", function (evt) {
						var o = evt.target;
						o.scaleX = o.scaleY = o.scale;
						update = true;
					});
				});
				console.log(stage);
				drawMap();
				update = true;
				createjs.Ticker.addEventListener("tick", tick);
			}
			function drawMap() {
				var map = new createjs.Container();
				var border = new createjs.Shape();
				var tilesX = parseInt(stage.canvas.clientWidth / tileW);
				var tilesY = parseInt(stage.canvas.clientHeight / tileH) - 4;
				var offsetX = 10;
				var offsetY = 10;
				//console.log(tilesX + " " + tilesY);
				border.graphics.beginStroke("#000").setStrokeStyle(1).drawRect(2, 2, stage.canvas.clientWidth - offsetX, stage.canvas.clientHeight - 270);

				map.addChild(border);
				map.x = 2;
				map.y = tileH * 4;
				console.log(border);
				stage.addChild(map);

				gridLoop(tilesX, tilesY, map, function(x, y, containerWrap) {
					var border = new createjs.Shape();
					var bitmap = new createjs.Bitmap(loader.getResult("dirtLand8"));
					var mapTile = new createjs.Container();

					bitmap.scaleX = bitmap.scaleY = tileW / bitmap.image.width;
					border.graphics.beginStroke("#000").setStrokeStyle(1).beginFill("darkgrey").drawRect(-1, -1, tileW, tileH);
					//border.name = 'testing'  + (tilesX + (tilesX * (tilesY-1)));
					mapTile.addChild(border, bitmap);
					mapTile.x = (x - 1) * tileW + offsetX;
					mapTile.y = (y - 1) * tileH + offsetY;
					containerWrap.addChildAt(mapTile, 0);
					stage.addChild(containerWrap);
					bitmap.addEventListener("mousedown", function (evt) {
						console.log(evt);
						var mapClick = evt.target;
						var border = new createjs.Shape();
						border.graphics.beginStroke("red").setStrokeStyle(1).drawRect(offsetX, offsetY, tileW, tileH);
						console.log(mapClick);
						mapClick.image = scope.selected.image;
						update = true;
					});

					console.log("testing");
					//console.log(map.y + (y - 1) * tileH);
				});
				update = true;
			}
			function gridLoop(gridX, gridY, container, funct) {
				for (y = 1; y <= gridY; y++) {
					for (x = 1; x <= gridX; x++) {
						funct(x, y, container);
					}
				}
			}
			function tick(event) {
				// this set makes it so the stage only re-renders when an event handler indicates a change has happened.
				if (update) {
					update = false; // only update once
					stage.update(event);
				}
			}
		}
	}
}]);