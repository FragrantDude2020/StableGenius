$(function()
{
	$(".vote a").click(function (event) {
		// get the author element items
		var authorElement = $(event.target).parent().parent().find(".author");
		var author = authorElement.html();

		// if the user is deleted, don't bother doing the rest
		if (author == "deleted")
			return;

		// figure out what the vote action details were
		var voteButtonClicked = event.target.dataset.direction;
		var voteButtonData = event.target.parentElement.dataset.vote;

		//debugger;

		// figure out what the previous and next states were, then calculate a vote magnitude to add to the vote count
		var voteMagnitude = 0;
		var unDid = false;
		if (voteButtonClicked == "up") {
			switch (voteButtonData) {
				case undefined:
					//console.log("detected upvote of user: ", author);
					voteMagnitude = 1;
					break;
				case "down":
					//console.log("detected switch-downvote of user: ", author);
					voteMagnitude = 2;
					break;
				case "up":
					//console.log("detected un-upvote of user: ", author);
					voteMagnitude = -1;
					unDid = true;
					break;
			}
		} else if (voteButtonClicked == "down") {
			switch (voteButtonData) {
				case undefined:
					//console.log("detected downvote of user: ", author);
					voteMagnitude = -1;
					break;
				case "up":
					//console.log("detected switch-upvote of user: ", author);
					voteMagnitude = -2;
					break;
				case "down":
					//console.log("detected un-downvote of user: ", author);
					voteMagnitude = 1;
					unDid = true;
					break;
			}
		}

		// get the current vote count from sync storage (prevents user manipulation), then update the vote count
		chrome.storage.sync.get(["users"], function (result) {
			//debugger;

			var voteValue = 0;

			// if a vote count exists, grab it
			if (result.users !== undefined && result.users[author] !== undefined && result.users[author].voteValue !== undefined) {
				//debugger;

				voteValue = result.users[author].voteValue;
			} else if (unDid) {
				voteValue = -voteMagnitude; // user has no previous vote value in the sync storage and we just detected an undo so there must be some sort of disconnect happening, so just trust the vote element and do an undo
            }

			//debugger;

			// update the vote count
			voteValue += voteMagnitude;
	      		
	  		// if there is no information for this author, initialize new
			var authorDetails = result || {};
			authorDetails.users = authorDetails.users || {};
			authorDetails.users[author] = authorDetails.users[author] || {};

	  		// save the vote count
			authorDetails.users[author].voteValue = voteValue;

	      	// write the vote count back out to sync storage
			chrome.storage.sync.set(authorDetails, function() {
				// update the front end on success
				var voteValueElement = $(".vote_value_" + author);

				if (voteValue == 0)
					voteValueElement.html("");
				else
					voteValueElement.html("[" + voteValue + "]");
	        });		
		});
	});

	// run through each user and add an author vote count element, and load up vote counts if they exist (shows nothing if no vote count or vote count = 0)
	$(".author").replaceWith(function (index, origText) {
		var authorElement = $(this);
		var author = authorElement.html();
		var origHtml = authorElement[0].outerHTML;

		//debugger;

		// async get the author data and update the vote count if it exists
		chrome.storage.sync.get(["users"], function (result) {
			if (result.users !== undefined && result.users[author] !== undefined && result.users[author].voteValue != undefined && result.users[author].voteValue != 0) {
				$(".vote_value_" + author).html("[" + result.users[author].voteValue + "]");
			}

		});

		// add the vote count element
		if (author != "deleted") {
			origHtml = "<span class='sg_insert_element'><div class='sg_inline_content'>" + origHtml + "&nbsp;<div class='vote_value_" + author + "'></div></div></span>";
		}

		return origHtml;
	});

	// run through each user and add an author tag element, and load up author tags if they exist
	$(".details").append(function (index, origText) {
		var authorElement = $(this).find(".author");
		var author = authorElement.html();
		var origHtml = "";

		//debugger;

		var authorTag = undefined;

		// async get the author data and replace the blank tag if it exists
		chrome.storage.sync.get(["users"], function (result) {
			if (result.users !== undefined && result.users[author] !== undefined && result.users[author].authorTag) {
				$(".author_tag_" + author).html("[" + result.users[author].authorTag + "]");
				$(".author_tag_" + author).attr("title", result.users[author].authorTag);
			}

		});

		// add the author tag element
		if (author != "deleted") {
			origHtml = "<span class='sg_insert_element'><div class='sg_inline_content'>&nbsp;<div class='sg_author_tag author_tag_" + author + "' title='No tag for this user'>&#8998;</div></div></span>";
		}

		return origHtml;
	});

	$(".sg_author_tag").click(function (e) {
		var authorElement = $(this);

		//debugger;

		var url = chrome.runtime.getURL('src/inject/author_tag_options.html');

		//debugger;

		$.ajax({
			url: url,
			success: function (data) {
    			//debugger;

    			console.log("Opening modal now");

				modal.open({
					content: data,
					//height: 500, //window.innerHeight - e.screenY,
					top: e.pageY,
					left: e.pageX + authorElement.outerWidth()
				});
    		}
		});
	});

	console.log(">>> end of DOM ready");
});


var modal = (function(){
	var 
	method = {},
	$overlay,
	$modal,
	$content,
	$close;

	// Center the modal in the viewport
	method.center = function () {
		var top, left;

		top = Math.max($(window).height() - $modal.outerHeight(), 0) / 2;
		left = Math.max($(window).width() - $modal.outerWidth(), 0) / 2;

		$modal.css({
			top:top + $(window).scrollTop(), 
			left:left + $(window).scrollLeft()
		});
	};

	// Open the modal
	method.open = function (settings) {
		//debugger;
		$content.empty().append(settings.content);

		$modal.css({
			width: settings.width || 'auto', 
			height: settings.height || 'auto',
			top: settings.top || 'auto',
			left: settings.left || 'auto'
		});

		if (!settings.top && !settings.left) {
			method.center();
			$(window).bind('resize.modal', method.center);
		}

		$modal.show();
		//$overlay.show();
	};

	// Close the modal
	method.close = function () {
		$modal.hide();
		$overlay.hide();
		$content.empty();
		$(window).unbind('resize.modal');
	};

	// Generate the HTML and add it to the document
	$overlay = $('<div id="sg_overlay"></div>');
	$modal = $('<div id="sg_modal"></div>');
	$content = $('<div id="sg_content"></div>');
	$close = $('<a id="sg_close" href="#">&#10006;</a>');

	$modal.hide();
	$overlay.hide();
	$modal.append($content, $close);

	$(document).ready(function(){
		$('body').append($overlay, $modal);						
	});

	$close.click(function(e){
		e.preventDefault();
		method.close();
	});

	return method;
}());
