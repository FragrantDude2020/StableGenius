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

		$content.empty().append(settings.content);

		setupInlineEditor();

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

		//debugger;

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
		$("#colorpicker").spectrum("destroy");
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

	$modal.hide();
	$overlay.hide();
	$modal.append($content, $close, $save);

	$(document).ready(function () {
		$('body').append($overlay, $modal);
	});

	$close.click(function (e) {
		e.preventDefault();
		method.close();
	});

	//$(".tag_save_button").click(function (event) {
	$save.click(function (event) {
		event.preventDefault();

		//debugger;

		saveAuthorTag($modal); // $("#sg_content"));
		method.close();
	});

	return method;
}());

function setAuthorTagClick() {
	//debugger;

	console.log("setting author tag clicks");

	//debugger;

	$(".sg_author_tag").click(function (e) {
		var authorElement = $(this);

		//debugger;

		var url = chrome.runtime.getURL('/src/inject/author_tag_options.html');

		//debugger;

		$.ajax({
			url: url,
			dataType: "html",
			success: function (data) {
				//debugger;

				console.log("Opening modal now");

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

function saveAuthorTag(targetOptionsWindow) {
	var tagContent = targetOptionsWindow.find("#sg_preview").html();
	var tagColor = targetOptionsWindow.find("#sg_preview").css("color");
	var tagBackground = targetOptionsWindow.find("#sg_preview").css("background-color");
	var author = targetOptionsWindow.find("#options_title").html();

	//debugger;

	getUsers(function (result) {
		var currentUser = result.users[author];

		//debugger;

		if (currentUser) {
			currentUser.authorTag = tagContent;
			currentUser.authorTagColor = ((tagContent == "") ? "" : tagColor);
			currentUser.authorTagBackground = ((tagContent == "") ? "" : tagBackground);

			updateUser(author, currentUser);
        }
	});

	var authorTag = $(document).find(".author_tag_" + author);

	if (!tagContent) {
		authorTag.addClass("icon-whhg-keyboarddelete")

		authorTag.html(tagContent);
		authorTag.css("color", "");
		authorTag.css("background-color", "");
	}
	else {
		authorTag.removeClass("icon-whhg-keyboarddelete");

		authorTag.html(tagContent);
		authorTag.css("color", tagColor);
		authorTag.css("background-color", tagBackground);
	}

	//debugger;
}

function getUsers(SuccessCallback, ErrorCallback) {
	chrome.storage.sync.get(["users"], function (result) {
		//debugger;

		// check to make sure the users list exists
		if (result.users !== undefined) {
			//debugger;

			if (SuccessCallback)
				SuccessCallback(result);
		} else {
			var authorDetails = result || {};

			// create a new users list
			authorDetails.users = authorDetails.users || {};

			if (ErrorCallback)
				ErrorCallback(authorDetails);

			saveSGDatabase(authorDetails);
		}
	});
}

function updateUsers(userData, SuccessCallback, ErrorCallback, isSingleUserData, userName) {
	chrome.storage.sync.get(["users"], function (result) {
		//debugger;

		// check to make sure the users list exists
		if (result.users !== undefined) {
			//$scope.print("found users: ", result.users);

			//debugger;

			if (isSingleUserData || false) {
				result.users[userName] = userData;
			} else {
				result.users = userData;
            }

			if (SuccessCallback)
				SuccessCallback(result);

			saveSGDatabase(result);
		} else {
			//$scope.print("no users found, resetting");

			if (ErrorCallback)
				ErrorCallback(result);
		}
	});
}

function updateUser(userName, userData, SuccessCallback, ErrorCallback) {
	updateUsers(userData, SuccessCallback, ErrorCallback, true, userName);
}

function saveSGDatabase(sgDatabase, refreshUsers, SuccessCallback, ErrorCallback) {
	refreshUsers = refreshUsers || true;

	// write the new users list back out to sync storage
	chrome.storage.sync.set(sgDatabase, function () {
		//debugger;

		//$scope.print("sync storage set complete");

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

function changeColor(tinyColor) {
	//console.log("tiny color: ", tinyColor.toHexString());

	//debugger;

	$("#sg_preview").css("background-color", tinyColor.toHexString());
	$("#sg_preview").css("color", $("#colorpicker").css("color"));
}

function setupInlineEditor() {
	$('#sg_preview_text_input').on('input propertychange paste', function (eventData) {
		var inputValue = eventData.target.value;

		//debugger;

		$("#sg_preview").html(inputValue);

		if (inputValue != "") {
			$("#sg_preview").removeClass("icon-whhg-keyboarddelete");
		}
		else {
			$("#sg_preview").addClass("icon-whhg-keyboarddelete");
		}
	});

	//debugger;

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
