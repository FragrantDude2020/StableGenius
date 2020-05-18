$(function ()
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
		var voteMagnitudeUp = 0;
		var voteMagnitudeDn = 0;
		var unDid = false;
		if (voteButtonClicked == "up") {
			switch (voteButtonData) {
				case undefined:
					//console.log("detected upvote of user: ", author);
					voteMagnitudeUp = 1;
					break;
				case "down":
					//console.log("detected switch-downvote of user: ", author);
					voteMagnitudeUp = 1;
					voteMagnitudeDn = -1;
					break;
				case "up":
					//console.log("detected un-upvote of user: ", author);
					voteMagnitudeUp = -1;
					unDid = true;
					break;
			}
		} else if (voteButtonClicked == "down") {
			switch (voteButtonData) {
				case undefined:
					//console.log("detected downvote of user: ", author);
					voteMagnitudeDn = 1;
					break;
				case "up":
					//console.log("detected switch-upvote of user: ", author);
					voteMagnitudeUp = -1;
					voteMagnitudeDn = 1;
					break;
				case "down":
					//console.log("detected un-downvote of user: ", author);
					voteMagnitudeDn = -1;
					unDid = true;
					break;
			}
		}

		// get the current vote count from sync storage (prevents user manipulation), then update the vote count
		chrome.storage.sync.get(["users"], function (result) {
			//debugger;

			var voteValueUp = 0;
			var voteValueDn = 0;

			// if a vote count exists, grab it
			if (result.users !== undefined && result.users[author] !== undefined && (result.users[author].voteValueUp !== undefined || result.users[author].voteValueDn !== undefined)) {
				//debugger;

				voteValueUp = result.users[author].voteValueUp;
				voteValueDn = result.users[author].voteValueDn;
			} else if (unDid) {
				// user has no previous vote value in the sync storage and we just detected an undo so there must be some sort of disconnect happening, so just trust the vote element and do an undo
				voteValueUp = -voteMagnitudeUp;
				voteValueDn = -voteMagnitudeDn;
            }

			//debugger;

			// update the vote count
			voteValueUp += voteMagnitudeUp;
			voteValueDn += voteMagnitudeDn;

			// sanity checks
			if (voteValueUp < 0)
				voteValueUp = 0;

			if (voteValueDn < 0)
				voteValueDn = 0;
	      		
	  		// if there is no information for this author, initialize new
			var authorDetails = result || {};
			authorDetails.users = authorDetails.users || {};
			authorDetails.users[author] = authorDetails.users[author] || {};

	  		// save the vote count
			authorDetails.users[author].voteValueUp = voteValueUp;
			authorDetails.users[author].voteValueDn = voteValueDn;

			//var finalVoteValue = voteValueUp - voteValueDn;
	      	// write the vote count back out to sync storage
			chrome.storage.sync.set(authorDetails, function() {
				// update the front end on success
				setVoteValue(author, voteValueUp - voteValueDn);
	        });		
		});
	});

	var setVoteValue = function (author, finalVoteValue) {
		var voteValueElement = $(".vote_value_" + author);

		if (finalVoteValue == 0)
			voteValueElement.html("");
		else {
			voteValueElement.html("[" + finalVoteValue + "]");

			voteValueElement.css("background-color", "rgba(" + (finalVoteValue < 0 ? "192, 0" : "0, 192") + ", 0, " + (Math.abs(finalVoteValue) / 10) + ")");
		}
    }

	// place inline elements and update user information
	var url = chrome.runtime.getURL('/src/inject/sg_inline_content.html');
	$.ajax({
		url: url,
		success: function (data, status, xhdr) {
			// place all inline author elements after the username link
			$(".author").after(function (index, author) {
				//debugger;

				// replace template strings
				currentElement = data.replace(new RegExp("{{author}}", 'g'), author);

				return currentElement;
			});
		},
		complete: function (xhdr, status) {
			if (status === "success") {
				//debugger;

				// async get the author data and update the vote count and user tag if they exist
				chrome.storage.sync.get(["users"], function (result) {
					//debugger;
					if (result.users !== undefined) {
						$(".author").each(function (index, authorElement) {
							var author = authorElement.innerHTML;

							//debugger;

							if (result.users[author] !== undefined) {

								// update vote count
								setVoteValue(author, (result.users[author].voteValueUp || 0) - (result.users[author].voteValueDn || 0));

								// update tag
								if (result.users[author].authorTag) {
									$(".author_tag_" + author).html("[" + result.users[author].authorTag + "]");
									$(".author_tag_" + author).attr("title", result.users[author].authorTag);
								}
							}
						});
					}
				});
			}
        }
	});

	//debugger;

	// sets up the functionality for clicking the user tag
	setAuthorTagClick();

	console.log(">>> end of DOM ready");
});


