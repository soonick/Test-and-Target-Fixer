var tntfixer =
{
	'statusBarIcon': null,
	'preferences': null,
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
	},
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

