/**
 * IMPORTANT: Remember to update session/top_panel/BuildLabel.xml in sync with this.
 */
g_ProjectInformation.organizationName.caption = translate("Council of Modders");
g_ProjectInformation.productDescription.caption = sprintf(
	"%(name)s\n(%(version)s)\n\n%(warning)s",
	{
		// Translation: Game/Mod name as displayed on lower part of the main menu seen on game start
		"name": setStringTags(
			sprintf(
				translate("%(title)s:\n%(subtitle)s"),
				{
					"title": translate("Terra Magna"),
					"subtitle": translate("Alpha 26")
				}
			),
			{ "font": "sans-bold-16" }
		),
		"version": translate("0 A.D. Alpha XXVI"), 
		"warning": translate("Notice: This game is under development and many features have not been added yet.")
	}
);
