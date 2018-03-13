Engine.LoadLibrary("rmgen");
Engine.LoadLibrary("rmgen-common");

const tPrimary = ["temp_grass", "temp_grass_c"];
const tCity = "road_flat";
const tCityPlaza = "road_flat";
const tForestFloor = "temp_grass_clovers_2";
const tGrassC = "temp_grass";
const tGrassA = "temp_grass_c";
const tGrassB = "peat_temp";
const tDirtCracks = "temp_dirt_gravel_plants";
const tCliff = "temp_cliff_b";
const tWater = "dirt_soft";

const oBerryBush = "gaia/flora_bush_berry";
const oDeer = "gaia/fauna_deer";
const oFish = "gaia/fauna_fish";
const oGoat = "gaia/fauna_goat";
const oStoneLarge = "gaia/geology_stonemine_temperate_quarry";
const oStoneSmall = "gaia/geology_stone_temperate";
const oMetalLarge = "gaia/geology_metal_temperate_slabs";
const oBamboo = "gaia/flora_chin_bamboo";
const oCarob = "gaia/flora_tree_carob";

const aBush1 = "actor|props/flora/bush_tempe_sm_lush.xml";
const aBush2 = "actor|props/flora/bush_tempe_me_lush.xml";
const aBush3 = "actor|props/flora/bush_tempe_la_lush.xml";
const aBush4 = "actor|props/flora/bush_tempe_underbrush.xml";
const aBushes = [aBush1, aBush2, aBush3, aBush4];
const aDecorativeRock = "actor|geology/stone_granite_small.xml";
const aReeds = "actor|props/flora/reeds_pond_lush_a.xml";
const aLillies = "actor|props/flora/water_lillies.xml";
const aCarob = "actor|flora/trees/carob.xml";
const aHillBush = "actor|props/flora/bush_tempe_b.xml";

var pForestP = [tForestFloor + TERRAIN_SEPARATOR + oCarob, tForestFloor];
var pForestD = [tForestFloor + TERRAIN_SEPARATOR + oBamboo, tForestFloor];

var heightSeaGround = -5;
var heightShallows = -1.5;
var heightLand = 1;

var g_Map = new RandomMap(heightLand, tPrimary);
var mapBounds = g_Map.getBounds();
var numPlayers = getNumPlayers();

var clPlayer = g_Map.createTileClass();
var clForest = g_Map.createTileClass();
var clWater = g_Map.createTileClass();
var clDirt = g_Map.createTileClass();
var clRock = g_Map.createTileClass();
var clMetal = g_Map.createTileClass();
var clFood = g_Map.createTileClass();
var clBaseResource = g_Map.createTileClass();
var clHill = g_Map.createTileClass();
var clHill2 = g_Map.createTileClass();

placePlayerBases({
	"PlayerPlacement": playerPlacementRiver(0, fractionToTiles(0.6)),
	"PlayerTileClass": clPlayer,
	"BaseResourceClass": clBaseResource,
	"Walls": "towers",
	"CityPatch": {
		"outerTerrain": tCityPlaza,
		"innerTerrain": tCity
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
		"template": oCarob,
		"count": scaleByMapSize(7, 20)
	},
	"Decoratives": {
		"template": aBush1
	}
});
Engine.SetProgress(40);

// A pair of players is placed between two rivers
var riverCount = Math.ceil(numPlayers / 2) + 1;
for (let riverID = 0; riverID < riverCount; ++riverID)
{
	let z = fractionToTiles((2 * riverID + 1) / (2 * riverCount));
	paintRiver({
		"parallel": true,
		"start": new Vector2D(mapBounds.left, z),
		"end": new Vector2D(mapBounds.right, z),
		"width": fractionToTiles(0.06),
		"fadeDist": fractionToTiles(0.01),
		"deviation": fractionToTiles(0),
		"heightLand": heightLand,
		"heightRiverbed": heightSeaGround,
		"mihHeight": heightSeaGround,
		"meanderShort": 16,
		"meanderLong": 0,
		"waterFunc": (position, height, riverFraction) => {

			if (riverFraction > 0.475 && riverFraction < 0.525 && height < heightShallows)
				g_Map.setHeight(position, heightShallows);

			clWater.add(position);
		}
	});
}
Engine.SetProgress(45);

createArea(
	new MapBoundsPlacer(),
	new TerrainPainter(tWater),
	new NearTileClassConstraint(clWater, 1));

g_Map.log("Creating bumps");
createAreas(
	new ClumpPlacer(scaleByMapSize(20, 50), 0.3, 0.06, 1),
	new SmoothElevationPainter(ELEVATION_MODIFY, 2, 2),
	avoidClasses(clWater, 2, clPlayer, 13),
	scaleByMapSize(100, 200));

g_Map.log("Creating hills");
createAreas(
	new ClumpPlacer(scaleByMapSize(20, 150), 0.2, 0.1, 1),
	[
		new LayeredPainter([tCliff, tDirtCracks], [2]),
		new SmoothElevationPainter(ELEVATION_SET, 12, 2),
		new TileClassPainter(clHill)
	],
	avoidClasses(clPlayer, 18, clWater, 5, clHill, 10),
	3 * scaleByMapSize(1, 4) * numPlayers);

g_Map.log("Creating level 2 hills");
createAreas(
	new ClumpPlacer(scaleByMapSize(10, 75), 0.2, 0.1, 1),
	[
		new LayeredPainter([tCliff, tDirtCracks], [2]),
		new SmoothElevationPainter(ELEVATION_SET, 18, 2),
		new TileClassPainter(clHill2)
	],
	stayClasses(clHill, 0),
	8 * scaleByMapSize(1, 4) * numPlayers);

g_Map.log("Creating level 3 hills");
createAreas(
	new ClumpPlacer(scaleByMapSize(5, 37), 0.2, 0.1, 1),
	[
		new LayeredPainter([tCliff, tDirtCracks], [2]),
		new SmoothElevationPainter(ELEVATION_SET, 25, 2),
		new TileClassPainter(clHill2)
	],
	stayClasses(clHill2, 0),
	20 * scaleByMapSize(1, 4) * numPlayers);

g_Map.log("Creating forests");
var [numForest, numStragglers] = getTreeCounts(600, 3200, 0.7);
createForests(
	[tGrassA, tForestFloor, tForestFloor, pForestD, pForestP],
	avoidClasses(clPlayer, 12, clForest, 10, clWater, 2, clHill, 2),
	clForest,
	numForest);
Engine.SetProgress(60);

g_Map.log("Creating grass patches");
var sizes = [scaleByMapSize(3, 48), scaleByMapSize(5, 84), scaleByMapSize(8, 128)];
for (var i = 0; i < sizes.length; i++)
	createAreas(
		new ClumpPlacer(sizes[i], 0.3, 0.06, 0.5),
		[
			new LayeredPainter([[tGrassC,tGrassA],[tGrassA,tGrassB], [tGrassB,tGrassC]], [1,1]),
			new TileClassPainter(clDirt)
		],
		avoidClasses(clForest, 0, clHill, 0, clDirt, 5, clPlayer, 10, clWater, 1),
		scaleByMapSize(15, 45));

g_Map.log("Creating dirt patches");
var sizes = [scaleByMapSize(2, 32), scaleByMapSize(3, 48), scaleByMapSize(5, 80)];
for (var i = 0; i < sizes.length; i++)
	createAreas(
		new ClumpPlacer(sizes[i], 0.3, 0.06, 0.5),
		new TerrainPainter(tDirtCracks),
		avoidClasses(clForest, 0, clHill, 0, clDirt, 5, clPlayer, 10, clWater, 1),
		scaleByMapSize(15, 45));

Engine.SetProgress(65);

g_Map.log("Creating stone mines");
createObjectGroups(
	new SimpleGroup([new SimpleObject(oStoneSmall, 0,2, 0,4), new SimpleObject(oStoneLarge, 1,1, 0,4)], true, clRock),
	0,
	avoidClasses(clForest, 1, clPlayer, 10, clRock, 10, clHill, 1, clWater, 1),
	scaleByMapSize(4,16),
	100);

g_Map.log("Creating small stone quarries");
createObjectGroups(
	new SimpleGroup([new SimpleObject(oStoneSmall, 2,5, 1,3)], true, clRock),
	0,
	avoidClasses(clForest, 1, clPlayer, 10, clRock, 10, clHill, 1, clWater, 1),
	scaleByMapSize(4,16),
	100);

g_Map.log("Creating metal mines");
createObjectGroups(
	new SimpleGroup([new SimpleObject(oMetalLarge, 1,1, 0,4)], true, clMetal),
	0,
	avoidClasses(clForest, 1, clPlayer, 10, clMetal, 10, clRock, 5, clHill, 1, clWater, 1),
	scaleByMapSize(4,16),
	100);

Engine.SetProgress(75);

g_Map.log("Creating bushes");
createObjectGroups(
	new SimpleGroup([new RandomObject(aBushes, 2,3, 0,2)]),
	0,
	avoidClasses(clWater, 1, clPlayer, 10, clForest, 0),
	10*scaleByMapSize(16, 262));

g_Map.log("Creating lillies");
createObjectGroups(
	new SimpleGroup([new SimpleObject(aLillies, 1, 2, 0, 2)]),
	0,
	stayClasses(clWater, 1),
	10 * scaleByMapSize(16, 262));

g_Map.log("Creating reeds");
createObjectGroups(
	new SimpleGroup([new SimpleObject(aReeds, 1,2, 0,2)]),
	0,
	stayClasses(clWater, 1),
	10 * scaleByMapSize(16, 262));

g_Map.log("Creating more decorative rocks");
createObjectGroups(
	new SimpleGroup([new SimpleObject(aDecorativeRock, 1,2, 0,2)]),
	0,
	avoidClasses(clWater, 1, clPlayer, 5, clForest, 0),
	scaleByMapSize(16, 262));

Engine.SetProgress(80);

g_Map.log("Creating goats");
createObjectGroups(
	new SimpleGroup([new SimpleObject(oGoat, 2, 4, 0, 3)], true, clFood),
	0,
	avoidClasses(clForest, 0, clPlayer, 10, clWater, 1, clFood, 10, clHill, 2),
	scaleByMapSize(5, 20),
	50);

g_Map.log("Creating deer");
createObjectGroups(
	new SimpleGroup([new SimpleObject(oDeer, 2,4, 0,3)], true, clFood),
	0,
	avoidClasses(clForest, 0, clPlayer, 10, clWater, 1, clFood, 10, clHill, 2),
	scaleByMapSize(5, 20),
	50);
Engine.SetProgress(90);

g_Map.log("Creating fish");
createObjectGroups(
	new SimpleGroup(
		[new SimpleObject(oFish, 1,1, 0,2)],
		true,
		clFood),
	0,
	[avoidClasses(clFood, 20), stayClasses(clWater, 2)],
	5 * numPlayers,
	60);
Engine.SetProgress(95);

createStragglerTrees([oBamboo, oCarob], avoidClasses(clWater, 1, clForest, 1, clHill, 1, clPlayer, 9, clMetal, 1, clRock, 1), clForest, numStragglers);
createStragglerTrees([aHillBush, aCarob], stayClasses(clHill, 2), clForest, 2 * numStragglers);

setWaterColor(0.51, 0.6, 0.4);
setWaterTint(0.45, 0.53, 0.4);

g_Map.ExportMap();
