// Class helper functions
var find = function(element, s){
	if(typeof element == 'string'){
		s = element
		element = document
	}
	return document.querySelectorAll(s)
}
var findOne = function(element, s){
	if(typeof element == 'string'){
		s = element
		element = document
	}
	return element.querySelector(s)
}
function addClass(el, cls){
	if (el.classList){
		classes = cls.split(' ')
		for(var i in classes)
	  		el.classList.add(classes[i]);
	}else
	  el.className += ' ' + cls;
}
function hasClass(el, cls){
	if (el.classList)
	  return el.classList.contains(className);
	else
	  return new RegExp('(^| )' + className + '( |$)', 'gi').test(el.className);
}
function removeClass(el, cls){
	if (el.classList)
	  el.classList.remove(cls);
	else
	  el.className = el.className.replace(new RegExp('(^|\\b)' + cls.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
}

var registerButton = findOne('.js-register');
	modal = findOne( '#registerModal' ),
	close = findOne( modal, '.js-modal-close' ),
	overlay = document.querySelector( '.modal-overlay' );;

function removeModal(){
	removeClass( modal, 'show' );
}

registerButton.addEventListener( 'click', function( event ) {
	addClass( modal, 'show' );
	overlay.removeEventListener( 'click', removeModal );
	overlay.addEventListener( 'click', removeModal );
});

close.addEventListener( 'click', function( ev ) {
	ev.stopPropagation();
	removeModal()
});
