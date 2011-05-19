var tntfixer =
{
	/**
	 *	Reference to status bar icon
	 */
	'statusBarIcon': null,
	/**
	 *	Saved preferences for this plugin
	 */
	'preferences': null,
	/**
	 *	Pattern to search on url
	 */
	 'pattern': 'omniture.com',
	/**
	 *	Number of open tabs that match the pattern
	 */
	 'matchedTabs': 0,
	/**
	 *	init
	 *	Initializes the extension. Gets a reference to the status bar icon,
	 *	gets preferences status of the extension and verifies how many Tnt tabs
	 *	are already open
	 *
	 *	@return	void
	 */
	'init': function()
	{
		//	Preferences manager
		tntfixer.preferences = Components
				.classes["@mozilla.org/preferences-service;1"].getService(
				Components.interfaces.nsIPrefService);
		tntfixer.preferences = tntfixer.preferences.getBranch('extensions.tntfixer.');
		try
		{
			var status = tntfixer.preferences.getCharPref('status');
		}
		catch (err)
		{
			var status = 'inactive';
			tntfixer.preferences.setCharPref('status', status);
		}

		//	Status bar icon
		tntfixer.statusBarIcon = document.getElementById('tntFixerStatusBarIcon');
		tntfixer.statusBarIcon.addEventListener('click',
				tntfixer.toogleStatusBarIcon, false);
		tntfixer.statusBarIcon.setAttribute('value', status);

		//	Start listening on current tab if status is active and current tab
		//	matches the domain
		if ('active' == status)
		{
			gBrowser.getBrowserForTab(gBrowser.selectedTab).addEventListener(
				'DOMContentLoaded',
				tntfixer.fixCurrentTab,
				true
			);
		}
	},
	/**
	 *	toogleStatusBarIcon
	 *	Changes the color of the icon in the status bar when it is clicked
	 *
	 *	@return	void
	 */
	'toogleStatusBarIcon': function()
	{
		if ('active' == tntfixer.statusBarIcon.getAttribute('value'))
		{
			tntfixer.statusBarIcon.setAttribute('value', 'inactive');
			tntfixer.preferences.setCharPref('status', 'inactive');
		}
		else
		{
			tntfixer.statusBarIcon.setAttribute('value', 'active');
			tntfixer.preferences.setCharPref('status', 'active');
		}
		tntfixer.getNumberOfTntTags();
	},
	/**
	 *	getNumberOfTntTags
	 *	Browses all the current tabs to find out how many Tnt tabs are open.
	 *	populates matchedTabs with the number of matches found and also returns
	 *	the value
	 *
	 *	@return	int		$found.- Number of curretly open Tnt tabs
	 */
	'getNumberOfTntTags': function()
	{
		var num = gBrowser.browsers.length;
		var found = 0;

		for (var i = 0; i < num; i++)
		{
			var tab = gBrowser.getBrowserAtIndex(i);
			if (-1 != tab.currentURI.spec.indexOf(tntfixer.pattern))
			{
				found++;
			}
		}

		tntfixer.matchedTabs = found;
		return found;
	},
	/**
	 *	getCurrentDomain
	 *	Returns the domain of the URL in the current tab
	 *
	 *	@return	string	domain.- Domain of current tab
	 */
	'getCurrentDomain': function()
	{
		var domain = gBrowser.getBrowserForTab(gBrowser.selectedTab)
			.currentURI.host;
	 	return domain;
	},
	/**
	 *	fixCurrentTab
	 *	Verifies if this is a Tnt tab. If it is neccesary listeners are attached
	 *
	 *	@return	void
	 */
	'fixCurrentTab': function()
	{
		if (-1 != tntfixer.getCurrentDomain().indexOf(tntfixer.pattern))
		{
			var el = gBrowser.getBrowserForTab(gBrowser.selectedTab).contentDocument.getElementById('international').parentNode;
			el.addEventListener(
				'click',
				function(e)
				{
					if ('international' == e.target.id)
					{
						alert(4);
						e.stopPropagation();
					}
				},
				true
			);
		}
	}
	
};

//	Initialize at startup
window.addEventListener(
	'load',
	function()
	{
		tntfixer.init();
	},
	true
);

