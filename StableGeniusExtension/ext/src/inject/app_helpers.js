function setAuthorTagClick() {
	//debugger;

	console.log("setting author tag clicks");

	$(".sg_author_tag").click(function (e) {
		var authorElement = $(this);

		//debugger;

		var url = chrome.runtime.getURL('/src/inject/author_tag_options.html');

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
}

var modal = (function () {
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
			top: top + $(window).scrollTop(),
			left: left + $(window).scrollLeft()
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
		$("#colorpicker").spectrum("destroy");
		//debugger;
		$content.empty();
		$modal.hide();
		$overlay.hide();
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

	$(document).ready(function () {
		$('body').append($overlay, $modal);
	});

	$close.click(function (e) {
		e.preventDefault();
		method.close();
	});

	return method;
}());
