Engine.LoadLibrary("rmgen");

setSunColor(0.733, 0.746, 0.574);
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
var oChicken = "gaia/fauna_chicken";
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

InitMap();

var numPlayers = getNumPlayers();
var mapSize = getMapSize();

var clPlayer = createTileClass();
var clHill = createTileClass();
var clForest = createTileClass();
var clWater = createTileClass();
var clDirt = createTileClass();
var clRock = createTileClass();
var clMetal = createTileClass();
var clFood = createTileClass();
var clBaseResource = createTileClass();
var clSouth = createTileClass();

for (var ix = 0; ix < mapSize; ix++)
	for (var iz = 0; iz < mapSize; iz++)
		if (iz < mapSize/6)
			addToClass(ix, iz, clSouth);

var [playerIDs, playerX, playerZ] = radialPlayerPlacement(0.25);

for (var i = 0; i < numPlayers; i++)
{
	var id = playerIDs[i];
	log("Creating base for player " + id + "...");
	var radius = scaleByMapSize(15,25);
	var fx = fractionToTiles(playerX[i]);
	var fz = fractionToTiles(playerZ[i]);
	var ix = round(fx);
	var iz = round(fz);

	addToClass(ix, iz, clPlayer);
	addToClass(ix+5, iz, clPlayer);
	addToClass(ix, iz+5, clPlayer);
	addToClass(ix-5, iz, clPlayer);
	addToClass(ix, iz-5, clPlayer);

	// create the city patch
	var cityRadius = radius/3;
	var placer = new ClumpPlacer(PI*cityRadius*cityRadius, 0.6, 0.3, 10, ix, iz);
	var painter = new LayeredPainter([tRoadWild, tRoad], [1]);
	createArea(placer, painter, undefined);
	// create starting units
	placeCivDefaultEntities(fx, fz, id);

	// create animals
	for (var j = 0; j < 2; ++j)
	{
		var aAngle = randFloat(0, TWO_PI);
		var aDist = 7;
		var aX = round(fx + aDist * cos(aAngle));
		var aZ = round(fz + aDist * sin(aAngle));
		var group = new SimpleGroup(
			[new SimpleObject(oChicken, 5,5, 0,3)],
			true, clBaseResource, aX, aZ
		);
		createObjectGroup(group, 0);
	}

	// create berry bushes
	var bbAngle = randFloat(0, TWO_PI);
	var bbDist = 12;
	var bbX = round(fx + bbDist * cos(bbAngle));
	var bbZ = round(fz + bbDist * sin(bbAngle));
	group = new SimpleGroup(
		[new SimpleObject(oBerryBush, 5,5, 0,3)],
		true, clBaseResource, bbX, bbZ
	);
	createObjectGroup(group, 0);
	// create metal mine
	var mAngle = bbAngle;
	while(abs(mAngle - bbAngle) < PI/3)
	{
		mAngle = randFloat(0, TWO_PI);
	}
	var mDist = radius - 4;
	var mX = round(fx + mDist * cos(mAngle));
	var mZ = round(fz + mDist * sin(mAngle));
	group = new SimpleGroup(
		[new SimpleObject(oMetalLarge, 1,1, 0,0)],
		true, clBaseResource, mX, mZ
	);
	createObjectGroup(group, 0);

	// create stone mines
	mAngle += randFloat(PI/8, PI/4);
	mX = round(fx + mDist * cos(mAngle));
	mZ = round(fz + mDist * sin(mAngle));
	group = new SimpleGroup(
		[new SimpleObject(oStoneLarge, 1,1, 0,2)],
		true, clBaseResource, mX, mZ
	);
	createObjectGroup(group, 0);

	var hillSize = PI * radius * radius;

	// create starting straggler trees
	var num = hillSize / 40;
	for (var j = 0; j < num; j++)
	{
		var tAngle = randFloat(0, TWO_PI);
		var tDist = randFloat(11, 13);
		var tX = round(fx + tDist * cos(tAngle));
		var tZ = round(fz + tDist * sin(tAngle));
		group = new SimpleGroup(
			[new SimpleObject(oBush, 2,2, 0,5)],
			false, clBaseResource, tX, tZ
		);
		createObjectGroup(group, 0, avoidClasses(clBaseResource,4));
	}

	// create grass tufts
	var num = hillSize / 250;
	for (var j = 0; j < num; j++)
	{
		var gAngle = randFloat(0, TWO_PI);
		var gDist = radius - (5 + randInt(7));
		var gX = round(fx + gDist * cos(gAngle));
		var gZ = round(fz + gDist * sin(gAngle));
		group = new SimpleGroup(
			[new SimpleObject(aGrassShort, 2,5, 0,1, -PI/8,PI/8)],
			false, clBaseResource, gX, gZ
		);
		createObjectGroup(group, 0);
	}
}
Engine.SetProgress(20);

log("Creating bumps...");
createAreas(
	new ClumpPlacer(scaleByMapSize(20, 50), 0.3, 0.06, 1),
	new SmoothElevationPainter(ELEVATION_MODIFY, 2, 2),
	avoidClasses(clPlayer, 13),
	scaleByMapSize(200, 600));

log("Creating hills...");
createAreas(
	new ClumpPlacer(scaleByMapSize(15, 100), 0.2, 0.1, 1),
	[
		new LayeredPainter([tCliff, tHill], [2]),
		new SmoothElevationPainter(ELEVATION_SET, 18, 2),
		paintClass(clHill)
	],
	avoidClasses(clPlayer, 13, clHill, 20),
	scaleByMapSize(2, 6));

log("Creating southern hills...");
createAreas(
	new ClumpPlacer(scaleByMapSize(12, 80), 0.2, 0.1, 1),
	[
		new LayeredPainter([tCliff, tHill], [2]),
		new SmoothElevationPainter(ELEVATION_SET, 18, 2),
		paintClass(clHill)
	],
	[avoidClasses(clPlayer, 17, clHill, 10), stayClasses(clSouth, 1)],
	scaleByMapSize(2, 6) * 10);

var MIN_TREES = 1000;
var MAX_TREES = 6000;
var P_FOREST = 0.95;

var totalTrees = scaleByMapSize(MIN_TREES, MAX_TREES);
var numForest = totalTrees * P_FOREST;
var numStragglers = totalTrees * (1.0 - P_FOREST);

log("Creating forests...");
var types = [
	[[tGrassDForest, tGrass, pForestD], [tGrassDForest, pForestD]],
	[[tGrassPForest, tGrass, pForestP], [tGrassPForest, pForestP]]
];

var size = numForest / (scaleByMapSize(2,8) * numPlayers);
var num = floor(size / types.length);
for (var i = 0; i < types.length; ++i)
	createAreas(
		new ClumpPlacer(numForest / num, 0.1, 0.1, 1),
		[
			new LayeredPainter(types[i], [2]),
			paintClass(clForest)
		],
		avoidClasses(clPlayer, 13, clForest, 20, clHill, 1),
		num);

Engine.SetProgress(50);

log("Creating dirt patches...");
var sizes = [scaleByMapSize(3, 48), scaleByMapSize(5, 84), scaleByMapSize(8, 128)];
for (var i = 0; i < sizes.length; i++)
	createAreas(
		new ClumpPlacer(sizes[i], 0.3, 0.06, 0.5),
		[
			new LayeredPainter([[tGrass,tGrassA],[tGrassA,tGrassB], [tGrassB,tGrassC]], [1,1]),
			paintClass(clDirt)
		],
		avoidClasses(clForest, 0, clHill, 0, clDirt, 5, clPlayer, 10),
		scaleByMapSize(20, 60));

log("Creating sand patches...");
var sizes = [scaleByMapSize(2, 32), scaleByMapSize(3, 48), scaleByMapSize(5, 80)];
for (var i = 0; i < sizes.length; i++)
	createAreas(
		new ClumpPlacer(sizes[i], 0.3, 0.06, 0.5),
		new TerrainPainter(tSand),
		avoidClasses(clForest, 0, clHill, 0, clDirt, 5, clPlayer, 10),
		scaleByMapSize(30, 90));

Engine.SetProgress(55);

log("Creating stone mines...");
createObjectGroups(
	new SimpleGroup([new SimpleObject(oStoneSmall, 0,2, 0,4), new SimpleObject(oStoneLarge, 1,1, 0,4)], true, clRock),
	0,
	avoidClasses(clForest, 1, clPlayer, 10, clRock, 10, clHill, 1),
	scaleByMapSize(2,8),
	100);

createObjectGroups(
	new SimpleGroup([new SimpleObject(oStoneSmall, 2,5, 1,3)], true, clRock),
	0,
	avoidClasses(clForest, 1, clPlayer, 10, clRock, 10, clHill, 1),
	scaleByMapSize(2,8),
	100);

log("Creating metal mines...");
createObjectGroups(
	new SimpleGroup([new SimpleObject(oMetalLarge, 1,1, 0,4)], true, clMetal),
	0,
	avoidClasses(clForest, 1, clPlayer, 10, clMetal, 10, clRock, 5, clHill, 1),
	scaleByMapSize(2,8),
	100);
Engine.SetProgress(65);

log("Creating small decorative rocks...");
createObjectGroups(
	new SimpleGroup(
		[new SimpleObject(aRockMedium, 1,3, 0,1)],
		true),
	0,
	avoidClasses(clWater, 0, clForest, 0, clPlayer, 10, clHill, 0),
	scaleByMapSize(16, 262), 50);

log("Creating large decorative rocks...");
createObjectGroups(
	new SimpleGroup(
		[new SimpleObject(aRockLarge, 1,2, 0,1), new SimpleObject(aRockMedium, 1,3, 0,2)],
		true),
	0,
	avoidClasses(clWater, 0, clForest, 0, clPlayer, 10, clHill, 0),
	scaleByMapSize(8, 131),
	50);

Engine.SetProgress(70);

log("Creating deer...");
createObjectGroups(
	new SimpleGroup(
		[new SimpleObject(oDeer, 5,7, 0,4)],
		true,
		clFood),
	0,
	avoidClasses(clWater, 0, clForest, 0, clPlayer, 10, clHill, 1, clFood, 20),
	3 * numPlayers,
	50);

Engine.SetProgress(75);

log("Creating sheep...");
createObjectGroups(
	new SimpleGroup(
		[new SimpleObject(oSheep, 2,3, 0,2)],
		true,
		clFood),
	0,
	avoidClasses(clWater, 0, clForest, 0, clPlayer, 10, clHill, 1, clFood, 20),
	3 * numPlayers,
	50);

Engine.SetProgress(85);

log("Creating straggler trees...");
var types = [oBush];
var num = floor(numStragglers / types.length);
for (var i = 0; i < types.length; ++i)
	createObjectGroups(
		new SimpleGroup(
			[new SimpleObject(types[i], 1,1, 0,3)],
			true,
			clForest),
		0,
		avoidClasses(clForest, 1, clHill, 1, clPlayer, 13, clMetal, 1, clRock, 1),
		num);

ExportMap();
