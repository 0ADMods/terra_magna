Engine.LoadLibrary("rmgen");
Engine.LoadLibrary("rmgen-common");

var tGrass = ["desert_dirt_rough", "desert_dirt_rough_2", "desert_sand_dunes_50", "desert_sand_smooth"];
var tGrassPForest = "desert_dirt_rocks_1";
var tGrassDForest = "desert_dirt_rough";
var tCliff = ["desert_cliff_1", "desert_cliff_2", "desert_cliff_3", "desert_cliff_4", "desert_cliff_5"];
var tGrassA = ["desert_sand_dunes_50", "desert_dirt_rough_2", "desert_sand_dunes_50", "desert_sand_smooth"];
var tGrassB = ["desert_sand_smooth", "desert_dirt_rough_2", "desert_sand_dunes_50", "desert_sand_smooth"];
var tGrassC = "desert_sand_dunes_50";
var tHill = ["desert_dirt_rocks_1", "desert_dirt_rocks_2", "desert_dirt_rocks_3"];
var tRoad = "desert_city_tile";
var tRoadWild = "desert_city_tile";
var tSand = ["desert_sand_dunes_50", "desert_sand_dunes_50", "desert_sand_smooth"];

var oBush = "gaia/flora_bush_temperate";
var oBerryBush = "gaia/flora_bush_grapes";
var oDeer = "gaia/fauna_camel";
var oSheep = "gaia/fauna_gazelle";
var oStoneLarge = "gaia/geology_stonemine_desert_quarry";
var oStoneSmall = "gaia/geology_stone_desert_small";
var oMetalLarge = "gaia/geology_metal_desert_slabs";

var aGrassShort = "actor|props/flora/grass_soft_dry_large.xml";
var aRockLarge = "actor|geology/stone_desert_med.xml";
var aRockMedium = "actor|geology/stone_desert_med.xml";

var pForestD = [tGrassDForest + TERRAIN_SEPARATOR + oBush, tGrassDForest];
var pForestP = [tGrassPForest + TERRAIN_SEPARATOR + oBush, tGrassPForest];

var g_Map = new RandomMap(2, tGrass);
var mapBounds = g_Map.getBounds();
var numPlayers = getNumPlayers();

var clPlayer = g_Map.createTileClass();
var clHill = g_Map.createTileClass();
var clForest = g_Map.createTileClass();
var clWater = g_Map.createTileClass();
var clDirt = g_Map.createTileClass();
var clRock = g_Map.createTileClass();
var clMetal = g_Map.createTileClass();
var clFood = g_Map.createTileClass();
var clBaseResource = g_Map.createTileClass();
var clSouth = g_Map.createTileClass();

placePlayerBases({
	"PlayerPlacement": playerPlacementCircle(fractionToTiles(0.25)),
	"PlayerTileClass": clPlayer,
	"BaseResourceClass": clBaseResource,
	"CityPatch": {
		"outerTerrain": tRoadWild,
		"innerTerrain": tRoad
	},
	"Chicken": {
	},
	"Berries": {
		"template": oBerryBush
	},
	"Mines": {
		"types": [
			{ "template": oMetalLarge },
			{ "template": oStoneLarge }
		]
	},
	"Trees": {
		"template": oBush,
		"count": scaleByMapSize(17, 50)
	},
	"Decoratives": {
		"template": aGrassShort
	}
});
Engine.SetProgress(20);

g_Map.log("Creating bumps");
createAreas(
	new ClumpPlacer(scaleByMapSize(20, 50), 0.3, 0.06, 1),
	new SmoothElevationPainter(ELEVATION_MODIFY, 2, 2),
	avoidClasses(clPlayer, 13),
	scaleByMapSize(200, 600));
Engine.SetProgress(25);

g_Map.log("Creating hills");
createAreas(
	new ClumpPlacer(scaleByMapSize(15, 100), 0.2, 0.1, 1),
	[
		new LayeredPainter([tCliff, tHill], [2]),
		new SmoothElevationPainter(ELEVATION_SET, 18, 2),
		new TileClassPainter(clHill)
	],
	avoidClasses(clPlayer, 13, clHill, 20),
	scaleByMapSize(2, 6));
Engine.SetProgress(30);

g_Map.log("Marking south");
createArea(
	new RectPlacer(new Vector2D(mapBounds.left, mapBounds.bottom), new Vector2D(mapBounds.right, mapBounds.bottom + fractionToTiles(1/6))),
	new TileClassPainter(clSouth));

g_Map.log("Creating southern hills");
createAreas(
	new ClumpPlacer(scaleByMapSize(12, 80), 0.2, 0.1, 1),
	[
		new LayeredPainter([tCliff, tHill], [2]),
		new SmoothElevationPainter(ELEVATION_SET, 18, 2),
		new TileClassPainter(clHill)
	],
	[avoidClasses(clPlayer, 17, clHill, 10), stayClasses(clSouth, 1)],
	scaleByMapSize(2, 6) * 10);
Engine.SetProgress(40);

var [numForest, numStragglers] = getTreeCounts(1000, 6000, 0.95);
createForests(
	[tGrass, tGrassDForest, tGrassPForest, pForestD, pForestP],
	avoidClasses(clPlayer, 13, clForest, 20, clHill, 1),
	clForest,
	numForest);
Engine.SetProgress(50);

g_Map.log("Creating dirt patches");
var sizes = [scaleByMapSize(3, 48), scaleByMapSize(5, 84), scaleByMapSize(8, 128)];
for (let size of sizes)
	createAreas(
		new ClumpPlacer(size, 0.3, 0.06, 0.5),
		[
			new LayeredPainter([[tGrass, tGrassA], [tGrassA, tGrassB], [tGrassB, tGrassC]], [1, 1]),
			new TileClassPainter(clDirt)
		],
		avoidClasses(clForest, 0, clHill, 0, clDirt, 5, clPlayer, 10),
		scaleByMapSize(20, 60));
Engine.SetProgress(52);

g_Map.log("Creating sand patches");
var sizes = [scaleByMapSize(2, 32), scaleByMapSize(3, 48), scaleByMapSize(5, 80)];
for (var i = 0; i < sizes.length; i++)
	createAreas(
		new ClumpPlacer(sizes[i], 0.3, 0.06, 0.5),
		new TerrainPainter(tSand),
		avoidClasses(clForest, 0, clHill, 0, clDirt, 5, clPlayer, 10),
		scaleByMapSize(30, 90));
Engine.SetProgress(55);

g_Map.log("Creating stone mines");
createObjectGroups(
	new SimpleGroup([new SimpleObject(oStoneSmall, 0,2, 0,4), new SimpleObject(oStoneLarge, 1,1, 0,4)], true, clRock),
	0,
	avoidClasses(clForest, 1, clPlayer, 10, clRock, 10, clHill, 1),
	scaleByMapSize(2,8),
	100);
Engine.SetProgress(60);

createObjectGroups(
	new SimpleGroup([new SimpleObject(oStoneSmall, 2,5, 1,3)], true, clRock),
	0,
	avoidClasses(clForest, 1, clPlayer, 10, clRock, 10, clHill, 1),
	scaleByMapSize(2, 8),
	100);
Engine.SetProgress(62);

g_Map.log("Creating metal mines");
createObjectGroups(
	new SimpleGroup([new SimpleObject(oMetalLarge, 1,1, 0,4)], true, clMetal),
	0,
	avoidClasses(clForest, 1, clPlayer, 10, clMetal, 10, clRock, 5, clHill, 1),
	scaleByMapSize(2,8),
	100);
Engine.SetProgress(65);

g_Map.log("Creating small decorative rocks");
createObjectGroups(
	new SimpleGroup([new SimpleObject(aRockMedium, 1, 3, 0, 1)], true),
	0,
	avoidClasses(clWater, 0, clForest, 0, clPlayer, 10, clHill, 0),
	scaleByMapSize(16, 262),
	50);
Engine.SetProgress(67);

g_Map.log("Creating large decorative rocks");
createObjectGroups(
	new SimpleGroup([new SimpleObject(aRockLarge, 1, 2, 0, 1), new SimpleObject(aRockMedium, 1, 3, 0, 2)], true),
	0,
	avoidClasses(clWater, 0, clForest, 0, clPlayer, 10, clHill, 0),
	scaleByMapSize(8, 131),
	50);
Engine.SetProgress(70);

g_Map.log("Creating deer");
createObjectGroups(
	new SimpleGroup([new SimpleObject(oDeer, 5, 7, 0, 4)], true, clFood),
	0,
	avoidClasses(clWater, 0, clForest, 0, clPlayer, 10, clHill, 1, clFood, 20),
	3 * numPlayers,
	50);
Engine.SetProgress(75);

g_Map.log("Creating sheep");
createObjectGroups(
	new SimpleGroup([new SimpleObject(oSheep, 2, 3, 0, 2)], true, clFood),
	0,
	avoidClasses(clWater, 0, clForest, 0, clPlayer, 10, clHill, 1, clFood, 20),
	3 * numPlayers,
	50);
Engine.SetProgress(85);

createStragglerTrees([oBush], avoidClasses(clForest, 1, clHill, 1, clPlayer, 13, clMetal, 1, clRock, 1), clForest, numStragglers);

placePlayersNomad(clPlayer, avoidClasses(clForest, 1, clMetal, 4, clRock, 4, clHill, 4, clFood, 2));

setSunColor(0.733, 0.746, 0.574);

g_Map.ExportMap();
