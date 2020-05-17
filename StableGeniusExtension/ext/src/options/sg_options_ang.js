var app = angular
	.module("app", ['ngAnimate', 'ngSanitize', 'ui.bootstrap', 'ngMaterial'])
	/*
	.config(['$provide', function ($provide) {
		/**
		  * Angular Material dynamically generates Style tags
		  * based on themes and palletes; for each ng-app.
		  * Let's disable generation and <style> DOM injections.
		  * /
		$provide.constant('$MD_THEME_CSS', '/** /'); < FIX THE COMMENT STRING HERE BEFORE UNCOMMENTING
	}]);;
	*/
