const preTerraMagnaInit = init;
init = function(initData, hotloadData)
{
	preTerraMagnaInit(initData, hotloadData);

	// Remember to keep session/session_terraMagna.js in sync with this:
	Engine.GetGUIObjectByName("mainMenu").children[4].children[0].caption = sprintf("%(name)s\n(%(version)s)\n\n%(warning)s", {
		// Translation: Game/Mod name as displayed on lower part of the main menu seen on game start
		"name": setStringTags(translate("Terra Magna"), { "font": "sans-bold-16" }),
		"version": translate("0 A.D. Alpha XXIII"), 
		"warning": translate("WARNING: This is an early development version of the game. Many features have not been added yet.")
	});
}
