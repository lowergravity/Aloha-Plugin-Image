/*
* Aloha Image Plugin - Allow image manipulation in Aloha Editor
* 
*   Copyright (C) 2010 by Nicolas Karageuzian - http://nka.me/
*	Copyright (C) 2010 by Benjamin Athur Lupton - http://www.balupton.com
* Licensed unter the terms of AGPL http://www.gnu.org/licenses/agpl-3.0.html
*
* do not require anymore IKS Loader
*/

// Attributes manipulation utilities
// Aloha team may want to factorize, it could be useful for other plugins
// Prototypes
String.prototype.toInteger = String.prototype.toInteger || function(){
	return parseInt(String(this).replace(/px$/,'')||0,10);
};
String.prototype.toFloat = String.prototype.toInteger || function(){
	return parseFloat(String(this).replace(/px$/,'')||0,10);
};
Number.prototype.toInteger = Number.prototype.toInteger || String.prototype.toInteger;
Number.prototype.toFloat = Number.prototype.toFloat || String.prototype.toFloat;

// jQuery
jQuery.fn.increase = jQuery.fn.increase || function(attr){
	var	obj = jQuery(this),
		value = obj.css(attr).toFloat(),
		newValue = Math.round((value||1)*1.2);
	if (value == newValue) { // when value is 2, won't increase
		newValue++;
	}
	// Apply
	obj.css(attr,newValue);
	// Chain
	return obj;
};
jQuery.fn.decrease = jQuery.fn.decrease || function(attr){
	var	obj = jQuery(this),
		value = obj.css(attr).toFloat(),
		newValue = Math.round((value||0)*0.8);
	// Apply
	if (value == newValue && newValue >0) { // when value is 2, won't increase
		newValue--;
	}
	obj.css(attr,newValue);
	// Chain
	return obj;
};



GENTICS.Aloha.Image=new GENTICS.Aloha.Plugin("com.gentics.aloha.plugins.Image");

GENTICS.Aloha.Image.languages=["en","fr","de"];
GENTICS.Aloha.Image.config = { 'img': { 'max_width': '50px',
		'max_height': '50px' }};
/*
 * Initalize plugin
 */
GENTICS.Aloha.Image.init=function(){
	// get settings
    if (GENTICS.Aloha.Image.settings.objectTypeFilter != undefined)
    	GENTICS.Aloha.Image.objectTypeFilter = GENTICS.Aloha.Image.settings.objectTypeFilter;	
    if (GENTICS.Aloha.Image.settings.dropEventHandler != undefined)
    	GENTICS.Aloha.Image.dropEventHandler = GENTICS.Aloha.Image.settings.dropEventHandler;	

    var that=this;
	that.initImage();
	that.bindInteractions();
	that.subscribeEvents();
	stylePath = GENTICS_Aloha_base + '/plugins/com.gentics.aloha.plugins.Image/style.css';
	jQuery('<link rel="stylesheet" />').attr('href', stylePath).appendTo('head');
/*
	if (!GENTICS.Aloha.DnDFile) {
		dndFilePath = GENTICS_Aloha_base + '/plugins/com.gentics.aloha.plugins.DragnDropFiles/plugin.js';
		jQuery('<script type="text/javascript" />').attr('src', dndFilePath).appendTo('head');
	}
 * 
 */
	
   }; // END INIT

GENTICS.Aloha.Image.objectTypeFilter = [];

/**
 * Default behaviour for dropped image
 * car be overriden in settings
 */


// GENTICS.Aloha.Image.PropsWindow =
GENTICS.Aloha.Image.initImage = function() {
	var that = this;
	this.insertImgButton = new GENTICS.Aloha.ui.Button({
		'iconClass': 'GENTICS_button GENTICS_img_insert',
		'size' : 'small',
		'onclick' : function () { that.insertImg(); },
		'tooltip' : that.i18n('button.addimg.tooltip'),
		'toggle' : false
	});
	GENTICS.Aloha.FloatingMenu.addButton(
			'GENTICS.Aloha.continuoustext',
			this.insertImgButton,
			GENTICS.Aloha.i18n(GENTICS.Aloha, 'floatingmenu.tab.insert'),
			1
	);
	
// GENTICS.Aloha.FloatingMenu.createScope(this.getUID('img'),
// 'GENTICS.Aloha.continuoustext');
	GENTICS.Aloha.FloatingMenu.createScope(this.getUID('image'), 'global');
	
	var alignLeftButton = new GENTICS.Aloha.ui.Button({
        'iconClass': 'GENTICS_button GENTICS_img_align_left',
        'size': 'small',
        'onclick' : function() {
            var img = that.findImgMarkup();
            jQuery(img).css('float', 'left');
        },
        'tooltip': that.i18n('button.img.align.left.tooltip')
    });
	var alignRightButton = new GENTICS.Aloha.ui.Button({
        'iconClass': 'GENTICS_button GENTICS_img_align_right',
        'size': 'small',
        'onclick' : function() {
            var img = that.findImgMarkup();
            jQuery(img).css('float', 'right');
        },
        'tooltip': that.i18n('button.img.align.right.tooltip')
    });
    var alignNoneButton = new GENTICS.Aloha.ui.Button({
        'iconClass': 'GENTICS_button GENTICS_img_align_none',
        'size': 'small',
        'onclick' : function() {
	    	var img = that.findImgMarkup();
	        jQuery(img).css('float', '');
        },
        'tooltip': that.i18n('button.img.align.none.tooltip')
    });
    
    // add the src field for images
    var imgSrcLabel = new GENTICS.Aloha.ui.Button({
    	'label': that.i18n('field.img.src.label'),
    	'tooltip': that.i18n('field.img.src.tooltip'),
    	'size': 'small'
    });
    this.imgSrcField = new GENTICS.Aloha.ui.AttributeField({});
    this.imgSrcField.setObjectTypeFilter( this.objectTypeFilter );

    // add the title field for images
    var imgTitleLabel = new GENTICS.Aloha.ui.Button({
    	'label': that.i18n('field.img.title.label'),
    	'tooltip': that.i18n('field.img.title.tooltip'),
    	'size': 'small'
    });
    this.imgTitleField = new GENTICS.Aloha.ui.AttributeField();
    this.imgTitleField.setObjectTypeFilter();

    GENTICS.Aloha.FloatingMenu.addButton(
    		this.getUID('image'),
    		this.imgSrcField,
    		this.i18n('floatingmenu.tab.img'),
    		1
    );
    GENTICS.Aloha.FloatingMenu.addButton(
    		this.getUID('image'),
    		alignRightButton,
    		this.i18n('floatingmenu.tab.img'),
    		1
    );
    GENTICS.Aloha.FloatingMenu.addButton(
    		this.getUID('image'),
    		alignLeftButton,
    		this.i18n('floatingmenu.tab.img'),
    		1
    );
    GENTICS.Aloha.FloatingMenu.addButton(
    		this.getUID('image'),
    		alignNoneButton,
    		this.i18n('floatingmenu.tab.img'),
    		1
    );
    GENTICS.Aloha.FloatingMenu.addButton(
    		this.getUID('image'),
    		this.imgTitleField,
    		this.i18n('floatingmenu.tab.img'),
    		1
    );
    
    var incPadding = new GENTICS.Aloha.ui.Button({
    	iconClass: 'GENTICS_button GENTICS_img_padding_increase',
    	size: 'small',
    	onclick: function() {
    	var image = that.findImgMarkup();
    	Image = jQuery(image);
    	// Apply
    	Image.increase('padding');
    	},
    	tooltip: this.i18n('padding.increase')
    	});
    GENTICS.Aloha.FloatingMenu.addButton(
    		this.getUID('image'),
    		incPadding,
    		this.i18n('floatingmenu.tab.img'),
    		2
    );
   var decPadding = new GENTICS.Aloha.ui.Button({
    	iconClass: 'GENTICS_button GENTICS_img_padding_decrease',
    	size: 'small',
    	onclick: function() {
    	var image = that.findImgMarkup();
    	Image = jQuery(image);
    	// Apply
    	Image.decrease('padding');
    	},
    	tooltip: this.i18n('padding.decrease')
    	});
   GENTICS.Aloha.FloatingMenu.addButton(
   		this.getUID('image'),
   		decPadding,
   		this.i18n('floatingmenu.tab.img'),
   		2
   );
   var  incSize = new GENTICS.Aloha.ui.Button({
	   iconClass: 'GENTICS_button GENTICS_img_size_increase',
	   size: 'small',
	   onclick: function() {
	   var image = that.findImgMarkup();
	   Image = jQuery(image);
	   // Apply
		   Image.increase('height').increase('width');
	   },
	   tooltip: this.i18n('size.increase')
	   });
   GENTICS.Aloha.FloatingMenu.addButton(
	   		this.getUID('image'),
	   		incSize,
	   		this.i18n('floatingmenu.tab.img'),
	   		2
	   );
   var decSize = new GENTICS.Aloha.ui.Button({
	   iconClass: 'GENTICS_button GENTICS_img_size_decrease',
	   size: 'small',
	   onclick: function() {
	   var image = that.findImgMarkup();
	   Image = jQuery(image);
	   // Apply
	   Image.decrease('height').decrease('width');
	   },
	   tooltip: that.i18n('size.decrease')
	   });
   GENTICS.Aloha.FloatingMenu.addButton(
	   		this.getUID('image'),
	   		decSize,
	   		this.i18n('floatingmenu.tab.img'),
	   		2
	   );
};

GENTICS.Aloha.Image.bindInteractions = function () {
    var that = this;

    // update image object when src changes
    this.imgSrcField.addListener('keyup', function(obj, event) {  	
    	that.srcChange();
    });

    this.imgSrcField.addListener('blur', function(obj, event) {
    	// TODO remove image or do something usefull if the user leaves the
    	// image without defining a valid image src.
    	img = jQuery(obj.getTargetObject());
    	if (img.attr('src') == "") {
    		img.remove();
    	} // image removal when src field is blank
    });
     
};

GENTICS.Aloha.Image.subscribeEvents = function () {
	var that = this;
	//handles dropped files
	GENTICS.Aloha.EventRegistry.subscribe(GENTICS.Aloha, 'UploadSuccess', function(event,data) {
		if (data.file.type.match(/image\//)) {	
			img = jQuery('#'+data.id);
			img.attr("src",data.src);
			img.attr("id",'');
		}
	});
	GENTICS.Aloha.EventRegistry.subscribe(GENTICS.Aloha, 'UploadFailure', function(event,data) {
		if (data.file.type.match(/image\//)) {	
			img = jQuery('#'+data.id);
			img.remove();
		}
	});
	GENTICS.Aloha.EventRegistry.subscribe(GENTICS.Aloha, 'dropFileInEditable', function(event,data) {
		//console.log(data.file);
		if (data.fileObj.file.type.match(/image\//)) {			
			var reader = new FileReader();
			reader.config = that.getEditableConfig(data.editable);
			reader.attachedData = data;
			reader.onloadend = function(readEvent) {
				img = jQuery('<img id="'+reader.attachedData.fileObj.id+'" style="" title="" src=""></img>');
				img.click( GENTICS.Aloha.Image.clickImage );
				if (reader.attachedData.fileObj.src == undefined) {
					reader.attachedData.fileObj.src =readEvent.target.result;
				}
				img.attr('src', reader.attachedData.fileObj.src );
				GENTICS.Utils.Dom.insertIntoDOM(img,reader.attachedData.range,  jQuery(GENTICS.Aloha.activeEditable.obj));
			};
			reader.readAsDataURL(data.fileObj.file);
		}
	});
    // add the event handler for selection change
    GENTICS.Aloha.EventRegistry.subscribe(GENTICS.Aloha, 'selectionChanged', function(event, rangeObject) {
    	var foundMarkup = that.findImgMarkup( rangeObject );
    	var config = that.getEditableConfig(GENTICS.Aloha.activeEditable.obj);
        if ( config.img ) {
        	that.insertImgButton.show();
        } else {
        	that.insertImgButton.hide();
        	// TODO this should not be necessary here!
        	GENTICS.Aloha.FloatingMenu.doLayout();
            // leave if img is not allowed
            return;
        }
        if ( foundMarkup ) {
        	// img found
        	that.insertImgButton.hide();
        	GENTICS.Aloha.FloatingMenu.setScope(that.getUID('image'));
            that.imgSrcField.setTargetObject(foundMarkup, 'src');
            that.imgTitleField.setTargetObject(foundMarkup, 'title');
            that.imgSrcField.focus();
            GENTICS.Aloha.FloatingMenu.userActivatedTab = that.i18n('floatingmenu.tab.img');
        } else {
        	that.imgSrcField.setTargetObject(null);
        }
    	// TODO this should not be necessary here!
    	GENTICS.Aloha.FloatingMenu.doLayout();
    });
    // add to all editables the image click
    for (var i = 0; i < GENTICS.Aloha.editables.length; i++) {

	    // add a click (=select) event to all image.
	    GENTICS.Aloha.editables[i].obj.find('img').each( function( i ) {
	        // select the image when clicked
	        jQuery(this).click( GENTICS.Aloha.Image.clickImage );
	    });
    }
};

GENTICS.Aloha.Image.clickImage = function ( e ) { 
	// select the image
	// HELP: can't find a way...
	thisimg = jQuery(this);
   var offset = 1;//GENTICS.Utils.Dom.getIndexInParent(this);
   var imgRange = new GENTICS.Utils.RangeObject({
	   startContainer: thisimg.parent(),
	   endContainer: thisimg.parent(),
	   startOffset: offset,
	   endOffset: offset+1
   });
   imgRange.correctRange();
   imgRange.update();
   // console.log(imgRange);
   imgRange.select();
   
};



GENTICS.Aloha.Image.findImgMarkup = function ( range ) {
	if ( typeof range == 'undefined' ) {
        var range = GENTICS.Aloha.Selection.getRangeObject();   
    }
	try {
	    if (range.startContainer.childNodes[range.startOffset].nodeName.toLowerCase() == 'img') {
			// console.log(range);
			result = range.startContainer.childNodes[range.startOffset];
			if (! result.css) result.css = "";
			if (! result.title) result.title = "";
			if (! result.src) result.src = "";
			return result;
		}
	} catch (e) {
		GENTICS.Aloha.Log.debug(e,"Error finding img markup.");
	}
    return null;
    
};

GENTICS.Aloha.Image.insertImg = function() {
	var range = GENTICS.Aloha.Selection.getRangeObject();
	
    if ( range.isCollapsed() ) {
    	// TODO I would suggest to call the srcChange method. So all image src
		// changes are on one single point.
    	imagetag = '<img src="' + GENTICS_Aloha_base + 'plugins/com.gentics.aloha.plugins.Image/images/blank.jpeg" title="" style=""></img>';
    	var newImg = jQuery(imagetag);
    	// add the click selection handler
    	newImg.click( GENTICS.Aloha.Image.clickImage );
    	GENTICS.Utils.Dom.insertIntoDOM(newImg, range, jQuery(GENTICS.Aloha.activeEditable.obj));
    	// select the image when inserted
// var offset = GENTICS.Utils.Dom.getIndexInParent(newImg.get(0));
// var imgRange = new GENTICS.Utils.RangeObject({
// startContainer: newImg.parent(),
// endContainer: newImg.parent(),
// startOffset: offset,
// endOffset: offset+1
// });
// imgRange.select();
    	
    } else {
    	// TODO NEVER alert!! i18n !! Instead log. We have a messaging stack on
    	// the roadmap which will offer you the possibility to push messages.
    	alert('img cannot markup a selection');
    	// TODO the desired behavior could be that the selected content is
		// replaced by an image.
    	// TODO it should be editor's choice, with an Ext Dialog instead of
		// alert.
    }
};


GENTICS.Aloha.Image.srcChange = function () {
	// TODO the src changed. I suggest :
	// 1. set an loading image (I suggest set src base64 enc) to show the user
	// we are trying to load an image
	// 2. start a request to get the image
	// 3a. the image is ok change the src
	// 3b. the image is not availbable show an error.
	// this.imgSrcField.getTargetObject(), (the img tag)
	// this.imgSrcField.getQueryValue(), (the query value in the inputfield)
	// this.imgSrcField.getItem() (optinal a selected resource item)
	// TODO additionally implement an srcChange Handler to let implementer
	// customize
};
