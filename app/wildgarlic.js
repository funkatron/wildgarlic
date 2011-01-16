/**
 * helpers 
 */

/**
 * simple localization helper for strings 
 */
$L = function(str) {
	return str;
};

// init jo
jo.load();


jo.setDebug(true);


var WildGarlic = function() {
	
	var self = this;
	
	self.model = new joRecord({
		searchResults  : [],
		selectedResult : null,
		searchText     : ''
	});
	
	self.ui = {};
	

	/**
	 * setup & load the app UI 
	 */
	function load() {
		
		
		
		joDefer(function() {
			// dynamic CSS loading based on platform, in this case FireFox
			// doesn't do stack transitions well, so we're downshifting

			if (jo.matchPlatform("iphone ipad safari")) {
				joDOM.loadCSS("./jo/css/aluminum/webkit.css");
			} else if (jo.matchPlatform("chrome webkit webos")) {
				joDOM.loadCSS("./jo/css/aluminum/webkit.css");
				joDOM.loadCSS("./jo/css/aluminum/chrome.css");
			} else {
				joDOM.loadCSS("./jo/css/aluminum/gecko.css");
			}
			// as an optimization, I recommend in a downloadable app that
			// you create a custom CSS file for each platform using some
			// sort of make-like process.
		}, this);
		
		
		
		// if webOS, tell it the stage is ready
		if (window.PalmSystem) {
		   window.PalmSystem.stageReady();
		}
		

		
		// make a new screen		
		self.ui.screen = new joScreen(
			new joContainer([
				new joFlexcol([
					self.ui.nav   = new joNavbar(),
					self.ui.stack = new joStackScroller()
				]),
				self.ui.toolbar = new joToolbar("This is a footer, neat huh?")
			]).setStyle({position: "absolute", top: "0", left: "0", bottom: "0", right: "0"})
		);
		self.ui.nav.setStack(self.ui.stack);
		
		
		
		/**
		 * make cards 
		 */
		self.ui.cards = {
			
			home:homeCard(),
			def :defCard() 
			
		};
		
		
		
		joGesture.forwardEvent.subscribe(self.ui.stack.forward, self.ui.stack);
		joGesture.backEvent.subscribe(self.ui.stack.pop, self.ui.stack);
		
		
		
		/**
		 * push initial card to stack 
		 */
		self.ui.stack.push(self.ui.cards.home);
		
		
	};

	
	
	/**
	 * set up the home card 
	 */
	function homeCard() {
		
		
		/**
		 * setup results list 
		 */
		var resultsList = new joList(self.model.link('searchResults'));
		// formatItem is your renderer
		resultsList.formatItem = function(data, index) {
			var title = data.word + " (" + data.thumbs_up + ")";
			// call the prototype version so we get the cool formatting
			return joList.prototype.formatItem.call(this, title, index);
		};
		// comparison method
		resultsList.compareItems = function(a,b) {
			if (a.thumbsUp > b.thumbsUp)
			    return 1;
			else if (a.thumbsUp == b.thumbsUp)
			    return 0;
			else
			    return -1;
		};
		resultsList.selectEvent.subscribe(onItemSelect, self);
		
		
		/**
		 * create the card 
		 */
		var card = new joCard([
			new joInput(self.model.link('searchText')),
			new joButton($L('Search')).selectEvent.subscribe(search, self),
			resultsList
		]).setTitle($L('WildGarlic'));

		return card;
	}
	
	
	/**
	 * set up the definition card 
	 */
	function defCard() {
		
		/**
		 * create the card 
		 */
		var card = new joCard([
			new joCaption("Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Phasellus nisl dolor, pulvinar id, pharetra a, egestas nec, ante. Duis scelerisque eleifend metus. Sed non odio id odio varius rutrum. Pellentesque congue commodo lacus. In semper pede lacinia felis. Morbi mollis molestie lorem. Morbi suscipit libero. Quisque ut erat sit amet elit aliquam nonummy. Donec tortor. Aliquam gravida ullamcorper pede. Praesent eros. Sed fringilla ligula sed odio pharetra imperdiet. Integer aliquet quam vitae nibh. Nam pretium, neque non congue vulputate, odio odio vehicula augue, sit amet gravida pede massa ac lectus. Curabitur a libero vitae dui sagittis aliquet. Ut suscipit. Curabitur accumsan sem a urna. Ut elit pede, vulputate sed, feugiat quis, congue sed, lacus.")
		]).setTitle('Definition');
		
		card.activate = function() {
			this.setTitle(self.model.getProperty('selectedResult').word);
		};

		return card;
		
	}
	
	
	
	/**
	 * search for results 
	 */
	function search() {
		var searchText = self.model.getProperty('searchText');
		if (searchText) {
			joFile(
				'http://www.urbandictionary.com/iphone/search/define?term='+window.encodeURIComponent(searchText),
				function(data, context, error) {
					if (data) {
						var result = JSON.parse(data);
						self.model.setProperty('searchResults', result.list);
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
		var results = self.model.getProperty('searchResults');
		self.model.setProperty('selectedResult', results[index]);
		self.ui.stack.push(self.ui.cards.def);
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
