jQuery(function($){

	/********************************************/
	/*											*/
	/* Setup         				  		    */
	/*											*/
	/********************************************/

	// Currently a test key
	Stripe.setPublishableKey('pk_live_BXRjo7MBwBvPSNM1338ZQVj3');

	$.postJSON = function(url, data, onSuccess, onError) {
	    return jQuery.ajax({
	        'type': 'POST',
	        'url': url,
	        'contentType': 'application/json',
	        'data': JSON.stringify(data),
	        'dataType': 'json',
	        'success': onSuccess,
	        'error': function(jqxhr){
	        	return onError(json, jqxhr.statusCode());
	        }
	    });
	};

	var valid_card = ['visa', 'mastercard', 'amex', 'dinersclub', 'jcb'];

	/********************************************/
	/*											*/
	/* Modal Controls         		  		    */
	/*											*/
	/********************************************/

	var registerButton = $('.js-register'),
		modal = $( '#registerModal' ),
		close = $( '.js-modal-close' ),
		submit = $( '.js-submit' ),
		overlay = $( '.modal-overlay' );

	function closeModal(){
		modal.removeClass('show' );
	}
	registerButton.on( 'click', function( event ) {
		modal.addClass('show')
		$('input.name').focus()
		overlay.unbind('click', closeModal );
		overlay.on( 'click', closeModal );
	});
	close.on( 'click', function( ev ) {
		ev.stopPropagation();
		closeModal();
	});
	$('.show-discount').on('click', function(){
		var parent = $('input.discount').parent()
		if( parent.hasClass('hidden') ){
			$('.modal-content').height( $('.modal-content').height()+50 )
			parent.removeClass('hidden');
			$('input.discount').focus();
			$(this).text('Hide discount field');
		}else{
			parent.addClass('hidden');
			$(this).text('Have a discount code?');
			$('.modal-content').height( $('.modal-content').height()-50 )
		}
	});

	/********************************************/
	/*											*/
	/* Form Validation         		  		    */
	/*											*/
	/********************************************/

	$('input.cc-num').payment('formatCardNumber');
	$('input.cc-exp').payment('formatCardExpiry');
	$('input.cc-cvc').payment('formatCardCVC');
	$('[data-numeric]').payment('restrictNumeric');

	$('input:not(.cc-num)').typeWatch({
		event: 'typingDone',
		wait: 750
	});

	var cardType;
	var nameOk = emailOk = numOk = cvcOk = expOk = false;
	function checkSubmit(){
		if(nameOk && emailOk && numOk && cvcOk && expOk){
			submit.removeClass('disabled');
			$('.input-error-text').removeClass('show');
		}else
			submit.addClass('disabled');
		
		return nameOk && emailOk && numOk && cvcOk && expOk;
	}
	$('input.cc-num').on('keyup', function(evt){
		$(this).parent().removeClass('empty error');

		var newType = $.payment.cardType( parseInt( $(this).val() ) );
		if( newType != cardType){
			if( cardType )
				$(this).siblings('.card').removeClass(cardType);	
			if( newType ){
				if(valid_card.indexOf(newType) != -1){
					$(this).siblings('.card').addClass(newType);
					cardType = newType
				}else{
					cardType = null;
				}
			}
		}
	});

	$('input.name').on('typingDone', function(evt){
		$(this).parent().removeClass('empty');
		nameOk = $(this).val().match(/^[a-zA-Z\\s]+ /i);
		checkSubmit();
		if(nameOk)
			$(this).parent().removeClass('error');
		else
			$(this).parent().addClass('error');
	});
	$('input.email').on('typingDone', function(evt){
		$(this).parent().removeClass('empty');
		emailOk = $(this).val().match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}\b/i);
		checkSubmit();
		if(emailOk)
			$(this).parent().removeClass('error');
		else
			$(this).parent().addClass('error');
	});
	$('input.cc-num').on('blur', function(evt){
		if($(this).val()){
			console.log(cardType)
			if(!cardType || cardType == undefined){
				var card = $(this).siblings('.card').addClass('pe-7s-check');
				cardType = 'pe-7s-check';
			}
			$(this).parent().removeClass('empty');
			numOk = $.payment.validateCardNumber( $(this).val() );
			checkSubmit();
			if( numOk )
				$(this).parent().removeClass('error');
			else
				$(this).parent().addClass('error');
		}
	});
	$('input.cc-cvc').on('typingDone', function(evt){
		$(this).parent().removeClass('empty');
		cvcOk = $.payment.validateCardCVC( $(this).val(), cardType );
		checkSubmit();
		if( cvcOk )
			$(this).parent().removeClass('error');
		else
			$(this).parent().addClass('error');
	});
	$('input.cc-exp').on('typingDone', function(evt){
		$(this).parent().removeClass('empty');
		var value = $(this).payment('cardExpiryVal');
		expOk = $.payment.validateCardExpiry( value.month, value.year );
		checkSubmit();
		if( expOk )
			$(this).parent().removeClass('error');
		else
			$(this).parent().addClass('error');
	});
	$('input.discount').on('typingDone', function(evt){
		if( $(this).hasClass('hidden') ){
			$(this).val();
			$(this).parent().addClass('empty');
			$(this).parent().removeClass('error');
			return;
		}
		$(this).parent().removeClass('empty');
	});


	/********************************************/
	/*											*/
	/* Form Submission         		  		    */
	/*											*/
	/********************************************/

	$('.js-submit').on('click', function(ev){
		ev.preventDefault();

		$('input.name').trigger('typingDone');
		$('input.email').trigger('typingDone');
		$('input.cc-num').trigger('blur');
		$('input.cc-cvc').trigger('typingDone');
		$('input.cc-exp').trigger('typingDone');
		if( ! $('input.discount').hasClass('hidden') )
			$('input.discount').trigger('typingDone');

		if( checkSubmit() ){
			var expDate = $('input.cc-exp').payment('cardExpiryVal');

			var stripeData = {
			  number: $('input.cc-num').val(),
			  cvc: $('input.cc-cvc').val(),
			  exp_month: expDate.month,
			  exp_year: expDate.year
			}
			Stripe.card.createToken(stripeData, function(status, response){
				if(response.error){
					console.log("Error!", response.error);
				}else{
					console.log("Card", response.card)
					var data = {
						user: {
							name: $('input.name').val(),
							email: $('input.email').val(), 
						},
						stripe_token: response.id,
						discount: $('input.discount').val() || false
					}

					var requestTimeout = setTimeout(function(){
						$('.js-submit').addClass('fail');
						$('.js-submit').html('<i class="pe-7s-close-circle"></i>');
						setTimeout(function(){
							$('.js-submit').html('Register'); // Temp, until we show a page after the request succeeds
							$('.js-submit').removeClass('has-icon');
							$('.js-submit').removeClass('fail');
						}, 1500)
						$('.input-error-text.cc').text("Uh oh, something's wrong... Try again in a little bit.");
						$('.input-error-text.cc').addClass('show');
					}, 10000);

					$.postJSON('https://api.gopilot.org/events/'+PILOT_EVENT_ID+'/register', data,
					function(data){
						console.log("Done!", data);
						$('.button.js-complete').attr('href', '/complete.html?token='+data.token)
						$('.js-submit').addClass('success');
						$('.js-submit').html('<i class="pe-7s-check"></i>');
						setTimeout(function(){
							$('.modal-content').removeClass('step-1');
							$('.modal-content').addClass('step-2');
						}, 1500)
					}, 
					function(err, status){
						console.log(err);
						clearTimeout(requestTimeout)
						$('.js-submit').addClass('fail');
						$('.js-submit').html('<i class="pe-7s-close-circle"></i>');
						setTimeout(function(){
							$('.js-submit').html('Register'); // Temp, until we show a page after the request succeeds
							$('.js-submit').removeClass('has-icon');
							$('.js-submit').removeClass('fail')
						}, 1500)

						var block = (err.reason == "name") ? "name" : 
									(err.reason == "email") ? "email" : "cc";
	 					
						$('.input-error-text.'+block).text(err.message);
						$('.input-error-text.'+block).addClass('show');

						var input = false;
						if(block != "cc")
							input = block;
						else if(err.reason == "number")
							input = "cc-num";
						else if(err.reason == "cvc")
							input = "cc-cvc";
						else if(err.reason == "exp_month" || err.reason == "exp_year")
							input = "cc-exp";
						else if(err.reason == "charge" || err.reason == "customer")
							input = "cc-num"

						if(input)
							$("input."+input).parent().addClass('error');

					});
					$('js-submit').html('<i class="pe-7s-config spin"></i>');
				}
			});
			$('.js-submit').addClass('has-icon')
			$('.js-submit').html('<i class="pe-7s-config spin"></i>');
		}
	});
});

