jQuery(function($){

	var registerButton = $('.js-register'),
		modal = $( '#registerModal' ),
		submit = $( '#registerModal .js-modal-close' ),
		overlay = $( '.modal-overlay' );


	// Modal Opening/Closing
	function closeModal(){
		modal.removeClass('show' );
	}
	registerButton.on( 'click', function( event ) {
		modal.addClass('show')

		overlay.unbind('click', closeModal );
		overlay.on( 'click', closeModal );
	});
	submit.on( 'click', function( ev ) {
		ev.stopPropagation();
		closeModal();
	});

	// Form Validation
	$('input.cc-num').payment('formatCardNumber');
	$('input.cc-exp').payment('formatCardExpiry');
	$('input.cc-cvc').payment('formatCardCVC');
	$('[data-numeric]').payment('restrictNumeric');

	var cardType;
	var nameOk = emailOk = numOk = cvcOk = expOk = true;
	function checkSubmit(){
		if(nameOk && emailOk && numOk && cvcOk && expOk){
			submit.removeClass('disabled')
		}else{
			submit.addClass('disabled')
		}
	}
	$('input.cc-num').on('keyup', function(evt){
		var newType = $.payment.cardType( parseInt( $(this).val() ) )
		if( newType && newType != cardType ){
			cardType = newType
			console.log(cardType);
		}
	});

	$('input.name').on('blur', function(evt){
		nameOk = $(this).val().match(/^[a-zA-Z\\s]+ /i)
		checkSubmit()
		if(nameOk)
			$(this).parent().removeClass('error');
		else
			$(this).parent().addClass('error');
	});
	$('input.email').on('blur', function(evt){
		emailOk = $(this).val().match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}\b/i)
		checkSubmit()
		if(emailOk)
			$(this).parent().removeClass('error');
		else
			$(this).parent().addClass('error');
	});
	$('input.cc-num').on('blur', function(evt){
		numOk = $.payment.validateCardNumber( $(this).val() )
		checkSubmit()
		if( numOk )
			$(this).parent().removeClass('error');
		else
			$(this).parent().addClass('error');
	});
	$('input.cc-cvc').on('blur', function(evt){
		cvcOk = $.payment.validateCardCVC( $(this).val(), cardType )
		checkSubmit()
		if( cvcOk )
			$(this).parent().removeClass('error');
		else
			$(this).parent().addClass('error');
	});
	$('input.cc-exp').on('blur', function(evt){
		expOk = $.payment.validateCardExpiry( value.month, value.year )
		checkSubmit()
		if( expOk )
			$(this).parent().removeClass('error');
		else
			$(this).parent().addClass('error');
	});

});

