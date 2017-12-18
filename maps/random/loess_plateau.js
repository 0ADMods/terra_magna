Engine.LoadLibrary("rmgen");

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
const oChicken = "gaia/fauna_chicken";
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
const eCarob = "actor|flora/trees/carob.xml";
const eHillBush = "actor|props/flora/bush_tempe_b.xml";

var pForestP = [tForestFloor + TERRAIN_SEPARATOR + oCarob, tForestFloor];
var pForestD = [tForestFloor + TERRAIN_SEPARATOR + oBamboo, tForestFloor];

log("Initializing map...");

InitMap();

var numPlayers = getNumPlayers();
var mapSize = getMapSize();

var clPlayer = createTileClass();
var clForest = createTileClass();
var clWater = createTileClass();
var clDirt = createTileClass();
var clRock = createTileClass();
var clMetal = createTileClass();
var clFood = createTileClass();
var clBaseResource = createTileClass();
var clHill = createTileClass();
var clHill2 = createTileClass();

var playerIDs = sortAllPlayers();
var playerX = [];
var playerZ = [];
for (var i = -1; i < numPlayers-1; i++)
{
	let playerPos = (((i+abs(i%2))/2)+1)/(((numPlayers+(numPlayers%2))/2)+1)
	playerZ[i+1] = playerPos;
	playerX[i+1] = 0.2 + 0.6*((i+1)%2);
}

for (var i = 0; i < numPlayers; i++)
{
	var id = playerIDs[i];
	log("Creating base for player " + id + "...");

	var radius = scaleByMapSize(15,25);

	var fx = fractionToTiles(playerX[i]);
	var fz = fractionToTiles(playerZ[i]);
	var ix = floor(fx);
	var iz = floor(fz);
	addToClass(ix, iz, clPlayer);

	// create the city patch
	var cityRadius = radius/3;
	var placer = new ClumpPlacer(PI*cityRadius*cityRadius, 0.6, 0.3, 10, ix, iz);
	var painter = new LayeredPainter([tCityPlaza, tCity], [1]);
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
	var num = hillSize / 100;
	for (var j = 0; j < num; j++)
	{
		var tAngle = randFloat(0, TWO_PI);
		var tDist = randFloat(13, 15);
		var tX = round(fx + tDist * cos(tAngle));
		var tZ = round(fz + tDist * sin(tAngle));
		group = new SimpleGroup(
			[new SimpleObject(oCarob, 1,3, 0,2)],
			false, clBaseResource, tX, tZ
		);
		createObjectGroup(group, 0, avoidClasses(clBaseResource,4));
	}

	placeDefaultDecoratives(playerX[i], playerZ[i], aBush1, clBaseResource, radius);
}

const WATER_WIDTH = 0.03;
log("Creating river");
var theta = [];
for (var q=0 ; q < (numPlayers + (numPlayers % 2)) / 2 + 1 ; q++)
{
	theta [q] = randFloat(0, TWO_PI);
}
for (ix = 0; ix < mapSize; ix++)
{
	for (iz = 0; iz < mapSize; iz++)
	{
		var x = ix / (mapSize + 1.0);
		var z = iz / (mapSize + 1.0);

		var h = 0;

		h = 32 * (z - 0.5);

		// add the rough shape of the water
		var km = 0.8/scaleByMapSize(35, 160);
		var rn = (numPlayers+(numPlayers%2))/2;
		if (-3.0 < getHeight(ix, iz))
		{
			for (var nr = 0; nr < rn + 1 ; nr++)
			{
				var cu = km*sin(theta[nr]+x*PI*(mapSize/64));
				var kal = (2*nr+1)/(2*rn+2);
				if ((z > cu+(kal-WATER_WIDTH))&&(z < cu+(kal+WATER_WIDTH)))
				{
					if (z < cu+((kal-WATER_WIDTH+0.03)))
					{
						h = -5 + 160.0*(cu+((kal-WATER_WIDTH+0.03)-z));
						if (((x>0.475)&&(x<0.525))&&(h<-1.5))
						{
							h=-1.5;
						}

					}
					else if (z > (cu+((kal+WATER_WIDTH-0.03))))
					{
						h = -5 + 160.0*(z-(cu+((kal+WATER_WIDTH-0.03))));
						if (((x>0.475)&&(x<0.525))&&(h<-1.5))
						{
							h=-1.5;
						}
					}
					else
					{
						if ((x>0.475)&&(x<0.525))
						{
							h = -1.5;
						}
						else
						{
							h = -3.0;
						}
					}
					setHeight(ix, iz, h);
					addToClass(ix, iz, clWater);
					placeTerrain(ix, iz, tWater);
					placeTerrain(ix, iz+1, tWater);
					placeTerrain(ix, iz-1, tWater);
				}
			}
		}
	}
}

Engine.SetProgress(45);

log("Creating bumps...");
createAreas(
	new ClumpPlacer(scaleByMapSize(20, 50), 0.3, 0.06, 1),
	new SmoothElevationPainter(ELEVATION_MODIFY, 2, 2),
	avoidClasses(clWater, 2, clPlayer, 13),
	scaleByMapSize(100, 200)
);

log("Creating hills...");
createAreas(
	new ClumpPlacer(scaleByMapSize(20, 150), 0.2, 0.1, 1),
	[
		new LayeredPainter([tCliff, tDirtCracks], [2]),
		new SmoothElevationPainter(ELEVATION_SET, 12, 2),
		paintClass(clHill)
	],
	avoidClasses(clPlayer, 18, clWater, 5, clHill, 10),
	3 * scaleByMapSize(1, 4) * numPlayers);

log("Creating level 2 hills...");
createAreas(
	new ClumpPlacer(scaleByMapSize(10, 75), 0.2, 0.1, 1),
	[
		new LayeredPainter([tCliff, tDirtCracks], [2]),
		new SmoothElevationPainter(ELEVATION_SET, 18, 2),
		paintClass(clHill2)
	],
	stayClasses(clHill, 0),
	8 * scaleByMapSize(1, 4) * numPlayers
);

log("Creating level 3 hills...");
createAreas(
	new ClumpPlacer(scaleByMapSize(5, 37), 0.2, 0.1, 1),
	[
		new LayeredPainter([tCliff, tDirtCracks], [2]),
		new SmoothElevationPainter(ELEVATION_SET, 25, 2),
		paintClass(clHill2)
	],
	stayClasses(clHill2, 0),
	20 * scaleByMapSize(1, 4) * numPlayers
);

var MIN_TREES = 600;
var MAX_TREES = 3600;
var P_FOREST = 0.7;

var totalTrees = scaleByMapSize(MIN_TREES, MAX_TREES);
var numForest = totalTrees * P_FOREST;
var numStragglers = totalTrees * (1.0 - P_FOREST);

log("Creating forests...");
var types = [
	[[tForestFloor, tGrassA, pForestD], [tForestFloor, pForestD]],
	[[tForestFloor, tGrassA, pForestP], [tForestFloor, pForestP]]
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
		avoidClasses(clPlayer, 12, clForest, 10, clWater, 2, clHill, 2),
		num);

Engine.SetProgress(60);

log("Creating grass patches...");
var sizes = [scaleByMapSize(3, 48), scaleByMapSize(5, 84), scaleByMapSize(8, 128)];
for (var i = 0; i < sizes.length; i++)
	createAreas(
		new ClumpPlacer(sizes[i], 0.3, 0.06, 0.5),
		[
			new LayeredPainter([[tGrassC,tGrassA],[tGrassA,tGrassB], [tGrassB,tGrassC]], [1,1]),
			paintClass(clDirt)
		],
		avoidClasses(clForest, 0, clHill, 0, clDirt, 5, clPlayer, 10, clWater, 1),
		scaleByMapSize(15, 45)
	);

log("Creating dirt patches...");
var sizes = [scaleByMapSize(2, 32), scaleByMapSize(3, 48), scaleByMapSize(5, 80)];
for (var i = 0; i < sizes.length; i++)
	createAreas(
		new ClumpPlacer(sizes[i], 0.3, 0.06, 0.5),
		new TerrainPainter(tDirtCracks),
		avoidClasses(clForest, 0, clHill, 0, clDirt, 5, clPlayer, 10, clWater, 1),
		scaleByMapSize(15, 45));

Engine.SetProgress(65);

log("Creating stone mines...");
createObjectGroupsDeprecated(
	new SimpleGroup([new SimpleObject(oStoneSmall, 0,2, 0,4), new SimpleObject(oStoneLarge, 1,1, 0,4)], true, clRock),
	0,
	avoidClasses(clForest, 1, clPlayer, 10, clRock, 10, clHill, 1, clWater, 1),
	scaleByMapSize(4,16),
	100);

log("Creating small stone quarries...");
createObjectGroupsDeprecated(
	new SimpleGroup([new SimpleObject(oStoneSmall, 2,5, 1,3)], true, clRock),
	0,
	avoidClasses(clForest, 1, clPlayer, 10, clRock, 10, clHill, 1, clWater, 1),
	scaleByMapSize(4,16),
	100);

log("Creating metal mines...");
createObjectGroupsDeprecated(
	new SimpleGroup([new SimpleObject(oMetalLarge, 1,1, 0,4)], true, clMetal),
	0,
	avoidClasses(clForest, 1, clPlayer, 10, clMetal, 10, clRock, 5, clHill, 1, clWater, 1),
	scaleByMapSize(4,16),
	100);

Engine.SetProgress(75);

log("Creating bushes...");
createObjectGroupsDeprecated(
	new SimpleGroup([new RandomObject(aBushes, 2,3, 0,2)]),
	0,
	avoidClasses(clWater, 1, clPlayer, 10, clForest, 0),
	10*scaleByMapSize(16, 262));

log("Creating lillies...");
group = new SimpleGroup([new SimpleObject(aLillies, 1,2, 0,2)]);
createObjectGroupsDeprecated(group, 0,
	stayClasses(clWater, 1),
	10*scaleByMapSize(16, 262)
);

log("Creating reeds...");
createObjectGroupsDeprecated(
	new SimpleGroup([new SimpleObject(aReeds, 1,2, 0,2)]),
	0,
	stayClasses(clWater, 1),
	10*scaleByMapSize(16, 262));

log("Creating more decorative rocks...");
createObjectGroupsDeprecated(
	new SimpleGroup([new SimpleObject(aDecorativeRock, 1,2, 0,2)]),
	0,
	avoidClasses(clWater, 1, clPlayer, 5, clForest, 0),
	scaleByMapSize(16, 262));

Engine.SetProgress(80);

log("Creating goats...");
group = new SimpleGroup([new SimpleObject(oGoat, 2,4, 0,3)], true, clFood);
createObjectGroupsDeprecated(
	group,
	0,
	avoidClasses(clForest, 0, clPlayer, 10, clWater, 1, clFood, 10, clHill, 2),
	scaleByMapSize(5, 20),
	50);

log("Creating deer...");
createObjectGroupsDeprecated(
	new SimpleGroup([new SimpleObject(oDeer, 2,4, 0,3)], true, clFood),
	0,
	avoidClasses(clForest, 0, clPlayer, 10, clWater, 1, clFood, 10, clHill, 2),
	scaleByMapSize(5, 20),
	50);

Engine.SetProgress(90);

log("Creating fish...");
createObjectGroupsDeprecated(
	new SimpleGroup(
		[new SimpleObject(oFish, 1,1, 0,2)],
		true,
		clFood),
	0,
	[avoidClasses(clFood, 20), stayClasses(clWater, 2)],
	5 * numPlayers,
	60);

Engine.SetProgress(95);

log("Creating straggler trees...");
var types = [oBamboo, oCarob];
var num = floor(numStragglers / types.length);
for (var i = 0; i < types.length; ++i)
	createObjectGroupsDeprecated(
		new SimpleGroup(
			[new SimpleObject(types[i], 1,1, 0,3)],
			true, clForest
		),
		0,
		avoidClasses(clWater, 1, clForest, 1, clHill, 1, clPlayer, 9, clMetal, 1, clRock, 1),
		num);

log("Creating hill trees...");
var types = [eHillBush, eCarob];
var num = 2*floor(numStragglers / types.length);
for (var i = 0; i < types.length; ++i)
	createObjectGroupsDeprecated(
		new SimpleGroup(
			[new SimpleObject(types[i], 1,1, 0,3)],
			true, clForest
		),
		0,
		stayClasses(clHill, 2),
		num);

setWaterColor(0.51, 0.6, 0.4);
setWaterTint(0.45, 0.53, 0.4);

ExportMap();