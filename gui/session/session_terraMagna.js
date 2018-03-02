
const preTerraMagnaInit = init;
init = function(initData, hotloadData)
{
	preTerraMagnaInit(initData, hotloadData);

	// top_panel/label.xml
	// Remember to update pregame/mainmenu_terraMagna.js in sync with this:
	// Translation: Game/Mod name as found at the top of the in-game user interface
	Engine.GetGUIObjectByName("alphaLabel").caption = sprintf(translate("%(title)s (%(version)s)"), {
		"title": translate("Terra Magna"),
		"version": translate("ALPHA XXIII")
	});
}
