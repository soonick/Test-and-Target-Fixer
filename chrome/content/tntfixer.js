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
	 *	Number of open tabs that match the pattern in all windows
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
		// Listeners to count tabs at startup
		var currentTab = gBrowser.getBrowserForTab(gBrowser.selectedTab);
		currentTab.addEventListener('load', tntfixer.getNumberOfTntTabs, true);
		window.removeEventListener('load', tntfixer.init, false);
		window.addEventListener("focus", tntfixer.getNumberOfTntTabs, false);

		// Listeners to count tabs when opening or closing windows or tabs
		var container = gBrowser.tabContainer;
		container.addEventListener("TabClose", tntfixer.verifyClosedTab, true);
		container.addEventListener("TabOpen", tntfixer.verifyOpenedTab, true);
		window.addEventListener("unload", tntfixer.unload, false);

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
			var newStatus = 'inactive';
		}
		else
		{
			var newStatus = 'active';
		}

		var wm = Components.classes['@mozilla.org/appshell/window-mediator;1']
				.getService(Components.interfaces.nsIWindowMediator);
		var windowIter = wm.getEnumerator('navigator:browser');
		var currentWindow;
		while (windowIter.hasMoreElements())
		{
			currentWindow = windowIter.getNext();
			currentWindow.tntfixer.statusBarIcon.setAttribute('value', newStatus);
			currentWindow.tntfixer.preferences.setCharPref('status', newStatus);
		}
	},
	/**
	 *	verifyOpenedTab
	 *	Checks if a newly opened tab has Tnt domain and updates matchedTabs
	 *
	 *	@return	void
	 */
	'verifyOpenedTab': function(e)
	{
		var browser = gBrowser.getBrowserForTab(e.target);
		browser.addEventListener('load', tntfixer.getNumberOfTntTabs, true);
	},
	/**
	 *	verifyClosedTab
	 *	Checks if the closing tab has Tnt domain and updates matchedTabs
	 *
	 *	@return	void
	 */
	'verifyClosedTab': function(e)
	{
		var browser = gBrowser.getBrowserForTab(e.target);
		if (-1 == browser.currentURI.spec.indexOf(tntfixer.pattern))
		{
    		return;
		}

		var wm = Components.classes['@mozilla.org/appshell/window-mediator;1']
				.getService(Components.interfaces.nsIWindowMediator);

		var windowIter = wm.getEnumerator('navigator:browser');
		var currentWindow;	
		while (windowIter.hasMoreElements())
		{
			currentWindow = windowIter.getNext();
			currentWindow.tntfixer.matchedTabs--;
		}
	},
	/**
	 *	getNumberOfTntTabs
	 *	Browses all the current tabs to find out how many Tnt tabs are open.
	 *	populates matchedTabs with the number of matches found and also returns
	 *	the value
	 *
	 *	@return	int		$found.- Number of curretly open Tnt tabs
	 */
	'getNumberOfTntTabs': function()
	{
		var wm = Components.classes['@mozilla.org/appshell/window-mediator;1']
				.getService(Components.interfaces.nsIWindowMediator);

		var windowIter = wm.getEnumerator('navigator:browser');
		var currentWindow;	
		var tabCount = 0;
		while (windowIter.hasMoreElements())
		{
			currentWindow = windowIter.getNext();
			tabbrowser = currentWindow.getBrowser();

			for (var i = 0; i < tabbrowser.browsers.length; i++)
			{
				var browser = tabbrowser.getBrowserAtIndex(i);
				if (-1 != browser.currentURI.spec.indexOf(tntfixer.pattern))
        		{
            		tabCount++;
        		}
			}
		}

		var windowIter = wm.getEnumerator('navigator:browser');
		var currentWindow;	
		while (windowIter.hasMoreElements())
		{
			currentWindow = windowIter.getNext();
			currentWindow.tntfixer.matchedTabs = tabCount;
		}

		tntfixer.matchedTabs = tabCount;
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
			var currentDocument = gBrowser.getBrowserForTab(gBrowser.selectedTab)
					.contentDocument;
			//	If the campaign is approved then alert that hitting save
			//	deactivates the offer
			var isActive = false;
			var divs = currentDocument.getElementsByClassName('approved_campaign');
			if ('approved' == divs[0].innerHTML.toLowerCase())
			{
				isActive = true;
			}
			if (isActive)
			{
				var saveButton = currentDocument.getElementById('campaign-save');
				saveButton.parentNode.addEventListener(
					'click',
					tntfixer.confirmDisapproveCampaign,
					true
				);
			}
		}
	},
	/**
	 *	confirmDisapproveCampaign
	 *	Attaches a confirm dialog to the save campaign button
	 *
	 *	@return	void
	 */
	'confirmDisapproveCampaign': function(e)
	{
		//	We only proceed when the actual save button was clicked
		if ('campaign-save' != e.target.id)
		{
			return;
		}

		var text = 'This campaign is currently active. If you proceed your ' +
				'changes will be saved and your campaign disapproved';
		if (!confirm(text))
		{
			e.stopPropagation();
		}
	},
	/**
     *	unload
     *	When a window is closed it subtracts its matched tabs from the matchedTabs
     *	attribute in all other windows
     *
     *	@return	void
     */
	'unload': function()
	{
		var tabbrowser = window.getBrowser();
		var tabCount = 0;

		for (var i = 0; i < tabbrowser.browsers.length; i++)
		{
			var browser = tabbrowser.getBrowserAtIndex(i);
			if (-1 != browser.currentURI.spec.indexOf(tntfixer.pattern))
    		{
        		tabCount++;
    		}
		}

		if (0 == tabCount)
		{
			return;
		}

		var wm = Components.classes['@mozilla.org/appshell/window-mediator;1']
				.getService(Components.interfaces.nsIWindowMediator);

		var windowIter = wm.getEnumerator('navigator:browser');
		var currentWindow;	
		while (windowIter.hasMoreElements())
		{
			currentWindow = windowIter.getNext();
			currentWindow.tntfixer.matchedTabs =
					currentWindow.tntfixer.matchedTabs - tabCount;
		}
	}
};

//	Initialize at startup
window.addEventListener('load', tntfixer.init, false);

