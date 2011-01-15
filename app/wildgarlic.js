/**
 * helpers 
 */

/**
 * simple localization helper for strings 
 */
$L = function(str) {
	return str;
};



var WildGarlic = function() {
	
	var self = this;

	self.searchResults = [];
	self.ui = {};


	/**
	 * setup & load the app UI 
	 */
	function load() {
		
		// init jo
		jo.load();
		
		// if webOS, tell it the stage is ready
		if (window.PalmSystem) {
		   window.PalmSystem.stageReady();
		}
		
		
		// make a new screen
		self.ui.stack = new joStackScroller();
		self.ui.scn = new joScreen(self.ui.stack);

		/**
		 * make UI elements 
		 */
		self.ui.title = new joTitle($L('WildGarlic'));
		self.ui.searchBox = new joInput();
		self.ui.searchButton = new joButton($L('Search')).selectEvent.subscribe(search, self);
		
		/**
		 * setup results list 
		 */
		self.ui.resultsList = new joList(self.searchResults).attach(document.body);
		// formatItem is your renderer
		self.ui.resultsList.formatItem = function(data, index) {
			var title = data.word + " (" + data.thumbs_up + ")";
			// call the prototype version so we get the cool formatting
			return joList.prototype.formatItem.call(this, title, index);
		};
		// comparison method
		self.ui.resultsList.compareItems = function(a,b) {
			if (a.thumbsUp > b.thumbsUp)
			    return 1;
			else if (a.thumbsUp == b.thumbsUp)
			    return 0;
			else
			    return -1;
		};
		self.ui.resultsList.selectEvent.subscribe(onItemSelect, self);
		
		
		/**
		 * create the card 
		 */
		self.ui.card = new joCard([
			self.ui.title,
			self.ui.searchBox,
			self.ui.searchButton,
			self.ui.resultsList
		]);


		/**
		 * push card to stack 
		 */
		self.ui.stack.push(self.ui.card);
		
	};
	
	
	
	/**
	 * search for results 
	 */
	function search() {
		joFocus.set(self.ui.searchBox);
		var searchtxt = self.ui.searchBox.getData();
		if (searchtxt) {
			joFile(
				'http://www.urbandictionary.com/iphone/search/define?term='+window.encodeURIComponent(searchtxt),
				function(data, context, error) {
					if (data) {
						var result = JSON.parse(data);
						self.searchResults = result.list;
						self.ui.resultsList.data = self.searchResults;
						self.ui.resultsList.refresh();
					}
				},
				self
			);	
		}
	};
	
	
	/**
	 * handle taps on the search items 
	 */
	function onItemSelect(index) {
		self.ui.scn.alert(self.ui.resultsList.data[index].definition);
	}
	
	
	
	/**
	 * expose public methods 
	 */
	return {
		"load": load,
		"search": search
	};
	
};

/**
 * instance as 'app' 
 */
var app = new WildGarlic();
