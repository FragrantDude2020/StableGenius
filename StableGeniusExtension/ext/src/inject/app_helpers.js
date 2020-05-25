var modal = (function () {
	var
		method = {},
		$overlay,
		$modal,
		$content,
		$close,
		$save;

	// Center the modal in the viewport
	method.center = function () {
		var top, left;

		top = Math.max($(window).height() - $modal.outerHeight(), 0) / 2;
		left = Math.max($(window).width() - $modal.outerWidth(), 0) / 2;

		$modal.css({
			top: top + $(window).scrollTop(),
			left: left + $(window).scrollLeft()
		});
	};

	// Open the modal
	method.open = function (settings) {
		//debugger;

		// add the HTML content
		$content.empty().append(settings.content);

		// add functionality to modal
		setupInlineEditor();

		// set modal size
		$modal.css({
			width: settings.width || 'auto',
			height: settings.height || 'auto',
			top: settings.top || 'auto',
			left: settings.left || 'auto'
		});

		// if we don't set a top and left then automatically center the modal in the viewport
		if (!settings.top && !settings.left) {
			method.center();
			$(window).bind('resize.modal', method.center);
		}

		//debugger;

		// pre-populate the data in the modal
		$modal.find("#options_title").html(settings.titleText);
		$modal.find("#sg_preview_text_input").val(settings.authorTag);
		$("#colorpicker").spectrum("set", settings.authorTagBackground || "#fff");

		$modal.find("#sg_preview").html(settings.authorTag || "<i class='icon-whhg-keyboarddelete'></i>");
		$modal.find("#sg_preview").css("color", settings.authorTagColor);
		$modal.find("#sg_preview").css("background-color", settings.authorTagBackground);

		//debugger;

		$modal.show();
		//$overlay.show();
	};

	// Close the modal
	method.close = function () {
		//debugger;
		$("#colorpicker").spectrum("destroy"); // the color picker needs to be destroyed, otherwise it leaves an unstyled input box at the bottom of the screen
		$content.empty();
		$modal.hide();
		//$overlay.hide();
		$(window).unbind('resize.modal');
	};

	// Generate the HTML and add it to the document
	$overlay = $('<div id="sg_overlay"></div>');
	$modal = $('<div id="sg_modal"></div>');
	$content = $('<div id="sg_content"></div>');
	$close = $('<a id="sg_close" href="#" title="Close">&#10006;</a>');
	$save = $('<div class="btn btn-success btn-sm tag_save_button">Save</div>');

	// hide everything
	$modal.hide();
	$overlay.hide();

	// on default, add placeholder tags
	$modal.append($content, $close, $save);

	// inject the modal into the screen HTML
	$(document).ready(function () {
		$('body').append($overlay, $modal);
	});

	// close the modal
	$close.click(function (e) {
		e.preventDefault();
		method.close();
	});

	// save the user information
	$save.click(function (event) {
		event.preventDefault();

		//debugger;

		saveAuthorTag($modal);
		method.close();
	});

	return method;
}());

// sets up functionality for when a user clicks an author's name tag
function setAuthorTagClick() {
	//debugger;

	console.log("setting author tag clicks");

	//debugger;

	$(".sg_author_tag").click(function (e) {
		// save the current element for future use
		var authorElement = $(this);
		// get the path to the injectable
		var url = chrome.runtime.getURL('/src/inject/author_tag_options.html');

		//debugger;

		// pull the injectable file and use it as contents for the modal
		$.ajax({
			url: url,
			dataType: "html",
			success: function (data) {
				//console.log("Opening modal now");

				//debugger;

				modal.open({
					content: data,
					titleText: authorElement.data("author"),
					authorTag: authorElement.data("tag"),
					authorTagColor: authorElement.data("tagColor"),
					authorTagBackground: authorElement.data("tagBackground"),
					top: authorElement.offset().top - (authorElement.outerHeight() * 2),
					left: authorElement.offset().left,
					width: 300
				});
			}
		});
	});
}

// set up functionality to save author information when user clicks "Save"
function saveAuthorTag(targetOptionsWindow) {
	// get all the tag information
	var tagContent = targetOptionsWindow.find("#sg_preview").html();
	var tagColor = targetOptionsWindow.find("#sg_preview").css("color");
	var tagBackground = targetOptionsWindow.find("#sg_preview").css("background-color");
	var author = targetOptionsWindow.find("#options_title").html();

	//debugger;

	// pull the users from sync storage first just so that we don't accidentally store broken or incomplete data
	getUsers(function (result) {
		//debugger;

		// if author data doesn't exist, create a new one
		if (!result.users[author]) {
			result.users[author] = {};
        }

		// set the author tag information, blank out the color and background on empty tag
		result.users[author].authorTag = tagContent;
		result.users[author].authorTagColor = ((tagContent == "") ? "" : tagColor);
		result.users[author].authorTagBackground = ((tagContent == "") ? "" : tagBackground);

		// save the author information to the sync database
		updateUser(author, result.users[author]);
	});

	var authorTag = $(document).find(".author_tag_" + author);

	// automatically update the tag on the screen so that we don't have to waste time refreshing the user information for the whole screen
	if (!tagContent) {
		// if no author tag, reset tag icon
		authorTag.addClass("icon-whhg-keyboarddelete")

		authorTag.html(tagContent);
		authorTag.css("color", "");
		authorTag.css("background-color", "");
	}
	else {
		// set author tag icon visuals
		authorTag.removeClass("icon-whhg-keyboarddelete");

		authorTag.html(tagContent);
		authorTag.css("color", tagColor);
		authorTag.css("background-color", tagBackground);

		authorTag.data("tag", tagContent);
		authorTag.data("tagColor", tagColor);
		authorTag.data("tagBackground", tagBackground);
	}
}

// pull the entire users database from sync storage (with optional callbacks)
function getUsers(SuccessCallback, ErrorCallback) {
	chrome.storage.sync.get(["users"], function (result) {
		//debugger;

		// check to make sure the users list exists
		if (result.users !== undefined) {
			//debugger;

			if (SuccessCallback)
				SuccessCallback(result);
		} else {
			// if the users list doesn't exist, create a new one
			var authorDetails = result || {};

			// create a new users list
			authorDetails.users = authorDetails.users || {};

			if (ErrorCallback)
				ErrorCallback(authorDetails);

			// save new list
			saveSGDatabase(authorDetails);
		}
	});
}

// update the entire user database, "userData" is the whole users list | update a single user, "userData" is that user's information
function updateUsers(userData, SuccessCallback, ErrorCallback, userName) {
	chrome.storage.sync.get(["users"], function (result) {
		//debugger;

		// check to make sure the users list exists
		if (result.users !== undefined) {
			//debugger;

			// if it's a single user, just save that one user
			if (userName !== undefined) {
				result.users[userName] = userData;
			} else {
				result.users = userData;
            }

			// allow the success callback before we save the database
			if (SuccessCallback)
				SuccessCallback(result);

			// save the database
			saveSGDatabase(result);
		} else {
			// do nothing except call the error callback
			if (ErrorCallback)
				ErrorCallback(result);
		}
	});
}

// convenience wrapper to update a single user
function updateUser(userName, userData, SuccessCallback, ErrorCallback) {
	updateUsers(userData, SuccessCallback, ErrorCallback, userName);
}

// save the whole Stable Genius database to sync storage, with optional user list refresh
function saveSGDatabase(sgDatabase, refreshUsers, SuccessCallback, ErrorCallback) {
	refreshUsers = refreshUsers || true;

	// write the new users list back out to sync storage
	chrome.storage.sync.set(sgDatabase, function () {
		//debugger;

		// if a refresh is requested, do that whole thing, otherwise just call the success callback
		if (refreshUsers) {
			getUsers(function (result) {
				if (SuccessCallback)
					SuccessCallback(result);
			},
				function (authorDetails) {
					if (ErrorCallback)
						ErrorCallback(authorDetails);
				});
		} else {
			if (SuccessCallback)
				SuccessCallback(sgDatabase);
		}
	});
}

// update the preview on the tag modal to reflect a new color that the user chose
function changeColor(tinyColor) {
	//console.log("tiny color: ", tinyColor.toHexString());

	//debugger;

	$("#sg_preview").css("background-color", tinyColor.toHexString());
	$("#sg_preview").css("color", $("#colorpicker").css("color"));
}

// set up functionality for the tag modal
function setupInlineEditor() {
	// attach to the text box so we can do a preview update when data changes
	$('#sg_preview_text_input').on('input propertychange paste', function (eventData) {
		// get the data the user has typed
		var inputValue = eventData.target.value;

		//debugger;

		// copy data to preview
		$("#sg_preview").html(inputValue);

		// if the text box is blank, show the tag in preview
		if (inputValue != "") {
			$("#sg_preview").removeClass("icon-whhg-keyboarddelete");
		}
		else {
			$("#sg_preview").addClass("icon-whhg-keyboarddelete");
		}
	});

	//debugger;

	// set up the Spectrum color picker https://bgrins.github.io/spectrum/
	$("#colorpicker").spectrum({
		preferredFormat: "hex",
		type: "text",
		togglePaletteOnly: "true",
		hideAfterPaletteSelect: "true",
		showInput: "true",
		showInitial: "true",
		color: "#fff",
		change: changeColor
	});

};
