jQuery(function($){
	$('.toggle-button').on('click', function(evt){
		$(this).siblings().removeClass('selected');
		$(this).toggleClass('selected');
	});

	$('input, textarea').typeWatch({
		event: 'typingDone',
		wait: 750
	});

	var validators = {
		"name": /^[a-zA-Z\\s]+ /i,
		"phone": /[0-9-\(\)]{10}/,
		"email": /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}\b/i,
		"age": /[0-9]{1,2}/
	}
	window.isValid = {}

	function validateInput(elem){
		$(elem).siblings('.status').removeClass('pe-7s-check pe-7s-close-circle')
		if( $(elem).val().length > 0) {
			var type = $(elem).data('validation');
			var name = $(elem).attr('name');

			console.log('checking', name, type, validators[ type ])
			isValid[ name ] = $(elem).val().match( validators[ type ] )
			if( isValid[ name ]){
				console.log('valid')
				$(elem).siblings('.status').addClass('pe-7s-check');
			}
			else{
				console.log('invalid')
				$(elem).siblings('.status').addClass('pe-7s-close-circle')
			}
		}
	}

	validateInput( 'input.js-name' );
	validateInput( 'input.js-email' );

	$('input[required]').on('typingDone', function(evt){
		validateInput(this);
	});
	$('input[required]').on('blur', function(evt){
		validateInput(this);
	});

	$('.js-submit').on('click', function(evt){
		alert("[to be implemented]");
	})
});