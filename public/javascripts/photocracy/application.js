$.ajaxSetup({
	timeout: 10000
});

$(document).ready(function() {
	// voting
  $('a.vote').on('click', function(e) {
		if ($(this).hasClass('loading')) {
			alert("One sec, we're loading the next pair...");
		} else {
			// visible if the users hasn't voted

			$(this).addClass('checked');

			// prevent double clicking
			$('a.vote').addClass('loading');

			// store image location
			var x_click_offset = calculateClickOffset('x', e, $(this));
			var y_click_offset = calculateClickOffset('y', e, $(this));
			
			castVote($(this), x_click_offset, y_click_offset);
		}
		e.preventDefault();
  });

	// uploading a photo
	// uses ajaxupload.js (AjaxUpload throws an error if button isn't on page)
	var button = $('#choose_file');
	if (button.length != 0) {
		new AjaxUpload(button, {
	    action: button.attr('href'),
	    name: 'new_idea',
	    data: {
	      question_id : button.attr('question_id'),
          authenticity_token: AUTH_TOKEN,
				locale: RAILS_LOCALE
	    },
	    autoSubmit: true,
	    responseType: "json",
	    onChange: function(file, extension){
	      $('#photo_step_1').hide();
	      $('#photo_step_3').hide();
	      $('#photo_step_2').show();
	    },
	    onSubmit : function(file , ext){
	      // validate jpg, png, jpeg, or gif
	      if (! (ext && /^(jpg|png|jpeg|gif)$/i.test(ext))){
	        $('#photo_step_2').hide();
	        $('#photo_step_1').show();
	        $('#file_error').show();
	        return false;
	      }
	    },
	    onComplete : function(file, response){
	      
	      $('#photo_step_1').hide();
	      $('#photo_step_2').hide();
	      $('#photo_step_3').show();
	      
	      if(response.response_status == "200"){
	          thumbnail_url = response.thumbnail_url;

	          $('#uploaded_thumbnail').attr('src', thumbnail_url);
	          $('#uploaded_thumbnail').show();
	          $('.photo_success_message').show();
	          $('.photo_error_message').hide();
	      }
	      else{
	          $('#uploaded_thumbnail').hide();
	          $('.photo_success_message').hide();
	          $('.photo_error_message').show();
	          $('#photo_details_message').html(response.errors);
	      }
	      
	    }
	  });
	};

	// can't decide submit (skip)
	$('#cant_decide_form').submit(function(e){
		submitCantDecide($(this));
		e.preventDefault();
	});

	// flag as inappropriate submit
	$('#flag_as_inappropriate_form').submit(function(e){
		submitFlag($(this));
		e.preventDefault();
	});

	// view ajax graph
	$('a.ajax_graph').on('click', function(e) {
		$('#graphs > li > a').removeClass('active');
		$(this).addClass('active');

		target = $('.target');
		target.html('<img src=/images/indicator.gif />')
		target.attr('id', $(this).attr('div_id'));

		if ($(this).attr('response_type') == 'script') {
			jQuery.get($(this).attr("href"), null, null, $(this).attr('response_type'));
		} else {
			// total hack for world map
			var iframe_html= "<iframe id='voter_map_iframe' src='" + $(this).attr('href') + "' onload='iframe_loaded();' width='100%' height='370px' frameborder=0 scrolling=no style='border:1px solid #666;'></iframe>"
			target.html(iframe_html);
			// jQuery.get($(this).attr("href"), function(data) {
			//   target.html(data);
			// });
		}

		e.preventDefault();
	});

	// toggle activation on admin
	$('input.activation').on('click', function(e) {
		toggleChoiceActivation($(this));
	});

	$('input.auto_activation').on('click', function(e) {
		toggleQuestionAutoActivation($(this));
	});
});

function submitCantDecide(button) {
	var VOTE_CAST_AT = new Date();
	var reason = 'other';

	if (reasonValid(reason)) {
		clearImages();
		$('a.vote').addClass('loading');
		$('#cant_decide_options').dialog('close');
		$('input[name=cant_decide_reason]').attr('checked', false); // clear radio buttons
		$('input[name=reason_text]').val(''); // clear text box

		jQuery.ajax({
			type: 'POST',
			dataType: 'json',
		  url: $(button).attr('data-action'),
		  data: {
				cant_decide_reason: reason,
				prompt_id: $('#prompt_id').val(),
		    appearance_lookup: $('#appearance_lookup').val(),
				time_viewed: VOTE_CAST_AT - PAGE_LOADED_AT,
                authenticity_token: AUTH_TOKEN,
				locale: RAILS_LOCALE
		  },
		  error: function(request, textStatus, errorThrown) {
				voteError(request, textStatus, errorThrown);
			},
		  success: function(data, textStatus, request) {
			        preloadFuturePhotos(data);
			        updateVotingHistory(data);
				loadNextPrompt(data);
			        updateUrlsAndHiddenFields(data);
				PAGE_LOADED_AT = new Date(); // reset the page load time
			}
		});
	}
}

function submitFlag(form) {
	var VOTE_CAST_AT = new Date();
	var reason = jQuery.trim($('#inappropriate_reason').val());
	$('#inappropriate_reason').val('');

 	if(!reason){
  	alert("Please include an explanation");
    return false;
 	} else {
		clearImages();
		$('a.vote').addClass('loading');
		$('#flag_as_inappropriate').dialog('close');

		jQuery.ajax({
			type: 'POST',
			dataType: 'json',
		  url: form.attr('action'),
		  data: {
				flag_reason: reason,
				side: $('#inappropriate_side').val(),
				prompt_id: $('#prompt_id').val(),
		    appearance_lookup: $('#appearance_lookup').val(),
				time_viewed: VOTE_CAST_AT - PAGE_LOADED_AT,
                authenticity_token: AUTH_TOKEN,
				locale: RAILS_LOCALE
		  },
		  error: function(request, textStatus, errorThrown) {
				voteError(request, textStatus, errorThrown);
			},
		  success: function(data, textStatus, request) {
			        preloadFuturePhotos(data);
				loadNextPrompt(data);
			        updateUrlsAndHiddenFields(data);
				$('#item_count').text(
					decrement($('#item_count').text())
				);
				PAGE_LOADED_AT = new Date(); // reset the page load time
			}
		});
	}
}

function reasonValid(reason) {
	if (!reason) {
	  alert("Please select a reason");
	  return false;
	} else {
		if(reason == 'user_other'){
			user_text = jQuery.trim($('input[name=reason_text]').val());
	   	if(!user_text){
	    	alert("Please include an explanation");
	      return false;
	   	}
		}
		return true;
	}
}

function castVote(choice, x, y) {
	var VOTE_CAST_AT = new Date();

	// a/b test transition animation
	if (VOTE_CROSSFADE_TRANSITION) {
		clearImagesCrossfade();
	} else {
		clearImages();
	}


	jQuery.ajax({
		type: 'POST',
		dataType: 'json',
	  url: choice.attr('href'),
	  data: {
        authenticity_token: AUTH_TOKEN,
			time_viewed: VOTE_CAST_AT - PAGE_LOADED_AT,
	    appearance_lookup: $('#appearance_lookup').val(),
			x_click_offset: x,
			y_click_offset: y
	  },
	  error: function(request, textStatus, errorThrown) {
			voteError(request, textStatus, errorThrown);
		},
	  success: function(data, textStatus, request) {
			preloadFuturePhotos(data);
			updateVotingHistory(data,false);

			// the ordering of these functions is important
			// because some rely on attrs of the a.vote
			// and others modify those attrs
			if (!VOTE_CROSSFADE_TRANSITION) { loadNextPrompt(data); };
			updateUrlsAndHiddenFields(data);
			if (VOTE_CROSSFADE_TRANSITION) { 
				$('table.fade').remove(); 
				$('a.vote').removeClass('loading'); 
			};
			incrementVoteCount();
			incrementVisitorVoteCount(); 
			choice.removeClass('checked');
			PAGE_LOADED_AT = new Date(); // reset the page load time
		}
	});
}

function incrementVoteCount() {
	$('#votes_count').text(
		increment($('#votes_count').text())
	);
}

function incrementVisitorVoteCount() {
	$('#visitor_votes').text(
		increment($('#visitor_votes').text())
	);
}

function toggleChoiceActivation(checkbox) {
	var span = checkbox.next()
	var label = checkbox.parents('label')
	span.text('...')

	jQuery.ajax({
		type: 'POST',
		dataType: 'json',
	  url: checkbox.attr('href'),
	  data: {
        authenticity_token: AUTH_TOKEN
	  },
	  error: function(request, textStatus, errorThrown) {
			voteError(request, textStatus, errorThrown);
		},
	  success: function(data, textStatus, request) {
			label.removeClass('Deactivated');
			span.text(data['verb']);
			label.addClass(data['verb']);
		}
	});
}

function toggleQuestionAutoActivation(checkbox) {
	var span = checkbox.next();
	var label = checkbox.parents('label');
	var saved_text = span.text();
	span.text('...');

	jQuery.ajax({
		type: 'POST',
		dataType: 'json',
	  url: checkbox.attr('href'),
	  data: {
        authenticity_token: AUTH_TOKEN
	  },
	  error: function(request, textStatus, errorThrown) {
			voteError(request, textStatus, errorThrown);
		},
	  success: function(data, textStatus, request) {
			span.text(saved_text);
		}
	});
}

function calculateClickOffset(axis, e, choice) {
	return 0;
}

function updateVotingHistory(data, update_visitor_votes) {

	if(update_visitor_votes == undefined){
	   update_visitor_votes = true  //update visitor_votes by default
	}
		

	var winner = data['voted_prompt_winner'];
	
	if(update_visitor_votes)
		updateVisitorVotes(data['visitor_votes']);

	addThumbnailsToHistory($('.left').attr('thumb'), $('.left').attr('choice_url'), $('.right').attr('thumb'), $('.right').attr('choice_url'), data['voted_at'], winner);

	$('#your_votes').children(":first").effect("highlight", {}, 3000);
	$(".timeago").timeago();
}

function addThumbnailsToHistory(left_thumb, left_url, right_thumb, right_url, voted_at, winner){
	$('#your_votes').prepend("\
		<li>\
			<a href='" + left_url + "'<img src='" + left_thumb + "' class='" + (winner == 'left' ? 'winner' : 'loser') + "'/></a>\
			<a href='" + right_url + "'<img src='" + right_thumb + "' class='" + (winner == 'right' ? 'winner' : 'loser') + "'/></a>\
			<!-- <span class='timeago' title='" + voted_at + "'>" + voted_at + "</span> -->\
		</li>\
	");
}

function updateVisitorVotes(number_of_votes) {
	// update vote count
	$('#visitor_votes').text(number_of_votes);

	// your voteS unless you've only voted once
	(number_of_votes == 1) ? $('#s').hide() : $('#s').show();
}

function setField(side, variable, value){
	var cvalue = $.trim(value);
	if (cvalue == ""){
		cvalue = "-";
	}
	var dd = $('div.candidate_box.' + side + ' > .candidate_info > dl > dd.' + variable);
	dd.text(cvalue);
}

function loadNextPrompt(data) {
	jQuery.each(['left', 'right'], function(index, side) {
		var candidate_box = $('div.candidate_box.' + side + ' > .candidate_info > .candidate_photo');

		var candidate = data['candidate_' + side]['candidate'];
		
		// change photos
		candidate_box.html("<img style='display:none;' src='" + data['new' + side + '_photo'] + "'/>");

		setField(side, 'nombre', candidate['nombre'])
		setField(side, 'apellidos', candidate['apellidos'])
		setField(side, 'estudios', candidate['estudios'])
		setField(side, 'profesion', candidate['profesion'])
		setField(side, 'idiomas_dominio', candidate['idiomas'])
		setField(side, 'idiomas_habilidad', candidate['idiomas_limitados'])
		setField(side, 'partido', candidate['partido_politico'])
		setField(side, 'contribucion', candidate['contribucion_social'])
		setField(side, 'motivacion', candidate['motivaciones'])

		var btn = $('div.candidate_box.' + side + ' > .form_actions > .btn-info');
		var msg = $('div.candidate_box.' + side + ' > .form_actions > .noprofile');
		if(candidate['url_mifirma'].length > 0){
			btn.attr('href', (candidate['url_mifirma']));
			msg.text('');
			btn.removeClass('disabled');
		} else{
			msg.text('El candidato no tiene un perfil extendido para avalar');
			btn.addClass('disabled');
		}

		// fade in photo - don't vary fade in time
		candidate_box.find('img').fadeIn(FADE_IN_TIME, function() {
			// allow voting after fully faded in
			$('a.vote.' + side).removeClass('loading');
		});
	});
}

// a variation of the clearImages method being a/b tested
function clearImagesCrossfade() {
	jQuery.each(['left', 'right'], function(index, side) {
		// current table
		var link = $('a.vote.' + side);
		var candidate_box = $('div.candidate_box.' + side + ' > table.current');
		var current_image = candidate_box.find('img');

		var fade_table = candidate_box.clone();
        fade_table.prependTo(link);
		// duplicate the table holding the image
		// add the class 'fade' to it and remove 'current'
		fade_table.removeClass('current').addClass('fade');

		// switch the candidate_boxs img to the next photo
		current_image.attr('src', link.attr('future_photo'));

		// fade out and remove the fade_table
		fade_table.animate({opacity: 0}, FADE_TIME, function() {
			$(this).remove();
		});
	});
}

function preloadFuturePhotos(data) {
	jQuery.preLoadImages(data["future_left_photo"]);
	jQuery.preLoadImages(data["future_right_photo"]);
}

function updateUrlsAndHiddenFields(data) {
	jQuery.each(['left', 'right'], function(index, side) {
		// change photo thumb
		$('a.vote.' + side).attr('thumb', data['new' + side + '_photo_thumb']);
		// change future photo
		$('a.vote.' + side).attr('future_photo', data['future_' + side + '_photo']);
		// change href url
		$('a.vote.' + side).attr('href', data['new' + side + '_url']);
		// change choice url
		$('a.vote.' + side).attr('choice_url', data['new' + side + '_choice_url']);
	});

	// change appearance_lookup and prompt_id hidden fields
	$('#appearance_lookup').val(data['appearance_lookup']);
	$('#prompt_id').val(data['prompt_id']);

	// change urls for inappropriate and skip forms
	$('#flag_as_inappropriate_form').attr('action', data['flag_url']);
	$('#cant_decide_form').attr('action', data['skip_url']);
}

function voteError(request, textStatus, errorThrown) {
	alert(textStatus);
}

function increment(number){
	return parseInt(number) + 1;
}

function decrement(number){
	return parseInt(number) - 1;
}

function clearImages() {
	$('.candidate_box.right > .candidate_info > .candidate_photo').find('img').fadeOut(FADE_TIME, function() {
		$(this).remove();
	});
	
	$('.candidate_box.left > .candidate_info > .candidate_photo').find('img').fadeOut(FADE_TIME, function() {
		$(this).remove();
	});
}

(function($) {
  var cache = [];
  // Arguments are image paths relative to the current page.
  $.preLoadImages = function() {
    var args_len = arguments.length;
    for (var i = args_len; i--;) {
      var cacheImage = document.createElement('img');
      cacheImage.src = arguments[i];
      cache.push(cacheImage);
    }
  }
})(jQuery)

