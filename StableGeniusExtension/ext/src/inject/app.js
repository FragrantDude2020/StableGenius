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
								if (result.users[author].voteValue != undefined && result.users[author].voteValue != 0) {
									$(".vote_value_" + author).html("[" + result.users[author].voteValue + "]");
								}

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

	/*
	// run through each user and add an author vote count element, and load up vote counts if they exist (shows nothing if no vote count or vote count = 0)
	$(".author").replaceWith(function (index, origText) {
		var authorElement = $(this);
		var author = authorElement.html();
		var origHtml = authorElement[0].outerHTML;

		//debugger;

		// async get the author data and update the vote count if it exists
		chrome.storage.sync.get(["users"], function (result) {
			if (result.users !== undefined && result.users[author] !== undefined) {

				// update vote count
				if (result.users[author].voteValue != undefined && result.users[author].voteValue != 0) {
					$(".vote_value_" + author).html("[" + result.users[author].voteValue + "]");
				}

				// update tag
				if (result.users[author].authorTag) {
					$(".author_tag_" + author).html("[" + result.users[author].authorTag + "]");
					$(".author_tag_" + author).attr("title", result.users[author].authorTag);
				}
			}
		});

		// add the vote count element
		if (author != "deleted") {
			origHtml = "<span class='sg_insert_element'><div class='sg_inline_content'>"
				+ origHtml
				+ "&nbsp;<div class='vote_value_"
				+ author
				+ "'></div>"
				+ "&nbsp;<div class='sg_author_tag author_tag_"
				+ author
				+ " icon-whhg-keyboarddelete' title='No tag for this user'></div>"
				+ "</div></span>";
		}

		return origHtml;
	});
	*/
	/*
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
			origHtml = "<span class='sg_insert_element'><div class='sg_inline_content'>&nbsp;<div class='sg_author_tag author_tag_" + author + " icon-whhg-keyboarddelete' title='No tag for this user'></div></div></span>";
		}

		return origHtml;
	});
	*/

	//debugger;

	setAuthorTagClick();

	console.log(">>> end of DOM ready");
});


